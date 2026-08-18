-- ADMIN JOURNEY UPDATES

-- 1. Track activity
ALTER TABLE profiles ADD COLUMN last_login_at TIMESTAMPTZ;
ALTER TABLE profiles ADD COLUMN security_pin TEXT; -- Hashed PIN for secondary verification

-- 2. Discussion posts table (Ensure it exists from previous step, or add it if missing)
-- (Already added in mentor_experience_updates.sql)

-- 3. Risk flags view or helper logic
-- We'll do the logic in the application layer for now to keep it flexible,
-- but we can add an index to help with performance.
CREATE INDEX idx_profiles_last_login ON profiles(last_login_at);
CREATE INDEX idx_tasks_week_status ON tasks(week_number, status);
