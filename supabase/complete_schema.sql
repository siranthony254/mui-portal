-- MUI FORGE — COMPLETE DATABASE SCHEMA
-- Run this once in Supabase SQL Editor to set up the entire database
-- Includes all tables, indexes, RLS policies, triggers, and functions

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- BASIC HELPER FUNCTIONS (no table dependencies)
-- ============================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS TRIGGER
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- PROFILES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT NOT NULL,
  full_name TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'student' CHECK (role IN ('admin','mentor','student')),
  avatar_url TEXT,
  institution TEXT,
  institution_type TEXT CHECK (institution_type IN ('university','tvet','college','kmtc')),
  year_of_study TEXT,
  county TEXT,
  phone TEXT,
  bio TEXT,
  approved BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Trigger for profiles updated_at
DROP TRIGGER IF EXISTS profiles_updated_at ON profiles;
CREATE TRIGGER profiles_updated_at BEFORE UPDATE ON profiles
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- Trigger to create profile on new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
AS $$
BEGIN
  INSERT INTO profiles (id, email, full_name, role, approved)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    CASE
      WHEN NEW.raw_user_meta_data->>'role' = 'mentor' THEN 'mentor'
      ELSE 'student'
    END,
    false
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- RLS for profiles
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "profiles_self" ON profiles;
DROP POLICY IF EXISTS "profiles_admin" ON profiles;
DROP POLICY IF EXISTS "profiles_mentor_view" ON profiles;

-- Create policies - order matters, profiles_self must be first
CREATE POLICY "profiles_self"
ON profiles
FOR ALL
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- Note: Admin and mentor policies will be created after functions are defined below
-- This ensures users can always see their own profile even if other policies fail

-- ============================================
-- TABLE-DEPENDENT HELPER FUNCTIONS
-- ============================================

-- Function to check if current user is admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.profiles
    WHERE id = auth.uid()
      AND role = 'admin'
  );
$$;

-- Function to check if current user is approved mentor
CREATE OR REPLACE FUNCTION public.is_approved_mentor()
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.profiles
    WHERE id = auth.uid()
      AND role = 'mentor'
      AND approved = true
  );
$$;

-- ============================================
-- COMPLETE PROFILES POLICIES (now that functions exist)
-- ============================================

CREATE POLICY "profiles_admin"
ON profiles
FOR ALL
USING (public.is_admin())
WITH CHECK (public.is_admin());

CREATE POLICY "profiles_mentor_view"
ON profiles
FOR SELECT
USING (public.is_approved_mentor());

-- ============================================
-- COHORTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS cohorts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  semester TEXT NOT NULL,
  year INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','applications_open','active','completed')),
  start_date DATE,
  end_date DATE,
  max_participants INTEGER NOT NULL DEFAULT 25,
  current_week INTEGER NOT NULL DEFAULT 1,
  applications_open BOOLEAN NOT NULL DEFAULT false,
  vision_clubs_enabled BOOLEAN NOT NULL DEFAULT false,
  capstone_submissions_enabled BOOLEAN NOT NULL DEFAULT false,
  chat_enabled BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

DROP TRIGGER IF EXISTS cohorts_updated_at ON cohorts;
CREATE TRIGGER cohorts_updated_at BEFORE UPDATE ON cohorts
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

ALTER TABLE cohorts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "cohorts_read" ON cohorts;
DROP POLICY IF EXISTS "cohorts_admin_write" ON cohorts;

CREATE POLICY "cohorts_read"
ON cohorts
FOR SELECT
USING (status != 'draft' OR public.is_admin());

