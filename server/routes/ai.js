// routes/ai.js  –  Claude API integration
const router = require('express').Router();
const axios = require('axios');
const { protect, authorise } = require('../middleware/auth');
const { ExamPaper, ExamQuestion, TeacherFeedback, RubricSubmission, SelfReflection } = require('../models/Assessment');
const { LearningOutcome } = require('../models/Core');

router.use(protect);

const claudeCall = async (systemPrompt, userMessage, maxTokens = 2000) => {
  const response = await axios.post(
    'https://api.anthropic.com/v1/messages',
    {
      model: 'claude-opus-4-6',
      max_tokens: maxTokens,
      system: systemPrompt,
      messages: [{ role: 'user', content: userMessage }]
    },
    {
      headers: {
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json'
      }
    }
  );
  return response.data.content[0].text;
};

// ── Generate exam questions for a paper ──────────────────────────
router.post('/generate-exam', authorise('teacher','admin'), async (req, res) => {
  try {
    const { paperId } = req.body;
    const paper = await ExamPaper.findById(paperId).populate('subject','name');
    if (!paper) return res.status(404).json({ message: 'Paper not found' });

    // Fetch LOs for the competencies tied to chosen chapters
    const los = await LearningOutcome.find({ grade: paper.grade })
      .populate('competency', 'code description');

    const systemPrompt = `You are an expert CBSE school exam paper setter for the HPC (Holistic Progress Card) platform. 
You create high-quality, curriculum-aligned questions for Grades 6-8 Science (NCERT).
Always respond with valid JSON only. No markdown, no explanation outside the JSON.`;

    const userMessage = `Generate exam questions for this paper configuration:
Subject: ${paper.subject.name}
Grade: ${paper.grade}
Exam type: ${paper.examType}
Term: ${paper.term}
Chapters: ${paper.chapters.join(', ')}
Total marks: ${paper.totalMarks}
Duration: ${paper.durationMins} minutes

Question type mix:
- MCQ: ${paper.questionTypeMix?.mcq?.count || 10} questions × ${paper.questionTypeMix?.mcq?.marks || 1} mark each
- Short answer: ${paper.questionTypeMix?.shortAnswer?.count || 8} questions × ${paper.questionTypeMix?.shortAnswer?.marks || 2} marks each
- Long answer: ${paper.questionTypeMix?.longAnswer?.count || 4} questions × ${paper.questionTypeMix?.longAnswer?.marks || 4} marks each
- Case-based: ${paper.questionTypeMix?.caseBased?.count || 1} questions × ${paper.questionTypeMix?.caseBased?.marks || 8} marks

Difficulty mix: Easy ${paper.difficultyMix?.easy || 30}%, Medium ${paper.difficultyMix?.medium || 50}%, Hard ${paper.difficultyMix?.hard || 20}%
Bloom distribution: Remember ${paper.bloomDistribution?.remember || 10}%, Understand ${paper.bloomDistribution?.understand || 20}%, Apply ${paper.bloomDistribution?.apply || 30}%, Analyse ${paper.bloomDistribution?.analyse || 25}%, Evaluate ${paper.bloomDistribution?.evaluate || 15}%

Available learning outcomes to map questions to:
${los.slice(0,20).map(lo => `${lo.loCode}: ${lo.description.substring(0,80)}...`).join('\n')}

Return a JSON array of question objects. Each object must have:
{
  "sectionLabel": "Section A",
  "questionNo": 1,
  "questionType": "mcq|short_answer|long_answer|case_based",
  "bloomLevel": "Remember|Understand|Apply|Analyse|Evaluate|Create",
  "difficulty": "easy|medium|hard",
  "questionText": "...",
  "options": [{"label":"A","text":"...","isCorrect":false}],  // MCQ only, 4 options
  "answerKey": "...",
  "markingGuide": "...",
  "marks": 1,
  "competencyCodes": ["C1.1"],
  "loCode": "C1.1.LO1.G6"
}`;

    const raw = await claudeCall(systemPrompt, userMessage, 4000);
    let questions;
    try {
      const cleaned = raw.replace(/```json\n?/g,'').replace(/```\n?/g,'').trim();
      questions = JSON.parse(cleaned);
    } catch {
      return res.status(500).json({ message: 'AI returned invalid JSON', raw });
    }

    // Save questions and update paper status
    const docs = questions.map((q, i) => ({ ...q, paper: paperId, aiGenerated: true, status: 'pending_review' }));
    await ExamQuestion.deleteMany({ paper: paperId, aiGenerated: true, status: 'pending_review' });
    const created = await ExamQuestion.insertMany(docs);
    await ExamPaper.findByIdAndUpdate(paperId, { status: 'ai_generated' });

    res.json({ count: created.length, questions: created });
  } catch (err) {
    console.error('AI generate-exam error:', err.message);
    res.status(500).json({ message: err.message });
  }
});

