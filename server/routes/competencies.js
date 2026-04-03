// routes/competencies.js - Supabase version
const router = require('express').Router();
const { protect, authorise } = require('../middleware/auth');
const supabase = require('../config/supabase');

router.use(protect);

// Subjects
router.get('/subjects', async (req, res) => {
  try {
    const { data: subjects, error } = await supabase
      .from('subjects')
      .select('*')
      .eq('stage', 'middle')
      .order('name');

    if (error) {
      return res.status(500).json({ message: error.message });
    }

    res.json(subjects);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Curricular Goals by subject + grade
router.get('/goals', async (req, res) => {
  try {
    const { subjectId, grade } = req.query;
    
    let query = supabase
      .from('curricular_goals')
      .select('*, subject:subjects(name, code)')
      .order('code');

    if (subjectId) query = query.eq('subject_id', subjectId);
    if (grade) query = query.contains('grade_applicability', [Number(grade)]);

    const { data: goals, error } = await query;

    if (error) {
      return res.status(500).json({ message: error.message });
    }

    res.json(goals);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Competencies
router.get('/', async (req, res) => {
  try {
    const { goalId, subjectId, grade } = req.query;
    
    let query = supabase
      .from('competencies')
      .select('*, curricular_goal:curricular_goals(code, description, subject:subjects(name, code))')
      .order('code');

    if (goalId) {
      query = query.eq('curricular_goal_id', goalId);
    } else if (subjectId) {
      const { data: goals } = await supabase
        .from('curricular_goals')
        .select('id')
        .eq('subject_id', subjectId);
      
      const goalIds = goals.map(g => g.id);
      query = query.in('curricular_goal_id', goalIds);
    }
    
    if (grade) query = query.contains('grade_applicability', [Number(grade)]);

    const { data: competencies, error } = await query;

    if (error) {
      return res.status(500).json({ message: error.message });
    }

    res.json(competencies);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Learning Outcomes for a competency + grade
router.get('/lo', async (req, res) => {
  try {
    const { competencyId, grade } = req.query;
    
    let query = supabase
      .from('learning_outcomes')
      .select('*, competency:competencies(code, description)')
      .order('lo_number');

    if (competencyId) query = query.eq('competency_id', competencyId);
    if (grade) query = query.eq('grade', Number(grade));

    const { data: los, error } = await query;

    if (error) {
      return res.status(500).json({ message: error.message });
    }

    res.json(los);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// LO rubric descriptors
router.get('/lo-rubric', async (req, res) => {
  try {
    const { loId } = req.query;
    
    const { data: descriptors, error } = await supabase
      .from('lo_rubric_descriptors')
      .select('*')
      .eq('learning_outcome_id', loId)
      .order('ability', 'level');

    if (error) {
      return res.status(500).json({ message: error.message });
    }

    res.json(descriptors);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Admin: create/update competency data
router.post('/subjects', authorise('admin'), async (req, res) => {
  try {
    const { data: subject, error } = await supabase
      .from('subjects')
      .insert(req.body)
      .select()
      .single();

    if (error) {
      return res.status(400).json({ message: error.message });
    }

    res.status(201).json(subject);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/goals', authorise('admin'), async (req, res) => {
  try {
    const { data: goal, error } = await supabase
      .from('curricular_goals')
      .insert(req.body)
      .select()
      .single();

    if (error) {
      return res.status(400).json({ message: error.message });
    }

    res.status(201).json(goal);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/lo', authorise('admin'), async (req, res) => {
  try {
    const { data: lo, error } = await supabase
      .from('learning_outcomes')
      .insert(req.body)
      .select()
      .single();

    if (error) {
      return res.status(400).json({ message: error.message });
    }

    res.status(201).json(lo);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/lo-rubric', authorise('admin'), async (req, res) => {
  try {
    const { data: desc, error } = await supabase
      .from('lo_rubric_descriptors')
      .insert(req.body)
      .select()
      .single();

    if (error) {
      return res.status(400).json({ message: error.message });
    }

    res.status(201).json(desc);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
