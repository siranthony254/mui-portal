-- ============================================
-- NOTIFICATION SYSTEM ENHANCEMENTS
-- ============================================
-- This migration adds priority levels, categories, user preferences,
-- activity tracking, commitment tracking, and mentor health metrics
-- for the robust notification system.

-- ============================================
-- 1. ENHANCE NOTIFICATIONS TABLE
-- ============================================

-- Add priority column with constraints
ALTER TABLE notifications 
ADD COLUMN IF NOT EXISTS priority TEXT DEFAULT 'routine' 
CHECK (priority IN ('routine', 'social', 'action_required', 'intervention'));

-- Add category column with constraints
ALTER TABLE notifications 
ADD COLUMN IF NOT EXISTS category TEXT 
CHECK (category IN ('formation', 'mentorship', 'accountability', 'social', 'admin', 'system'));

-- Add metadata column for flexible data storage
ALTER TABLE notifications 
ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}';

-- Add index for priority-based queries
CREATE INDEX IF NOT EXISTS idx_notifications_priority 
ON notifications(user_id, priority, created_at DESC);

-- Add index for category-based queries
CREATE INDEX IF NOT EXISTS idx_notifications_category 
ON notifications(category, created_at DESC);

-- ============================================
-- 2. USER NOTIFICATION PREFERENCES
-- ============================================

