-- Create journal_submissions table
CREATE TABLE IF NOT EXISTS journal_submissions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  student_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  session_id TEXT NOT NULL,
  cohort_id UUID NOT NULL REFERENCES cohorts(id) ON DELETE CASCADE,
  journal_type TEXT NOT NULL CHECK (journal_type IN ('private', 'mentor', 'group')),
  content TEXT NOT NULL,
  submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  sent_to_mentor BOOLEAN DEFAULT FALSE,
  posted_to_group BOOLEAN DEFAULT FALSE,
  is_private BOOLEAN DEFAULT TRUE,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_journal_submissions_student_id ON journal_submissions(student_id);
CREATE INDEX IF NOT EXISTS idx_journal_submissions_session_id ON journal_submissions(session_id);
CREATE INDEX IF NOT EXISTS idx_journal_submissions_cohort_id ON journal_submissions(cohort_id);
CREATE INDEX IF NOT EXISTS idx_journal_submissions_journal_type ON journal_submissions(journal_type);

-- Enable Row Level Security
ALTER TABLE journal_submissions ENABLE ROW LEVEL SECURITY;

-- Create policies
-- Students can view their own journals
CREATE POLICY "Students can view own journals"
  ON journal_submissions FOR SELECT
  USING (auth.uid() = student_id);

-- Students can insert their own journals
CREATE POLICY "Students can insert own journals"
  ON journal_submissions FOR INSERT
  WITH CHECK (auth.uid() = student_id);

-- Students can update their own journals
CREATE POLICY "Students can update own journals"
  ON journal_submissions FOR UPDATE
  WITH CHECK (auth.uid() = student_id);

-- Mentors can view journals from their mentees in their cohort
CREATE POLICY "Mentors can view mentee journals"
  ON journal_submissions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM enrollments
      WHERE enrollments.student_id = journal_submissions.student_id
      AND enrollments.cohort_id = journal_submissions.cohort_id
      AND enrollments.mentor_id = auth.uid()
    )
  );

-- Admins can view all journals
CREATE POLICY "Admins can view all journals"
  ON journal_submissions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update updated_at
CREATE TRIGGER update_journal_submissions_updated_at
  BEFORE UPDATE ON journal_submissions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
