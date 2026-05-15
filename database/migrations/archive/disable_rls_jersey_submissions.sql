-- Disable RLS on jersey_submissions table to allow admin operations
-- This is needed for the admin panel to properly delete/update submissions

-- Step 1: Remove ALL policies from jersey_submissions
DO $$
DECLARE
    r RECORD;
BEGIN
    FOR r IN (SELECT policyname FROM pg_policies WHERE tablename = 'jersey_submissions') LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON jersey_submissions', r.policyname);
        RAISE NOTICE 'Dropped policy: %', r.policyname;
    END LOOP;
END $$;

-- Step 2: Disable RLS completely on jersey_submissions
ALTER TABLE jersey_submissions DISABLE ROW LEVEL SECURITY;

-- Step 3: Verify the change
SELECT
  'jersey_submissions RLS Status' as check_type,
  tablename,
  CASE
    WHEN rowsecurity THEN 'ENABLED (RLS is still on)'
    ELSE 'DISABLED (RLS is off - admin panel should work)'
  END as rls_status,
  (SELECT COUNT(*) FROM pg_policies WHERE pg_policies.tablename = t.tablename) as policy_count
FROM pg_tables t
WHERE t.schemaname = 'public'
AND t.tablename = 'jersey_submissions';
