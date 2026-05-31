-- MUI PORTAL — COMPLETE DATABASE SCHEMA
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- PROFILES
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT NOT NULL, full_name TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'student' CHECK (role IN ('admin','mentor','student')),
  avatar_url TEXT, institution TEXT,
  institution_type TEXT CHECK (institution_type IN ('university','tvet','college','kmtc')),
  year_of_study TEXT, county TEXT, phone TEXT, bio TEXT,
  approved BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE OR REPLACE FUNCTION update_updated_at() RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER profiles_updated_at BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE OR REPLACE FUNCTION handle_new_user() RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id,email,full_name,role,approved) VALUES (
    NEW.id, NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name',''),
    CASE
      WHEN NEW.raw_user_meta_data->>'role' = 'mentor' THEN 'mentor'
      ELSE 'student'
    END,
    false
  ); RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- COHORTS
CREATE TABLE cohorts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL, semester TEXT NOT NULL, year INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','applications_open','active','completed')),
  start_date DATE, end_date DATE, max_participants INTEGER NOT NULL DEFAULT 25,
  current_week INTEGER NOT NULL DEFAULT 1,
  applications_open BOOLEAN NOT NULL DEFAULT false,
  vision_clubs_enabled BOOLEAN NOT NULL DEFAULT false,
  capstone_submissions_enabled BOOLEAN NOT NULL DEFAULT false,
  chat_enabled BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE TRIGGER cohorts_updated_at BEFORE UPDATE ON cohorts FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- WAITLIST
CREATE TABLE waitlist (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  cohort_id UUID NOT NULL REFERENCES cohorts(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  position INTEGER, status TEXT NOT NULL DEFAULT 'waiting' CHECK (status IN ('waiting','admitted','rejected')),
  application_essay TEXT, motivation TEXT,
  applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(cohort_id,student_id)
);

CREATE OR REPLACE FUNCTION set_waitlist_position() RETURNS TRIGGER AS $$
BEGIN SELECT COALESCE(MAX(position),0)+1 INTO NEW.position FROM waitlist WHERE cohort_id=NEW.cohort_id AND status='waiting'; RETURN NEW; END;
$$ LANGUAGE plpgsql;
CREATE TRIGGER waitlist_position BEFORE INSERT ON waitlist FOR EACH ROW EXECUTE FUNCTION set_waitlist_position();

-- ENROLLMENTS
CREATE TABLE enrollments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  cohort_id UUID NOT NULL REFERENCES cohorts(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  mentor_id UUID REFERENCES profiles(id),
  status TEXT NOT NULL DEFAULT 'enrolled' CHECK (status IN ('waitlisted','enrolled','active','completed','dropped')),
  current_pillar INTEGER NOT NULL DEFAULT 1,
  current_week INTEGER NOT NULL DEFAULT 1,
  enrolled_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  UNIQUE(cohort_id,student_id)
);

-- TASKS
CREATE TABLE tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  enrollment_id UUID NOT NULL REFERENCES enrollments(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  cohort_id UUID NOT NULL REFERENCES cohorts(id) ON DELETE CASCADE,
  pillar_number INTEGER NOT NULL CHECK (pillar_number BETWEEN 1 AND 5),
  week_number INTEGER NOT NULL CHECK (week_number BETWEEN 1 AND 12),
  title TEXT NOT NULL, prompt TEXT NOT NULL,
  submission TEXT, submission_url TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','submitted','reviewed','approved')),
  mentor_feedback TEXT, submitted_at TIMESTAMPTZ, reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(enrollment_id,pillar_number,week_number)
);

-- MENTOR ASSIGNMENTS
CREATE TABLE mentor_assignments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  mentor_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  cohort_id UUID NOT NULL REFERENCES cohorts(id) ON DELETE CASCADE,
  max_students INTEGER NOT NULL DEFAULT 5,
  current_students INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(mentor_id,cohort_id)
);

-- VISION CLUBS
CREATE TABLE vision_clubs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  cohort_id UUID NOT NULL REFERENCES cohorts(id) ON DELETE CASCADE,
  name TEXT NOT NULL, problem_statement TEXT NOT NULL, description TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','active','completed')),
  mentor_id UUID REFERENCES profiles(id),
  created_by UUID NOT NULL REFERENCES profiles(id),
  campus_count INTEGER NOT NULL DEFAULT 1,
  activated_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE TRIGGER vision_clubs_updated_at BEFORE UPDATE ON vision_clubs FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TABLE vision_club_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  club_id UUID NOT NULL REFERENCES vision_clubs(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('founder','member')),
  joined_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(club_id,student_id)
);

-- MESSAGING
CREATE TABLE conversations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  cohort_id UUID REFERENCES cohorts(id),
  participant_ids UUID[] NOT NULL,
  last_message TEXT, last_message_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL, read_by UUID[] NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE OR REPLACE FUNCTION update_conversation_last_message() RETURNS TRIGGER AS $$
BEGIN UPDATE conversations SET last_message=NEW.content, last_message_at=NEW.created_at WHERE id=NEW.conversation_id; RETURN NEW; END;
$$ LANGUAGE plpgsql;
CREATE TRIGGER messages_update_conversation AFTER INSERT ON messages FOR EACH ROW EXECUTE FUNCTION update_conversation_last_message();

-- RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE cohorts ENABLE ROW LEVEL SECURITY;
ALTER TABLE waitlist ENABLE ROW LEVEL SECURITY;
ALTER TABLE enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE vision_clubs ENABLE ROW LEVEL SECURITY;
ALTER TABLE vision_club_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Profiles
CREATE POLICY "profiles_self" ON profiles FOR ALL USING (auth.uid()=id);
CREATE POLICY "profiles_admin" ON profiles FOR ALL USING (EXISTS(SELECT 1 FROM profiles WHERE id=auth.uid() AND role='admin'));
CREATE POLICY "profiles_mentor_view" ON profiles FOR SELECT USING (EXISTS(SELECT 1 FROM profiles WHERE id=auth.uid() AND role='mentor' AND approved=true));
-- Cohorts
CREATE POLICY "cohorts_read" ON cohorts FOR SELECT USING (status!='draft' OR EXISTS(SELECT 1 FROM profiles WHERE id=auth.uid() AND role='admin'));
CREATE POLICY "cohorts_admin_write" ON cohorts FOR ALL USING (EXISTS(SELECT 1 FROM profiles WHERE id=auth.uid() AND role='admin'));
-- Waitlist
CREATE POLICY "waitlist_student" ON waitlist FOR ALL USING (student_id=auth.uid());
CREATE POLICY "waitlist_admin" ON waitlist FOR ALL USING (EXISTS(SELECT 1 FROM profiles WHERE id=auth.uid() AND role='admin'));
-- Enrollments
CREATE POLICY "enrollments_student" ON enrollments FOR SELECT USING (student_id=auth.uid());
CREATE POLICY "enrollments_mentor" ON enrollments FOR SELECT USING (mentor_id=auth.uid());
CREATE POLICY "enrollments_admin" ON enrollments FOR ALL USING (EXISTS(SELECT 1 FROM profiles WHERE id=auth.uid() AND role='admin'));
-- Tasks
CREATE POLICY "tasks_student" ON tasks FOR ALL USING (student_id=auth.uid());
CREATE POLICY "tasks_mentor" ON tasks FOR ALL USING (EXISTS(SELECT 1 FROM enrollments e WHERE e.id=tasks.enrollment_id AND e.mentor_id=auth.uid()));
CREATE POLICY "tasks_admin" ON tasks FOR ALL USING (EXISTS(SELECT 1 FROM profiles WHERE id=auth.uid() AND role='admin'));
-- Messages
CREATE POLICY "messages_participants" ON messages FOR ALL USING (EXISTS(SELECT 1 FROM conversations c WHERE c.id=messages.conversation_id AND auth.uid()=ANY(c.participant_ids)));
CREATE POLICY "conversations_participants" ON conversations FOR ALL USING (auth.uid()=ANY(participant_ids));
-- Vision clubs
CREATE POLICY "vision_clubs_enrolled" ON vision_clubs FOR SELECT USING (EXISTS(SELECT 1 FROM enrollments e WHERE e.cohort_id=vision_clubs.cohort_id AND e.student_id=auth.uid() AND e.status IN ('enrolled','active','completed')) OR EXISTS(SELECT 1 FROM profiles WHERE id=auth.uid() AND role IN ('admin','mentor')));
CREATE POLICY "vision_clubs_admin" ON vision_clubs FOR ALL USING (EXISTS(SELECT 1 FROM profiles WHERE id=auth.uid() AND role='admin'));
CREATE POLICY "vision_club_members_read" ON vision_club_members FOR SELECT USING (
  EXISTS(
    SELECT 1
    FROM vision_clubs vc
    WHERE vc.id=vision_club_members.club_id
      AND (
        EXISTS(SELECT 1 FROM profiles WHERE id=auth.uid() AND role IN ('admin','mentor'))
        OR EXISTS(
          SELECT 1 FROM enrollments e
          WHERE e.cohort_id=vc.cohort_id
            AND e.student_id=auth.uid()
            AND e.status IN ('enrolled','active','completed')
        )
      )
  )
);
CREATE POLICY "vision_club_members_admin" ON vision_club_members FOR ALL USING (EXISTS(SELECT 1 FROM profiles WHERE id=auth.uid() AND role='admin'));
CREATE POLICY "vision_club_members_self" ON vision_club_members FOR ALL USING (student_id=auth.uid()) WITH CHECK (student_id=auth.uid());

-- INDEXES
CREATE INDEX idx_enrollments_cohort ON enrollments(cohort_id);
CREATE INDEX idx_enrollments_student ON enrollments(student_id);
CREATE INDEX idx_enrollments_mentor ON enrollments(mentor_id);
CREATE INDEX idx_tasks_enrollment ON tasks(enrollment_id);
CREATE INDEX idx_tasks_student ON tasks(student_id);
CREATE INDEX idx_tasks_status ON tasks(status);
CREATE INDEX idx_messages_conversation ON messages(conversation_id);
CREATE INDEX idx_messages_created ON messages(created_at DESC);
CREATE INDEX idx_waitlist_cohort ON waitlist(cohort_id);
CREATE INDEX idx_vision_clubs_cohort ON vision_clubs(cohort_id);
CREATE INDEX idx_vision_club_members_club ON vision_club_members(club_id);
CREATE INDEX idx_vision_club_members_student ON vision_club_members(student_id);

-- REALTIME
ALTER PUBLICATION supabase_realtime ADD TABLE messages;
ALTER PUBLICATION supabase_realtime ADD TABLE conversations;
ALTER PUBLICATION supabase_realtime ADD TABLE tasks;
ALTER PUBLICATION supabase_realtime ADD TABLE enrollments;
