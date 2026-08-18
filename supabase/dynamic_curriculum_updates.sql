-- DYNAMIC CURRICULUM UPDATES

-- 1. Add pillars_config to cohorts to store unlimited pillars and their descriptions
ALTER TABLE cohorts ADD COLUMN IF NOT EXISTS pillars_config JSONB DEFAULT '[]';

-- 2. Create session_completions table to track student progress for sequential unlocking
CREATE TABLE IF NOT EXISTS session_completions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  cohort_id UUID NOT NULL REFERENCES cohorts(id) ON DELETE CASCADE,
  session_id TEXT NOT NULL, -- This will be the Sanity _id for the session
  completed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(student_id, session_id)
);

ALTER TABLE session_completions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "session_completions_student" ON session_completions FOR ALL USING (student_id = auth.uid());
CREATE POLICY "session_completions_admin" ON session_completions FOR SELECT USING (EXISTS(SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

-- 3. Index for performance
CREATE INDEX IF NOT EXISTS idx_session_completions_student ON session_completions(student_id);
