const mongoose = require('mongoose');
const { Schema } = mongoose;

// ── School ───────────────────────────────────────────────────────
const SchoolSchema = new Schema({
  name:         { type: String, required: true },
  board:        { type: String, default: 'CBSE' },
  city:         String,
  academicYear: { type: String, default: '2024-25' },
  stage:        { type: String, default: 'middle' }
}, { timestamps: true });

// ── Subject ──────────────────────────────────────────────────────
const SubjectSchema = new Schema({
  name:   { type: String, required: true },
  code:   { type: String, required: true },
  stage:  { type: String, default: 'middle' }
});

// ── Curricular Goal ──────────────────────────────────────────────
const CurricularGoalSchema = new Schema({
  subject:          { type: Schema.Types.ObjectId, ref: 'Subject', required: true },
  code:             { type: String, required: true },   // e.g. "CG1"
  description:      { type: String, required: true },
  gradeApplicability: [Number]                          // [6,7,8]
});

// ── Competency ───────────────────────────────────────────────────
const CompetencySchema = new Schema({
  curricularGoal:   { type: Schema.Types.ObjectId, ref: 'CurricularGoal', required: true },
  code:             { type: String, required: true },   // e.g. "C1.1"
  description:      { type: String, required: true },
  gradeApplicability: [Number],
  abilityEmphasis:  String                              // "Awareness + Creativity"
});

// ── Learning Outcome ─────────────────────────────────────────────
const LearningOutcomeSchema = new Schema({
  competency:    { type: Schema.Types.ObjectId, ref: 'Competency', required: true },
  grade:         { type: Number, required: true },
  loNumber:      { type: Number, default: 1 },
  loCode:        String,                                // e.g. "C1.1.LO1.G6"
  description:   { type: String, required: true },
  ncertChapters: String,
  bloomLevel:    { type: String, enum: ['Remember','Understand','Apply','Analyse','Evaluate','Create'] },
  abilityFocus:  String,
  termIndicative:String
});

// ── LO Rubric Descriptor (template layer) ───────────────────────
const LORubricDescriptorSchema = new Schema({
  learningOutcome: { type: Schema.Types.ObjectId, ref: 'LearningOutcome', required: true },
  ability:         { type: String, enum: ['Awareness','Sensitivity','Creativity'], required: true },
  level:           { type: String, enum: ['Beginner','Proficient','Advanced'], required: true },
  descriptorText:  { type: String, required: true },
  gradeAnchor:     String
});

// ── Activity ─────────────────────────────────────────────────────
const ActivitySchema = new Schema({
  competency:    { type: Schema.Types.ObjectId, ref: 'Competency', required: true },
  grade:         { type: Number, required: true },
  title:         { type: String, required: true },
  approach:      { type: String, enum: ['Art-integrated','Sports-integrated','Toy-based','Technology-integrated','Any other'] },
  isPreloaded:   { type: Boolean, default: true },
  createdBy:     { type: Schema.Types.ObjectId, ref: 'User' },
  // Assessment questions (observation guide for teacher)
  aqAwareness:   String,
  aqSensitivity: String,
  aqCreativity:  String,
  // Activity content
  steps:         [String],
  materials:     [String],
  durationMins:  Number,
  term:          { type: String, enum: ['T1','T2','ongoing','T1-T2'] }
}, { timestamps: true });

// ── Activity Rubric Descriptor (fillable layer) ──────────────────
const ActivityRubricSchema = new Schema({
  activity: { type: Schema.Types.ObjectId, ref: 'Activity', required: true },
  ability:  { type: String, enum: ['Awareness','Sensitivity','Creativity'], required: true },
  level:    { type: String, enum: ['Beginner','Proficient','Advanced'], required: true },
  descriptorText: { type: String, required: true }
});

// ── Chapter–Term Mapping (per school, configurable) ──────────────
const ChapterTermSchema = new Schema({
  school:   { type: Schema.Types.ObjectId, ref: 'School', required: true },
  subject:  { type: Schema.Types.ObjectId, ref: 'Subject', required: true },
  grade:    { type: Number, required: true },
  chapterNo:     Number,
  chapterName:   String,
  term:          { type: String, enum: ['T1','T2','ongoing'] },
  primaryCompetencies:    [String],
  supportingCompetencies: [String]
}, { timestamps: true });

module.exports = {
  School:              mongoose.model('School', SchoolSchema),
  Subject:             mongoose.model('Subject', SubjectSchema),
  CurricularGoal:      mongoose.model('CurricularGoal', CurricularGoalSchema),
  Competency:          mongoose.model('Competency', CompetencySchema),
  LearningOutcome:     mongoose.model('LearningOutcome', LearningOutcomeSchema),
  LORubricDescriptor:  mongoose.model('LORubricDescriptor', LORubricDescriptorSchema),
  Activity:            mongoose.model('Activity', ActivitySchema),
  ActivityRubric:      mongoose.model('ActivityRubric', ActivityRubricSchema),
  ChapterTerm:         mongoose.model('ChapterTerm', ChapterTermSchema)
};
