// routes/rubrics.js
const router = require('express').Router();
const { protect, authorise } = require('../middleware/auth');
const { RubricSubmission, SelfReflection } = require('../models/Assessment');

router.use(protect);

// Score helper: statement count → level
const scoreToLevel = (score) => {
  if (score <= 2) return 'Beginner';
  if (score <= 4) return 'Proficient';
  return 'Advanced';
};

// GET: submissions for a student + activity
router.get('/', async (req, res) => {
  try {
    const { studentId, activityId } = req.query;
    const filter = {};
    if (studentId) filter.student = studentId;
    if (activityId) filter.activity = activityId;
    const submissions = await RubricSubmission.find(filter)
      .populate('submittedBy', 'name role')
      .populate('activity', 'title competency grade');
    res.json(submissions);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// GET: full progress wheel data for a student + activity
router.get('/wheel/:studentId/:activityId', async (req, res) => {
  try {
    const { studentId, activityId } = req.params;
    const [teacher, student, peer, selfReflection] = await Promise.all([
      RubricSubmission.findOne({ student: studentId, activity: activityId, submitterRole: 'teacher' }),
      RubricSubmission.findOne({ student: studentId, activity: activityId, submitterRole: 'student' }),
      RubricSubmission.findOne({ student: studentId, activity: activityId, submitterRole: 'peer' }),
      SelfReflection.findOne({ student: studentId, activity: activityId })
    ]);

    // Disparity check: if teacher B and student P or A on same ability
    const disparity = [];
    if (teacher && student) {
      const levels = { Beginner: 1, Proficient: 2, Advanced: 3 };
      ['awareness','sensitivity','creativity'].forEach(ab => {
        const tKey = `${ab}Level`, sKey = `${ab}Level`;
        if (teacher[tKey] && student[sKey]) {
          const diff = Math.abs(levels[teacher[tKey]] - levels[student[sKey]]);
          if (diff >= 2) disparity.push({ ability: ab, teacherLevel: teacher[tKey], studentLevel: student[sKey] });
        }
      });
    }

    res.json({ teacher, student, peer, selfReflection, disparity });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// POST: teacher submits rubric
router.post('/teacher', authorise('teacher'), async (req, res) => {
  try {
    const { activityId, studentId, term, awarenessLevel, sensitivityLevel, creativityLevel, observationNotes } = req.body;
    const existing = await RubricSubmission.findOneAndUpdate(
      { activity: activityId, student: studentId, submitterRole: 'teacher' },
      { submittedBy: req.user._id, school: req.user.school._id, term,
        awarenessLevel, sensitivityLevel, creativityLevel, observationNotes },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
    res.status(201).json(existing);
  } catch (err) { res.status(400).json({ message: err.message }); }
});

// POST: student self-reflection + progress grid
router.post('/self-reflection', authorise('student'), async (req, res) => {
  try {
    const { activityId, term, emojiResponses,
            awarenessStatements, sensitivityStatements, creativityStatements,
            myLearnings, interestingThing, needsPractice, needsHelp } = req.body;

    // Compute B/P/A from statement counts
    const awarenessLevel   = scoreToLevel(awarenessStatements?.length || 0);
    const sensitivityLevel = scoreToLevel(sensitivityStatements?.length || 0);
    const creativityLevel  = scoreToLevel(creativityStatements?.length || 0);

    // Upsert self-reflection
    const reflection = await SelfReflection.findOneAndUpdate(
      { student: req.user._id, activity: activityId },
      { term, emojiResponses, awarenessStatements, sensitivityStatements, creativityStatements,
        awarenessLevel, sensitivityLevel, creativityLevel,
        myLearnings, interestingThing, needsPractice, needsHelp },
      { upsert: true, new: true }
    );

    // Upsert rubric submission for wheel
    await RubricSubmission.findOneAndUpdate(
      { activity: activityId, student: req.user._id, submitterRole: 'student' },
      { submittedBy: req.user._id, school: req.user.school._id, term,
        awarenessLevel, sensitivityLevel, creativityLevel,
        awarenessScore: awarenessStatements?.length || 0,
        sensitivityScore: sensitivityStatements?.length || 0,
        creativityScore: creativityStatements?.length || 0 },
      { upsert: true, new: true }
    );

    res.status(201).json(reflection);
  } catch (err) { res.status(400).json({ message: err.message }); }
});

// POST: peer assessment (progress grid + rubric)
router.post('/peer', authorise('student','peer'), async (req, res) => {
  try {
    const { activityId, studentId, term,
            awarenessStatements, sensitivityStatements, creativityStatements,
            needsPractice, engagementRatings } = req.body;

    const awarenessLevel   = scoreToLevel(awarenessStatements?.length || 0);
    const sensitivityLevel = scoreToLevel(sensitivityStatements?.length || 0);
    const creativityLevel  = scoreToLevel(creativityStatements?.length || 0);

    const submission = await RubricSubmission.findOneAndUpdate(
      { activity: activityId, student: studentId, submitterRole: 'peer' },
      { submittedBy: req.user._id, school: req.user.school._id, term,
        awarenessLevel, sensitivityLevel, creativityLevel,
        awarenessScore: awarenessStatements?.length || 0,
        sensitivityScore: sensitivityStatements?.length || 0,
        creativityScore: creativityStatements?.length || 0,
        observationNotes: needsPractice },
      { upsert: true, new: true }
    );

    res.status(201).json(submission);
  } catch (err) { res.status(400).json({ message: err.message }); }
});

module.exports = router;
