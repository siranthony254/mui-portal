-- MUI FORGE — DATABASE CLEANUP SCRIPT
-- ⚠️ WARNING: This will DELETE ALL DATA in your Supabase database
-- Run this only if you want to completely reset your database
-- This drops all tables, functions, triggers, and policies created by the schema

-- ============================================
-- DROP ALL TABLES (handles foreign keys automatically with CASCADE)
-- ============================================
DO $$
DECLARE
    r RECORD;
BEGIN
    -- Drops all tables in public schema with CASCADE
    FOR r IN (SELECT tablename FROM pg_tables WHERE schemaname = 'public') LOOP
        EXECUTE 'DROP TABLE IF EXISTS public.' || quote_ident(r.tablename) || ' CASCADE';
    END LOOP;
END $$;

-- ============================================
-- DROP TRIGGERS (auth schema)
-- ============================================
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- ============================================
-- DROP FUNCTIONS
-- ============================================
DROP FUNCTION IF EXISTS public.handle_new_user();
DROP FUNCTION IF EXISTS public.is_admin();
DROP FUNCTION IF EXISTS public.is_approved_mentor();
DROP FUNCTION IF EXISTS public.update_updated_at();
DROP FUNCTION IF EXISTS public.set_waitlist_position();
DROP FUNCTION IF EXISTS public.update_conversation_last_message();

-- ============================================
-- COMPLETED
-- ============================================
-- All MUI Forge database objects have been dropped
-- You can now run complete_schema.sql to set up a fresh database
