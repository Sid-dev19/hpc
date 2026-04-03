const mongoose = require('mongoose');
const { Schema } = mongoose;

// ── Rubric Submission (teacher / student / peer) ─────────────────
const RubricSubmissionSchema = new Schema({
  activity:      { type: Schema.Types.ObjectId, ref: 'Activity', required: true },
  student:       { type: Schema.Types.ObjectId, ref: 'User', required: true },
  submittedBy:   { type: Schema.Types.ObjectId, ref: 'User', required: true },
  submitterRole: { type: String, enum: ['teacher','student','peer'], required: true },
  term:          { type: String, enum: ['T1','T2'], required: true },
  school:        { type: Schema.Types.ObjectId, ref: 'School' },
  // B/P/A levels
  awarenessLevel:   { type: String, enum: ['Beginner','Proficient','Advanced'] },
  sensitivityLevel: { type: String, enum: ['Beginner','Proficient','Advanced'] },
  creativityLevel:  { type: String, enum: ['Beginner','Proficient','Advanced'] },
  // Numeric scores (0-6, from progress grid statement count)
  awarenessScore:   { type: Number, min: 0, max: 6 },
  sensitivityScore: { type: Number, min: 0, max: 6 },
  creativityScore:  { type: Number, min: 0, max: 6 },
  observationNotes: String
}, { timestamps: true });

// ── Self Reflection (student) ────────────────────────────────────
const SelfReflectionSchema = new Schema({
  student:   { type: Schema.Types.ObjectId, ref: 'User', required: true },
  activity:  { type: Schema.Types.ObjectId, ref: 'Activity', required: true },
  term:      String,
  // Emoji responses: proud/apply/motivated
  emojiResponses: {
    proud:     { type: String, enum: ['Yes','To an extent','No','Not sure'] },
    apply:     { type: String, enum: ['Yes','To an extent','No','Not sure'] },
    motivated: { type: String, enum: ['Yes','To an extent','No','Not sure'] }
  },
  // Progress grid: array of circled statement indices per ability
  awarenessStatements:   [Number],  // indices 0-5 of the 6 statements
  sensitivityStatements: [Number],
  creativityStatements:  [Number],
  // Computed B/P/A from statement count
  awarenessLevel:   String,
  sensitivityLevel: String,
  creativityLevel:  String,
  // My learnings free text
  myLearnings:     String,
  interestingThing:String,
  needsPractice:   String,
  needsHelp:       String
}, { timestamps: true });

// ── Teacher Feedback ─────────────────────────────────────────────
const TeacherFeedbackSchema = new Schema({
  submission:   { type: Schema.Types.ObjectId, ref: 'RubricSubmission', required: true },
  student:      { type: Schema.Types.ObjectId, ref: 'User', required: true },
  teacher:      { type: Schema.Types.ObjectId, ref: 'User', required: true },
  strengths:    [String],
  barriers:     [String],
  canProgress:  { type: String, enum: ['Yes','No','Not sure'] },
  futureSteps:  String,
  aiDraft:      String,
  finalText:    String,   // teacher-edited version
  isPublished:  { type: Boolean, default: false }
}, { timestamps: true });

// ── Term Summary (Part C) ────────────────────────────────────────
const TermSummarySchema = new Schema({
  student:   { type: Schema.Types.ObjectId, ref: 'User', required: true },
  subject:   { type: Schema.Types.ObjectId, ref: 'Subject', required: true },
  teacher:   { type: Schema.Types.ObjectId, ref: 'User', required: true },
  school:    { type: Schema.Types.ObjectId, ref: 'School' },
  term:      { type: String, enum: ['T1','T2'], required: true },
  awarenessLevel:   { type: String, enum: ['B','P','A'] },
  sensitivityLevel: { type: String, enum: ['B','P','A'] },
  creativityLevel:  { type: String, enum: ['B','P','A'] },
  holisticNote: String
}, { timestamps: true });

// ── Part A – Student ─────────────────────────────────────────────
const PartAStudentSchema = new Schema({
  student: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  // Part A(1) General information (pre-filled from profile)
  generalInfo: {
    dateOfBirth: Date,
    address: String,
    parentName: String,
    parentContact: String
  },
  // Part A(2) All About Me
  allAboutMe: {
    myStrengths:  String,
    myInterests:  String,
    myDreams:     String,
    aboutMyFamily:String
  },
  // Part A(3) Ambition Card
  ambitionCard: {
    iWantToBe:       String,
    stepICanTake:    String,
    personIAdmire:   String,
    subjectILove:    String
  }
}, { timestamps: true });

