-- Run this only if you already applied an older version of supabase/schema.sql.

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

DROP POLICY IF EXISTS "vision_club_members_read" ON vision_club_members;
DROP POLICY IF EXISTS "vision_club_members_admin" ON vision_club_members;
DROP POLICY IF EXISTS "vision_club_members_self" ON vision_club_members;

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

CREATE INDEX IF NOT EXISTS idx_vision_clubs_cohort ON vision_clubs(cohort_id);
CREATE INDEX IF NOT EXISTS idx_vision_club_members_club ON vision_club_members(club_id);
CREATE INDEX IF NOT EXISTS idx_vision_club_members_student ON vision_club_members(student_id);
