// routes/dashboard.js
const router = require('express').Router();
const { protect, authorise } = require('../middleware/auth');
const supabase = require('../config/supabase');

router.use(protect);

// Admin: school-wide stats
router.get('/admin', authorise('admin'), async (req, res) => {
  try {
    const schoolId = req.user.school_id;
    
    // Get counts
    const [studentsResult, teachersResult, submissionsResult, pendingResult] = await Promise.all([
      supabase
        .from('users')
        .select('id', { count: 'exact' })
        .eq('school_id', schoolId)
        .eq('role', 'student')
        .eq('is_active', true),
      supabase
        .from('users')
        .select('id', { count: 'exact' })
        .eq('school_id', schoolId)
        .eq('role', 'teacher')
        .eq('is_active', true),
      supabase
        .from('rubric_submissions')
        .select('id', { count: 'exact' })
        .eq('school_id', schoolId),
      supabase
        .from('rubric_submissions')
        .select('id', { count: 'exact' })
        .eq('school_id', schoolId)
        .eq('submitter_role', 'teacher')
    ]);

    const totalStudents = studentsResult.count || 0;
    const totalTeachers = teachersResult.count || 0;
    const totalSubmissions = submissionsResult.count || 0;
    const pendingSubmissions = pendingResult.count || 0;

    // Grade stats
    const { data: gradeData } = await supabase
      .from('users')
        .select('grade')
        .eq('school_id', schoolId)
        .eq('role', 'student')
        .eq('is_active', true);

    const gradeStats = gradeData.reduce((acc, user) => {
      const grade = user.grade;
      acc[grade] = (acc[grade] || 0) + 1;
      return acc;
    }, {});

    // Convert to array format like MongoDB aggregation
    const gradeStatsArray = Object.keys(gradeStats).map(grade => ({
      _id: parseInt(grade),
      count: gradeStats[grade]
    })).sort((a, b) => a._id - b._id);

    res.json({ totalStudents, totalTeachers, totalSubmissions, pendingSubmissions, gradeStats: gradeStatsArray });
  } catch (err) { 
    res.status(500).json({ message: err.message }); 
  }
});

// Teacher: class progress for a grade/section
router.get('/teacher', authorise('teacher'), async (req, res) => {
  try {
    const { grade, section } = req.query;
    const schoolId = req.user.school_id;
    
    let query = supabase
      .from('users')
      .select('id, name, grade, section, roll_no')
      .eq('school_id', schoolId)
      .eq('role', 'student')
      .eq('is_active', true);
    
    if (grade) query = query.eq('grade', Number(grade));
    if (section) query = query.eq('section', section);

    const { data: students } = await query.order('name');

    // For each student, get latest submission status
    const studentIds = students.map(s => s.id);
    const { data: submissions } = await supabase
      .from('rubric_submissions')
      .select('student_id, activity_id, awareness_level, sensitivity_level, creativity_level')
      .in('student_id', studentIds)
      .eq('submitter_role', 'teacher')
      .order('created_at', { ascending: false });

    const submissionMap = {};
    submissions.forEach(s => {
      if (!submissionMap[s.student_id]) submissionMap[s.student_id] = [];
      submissionMap[s.student_id].push(s);
    });

    const result = students.map(s => ({
      ...s,
      submissionCount: submissionMap[s.id]?.length || 0,
      latestLevels: submissionMap[s.id]?.[0] || null
    }));

    res.json(result);
  } catch (err) { 
    res.status(500).json({ message: err.message }); 
  }
});

// Student: own progress summary
router.get('/student', authorise('student'), async (req, res) => {
  try {
    const studentId = req.user.id;
    const [selfCountResult, teacherCountResult, termSummariesResult] = await Promise.all([
      supabase
        .from('rubric_submissions')
        .select('id', { count: 'exact' })
        .eq('student_id', studentId)
        .eq('submitter_role', 'student'),
      supabase
        .from('rubric_submissions')
        .select('id', { count: 'exact' })
        .eq('student_id', studentId)
        .eq('submitter_role', 'teacher'),
      supabase
        .from('term_summaries')
        .select('*, subject:subjects(name)')
        .eq('student_id', studentId)
    ]);

    const selfCount = selfCountResult.count || 0;
    const teacherCount = teacherCountResult.count || 0;
    const termSummaries = termSummariesResult || [];

    res.json({ selfCount, teacherCount, termSummaries });
  } catch (err) { 
    res.status(500).json({ message: err.message }); 
  }
});

// Parent: child's summary
router.get('/parent', authorise('parent'), async (req, res) => {
  try {
    const { data: parent } = await supabase
      .from('users')
      .select('child_id')
      .eq('id', req.user.id)
      .single();

    const childId = parent?.child_id;
    if (!childId) return res.json({ child: null, termSummaries: [] });
    
    const { data: termSummaries } = await supabase
      .from('term_summaries')
      .select('*, subject:subjects(name)')
      .eq('student_id', childId);

    res.json({ child: { id: childId }, termSummaries });
  } catch (err) { 
    res.status(500).json({ message: err.message }); 
  }
});

module.exports = router;
