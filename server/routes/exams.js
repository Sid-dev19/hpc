// routes/exams.js
const router = require('express').Router();
const { protect, authorise } = require('../middleware/auth');
const { ExamPaper, ExamQuestion } = require('../models/Assessment');
router.use(protect);

// List papers
router.get('/papers', async (req, res) => {
  try {
    const filter = { school: req.user.school._id };
    if (req.query.grade) filter.grade = Number(req.query.grade);
    if (req.query.status) filter.status = req.query.status;
    const papers = await ExamPaper.find(filter)
      .populate('subject','name')
      .populate('createdBy','name')
      .populate('approvedBy','name')
      .sort({ createdAt: -1 });
    res.json(papers);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// Get single paper with all questions
router.get('/papers/:id', async (req, res) => {
  try {
    const paper = await ExamPaper.findById(req.params.id)
      .populate('subject','name')
      .populate('createdBy','name');
    const questions = await ExamQuestion.find({ paper: req.params.id })
      .populate('learningOutcome','loCode description bloomLevel')
      .sort('questionNo');
    res.json({ paper, questions });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// Create paper (saves config, triggers AI generation via /api/ai/generate-exam)
router.post('/papers', authorise('teacher','admin'), async (req, res) => {
  try {
    const paper = await ExamPaper.create({
      ...req.body,
      school: req.user.school._id,
      createdBy: req.user._id,
      status: 'draft'
    });
    res.status(201).json(paper);
  } catch (err) { res.status(400).json({ message: err.message }); }
});

// Update paper config
router.put('/papers/:id', authorise('teacher','admin'), async (req, res) => {
  try {
    const paper = await ExamPaper.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(paper);
  } catch (err) { res.status(400).json({ message: err.message }); }
});

// Approve paper for publishing
router.put('/papers/:id/approve', authorise('teacher','admin'), async (req, res) => {
  try {
    const allQ = await ExamQuestion.countDocuments({ paper: req.params.id });
    const approved = await ExamQuestion.countDocuments({ paper: req.params.id, status: 'approved' });
    if (approved < allQ) {
      return res.status(400).json({ message: `${allQ - approved} questions still pending review` });
    }
    const paper = await ExamPaper.findByIdAndUpdate(
      req.params.id,
      { status: 'approved', approvedBy: req.user._id },
      { new: true }
    );
    res.json(paper);
  } catch (err) { res.status(400).json({ message: err.message }); }
});

// Publish paper
router.put('/papers/:id/publish', authorise('teacher','admin'), async (req, res) => {
  try {
    const paper = await ExamPaper.findByIdAndUpdate(
      req.params.id, { status: 'published' }, { new: true }
    );
    res.json(paper);
  } catch (err) { res.status(400).json({ message: err.message }); }
});

// Question: approve
router.put('/questions/:qid/approve', authorise('teacher','admin'), async (req, res) => {
  try {
    const q = await ExamQuestion.findByIdAndUpdate(
      req.params.qid, { status: 'approved' }, { new: true }
    );
    res.json(q);
  } catch (err) { res.status(400).json({ message: err.message }); }
});

// Question: edit
router.put('/questions/:qid', authorise('teacher','admin'), async (req, res) => {
  try {
    const q = await ExamQuestion.findByIdAndUpdate(
      req.params.qid,
      { ...req.body, teacherEdited: true, status: 'approved' },
      { new: true }
    );
    res.json(q);
  } catch (err) { res.status(400).json({ message: err.message }); }
});

// Question: swap (mark old as swapped, insert AI replacement via /api/ai/swap-question)
router.put('/questions/:qid/swap', authorise('teacher','admin'), async (req, res) => {
  try {
    await ExamQuestion.findByIdAndUpdate(req.params.qid, { status: 'swapped' });
    res.json({ message: 'Question marked for swap – trigger /api/ai/swap-question to generate replacement' });
  } catch (err) { res.status(400).json({ message: err.message }); }
});

module.exports = router;