// ── Part A(4) – Parent Partnership Card ─────────────────────────
const PartA4ParentSchema = new Schema({
  student: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  parent:  { type: Schema.Types.ObjectId, ref: 'User', required: true },
  term:    { type: String, enum: ['T1','T2'], required: true },
  // Home resources checkboxes
  homeResources: {
    booksAndMagazines:   Boolean,
    newspapers:          Boolean,
    toysGamesAndSports:  Boolean,
    phoneAndComputer:    Boolean,
    internet:            Boolean,
    publicBroadcast:     Boolean,
    resourcesForCWSN:    Boolean,
    other:               String
  },
  // Understanding my child (Yes/Sometimes/No/Not sure)
  understandingChild: {
    motivated:  String,
    schedule:   String,
    difficulty: String,
    progress:   String
  },
  // Support needs
  needsSupportIn:  [String],
  homeSupportPlan: String
}, { timestamps: true });

// ── Exam Paper ───────────────────────────────────────────────────
const ExamPaperSchema = new Schema({
  subject:   { type: Schema.Types.ObjectId, ref: 'Subject', required: true },
  school:    { type: Schema.Types.ObjectId, ref: 'School' },
  createdBy: { type: Schema.Types.ObjectId, ref: 'User' },
  approvedBy:{ type: Schema.Types.ObjectId, ref: 'User' },
  grade:     { type: Number, required: true },
  examType:  { type: String, enum: ['unit_test','half_yearly','annual'], required: true },
  term:      { type: String, enum: ['T1','T2'] },
  title:     String,
  chapters:  [String],
  totalMarks:    { type: Number, default: 50 },
  durationMins:  { type: Number, default: 90 },
  difficultyMix: {
    easy:   { type: Number, default: 30 },
    medium: { type: Number, default: 50 },
    hard:   { type: Number, default: 20 }
  },
  bloomDistribution: {
    remember:  Number,
    understand:Number,
    apply:     Number,
    analyse:   Number,
    evaluate:  Number,
    create:    Number
  },
  questionTypeMix: {
    mcq:       { count: Number, marks: Number },
    shortAnswer:{ count: Number, marks: Number },
    longAnswer: { count: Number, marks: Number },
    caseBased:  { count: Number, marks: Number }
  },
  status: { type: String, enum: ['draft','ai_generated','under_review','approved','published'], default: 'draft' }
}, { timestamps: true });

// ── Exam Question ────────────────────────────────────────────────
const ExamQuestionSchema = new Schema({
  paper:          { type: Schema.Types.ObjectId, ref: 'ExamPaper', required: true },
  learningOutcome:{ type: Schema.Types.ObjectId, ref: 'LearningOutcome' },
  sectionLabel:   String,
  questionNo:     Number,
  questionType:   { type: String, enum: ['mcq','short_answer','long_answer','case_based'] },
  bloomLevel:     { type: String, enum: ['Remember','Understand','Apply','Analyse','Evaluate','Create'] },
  difficulty:     { type: String, enum: ['easy','medium','hard'] },
  questionText:   { type: String, required: true },
  options:        [{ label: String, text: String, isCorrect: Boolean }],
  answerKey:      String,
  markingGuide:   String,
  marks:          Number,
  competencyCodes:[String],
  aiGenerated:    { type: Boolean, default: true },
  teacherEdited:  { type: Boolean, default: false },
  status:         { type: String, enum: ['pending_review','approved','swapped'], default: 'pending_review' }
}, { timestamps: true });

module.exports = {
  RubricSubmission: mongoose.model('RubricSubmission', RubricSubmissionSchema),
  SelfReflection:   mongoose.model('SelfReflection', SelfReflectionSchema),
  TeacherFeedback:  mongoose.model('TeacherFeedback', TeacherFeedbackSchema),
  TermSummary:      mongoose.model('TermSummary', TermSummarySchema),
  PartAStudent:     mongoose.model('PartAStudent', PartAStudentSchema),
  PartA4Parent:     mongoose.model('PartA4Parent', PartA4ParentSchema),
  ExamPaper:        mongoose.model('ExamPaper', ExamPaperSchema),
  ExamQuestion:     mongoose.model('ExamQuestion', ExamQuestionSchema)
};