// ── Swap a single question ────────────────────────────────────────
router.post('/swap-question', authorise('teacher','admin'), async (req, res) => {
  try {
    const { paperId, questionId, reason } = req.body;
    const paper = await ExamPaper.findById(paperId).populate('subject','name');
    const oldQ = await ExamQuestion.findById(questionId);

    const systemPrompt = `You are an expert CBSE exam question writer. Return a single JSON question object only.`;
    const userMessage = `Replace this question with an alternative of the same type, difficulty, and Bloom level.
Original question: ${oldQ.questionText}
Type: ${oldQ.questionType}, Difficulty: ${oldQ.difficulty}, Bloom: ${oldQ.bloomLevel}, Marks: ${oldQ.marks}
Reason for replacement: ${reason || 'Teacher requested alternative'}
Subject: ${paper.subject.name}, Grade: ${paper.grade}

Return a single JSON object with: questionText, options (if MCQ), answerKey, markingGuide, bloomLevel, difficulty.`;

    const raw = await claudeCall(systemPrompt, userMessage, 1000);
    const cleaned = raw.replace(/```json\n?/g,'').replace(/```\n?/g,'').trim();
    const newQ = JSON.parse(cleaned);

    const created = await ExamQuestion.create({
      ...oldQ.toObject(), _id: undefined, ...newQ,
      paper: paperId, aiGenerated: true, teacherEdited: false, status: 'pending_review'
    });
    await ExamQuestion.findByIdAndUpdate(questionId, { status: 'swapped' });

    res.json(created);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ── Draft teacher feedback ────────────────────────────────────────
router.post('/draft-feedback', authorise('teacher'), async (req, res) => {
  try {
    const { studentId, activityId, studentName, activityTitle, competencyCode } = req.body;

    const [teacherSub, studentSub, peerSub, selfRef] = await Promise.all([
      RubricSubmission.findOne({ student: studentId, activity: activityId, submitterRole: 'teacher' }),
      RubricSubmission.findOne({ student: studentId, activity: activityId, submitterRole: 'student' }),
      RubricSubmission.findOne({ student: studentId, activity: activityId, submitterRole: 'peer' }),
      SelfReflection.findOne({ student: studentId, activity: activityId })
    ]);

    const systemPrompt = `You are a supportive, constructive school teacher writing HPC (Holistic Progress Card) feedback for a middle school student (Grade 6-8). 
Write in warm, encouraging language. Be specific. Reference the activity and the three abilities (Awareness, Sensitivity, Creativity).
Return a JSON object only.`;

    const userMessage = `Write teacher feedback for this student activity assessment.

Student: ${studentName}
Activity: ${activityTitle} (Competency: ${competencyCode})

Teacher assessment:
- Awareness: ${teacherSub?.awarenessLevel || 'Not assessed'}
- Sensitivity: ${teacherSub?.sensitivityLevel || 'Not assessed'}  
- Creativity: ${teacherSub?.creativityLevel || 'Not assessed'}
- Teacher notes: ${teacherSub?.observationNotes || 'None'}

Student self-assessment:
- Awareness: ${studentSub?.awarenessLevel || 'Not filled'}, Sensitivity: ${studentSub?.sensitivityLevel || 'Not filled'}, Creativity: ${studentSub?.creativityLevel || 'Not filled'}
- My learnings: ${selfRef?.myLearnings || 'Not filled'}
- Needs practice: ${selfRef?.needsPractice || 'None stated'}

Peer assessment:
- Awareness: ${peerSub?.awarenessLevel || 'Not filled'}, Sensitivity: ${peerSub?.sensitivityLevel || 'Not filled'}, Creativity: ${peerSub?.creativityLevel || 'Not filled'}

Return JSON with these fields:
{
  "feedbackText": "2-3 sentences of holistic observational feedback",
  "strengths": ["strength 1", "strength 2", "strength 3"],
  "barriers": ["barrier 1", "barrier 2"],
  "canProgress": "Yes|No|Not sure",
  "futureSteps": "1-2 actionable next steps for the student"
}`;

    const raw = await claudeCall(systemPrompt, userMessage, 800);
    const cleaned = raw.replace(/```json\n?/g,'').replace(/```\n?/g,'').trim();
    const draft = JSON.parse(cleaned);

    res.json(draft);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ── Generate / suggest LO rubric descriptors ─────────────────────
router.post('/generate-rubric-descriptors', authorise('admin'), async (req, res) => {
  try {
    const { competencyCode, competencyDesc, grade, loDesc, bloomLevel } = req.body;

    const systemPrompt = `You are an expert in CBSE curriculum, NCF-2023, and HPC (Holistic Progress Card) assessment. 
Return only valid JSON. No markdown.`;

    const userMessage = `Generate HPC rubric descriptors for this learning outcome.

Competency: ${competencyCode} – ${competencyDesc}
Grade: ${grade}
Learning Outcome: ${loDesc}
Bloom Level: ${bloomLevel}
Abilities to describe: Awareness, Sensitivity, Creativity

For each ability (Awareness, Sensitivity, Creativity), write Beginner / Proficient / Advanced descriptors.
- Descriptors must be ACTIVITY-SPECIFIC (use language like "the student can...", "the student...") 
- Beginner: with significant support, partial, errors
- Proficient: independently but with occasional gaps
- Advanced: fully, spontaneously, extends beyond the task

Return JSON:
{
  "Awareness": { "Beginner": "...", "Proficient": "...", "Advanced": "..." },
  "Sensitivity": { "Beginner": "...", "Proficient": "...", "Advanced": "..." },
  "Creativity": { "Beginner": "...", "Proficient": "...", "Advanced": "..." }
}`;

    const raw = await claudeCall(systemPrompt, userMessage, 1200);
    const cleaned = raw.replace(/```json\n?/g,'').replace(/```\n?/g,'').trim();
    res.json(JSON.parse(cleaned));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
