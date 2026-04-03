// routes/activities.js
const router = require('express').Router();
const { protect, authorise } = require('../middleware/auth');
const { Activity, ActivityRubric } = require('../models/Core');

router.use(protect);

// Get activities by competency + grade
router.get('/', async (req, res) => {
  try {
    const { competencyId, grade } = req.query;
    const filter = {};
    if (competencyId) filter.competency = competencyId;
    if (grade) filter.grade = Number(grade);
    const activities = await Activity.find(filter)
      .populate('competency', 'code description')
      .populate('createdBy', 'name role')
      .sort({ isPreloaded: -1, createdAt: 1 });
    res.json(activities);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

router.get('/:id', async (req, res) => {
  try {
    const activity = await Activity.findById(req.params.id)
      .populate('competency', 'code description')
      .populate('createdBy', 'name');
    if (!activity) return res.status(404).json({ message: 'Activity not found' });
    const rubrics = await ActivityRubric.find({ activity: activity._id });
    res.json({ activity, rubrics });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// Admin: create preloaded activity
router.post('/', authorise('admin','teacher'), async (req, res) => {
  try {
    const activity = await Activity.create({
      ...req.body,
      createdBy: req.user._id,
      isPreloaded: req.user.role === 'admin'
    });
    res.status(201).json(activity);
  } catch (err) { res.status(400).json({ message: err.message }); }
});

// Admin: seed activity rubric descriptors
router.post('/:id/rubric-descriptors', authorise('admin'), async (req, res) => {
  try {
    const { descriptors } = req.body; // array of {ability, level, descriptorText}
    const docs = descriptors.map(d => ({ ...d, activity: req.params.id }));
    await ActivityRubric.deleteMany({ activity: req.params.id });
    const created = await ActivityRubric.insertMany(docs);
    res.status(201).json(created);
  } catch (err) { res.status(400).json({ message: err.message }); }
});

router.put('/:id', authorise('admin','teacher'), async (req, res) => {
  try {
    const activity = await Activity.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(activity);
  } catch (err) { res.status(400).json({ message: err.message }); }
});

module.exports = router;
