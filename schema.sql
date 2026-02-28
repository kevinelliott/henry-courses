-- TutorPulse: Progress intelligence for independent tutors
-- 8 tables: tutors, students, subjects, sessions, assessments, goals, notes, parent_reports

CREATE TABLE IF NOT EXISTS tutors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT,
  specialties TEXT DEFAULT '',
  hourly_rate NUMERIC(10,2) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS students (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tutor_id UUID REFERENCES tutors(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  grade TEXT DEFAULT '',
  parent_name TEXT DEFAULT '',
  parent_email TEXT DEFAULT '',
  parent_phone TEXT DEFAULT '',
  status TEXT DEFAULT 'active' CHECK (status IN ('active','paused','graduated','dropped')),
  started_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS subjects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tutor_id UUID REFERENCES tutors(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  category TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Each tutoring session logged
CREATE TABLE IF NOT EXISTS sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tutor_id UUID REFERENCES tutors(id) ON DELETE CASCADE,
  student_id UUID REFERENCES students(id) ON DELETE CASCADE,
  subject_id UUID REFERENCES subjects(id) ON DELETE SET NULL,
  scheduled_date DATE NOT NULL,
  duration_minutes INTEGER DEFAULT 60,
  amount NUMERIC(10,2) DEFAULT 0,
  status TEXT DEFAULT 'completed' CHECK (status IN ('scheduled','completed','cancelled','no-show')),
  topics_covered TEXT DEFAULT '',
  homework_assigned TEXT DEFAULT '',
  engagement_score INTEGER DEFAULT 5 CHECK (engagement_score BETWEEN 1 AND 10),
  comprehension_score INTEGER DEFAULT 5 CHECK (comprehension_score BETWEEN 1 AND 10),
  notes TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Skill assessments (scored 1-10 per topic per student over time)
CREATE TABLE IF NOT EXISTS assessments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tutor_id UUID REFERENCES tutors(id) ON DELETE CASCADE,
  student_id UUID REFERENCES students(id) ON DELETE CASCADE,
  subject_id UUID REFERENCES subjects(id) ON DELETE SET NULL,
  skill_name TEXT NOT NULL,
  score INTEGER NOT NULL CHECK (score BETWEEN 1 AND 10),
  assessed_at DATE DEFAULT CURRENT_DATE,
  notes TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Goals per student
CREATE TABLE IF NOT EXISTS goals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tutor_id UUID REFERENCES tutors(id) ON DELETE CASCADE,
  student_id UUID REFERENCES students(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT DEFAULT '',
  target_date DATE,
  status TEXT DEFAULT 'active' CHECK (status IN ('active','achieved','abandoned')),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Session notes / observations
CREATE TABLE IF NOT EXISTS session_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES sessions(id) ON DELETE CASCADE,
  note TEXT NOT NULL,
  visibility TEXT DEFAULT 'tutor' CHECK (visibility IN ('tutor','parent','both')),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS but allow all for now (anon key)
ALTER TABLE tutors ENABLE ROW LEVEL SECURITY;
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE session_notes ENABLE ROW LEVEL SECURITY;

-- Permissive policies for MVP
DO $$ 
DECLARE t TEXT;
BEGIN
  FOR t IN SELECT unnest(ARRAY['tutors','students','subjects','sessions','assessments','goals','session_notes'])
  LOOP
    EXECUTE format('CREATE POLICY "allow_all_%s" ON %I FOR ALL USING (true) WITH CHECK (true)', t, t);
  END LOOP;
END $$;
