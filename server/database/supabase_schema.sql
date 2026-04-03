-- HPC Platform Supabase Schema
-- Generated from MongoDB models

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table (replaces MongoDB User collection)
CREATE TABLE users (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    school_id UUID REFERENCES schools(id),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(20) CHECK (role IN ('admin', 'teacher', 'student', 'peer', 'parent')) NOT NULL,
    phone VARCHAR(20),
    grade INTEGER,
    section VARCHAR(10),
    roll_no VARCHAR(20),
    child_id UUID REFERENCES users(id),
    peer_id UUID REFERENCES users(id),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Schools table
CREATE TABLE schools (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    board VARCHAR(50) DEFAULT 'CBSE',
    city VARCHAR(100),
    academic_year VARCHAR(10) DEFAULT '2024-25',
    stage VARCHAR(20) DEFAULT 'middle',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Subjects table
CREATE TABLE subjects (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    code VARCHAR(20) NOT NULL,
    stage VARCHAR(20) DEFAULT 'middle',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Curricular Goals table
CREATE TABLE curricular_goals (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    subject_id UUID REFERENCES subjects(id) NOT NULL,
    code VARCHAR(20) NOT NULL,
    description TEXT NOT NULL,
    grade_applicability INTEGER[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Competencies table
CREATE TABLE competencies (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    curricular_goal_id UUID REFERENCES curricular_goals(id) NOT NULL,
    code VARCHAR(20) NOT NULL,
    description TEXT NOT NULL,
    grade_applicability INTEGER[],
    ability_emphasis VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Learning Outcomes table
CREATE TABLE learning_outcomes (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    competency_id UUID REFERENCES competencies(id) NOT NULL,
    grade INTEGER NOT NULL,
    lo_number INTEGER DEFAULT 1,
    lo_code VARCHAR(50),
    description TEXT NOT NULL,
    ncert_chapters VARCHAR(100),
    bloom_level VARCHAR(20) CHECK (bloom_level IN ('Remember','Understand','Apply','Analyse','Evaluate','Create')),
    ability_focus VARCHAR(100),
    term_indicative VARCHAR(20),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- LO Rubric Descriptors table
CREATE TABLE lo_rubric_descriptors (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    learning_outcome_id UUID REFERENCES learning_outcomes(id) NOT NULL,
    ability VARCHAR(20) CHECK (ability IN ('Awareness','Sensitivity','Creativity')) NOT NULL,
    level VARCHAR(20) CHECK (level IN ('Beginner','Proficient','Advanced')) NOT NULL,
    descriptor_text TEXT NOT NULL,
    grade_anchor VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Activities table
CREATE TABLE activities (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    competency_id UUID REFERENCES competencies(id) NOT NULL,
    grade INTEGER NOT NULL,
    title VARCHAR(255) NOT NULL,
    approach VARCHAR(50) CHECK (approach IN ('Art-integrated','Sports-integrated','Toy-based','Technology-integrated','Any other')),
    is_preloaded BOOLEAN DEFAULT true,
    created_by UUID REFERENCES users(id),
    aq_awareness TEXT,
    aq_sensitivity TEXT,
    aq_creativity TEXT,
    steps TEXT[],
    materials TEXT[],
    duration_mins INTEGER,
    term VARCHAR(10) CHECK (term IN ('T1','T2','ongoing','T1-T2')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Activity Rubrics table
CREATE TABLE activity_rubrics (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    activity_id UUID REFERENCES activities(id) NOT NULL,
    ability VARCHAR(20) CHECK (ability IN ('Awareness','Sensitivity','Creativity')) NOT NULL,
    level VARCHAR(20) CHECK (level IN ('Beginner','Proficient','Advanced')) NOT NULL,
    descriptor_text TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Chapter Term Mapping table
CREATE TABLE chapter_terms (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    school_id UUID REFERENCES schools(id) NOT NULL,
    subject_id UUID REFERENCES subjects(id) NOT NULL,
    grade INTEGER NOT NULL,
    chapter_no INTEGER,
    chapter_name VARCHAR(255),
    term VARCHAR(10) CHECK (term IN ('T1','T2','ongoing')),
    primary_competencies TEXT[],
    supporting_competencies TEXT[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Rubric Submissions table
CREATE TABLE rubric_submissions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    activity_id UUID REFERENCES activities(id) NOT NULL,
    student_id UUID REFERENCES users(id) NOT NULL,
    submitted_by UUID REFERENCES users(id) NOT NULL,
    submitter_role VARCHAR(20) CHECK (submitter_role IN ('teacher','student','peer')) NOT NULL,
    term VARCHAR(5) CHECK (term IN ('T1','T2')) NOT NULL,
    school_id UUID REFERENCES schools(id),
    awareness_level VARCHAR(20) CHECK (awareness_level IN ('Beginner','Proficient','Advanced')),
    sensitivity_level VARCHAR(20) CHECK (sensitivity_level IN ('Beginner','Proficient','Advanced')),
    creativity_level VARCHAR(20) CHECK (creativity_level IN ('Beginner','Proficient','Advanced')),
    awareness_score INTEGER CHECK (awareness_score >= 0 AND awareness_score <= 6),
    sensitivity_score INTEGER CHECK (sensitivity_score >= 0 AND sensitivity_score <= 6),
    creativity_score INTEGER CHECK (creativity_score >= 0 AND creativity_score <= 6),
    observation_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Self Reflections table
CREATE TABLE self_reflections (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    student_id UUID REFERENCES users(id) NOT NULL,
    activity_id UUID REFERENCES activities(id) NOT NULL,
    term VARCHAR(10),
    emoji_proud VARCHAR(20) CHECK (emoji_proud IN ('Yes','To an extent','No','Not sure')),
    emoji_apply VARCHAR(20) CHECK (emoji_apply IN ('Yes','To an extent','No','Not sure')),
    emoji_motivated VARCHAR(20) CHECK (emoji_motivated IN ('Yes','To an extent','No','Not sure')),
    awareness_statements INTEGER[],
    sensitivity_statements INTEGER[],
    creativity_statements INTEGER[],
    awareness_level VARCHAR(20),
    sensitivity_level VARCHAR(20),
    creativity_level VARCHAR(20),
    my_learnings TEXT,
    interesting_thing TEXT,
    needs_practice TEXT,
    needs_help TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Teacher Feedback table
CREATE TABLE teacher_feedback (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    submission_id UUID REFERENCES rubric_submissions(id) NOT NULL,
    student_id UUID REFERENCES users(id) NOT NULL,
    teacher_id UUID REFERENCES users(id) NOT NULL,
    strengths TEXT[],
    barriers TEXT[],
    can_progress VARCHAR(20) CHECK (can_progress IN ('Yes','No','Not sure')),
    future_steps TEXT,
    ai_draft TEXT,
    final_text TEXT,
    is_published BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Term Summaries table
CREATE TABLE term_summaries (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    student_id UUID REFERENCES users(id) NOT NULL,
    subject_id UUID REFERENCES subjects(id) NOT NULL,
    teacher_id UUID REFERENCES users(id) NOT NULL,
    school_id UUID REFERENCES schools(id),
    term VARCHAR(5) CHECK (term IN ('T1','T2')) NOT NULL,
    awareness_level VARCHAR(1) CHECK (awareness_level IN ('B','P','A')),
    sensitivity_level VARCHAR(1) CHECK (sensitivity_level IN ('B','P','A')),
    creativity_level VARCHAR(1) CHECK (creativity_level IN ('B','P','A')),
    holistic_note TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Part A Student table
CREATE TABLE part_a_students (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    student_id UUID REFERENCES users(id) NOT NULL UNIQUE,
    date_of_birth DATE,
    address TEXT,
    parent_name VARCHAR(255),
    parent_contact VARCHAR(50),
    my_strengths TEXT,
    my_interests TEXT,
    my_dreams TEXT,
    about_my_family TEXT,
    i_want_to_be TEXT,
    step_i_can_take TEXT,
    person_i_admire TEXT,
    subject_i_love TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Part A4 Parent table
CREATE TABLE part_a4_parents (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    student_id UUID REFERENCES users(id) NOT NULL,
    parent_id UUID REFERENCES users(id) NOT NULL,
    term VARCHAR(5) CHECK (term IN ('T1','T2')) NOT NULL,
    books_and_magazines BOOLEAN DEFAULT false,
    newspapers BOOLEAN DEFAULT false,
    toys_games_and_sports BOOLEAN DEFAULT false,
    phone_and_computer BOOLEAN DEFAULT false,
    internet BOOLEAN DEFAULT false,
    public_broadcast BOOLEAN DEFAULT false,
    resources_for_cwsn BOOLEAN DEFAULT false,
    other_resources TEXT,
    motivated VARCHAR(20) CHECK (motivated IN ('Yes','Sometimes','No','Not sure')),
    schedule VARCHAR(20) CHECK (schedule IN ('Yes','Sometimes','No','Not sure')),
    difficulty VARCHAR(20) CHECK (difficulty IN ('Yes','Sometimes','No','Not sure')),
    progress VARCHAR(20) CHECK (progress IN ('Yes','Sometimes','No','Not sure')),
    needs_support_in TEXT[],
    home_support_plan TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Exam Papers table
CREATE TABLE exam_papers (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    subject_id UUID REFERENCES subjects(id) NOT NULL,
    school_id UUID REFERENCES schools(id),
    created_by UUID REFERENCES users(id),
    approved_by UUID REFERENCES users(id),
    grade INTEGER NOT NULL,
    exam_type VARCHAR(20) CHECK (exam_type IN ('unit_test','half_yearly','annual')) NOT NULL,
    term VARCHAR(5) CHECK (term IN ('T1','T2')),
    title VARCHAR(255),
    chapters TEXT[],
    total_marks INTEGER DEFAULT 50,
    duration_mins INTEGER DEFAULT 90,
    easy_percent INTEGER DEFAULT 30,
    medium_percent INTEGER DEFAULT 50,
    hard_percent INTEGER DEFAULT 20,
    remember_percent INTEGER,
    understand_percent INTEGER,
    apply_percent INTEGER,
    analyse_percent INTEGER,
    evaluate_percent INTEGER,
    create_percent INTEGER,
    mcq_count INTEGER,
    mcq_marks INTEGER,
    short_answer_count INTEGER,
    short_answer_marks INTEGER,
    long_answer_count INTEGER,
    long_answer_marks INTEGER,
    case_based_count INTEGER,
    case_based_marks INTEGER,
    status VARCHAR(20) CHECK (status IN ('draft','ai_generated','under_review','approved','published')) DEFAULT 'draft',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Exam Questions table
CREATE TABLE exam_questions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    paper_id UUID REFERENCES exam_papers(id) NOT NULL,
    learning_outcome_id UUID REFERENCES learning_outcomes(id),
    section_label VARCHAR(50),
    question_no INTEGER,
    question_type VARCHAR(20) CHECK (question_type IN ('mcq','short_answer','long_answer','case_based')),
    bloom_level VARCHAR(20) CHECK (bloom_level IN ('Remember','Understand','Apply','Analyse','Evaluate','Create')),
    difficulty VARCHAR(10) CHECK (difficulty IN ('easy','medium','hard')),
    question_text TEXT NOT NULL,
    options JSONB,
    answer_key TEXT,
    marking_guide TEXT,
    marks INTEGER,
    competency_codes TEXT[],
    ai_generated BOOLEAN DEFAULT true,
    teacher_edited BOOLEAN DEFAULT false,
    status VARCHAR(20) CHECK (status IN ('pending_review','approved','swapped')) DEFAULT 'pending_review',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_school ON users(school_id);
CREATE INDEX idx_activities_competency ON activities(competency_id);
CREATE INDEX idx_activities_grade ON activities(grade);
CREATE INDEX idx_rubric_submissions_student ON rubric_submissions(student_id);
CREATE INDEX idx_rubric_submissions_activity ON rubric_submissions(activity_id);
CREATE INDEX idx_exam_questions_paper ON exam_questions(paper_id);
CREATE INDEX idx_learning_outcomes_competency ON learning_outcomes(competency_id);
CREATE INDEX idx_learning_outcomes_grade ON learning_outcomes(grade);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_schools_updated_at BEFORE UPDATE ON schools FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_subjects_updated_at BEFORE UPDATE ON subjects FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_curricular_goals_updated_at BEFORE UPDATE ON curricular_goals FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_competencies_updated_at BEFORE UPDATE ON competencies FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_learning_outcomes_updated_at BEFORE UPDATE ON learning_outcomes FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_lo_rubric_descriptors_updated_at BEFORE UPDATE ON lo_rubric_descriptors FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_activities_updated_at BEFORE UPDATE ON activities FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_activity_rubrics_updated_at BEFORE UPDATE ON activity_rubrics FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_chapter_terms_updated_at BEFORE UPDATE ON chapter_terms FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_rubric_submissions_updated_at BEFORE UPDATE ON rubric_submissions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_self_reflections_updated_at BEFORE UPDATE ON self_reflections FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_teacher_feedback_updated_at BEFORE UPDATE ON teacher_feedback FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_term_summaries_updated_at BEFORE UPDATE ON term_summaries FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_part_a_students_updated_at BEFORE UPDATE ON part_a_students FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_part_a4_parents_updated_at BEFORE UPDATE ON part_a4_parents FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_exam_papers_updated_at BEFORE UPDATE ON exam_papers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_exam_questions_updated_at BEFORE UPDATE ON exam_questions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
