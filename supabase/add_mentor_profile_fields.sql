-- Add mentor profile fields to profiles table
-- This adds bio, interests, and expertise fields for enhanced mentor profiles

ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS bio TEXT,
ADD COLUMN IF NOT EXISTS interests TEXT[],
ADD COLUMN IF NOT EXISTS expertise TEXT[];

-- Add comment for documentation
COMMENT ON COLUMN profiles.bio IS 'Mentor biography and personal statement';
COMMENT ON COLUMN profiles.interests IS 'Array of mentor interests and hobbies';
COMMENT ON COLUMN profiles.expertise IS 'Array of mentor areas of expertise';

-- Create index for efficient querying of mentors with profiles
CREATE INDEX IF NOT EXISTS idx_profiles_role_expertise ON profiles(role, expertise) WHERE role = 'mentor';
