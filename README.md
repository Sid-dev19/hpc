# HPC Platform — MERN Stack
**Holistic Progress Card · Middle Stage (Grades 6–8) · K12**

---

## Quick start

```bash
# 1. Clone and install
npm run install:all

# 2. Configure server environment
cd server && cp .env.example .env
# Edit .env → set MONGO_URI and ANTHROPIC_API_KEY

# 3. Seed demo data
cd server && node utils/seed.js

# 4. Run dev servers (client :3000 + server :5000)
cd .. && npm run dev
```

Demo accounts (password: `demo123`)
| Email | Role |
|---|---|
| admin@vidyabharati.edu   | Admin |
| teacher@vidyabharati.edu | Teacher |
| student@vidyabharati.edu | Student (Arjun Verma, Grade 6A) |
| peer@vidyabharati.edu    | Student/Peer (Zara Sheikh) |
| parent@vidyabharati.edu  | Parent (Ramesh Verma) |

---

## Architecture

```
hpc-platform/
├── client/                    React 18 SPA
│   └── src/
│       ├── App.js             Role-based router
│       ├── context/
│       │   └── AuthContext.js JWT auth state
│       ├── services/
│       │   └── api.js         Axios instance
│       ├── components/
│       │   ├── common/
│       │   │   └── AppShell.js  Sidebar + topbar layout
│       │   └── shared/
│       │       └── ProgressWheel.js  SVG interactive wheel
│       └── pages/
│           ├── admin/         Dashboard, Users, Competencies, ChapterMap, Exams, Analytics
│           ├── teacher/       Dashboard, RubricFill, TermSummary, Activities, ExamGen
│           ├── student/       Dashboard, PartA, SelfReflect, ProgressWheel, HPCReport
│           ├── peer/          Dashboard, Assessment
│           └── parent/        Dashboard, ProgressView, Reflection (Part A4)
│
└── server/                    Express + MongoDB
    ├── index.js               Entry point, all routes registered
    ├── config/db.js           Mongoose connection
    ├── middleware/auth.js     JWT protect + authorise
    ├── models/
    │   ├── User.js            All 5 roles (admin/teacher/student/peer/parent)
    │   ├── Core.js            School, Subject, CG, Competency, LO, Activity, ChapterTerm
    │   └── Assessment.js      RubricSubmission, SelfReflection, TeacherFeedback,
    │                          TermSummary, PartAStudent, PartA4Parent, ExamPaper, ExamQuestion
    ├── routes/
    │   ├── auth.js            POST /login, GET /me
    │   ├── users.js           CRUD users, role-filtered lists
    │   ├── schools.js         School management + chapter-term mapping
    │   ├── competencies.js    Subjects, CGs, competencies, LOs, LO rubrics
    │   ├── activities.js      Activity library, rubric descriptors
    │   ├── rubrics.js         Teacher/student/peer submissions, wheel data
    │   ├── feedback.js        Teacher feedback CRUD
    │   ├── termSummary.js     Part C (teacher only)
    │   ├── partA.js           Part A student + Part A4 parent
    │   ├── exams.js           Exam paper + question management
    │   ├── ai.js              Claude API — exam gen, feedback draft, rubric gen
    │   └── dashboard.js       Role-specific dashboard stats
    └── utils/seed.js          Demo data seeder
```

---

## Key design decisions

### Two rubric layers
- **LO rubric** (`lo_rubric_descriptors`) — template, used by admin/AI as generation source
- **Activity rubric** (`activity_rubrics`) — task-specific B/P/A descriptors, filled by teacher/student/peer

### Progress Wheel scoring
- Student and peer use 18-statement progress grids (6 per ability)
- Score 0–2 = Beginner, 3–4 = Proficient, 5–6 = Advanced
- Teacher uses direct B/P/A selection with descriptor text shown
- Disparity flag: if teacher and student differ by ≥2 levels on any ability

### AI integration (Claude API)
- **`POST /api/ai/generate-exam`** — generates full paper from config + LOs
- **`POST /api/ai/draft-feedback`** — drafts teacher feedback from 3-role rubric data
- **`POST /api/ai/swap-question`** — replaces a single question with same constraints
- **`POST /api/ai/generate-rubric-descriptors`** — generates B/P/A descriptors per LO

### Role-based access
| Route | Admin | Teacher | Student | Peer | Parent |
|---|---|---|---|---|---|
| `/admin/*` | ✓ | | | | |
| `/teacher/*` | | ✓ | | | |
| `/student/*` | | | ✓ | | |
| `/peer/*` | | | ✓ | ✓ | |
| `/parent/*` | | | | | ✓ |

### Part A flow
- Part A(1): pre-filled from student profile
- Part A(2) & A(3): student fills (About Me + Ambition Card)
- Part A(4): parent fills at end of each term (Partnership Card)

### Exam generation workflow
1. Teacher configures paper (grade, type, term, chapters, Bloom mix, difficulty split, marks)
2. `POST /api/exams/papers` creates the paper record
3. `POST /api/ai/generate-exam` sends config + LOs to Claude, saves questions
4. Teacher reviews each question (approve / edit / swap)
5. `PUT /api/exams/papers/:id/approve` validates all questions approved
6. `PUT /api/exams/papers/:id/publish` makes paper available

---

## Data seeding

Science competencies, LOs, rubric descriptors, and activities are in:
`Science_HPC_Complete_Seed_v2.xlsx`

Import to MongoDB with a script that reads the Excel and calls the `/api/competencies` endpoints, or use `mongoimport` with a JSON conversion.

---

## Environment variables

| Variable | Description |
|---|---|
| `MONGO_URI` | MongoDB connection string |
| `JWT_SECRET` | JWT signing secret |
| `JWT_EXPIRE` | Token expiry (default `7d`) |
| `ANTHROPIC_API_KEY` | Claude API key for AI features |
| `CLIENT_URL` | React dev server URL for CORS |
| `PORT` | Server port (default 5000) |
