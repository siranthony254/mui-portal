-- MENTOR EXPERIENCE UPDATES

-- 1. Add onboarded flag to profiles
ALTER TABLE profiles ADD COLUMN onboarded BOOLEAN NOT NULL DEFAULT false;

-- 2. Private Mentor Notes
CREATE TABLE mentor_notes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  mentor_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  is_sealed_letter BOOLEAN NOT NULL DEFAULT false,
  cohort_number INTEGER, -- To distinguish between Cohort 1 and 2 notes/letters
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE mentor_notes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "mentor_notes_mentor" ON mentor_notes FOR ALL USING (mentor_id = auth.uid());
CREATE POLICY "mentor_notes_admin" ON mentor_notes FOR SELECT USING (EXISTS(SELECT 1 FROM profiles WHERE id=auth.uid() AND role='admin'));

-- 3. Notifications Table
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT, -- e.g., 'mentor_assigned', 'task_feedback', 'new_session'
  link TEXT, -- Optional URL to navigate to
  read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "notifications_owner" ON notifications FOR ALL USING (user_id = auth.uid());

-- 4. Mentor Session Notes (Before next session note)
CREATE TABLE mentor_session_notes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  mentor_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  session_id UUID NOT NULL REFERENCES cohort_sessions(id) ON DELETE CASCADE,
  note TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(mentor_id, session_id)
);

ALTER TABLE mentor_session_notes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "mentor_session_notes_mentor" ON mentor_session_notes FOR ALL USING (mentor_id = auth.uid());
CREATE POLICY "mentor_session_notes_student" ON mentor_session_notes FOR SELECT USING (
  EXISTS(
    SELECT 1 FROM enrollments e
    WHERE e.mentor_id = mentor_session_notes.mentor_id
    AND e.student_id = auth.uid()
  )
);

-- 5. Discussion Board (if not already implemented elsewhere, let's add basic structure)
CREATE TABLE discussion_posts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  cohort_id UUID NOT NULL REFERENCES cohorts(id) ON DELETE CASCADE,
  author_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  title TEXT,
  content TEXT NOT NULL,
  is_pinned BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE discussion_posts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "discussion_posts_read" ON discussion_posts FOR SELECT USING (
  EXISTS(
    SELECT 1 FROM enrollments e
    WHERE e.cohort_id = discussion_posts.cohort_id
    AND e.student_id = auth.uid()
  ) OR EXISTS(
    SELECT 1 FROM profiles WHERE id=auth.uid() AND role IN ('admin', 'mentor')
  )
);
CREATE POLICY "discussion_posts_write" ON discussion_posts FOR INSERT WITH CHECK (auth.uid() = author_id);
CREATE POLICY "discussion_posts_update" ON discussion_posts FOR UPDATE USING (auth.uid() = author_id OR EXISTS(SELECT 1 FROM profiles WHERE id=auth.uid() AND role='admin'));

CREATE TABLE discussion_replies (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  post_id UUID NOT NULL REFERENCES discussion_posts(id) ON DELETE CASCADE,
  author_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE discussion_replies ENABLE ROW LEVEL SECURITY;
CREATE POLICY "discussion_replies_read" ON discussion_replies FOR SELECT USING (
  EXISTS(SELECT 1 FROM discussion_posts p WHERE p.id = discussion_replies.post_id)
);
CREATE POLICY "discussion_replies_write" ON discussion_replies FOR INSERT WITH CHECK (auth.uid() = author_id);

-- INDEXES for performance
CREATE INDEX idx_mentor_notes_student ON mentor_notes(student_id);
CREATE INDEX idx_notifications_user ON notifications(user_id, read);
CREATE INDEX idx_discussion_posts_cohort ON discussion_posts(cohort_id);
