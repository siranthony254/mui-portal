-- MUI FORGE — FIX PROFILES RLS POLICIES
-- Run this to fix the redirect loop caused by RLS blocking profile fetch
-- This reorganizes the policies to ensure users can always see their own profile

-- ============================================
-- DROP EXISTING PROFILES POLICIES
-- ============================================
DROP POLICY IF EXISTS "profiles_self" ON profiles;
DROP POLICY IF EXISTS "profiles_admin" ON profiles;
DROP POLICY IF EXISTS "profiles_mentor_view" ON profiles;

-- ============================================
-- RECREATE POLICIES IN CORRECT ORDER
-- ============================================

-- 1. Self policy - MUST BE FIRST to ensure users can always see their own profile
CREATE POLICY "profiles_self"
ON profiles
FOR ALL
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- ============================================
-- CREATE/UPDATE HELPER FUNCTIONS
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
-- CREATE ADMIN AND MENTOR POLICIES
-- ============================================

-- 2. Admin policy - allows admins full access
CREATE POLICY "profiles_admin"
ON profiles
FOR ALL
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- 3. Mentor view policy - allows approved mentors to view profiles
CREATE POLICY "profiles_mentor_view"
ON profiles
FOR SELECT
USING (public.is_approved_mentor());

-- ============================================
-- VERIFICATION
-- ============================================
-- Check that policies are created correctly
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE tablename = 'profiles'
ORDER BY policyname;
