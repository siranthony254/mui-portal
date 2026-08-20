-- Add status and last_login_at to profiles
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'left'));
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS last_login_at TIMESTAMPTZ;

-- Update existing profiles based on approved column
UPDATE profiles SET status = 'approved' WHERE approved = true AND status = 'pending';
