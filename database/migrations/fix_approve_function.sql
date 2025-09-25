-- Fix the approve_user_account function
-- The function exists but isn't updating records properly

-- Drop and recreate the function with better error handling
DROP FUNCTION IF EXISTS approve_user_account(UUID, UUID, TEXT);

CREATE OR REPLACE FUNCTION approve_user_account(
  user_id UUID,
  admin_id UUID,
  notes TEXT DEFAULT NULL
) RETURNS JSON AS $$
DECLARE
  result JSON;
  rows_affected INTEGER;
BEGIN
  -- Update the profile
  UPDATE profiles
  SET
    approval_status = 'approved',
    approved_at = now(),
    approved_by = admin_id,
    admin_notes = notes
  WHERE id = user_id;

  -- Check how many rows were affected
  GET DIAGNOSTICS rows_affected = ROW_COUNT;

  -- Return result with diagnostics
  result := json_build_object(
    'success', rows_affected > 0,
    'rows_affected', rows_affected,
    'user_id', user_id,
    'admin_id', admin_id
  );

  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Test the function manually with your test user
SELECT 'Testing approve function' as test;

-- Get the test user ID and admin ID for manual testing
SELECT
  'User IDs for testing' as info,
  test_user.id as test_user_id,
  test_user.username as test_username,
  admin_user.id as admin_user_id,
  admin_user.username as admin_username
FROM
  (SELECT id, username FROM profiles WHERE username = 'test') as test_user,
  (SELECT id, username FROM profiles WHERE is_admin = true LIMIT 1) as admin_user;

-- You can then manually test with:
-- SELECT approve_user_account(
--   'TEST_USER_ID_FROM_ABOVE'::uuid,
--   'ADMIN_USER_ID_FROM_ABOVE'::uuid,
--   'Manual function test'
-- );