CREATE TABLE IF NOT EXISTS notification_preferences (
  user_id UUID PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
  push_enabled BOOLEAN DEFAULT true,
  email_enabled BOOLEAN DEFAULT true,
  sms_enabled BOOLEAN DEFAULT false,
  quiet_hours_start TIME DEFAULT '22:00',
  quiet_hours_end TIME DEFAULT '06:00',
  categories JSONB DEFAULT '{"formation":true,"mentorship":true,"accountability":true,"social":false,"admin":true,"system":true}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS for notification preferences
ALTER TABLE notification_preferences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "notification_preferences_self" 
ON notification_preferences FOR ALL 
USING (auth.uid() = user_id);

-- Trigger to update updated_at timestamp
CREATE TRIGGER notification_preferences_updated_at 
BEFORE UPDATE ON notification_preferences
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- ============================================
-- 3. STUDENT ACTIVITY LOG
-- ============================================

CREATE TABLE IF NOT EXISTS student_activity_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  activity_type TEXT NOT NULL,
  cohort_id UUID REFERENCES cohorts(id),
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for activity queries
CREATE INDEX idx_activity_student_date 
ON student_activity_log(student_id, created_at DESC);

CREATE INDEX idx_activity_type_date 
ON student_activity_log(activity_type, created_at DESC);

CREATE INDEX idx_activity_cohort_date 
ON student_activity_log(cohort_id, created_at DESC) WHERE cohort_id IS NOT NULL;

-- RLS for student activity log
ALTER TABLE student_activity_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "student_activity_log_self" 
ON student_activity_log FOR SELECT 
USING (auth.uid() = student_id OR EXISTS(
  SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
));

CREATE POLICY "student_activity_log_system" 
ON student_activity_log FOR INSERT 
WITH CHECK (auth.uid() = student_id OR EXISTS(
  SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
));

-- ============================================
-- 4. FORMATION COMMITMENTS
-- ============================================

CREATE TABLE IF NOT EXISTS formation_commitments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  cohort_id UUID NOT NULL REFERENCES cohorts(id),
  week_number INTEGER NOT NULL,
  commitment TEXT NOT NULL,
  status TEXT DEFAULT 'pending' 
CHECK (status IN ('pending', 'in_progress', 'done', 'needs_help', 'abandoned')),
  reminder_sent BOOLEAN DEFAULT false,
  reminder_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for commitment queries
CREATE INDEX idx_commitments_student_week 
ON formation_commitments(student_id, week_number);

CREATE INDEX idx_commitments_cohort_week 
ON formation_commitments(cohort_id, week_number);

CREATE INDEX idx_commitments_status 
ON formation_commitments(status, created_at DESC);

-- RLS for formation commitments
ALTER TABLE formation_commitments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "formation_commitments_self" 
ON formation_commitments FOR ALL 
USING (auth.uid() = student_id OR EXISTS(
  SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'
));

-- Trigger to update updated_at timestamp
CREATE TRIGGER formation_commitments_updated_at 
BEFORE UPDATE ON formation_commitments
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();

-- ============================================
-- 5. MENTOR HEALTH METRICS
-- ============================================

CREATE TABLE IF NOT EXISTS mentor_health_metrics (
  mentor_id UUID PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
  students_assigned INTEGER DEFAULT 0,
  students_active INTEGER DEFAULT 0,
  reflections_pending INTEGER DEFAULT 0,
  avg_response_hours DECIMAL(10,2),
  check_ins_completed INTEGER DEFAULT 0,
  check_ins_total INTEGER DEFAULT 0,
  last_activity TIMESTAMPTZ,
  last_updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for mentor health queries
CREATE INDEX idx_mentor_health_active 
ON mentor_health_metrics(students_active DESC);

-- RLS for mentor health metrics
ALTER TABLE mentor_health_metrics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "mentor_health_self" 
ON mentor_health_metrics FOR SELECT 
USING (auth.uid() = mentor_id);

CREATE POLICY "mentor_health_admin" 
ON mentor_health_metrics FOR ALL 
USING (EXISTS(SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin'));

-- ============================================
-- 6. HELPER FUNCTIONS FOR NOTIFICATION SYSTEM
-- ============================================

-- Function to check if user is in quiet hours
CREATE OR REPLACE FUNCTION public.is_in_quiet_hours(user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM notification_preferences 
    WHERE user_id = is_in_quiet_hours.user_id
    AND CURRENT_TIME >= quiet_hours_start 
    AND CURRENT_TIME < quiet_hours_end
  );
$$;

-- Function to check if user has category enabled
CREATE OR REPLACE FUNCTION public.is_category_enabled(user_id UUID, category TEXT)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(
    (SELECT categories->>category FROM notification_preferences 
     WHERE user_id = is_category_enabled.user_id)::BOOLEAN,
    true
  );
$$;

-- Function to log student activity
CREATE OR REPLACE FUNCTION public.log_student_activity(
  student_id UUID,
  activity_type TEXT,
  cohort_id UUID DEFAULT NULL,
  metadata JSONB DEFAULT '{}'
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  activity_id UUID;
BEGIN
  INSERT INTO student_activity_log (student_id, activity_type, cohort_id, metadata)
  VALUES (student_id, activity_type, cohort_id, metadata)
  RETURNING id INTO activity_id;
  
  RETURN activity_id;
END;
$$;

-- Function to create notification with priority and category
CREATE OR REPLACE FUNCTION public.create_notification(
  user_id UUID,
  title TEXT,
  message TEXT,
  priority TEXT DEFAULT 'routine',
  category TEXT DEFAULT 'system',
  type TEXT DEFAULT 'general',
  link TEXT DEFAULT NULL,
  metadata JSONB DEFAULT '{}'
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  notification_id UUID;
  in_quiet_hours BOOLEAN;
  category_enabled BOOLEAN;
BEGIN
  -- Check quiet hours (skip for intervention priority)
  SELECT public.is_in_quiet_hours(user_id) INTO in_quiet_hours;
  
  -- Check category preference (skip for intervention priority)
  SELECT public.is_category_enabled(user_id, category) INTO category_enabled;
  
  -- Skip if in quiet hours and not intervention priority
  IF in_quiet_hours AND priority != 'intervention' THEN
    RETURN NULL;
  END IF;
  
  -- Skip if category disabled and not intervention priority
  IF NOT category_enabled AND priority != 'intervention' THEN
    RETURN NULL;
  END IF;
  
  -- Create notification
  INSERT INTO notifications (user_id, title, message, priority, category, type, link, metadata)
  VALUES (user_id, title, message, priority, category, type, link, metadata)
  RETURNING id INTO notification_id;
  
  RETURN notification_id;
END;
$$;

-- ============================================
-- 7. TRIGGERS FOR AUTOMATIC ACTIVITY LOGGING
-- ============================================

-- Log task submission
CREATE OR REPLACE FUNCTION public.log_task_submission()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO student_activity_log (student_id, activity_type, cohort_id, metadata)
  VALUES (
    NEW.student_id,
    'task_submit',
    (SELECT cohort_id FROM enrollments WHERE id = NEW.enrollment_id),
    jsonb_build_object('task_id', NEW.id, 'status', NEW.status)
  );
  RETURN NEW;
END;
$$;

CREATE TRIGGER trigger_log_task_submission
AFTER INSERT ON tasks
FOR EACH ROW EXECUTE FUNCTION public.log_task_submission();

-- Log journal entry
CREATE OR REPLACE FUNCTION public.log_journal_entry()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO student_activity_log (student_id, activity_type, metadata)
  VALUES (
    NEW.student_id,
    'journal_entry',
    jsonb_build_object('journal_id', NEW.id, 'week_number', NEW.week_number)
  );
  RETURN NEW;
END;
$$;

CREATE TRIGGER trigger_log_journal_entry
AFTER INSERT ON journals
FOR EACH ROW EXECUTE FUNCTION public.log_journal_entry();

-- Log message sent
CREATE OR REPLACE FUNCTION public.log_message_sent()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO student_activity_log (student_id, activity_type, cohort_id, metadata)
  VALUES (
    NEW.sender_id,
    'message_sent',
    (SELECT cohort_id FROM conversations WHERE id = NEW.conversation_id),
    jsonb_build_object('conversation_id', NEW.conversation_id, 'has_audio', NEW.audio_url IS NOT NULL)
  );
  RETURN NEW;
END;
$$;

CREATE TRIGGER trigger_log_message_sent
AFTER INSERT ON messages
FOR EACH ROW EXECUTE FUNCTION public.log_message_sent();

-- ============================================
-- 8. DEFAULT NOTIFICATION PREFERENCES
-- ============================================

-- Function to create default preferences for new users
CREATE OR REPLACE FUNCTION public.create_default_notification_preferences()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO notification_preferences (user_id)
  VALUES (NEW.id)
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trigger_default_notification_preferences
AFTER INSERT ON profiles
FOR EACH ROW EXECUTE FUNCTION public.create_default_notification_preferences();

-- ============================================
-- MIGRATION COMPLETE
-- ============================================
