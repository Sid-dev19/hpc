// routes/feedback.js
const router = require('express').Router();
const { protect, authorise } = require('../middleware/auth');
const { TeacherFeedback } = require('../models/Assessment');
router.use(protect);

router.get('/:studentId/:activityId', async (req, res) => {
  try {
    const fb = await TeacherFeedback.findOne({ student: req.params.studentId })
      .populate('teacher','name');
    res.json(fb);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.post('/', authorise('teacher'), async (req, res) => {
  try {
    const fb = await TeacherFeedback.findOneAndUpdate(
      { submission: req.body.submissionId, student: req.body.studentId },
      { ...req.body, teacher: req.user._id },
      { upsert: true, new: true }
    );
    res.status(201).json(fb);
  } catch (err) { res.status(400).json({ message: err.message }); }
});

module.exports = router;
