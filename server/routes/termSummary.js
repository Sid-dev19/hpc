// routes/termSummary.js
const router = require('express').Router();
const { protect, authorise } = require('../middleware/auth');
const { TermSummary } = require('../models/Assessment');
router.use(protect);

router.get('/', async (req, res) => {
  try {
    const { studentId, subjectId, term } = req.query;
    const filter = {};
    if (studentId) filter.student = studentId;
    if (subjectId) filter.subject = subjectId;
    if (term) filter.term = term;
    const summaries = await TermSummary.find(filter)
      .populate('subject','name code')
      .populate('student','name grade section');
    res.json(summaries);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.post('/', authorise('teacher'), async (req, res) => {
  try {
    const summary = await TermSummary.findOneAndUpdate(
      { student: req.body.studentId, subject: req.body.subjectId, term: req.body.term },
      { ...req.body, teacher: req.user._id, school: req.user.school._id },
      { upsert: true, new: true }
    );
    res.status(201).json(summary);
  } catch (err) { res.status(400).json({ message: err.message }); }
});

module.exports = router;
