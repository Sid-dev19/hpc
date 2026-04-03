// routes/partA.js
const router = require('express').Router();
const { protect, authorise } = require('../middleware/auth');
const { PartAStudent, PartA4Parent } = require('../models/Assessment');
router.use(protect);

// Student: get/save Part A (About Me, Ambitions)
router.get('/student', authorise('student'), async (req, res) => {
  try {
    const data = await PartAStudent.findOne({ student: req.user._id });
    res.json(data || {});
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.put('/student', authorise('student'), async (req, res) => {
  try {
    const data = await PartAStudent.findOneAndUpdate(
      { student: req.user._id },
      { student: req.user._id, ...req.body },
      { upsert: true, new: true }
    );
    res.json(data);
  } catch (err) { res.status(400).json({ message: err.message }); }
});

// Parent: get/save Part A(4) Partnership Card
router.get('/parent', authorise('parent'), async (req, res) => {
  try {
    const parent = await require('../models/User').findById(req.user._id);
    const data = await PartA4Parent.find({ student: parent.childId, parent: req.user._id });
    res.json(data);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.post('/parent', authorise('parent'), async (req, res) => {
  try {
    const data = await PartA4Parent.findOneAndUpdate(
      { student: req.body.studentId, parent: req.user._id, term: req.body.term },
      { ...req.body, parent: req.user._id },
      { upsert: true, new: true }
    );
    res.json(data);
  } catch (err) { res.status(400).json({ message: err.message }); }
});

// Teacher/Admin: view student Part A
router.get('/student/:studentId', authorise('teacher','admin'), async (req, res) => {
  try {
    const data = await PartAStudent.findOne({ student: req.params.studentId });
    res.json(data || {});
  } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;
