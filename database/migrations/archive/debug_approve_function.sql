-- Debug the approve function to see why user status isn't changing
-- Run this to test the approve_user_account function

-- Step 1: Check current pending accounts
SELECT
  'Current Pending Accounts' as check_type,
  id,
  username,
  email,
  approval_status,
  created_at as requested_at
FROM profiles p
LEFT JOIN auth.users u ON p.id = u.id
WHERE p.approval_status = 'pending'
ORDER BY p.created_at DESC;

-- Step 2: Test if the approve function exists and works
-- Replace 'USER_ID_HERE' with the actual ID of a pending user
SELECT
  'Function Test' as test,
  'Replace USER_ID_HERE with actual pending user ID' as instruction;

-- Example test (REPLACE THE ID):
-- SELECT approve_user_account(
--   'USER_ID_HERE'::uuid,  -- Replace with actual user ID
--   (SELECT id FROM profiles WHERE is_admin = true LIMIT 1),  -- Your admin ID
--   'Test approval via debug'
-- );

-- Step 3: After running the function above, check if status changed
-- SELECT
--   'After Function Test' as check_type,
--   id,
--   username,
--   approval_status,
--   approved_at,
--   admin_notes
-- FROM profiles
-- WHERE id = 'USER_ID_HERE'::uuid;  -- Replace with same user ID

-- Step 4: Check the pending_accounts view that the admin panel uses
SELECT
  'Pending Accounts View' as view_check,
  id,
  username,
  email,
  approval_status,
  requested_at
FROM pending_accounts
ORDER BY requested_at DESC;