-- Check if the approve function is actually working
-- Run this to diagnose the approve function issue

-- Step 1: Check the current state of the test user
SELECT
  'Current test user status' as check,
  id,
  username,
  approval_status,
  approved_at,
  approved_by,
  admin_notes
FROM profiles
WHERE username = 'test';

-- Step 2: Check if the approve_user_account function exists
SELECT
  'Function exists check' as check,
  proname as function_name,
  proargnames as argument_names
FROM pg_proc
WHERE proname = 'approve_user_account';

-- Step 3: Try to manually run the approve function on the test user
-- Get the test user's ID and your admin ID
SELECT
  'IDs for manual test' as info,
  test_user.id as test_user_id,
  admin_user.id as admin_user_id
FROM
  (SELECT id FROM profiles WHERE username = 'test') as test_user,
  (SELECT id FROM profiles WHERE is_admin = true LIMIT 1) as admin_user;

-- Step 4: Manual function call (you'll need to replace the IDs)
-- SELECT approve_user_account(
--   'TEST_USER_ID_HERE'::uuid,
--   'ADMIN_USER_ID_HERE'::uuid,
--   'Manual test approval'
-- );

-- Step 5: Check if manual call worked
-- SELECT
--   'After manual function call' as check,
--   username,
--   approval_status,
--   approved_at,
--   admin_notes
-- FROM profiles
-- WHERE username = 'test';