CREATE POLICY "cohorts_admin_write"
ON cohorts
FOR ALL
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- ============================================
-- WAITLIST TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS waitlist (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  cohort_id UUID NOT NULL REFERENCES cohorts(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  position INTEGER,
  status TEXT NOT NULL DEFAULT 'waiting' CHECK (status IN ('waiting','admitted','rejected')),
  application_essay TEXT,
  motivation TEXT,
  applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(cohort_id, student_id)
);

-- Function to set waitlist position
CREATE OR REPLACE FUNCTION public.set_waitlist_position()
RETURNS TRIGGER
AS $$
BEGIN
  SELECT COALESCE(MAX(position), 0) + 1
  INTO NEW.position
  FROM waitlist
  WHERE cohort_id = NEW.cohort_id AND status = 'waiting';
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS waitlist_position ON waitlist;
CREATE TRIGGER waitlist_position BEFORE INSERT ON waitlist
FOR EACH ROW EXECUTE FUNCTION public.set_waitlist_position();

ALTER TABLE waitlist ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "waitlist_student" ON waitlist;
DROP POLICY IF EXISTS "waitlist_admin" ON waitlist;

CREATE POLICY "waitlist_student"
ON waitlist
FOR ALL
USING (student_id = auth.uid())
WITH CHECK (student_id = auth.uid());

CREATE POLICY "waitlist_admin"
ON waitlist
FOR ALL
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- ============================================
-- ENROLLMENTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS enrollments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  cohort_id UUID NOT NULL REFERENCES cohorts(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  mentor_id UUID REFERENCES profiles(id),
  status TEXT NOT NULL DEFAULT 'enrolled' CHECK (status IN ('waitlisted','enrolled','active','completed','dropped')),
  current_pillar INTEGER NOT NULL DEFAULT 1,
  current_week INTEGER NOT NULL DEFAULT 1,
  enrolled_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  UNIQUE(cohort_id, student_id)
);

ALTER TABLE enrollments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "enrollments_student" ON enrollments;
DROP POLICY IF EXISTS "enrollments_mentor" ON enrollments;
DROP POLICY IF EXISTS "enrollments_admin" ON enrollments;

CREATE POLICY "enrollments_student"
ON enrollments
FOR SELECT
USING (student_id = auth.uid());

CREATE POLICY "enrollments_mentor"
ON enrollments
FOR SELECT
USING (mentor_id = auth.uid());

CREATE POLICY "enrollments_admin"
ON enrollments
FOR ALL
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- ============================================
-- TASKS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS tasks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  enrollment_id UUID NOT NULL REFERENCES enrollments(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  cohort_id UUID NOT NULL REFERENCES cohorts(id) ON DELETE CASCADE,
  pillar_number INTEGER NOT NULL CHECK (pillar_number BETWEEN 1 AND 5),
  week_number INTEGER NOT NULL CHECK (week_number BETWEEN 1 AND 12),
  title TEXT NOT NULL,
  prompt TEXT NOT NULL,
  submission TEXT,
  submission_url TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','submitted','reviewed','approved')),
  mentor_feedback TEXT,
  submitted_at TIMESTAMPTZ,
  reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(enrollment_id, pillar_number, week_number)
);

ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "tasks_student" ON tasks;
DROP POLICY IF EXISTS "tasks_mentor" ON tasks;
DROP POLICY IF EXISTS "tasks_admin" ON tasks;

CREATE POLICY "tasks_student"
ON tasks
FOR ALL
USING (student_id = auth.uid())
WITH CHECK (student_id = auth.uid());

CREATE POLICY "tasks_mentor"
ON tasks
FOR ALL
USING (
  EXISTS(
    SELECT 1
    FROM enrollments e
    WHERE e.id = tasks.enrollment_id
      AND e.mentor_id = auth.uid()
  )
);

CREATE POLICY "tasks_admin"
ON tasks
FOR ALL
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- ============================================
-- MENTOR ASSIGNMENTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS mentor_assignments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  mentor_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  cohort_id UUID NOT NULL REFERENCES cohorts(id) ON DELETE CASCADE,
  max_students INTEGER NOT NULL DEFAULT 5,
  current_students INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(mentor_id, cohort_id)
);

ALTER TABLE mentor_assignments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "mentor_assignments_admin" ON mentor_assignments;

