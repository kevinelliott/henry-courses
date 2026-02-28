-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Profiles table
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT,
  full_name TEXT,
  plan TEXT DEFAULT 'free',
  stripe_customer_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Courses table
CREATE TABLE courses (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  description TEXT,
  price NUMERIC DEFAULT 0,
  thumbnail_url TEXT,
  category TEXT,
  is_published BOOLEAN DEFAULT FALSE,
  student_count INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Sections table
CREATE TABLE sections (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  course_id UUID REFERENCES courses(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  position INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Lessons table
CREATE TABLE lessons (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  section_id UUID REFERENCES sections(id) ON DELETE CASCADE NOT NULL,
  course_id UUID REFERENCES courses(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  video_url TEXT,
  content TEXT,
  position INT NOT NULL DEFAULT 0,
  duration_minutes INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enrollments table
CREATE TABLE enrollments (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  course_id UUID REFERENCES courses(id) ON DELETE CASCADE NOT NULL,
  instructor_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  student_email TEXT NOT NULL,
  stripe_session_id TEXT,
  status TEXT DEFAULT 'active',
  enrolled_at TIMESTAMPTZ DEFAULT NOW()
);

-- Progress table
CREATE TABLE progress (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  enrollment_id UUID REFERENCES enrollments(id) ON DELETE CASCADE NOT NULL,
  lesson_id UUID REFERENCES lessons(id) ON DELETE CASCADE NOT NULL,
  completed_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(enrollment_id, lesson_id)
);

-- RLS Policies
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE progress ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Courses policies
CREATE POLICY "Instructors own their courses" ON courses FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Published courses are viewable" ON courses FOR SELECT USING (is_published = true);

-- Sections policies
CREATE POLICY "Instructors manage sections" ON sections FOR ALL USING (
  EXISTS (SELECT 1 FROM courses WHERE courses.id = sections.course_id AND courses.user_id = auth.uid())
);
CREATE POLICY "Sections viewable for published courses" ON sections FOR SELECT USING (
  EXISTS (SELECT 1 FROM courses WHERE courses.id = sections.course_id AND courses.is_published = true)
);

-- Lessons policies
CREATE POLICY "Instructors manage lessons" ON lessons FOR ALL USING (
  EXISTS (SELECT 1 FROM courses WHERE courses.id = lessons.course_id AND courses.user_id = auth.uid())
);
CREATE POLICY "Lessons viewable for published courses" ON lessons FOR SELECT USING (
  EXISTS (SELECT 1 FROM courses WHERE courses.id = lessons.course_id AND courses.is_published = true)
);

-- Enrollments policies
CREATE POLICY "Instructors view enrollments" ON enrollments FOR SELECT USING (auth.uid() = instructor_id);
CREATE POLICY "Service can insert enrollments" ON enrollments FOR INSERT WITH CHECK (true);

-- Progress policies
CREATE POLICY "Students manage own progress" ON progress FOR ALL USING (
  EXISTS (SELECT 1 FROM enrollments WHERE enrollments.id = progress.enrollment_id)
);

-- Profile trigger
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, email, full_name)
  VALUES (NEW.id, NEW.email, NEW.raw_user_meta_data->>'full_name')
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Update student_count trigger
CREATE OR REPLACE FUNCTION update_student_count()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE courses SET student_count = (
    SELECT COUNT(*) FROM enrollments WHERE course_id = NEW.course_id AND status = 'active'
  ) WHERE id = NEW.course_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_enrollment_created
  AFTER INSERT OR UPDATE ON enrollments
  FOR EACH ROW EXECUTE FUNCTION update_student_count();
