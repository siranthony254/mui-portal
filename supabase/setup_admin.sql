-- MUI FORGE — SETUP ADMIN ACCOUNT
-- This script sets up officialsiranthony@gmail.com as an admin
-- Run this AFTER running complete_schema.sql

-- ============================================
-- INSERT ADMIN PROFILE
-- ============================================
-- This creates the admin profile record
-- Note: The user must first sign up via the auth UI for this to work
-- This script will update their profile to admin role once they exist

-- Option 1: If the user already exists in auth.users, update their profile
UPDATE profiles
SET 
  role = 'admin',
  approved = true
WHERE email = 'officialsiranthony@gmail.com';

-- Option 2: If you need to create the user directly (requires service role)
-- Uncomment and run this only if you have service role access
/*
INSERT INTO profiles (id, email, full_name, role, approved)
VALUES (
  'YOUR_USER_ID_HERE', -- Replace with actual UUID from auth.users
  'officialsiranthony@gmail.com',
  'Admin User',
  'admin',
  true
)
ON CONFLICT (id) DO UPDATE SET
  role = 'admin',
  approved = true;
*/

-- ============================================
-- VERIFICATION
-- ============================================
-- Check if admin was set up correctly
SELECT 
  id,
  email,
  full_name,
  role,
  approved,
  created_at
FROM profiles
WHERE email = 'officialsiranthony@gmail.com';

-- ============================================
-- NOTES
-- ============================================
-- 1. The user must first sign up through the auth UI (/auth/register or /auth/login)
-- 2. After they sign up, run this script to upgrade them to admin
-- 3. The admin email is hardcoded to officialsiranthony@gmail.com
-- 4. If you need to change the admin email, update it in both:
--    - This file (setup_admin.sql)
--    - src/lib/auth/admin-emails.ts