CREATE POLICY "mentor_assignments_admin"
ON mentor_assignments
FOR ALL
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- ============================================
-- VISION CLUBS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS vision_clubs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  cohort_id UUID NOT NULL REFERENCES cohorts(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  problem_statement TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','active','completed')),
  mentor_id UUID REFERENCES profiles(id),
  created_by UUID NOT NULL REFERENCES profiles(id),
  campus_count INTEGER NOT NULL DEFAULT 1,
  activated_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

DROP TRIGGER IF EXISTS vision_clubs_updated_at ON vision_clubs;
CREATE TRIGGER vision_clubs_updated_at BEFORE UPDATE ON vision_clubs
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

ALTER TABLE vision_clubs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "vision_clubs_enrolled" ON vision_clubs;
DROP POLICY IF EXISTS "vision_clubs_admin" ON vision_clubs;

CREATE POLICY "vision_clubs_enrolled"
ON vision_clubs
FOR SELECT
USING (
  EXISTS(
    SELECT 1
    FROM enrollments e
    WHERE e.cohort_id = vision_clubs.cohort_id
      AND e.student_id = auth.uid()
      AND e.status IN ('enrolled','active','completed')
  )
  OR public.is_admin()
  OR public.is_approved_mentor()
);

CREATE POLICY "vision_clubs_admin"
ON vision_clubs
FOR ALL
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- ============================================
-- VISION CLUB MEMBERS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS vision_club_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  club_id UUID NOT NULL REFERENCES vision_clubs(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('founder','member')),
  joined_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(club_id, student_id)
);

ALTER TABLE vision_club_members ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "vision_club_members_read" ON vision_club_members;
DROP POLICY IF EXISTS "vision_club_members_admin" ON vision_club_members;
DROP POLICY IF EXISTS "vision_club_members_self" ON vision_club_members;

CREATE POLICY "vision_club_members_read"
ON vision_club_members
FOR SELECT
USING (
  EXISTS(
    SELECT 1
    FROM vision_clubs vc
    WHERE vc.id = vision_club_members.club_id
      AND (
        public.is_admin()
        OR public.is_approved_mentor()
        OR EXISTS(
          SELECT 1
          FROM enrollments e
          WHERE e.cohort_id = vc.cohort_id
            AND e.student_id = auth.uid()
            AND e.status IN ('enrolled','active','completed')
        )
      )
  )
);

CREATE POLICY "vision_club_members_admin"
ON vision_club_members
FOR ALL
USING (public.is_admin())
WITH CHECK (public.is_admin());

CREATE POLICY "vision_club_members_self"
ON vision_club_members
FOR ALL
USING (student_id = auth.uid())
WITH CHECK (student_id = auth.uid());

-- ============================================
-- CONVERSATIONS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS conversations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  cohort_id UUID REFERENCES cohorts(id),
  participant_ids UUID[] NOT NULL,
  last_message TEXT,
  last_message_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "conversations_participants" ON conversations;

CREATE POLICY "conversations_participants"
ON conversations
FOR ALL
USING (auth.uid() = ANY(participant_ids))
WITH CHECK (auth.uid() = ANY(participant_ids));

-- ============================================
-- MESSAGES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  read_by UUID[] NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Trigger to update conversation last message
CREATE OR REPLACE FUNCTION public.update_conversation_last_message()
RETURNS TRIGGER
AS $$
BEGIN
  UPDATE conversations
  SET last_message = NEW.content,
      last_message_at = NEW.created_at
  WHERE id = NEW.conversation_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS messages_update_conversation ON messages;
CREATE TRIGGER messages_update_conversation AFTER INSERT ON messages
FOR EACH ROW EXECUTE FUNCTION public.update_conversation_last_message();

ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "messages_participants" ON messages;

CREATE POLICY "messages_participants"
ON messages
FOR ALL
USING (
  EXISTS(
    SELECT 1
    FROM conversations c
    WHERE c.id = messages.conversation_id
      AND auth.uid() = ANY(c.participant_ids)
  )
)
WITH CHECK (
  EXISTS(
    SELECT 1
    FROM conversations c
    WHERE c.id = messages.conversation_id
      AND auth.uid() = ANY(c.participant_ids)
  )
);

