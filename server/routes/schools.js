// routes/schools.js
const router = require('express').Router();
const { protect, authorise } = require('../middleware/auth');
const { School, ChapterTerm } = require('../models/Core');

router.use(protect);

router.get('/', async (req, res) => {
  try {
    const schools = await School.find().sort('name');
    res.json(schools);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.post('/', authorise('admin'), async (req, res) => {
  try {
    const school = await School.create(req.body);
    res.status(201).json(school);
  } catch (err) { res.status(400).json({ message: err.message }); }
});

router.put('/:id', authorise('admin'), async (req, res) => {
  try {
    const school = await School.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(school);
  } catch (err) { res.status(400).json({ message: err.message }); }
});

// Chapter-term mapping per school
router.get('/:id/chapter-terms', async (req, res) => {
  try {
    const filter = { school: req.params.id };
    if (req.query.grade) filter.grade = Number(req.query.grade);
    if (req.query.subjectId) filter.subject = req.query.subjectId;
    const mappings = await ChapterTerm.find(filter)
      .populate('subject','name code')
      .sort('grade chapterNo');
    res.json(mappings);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.post('/:id/chapter-terms', authorise('admin','teacher'), async (req, res) => {
  try {
    const mapping = await ChapterTerm.findOneAndUpdate(
      { school: req.params.id, subject: req.body.subjectId, grade: req.body.grade, chapterNo: req.body.chapterNo },
      { ...req.body, school: req.params.id },
      { upsert: true, new: true }
    );
    res.status(201).json(mapping);
  } catch (err) { res.status(400).json({ message: err.message }); }
});

module.exports = router;