-- ============================================
-- JOURNALS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS journals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  pillar_number INTEGER NOT NULL CHECK (pillar_number BETWEEN 1 AND 5),
  week_number INTEGER NOT NULL CHECK (week_number BETWEEN 1 AND 12),
  content TEXT,
  is_shared BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(student_id, week_number)
);

DROP TRIGGER IF EXISTS journals_updated_at ON journals;
CREATE TRIGGER journals_updated_at BEFORE UPDATE ON journals
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

ALTER TABLE journals ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "journals_owner" ON journals;
DROP POLICY IF EXISTS "journals_mentor_shared" ON journals;
DROP POLICY IF EXISTS "journals_admin" ON journals;

CREATE POLICY "journals_owner"
ON journals
FOR ALL
USING (student_id = auth.uid())
WITH CHECK (student_id = auth.uid());

CREATE POLICY "journals_mentor_shared"
ON journals
FOR SELECT
USING (
  is_shared = true
  AND EXISTS(
    SELECT 1
    FROM enrollments e
    WHERE e.student_id = journals.student_id
      AND e.mentor_id = auth.uid()
  )
);

CREATE POLICY "journals_admin"
ON journals
FOR SELECT
USING (public.is_admin());

-- ============================================
-- COHORT SESSIONS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS cohort_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  cohort_id UUID NOT NULL REFERENCES cohorts(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  date DATE NOT NULL,
  time TEXT NOT NULL,
  theme TEXT,
  join_url TEXT,
  notes TEXT,
  homework TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

DROP TRIGGER IF EXISTS cohort_sessions_updated_at ON cohort_sessions;
CREATE TRIGGER cohort_sessions_updated_at BEFORE UPDATE ON cohort_sessions
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

ALTER TABLE cohort_sessions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "cohort_sessions_read" ON cohort_sessions;
DROP POLICY IF EXISTS "cohort_sessions_admin" ON cohort_sessions;

CREATE POLICY "cohort_sessions_read"
ON cohort_sessions
FOR SELECT
USING (
  EXISTS(
    SELECT 1
    FROM enrollments e
    WHERE e.cohort_id = cohort_sessions.cohort_id
      AND e.student_id = auth.uid()
      AND e.status IN ('enrolled','active','completed')
  )
  OR public.is_admin()
  OR public.is_approved_mentor()
);

CREATE POLICY "cohort_sessions_admin"
ON cohort_sessions
FOR ALL
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- ============================================
-- SESSION HOMEWORK COMPLETIONS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS session_homework_completions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id UUID NOT NULL REFERENCES cohort_sessions(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  completed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(session_id, student_id)
);

ALTER TABLE session_homework_completions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "session_homework_completions_owner" ON session_homework_completions;
DROP POLICY IF EXISTS "session_homework_completions_admin" ON session_homework_completions;

CREATE POLICY "session_homework_completions_owner"
ON session_homework_completions
FOR ALL
USING (student_id = auth.uid())
WITH CHECK (student_id = auth.uid());

CREATE POLICY "session_homework_completions_admin"
ON session_homework_completions
FOR SELECT
USING (public.is_admin());

-- ============================================
-- ACCOUNTABILITY PARTNERSHIPS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS accountability_partnerships (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  cohort_id UUID NOT NULL REFERENCES cohorts(id) ON DELETE CASCADE,
  student_id_1 UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  student_id_2 UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  last_check_in_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(student_id_1, cohort_id),
  UNIQUE(student_id_2, cohort_id),
  CHECK (student_id_1 < student_id_2)
);

ALTER TABLE accountability_partnerships ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "accountability_partnerships_read" ON accountability_partnerships;
DROP POLICY IF EXISTS "accountability_partnerships_admin" ON accountability_partnerships;

CREATE POLICY "accountability_partnerships_read"
ON accountability_partnerships
FOR SELECT
USING (
  auth.uid() = student_id_1
  OR auth.uid() = student_id_2
  OR public.is_admin()
);

CREATE POLICY "accountability_partnerships_admin"
ON accountability_partnerships
FOR ALL
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- ============================================
-- CHECK IN LOGS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS check_in_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  partnership_id UUID NOT NULL REFERENCES accountability_partnerships(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  reflection TEXT,
  check_in_date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE check_in_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "check_in_logs_read" ON check_in_logs;
DROP POLICY IF EXISTS "check_in_logs_insert" ON check_in_logs;

CREATE POLICY "check_in_logs_read"
ON check_in_logs
FOR SELECT
USING (
  EXISTS(
    SELECT 1
    FROM accountability_partnerships ap
    WHERE ap.id = check_in_logs.partnership_id
      AND (auth.uid() = ap.student_id_1 OR auth.uid() = ap.student_id_2)
  )
  OR public.is_admin()
);

CREATE POLICY "check_in_logs_insert"
ON check_in_logs
FOR INSERT
WITH CHECK (
  EXISTS(
    SELECT 1
    FROM accountability_partnerships ap
    WHERE ap.id = check_in_logs.partnership_id
      AND (auth.uid() = ap.student_id_1 OR auth.uid() = ap.student_id_2)
  )
);

-- ============================================
-- INDEXES
-- ============================================

-- Enrollments
CREATE INDEX IF NOT EXISTS idx_enrollments_cohort ON enrollments(cohort_id);
CREATE INDEX IF NOT EXISTS idx_enrollments_student ON enrollments(student_id);
CREATE INDEX IF NOT EXISTS idx_enrollments_mentor ON enrollments(mentor_id);

-- Tasks
CREATE INDEX IF NOT EXISTS idx_tasks_enrollment ON tasks(enrollment_id);
CREATE INDEX IF NOT EXISTS idx_tasks_student ON tasks(student_id);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);
CREATE INDEX IF NOT EXISTS idx_tasks_cohort ON tasks(cohort_id);

-- Messages
CREATE INDEX IF NOT EXISTS idx_messages_conversation ON messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_messages_created ON messages(created_at DESC);

-- Waitlist
CREATE INDEX IF NOT EXISTS idx_waitlist_cohort ON waitlist(cohort_id);

-- Vision Clubs
CREATE INDEX IF NOT EXISTS idx_vision_clubs_cohort ON vision_clubs(cohort_id);
CREATE INDEX IF NOT EXISTS idx_vision_club_members_club ON vision_club_members(club_id);
CREATE INDEX IF NOT EXISTS idx_vision_club_members_student ON vision_club_members(student_id);

-- Sessions
CREATE INDEX IF NOT EXISTS idx_cohort_sessions_cohort ON cohort_sessions(cohort_id);

-- Accountability
CREATE INDEX IF NOT EXISTS idx_accountability_partnerships_cohort ON accountability_partnerships(cohort_id);
CREATE INDEX IF NOT EXISTS idx_accountability_partnerships_students ON accountability_partnerships(student_id_1, student_id_2);
CREATE INDEX IF NOT EXISTS idx_check_in_logs_partnership ON check_in_logs(partnership_id);

-- Journals
CREATE INDEX IF NOT EXISTS idx_journals_student ON journals(student_id);
CREATE INDEX IF NOT EXISTS idx_journals_week ON journals(week_number);

-- ============================================
-- REALTIME SUBSCRIPTIONS
-- ============================================

-- Enable realtime for tables that need live updates
ALTER PUBLICATION supabase_realtime ADD TABLE messages;
ALTER PUBLICATION supabase_realtime ADD TABLE conversations;
ALTER PUBLICATION supabase_realtime ADD TABLE tasks;
ALTER PUBLICATION supabase_realtime ADD TABLE enrollments;

-- ============================================
-- COMPLETED
-- ============================================
-- The database schema is now complete with:
-- - All tables with proper constraints
-- - Row Level Security policies
-- - Helper functions (is_admin, is_approved_mentor, update_updated_at)
-- - Triggers for automated updates
-- - Indexes for performance
-- - Realtime subscriptions for live features
