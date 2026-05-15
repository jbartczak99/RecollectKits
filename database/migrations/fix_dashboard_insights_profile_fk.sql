-- Fix: re-point dashboard_insight_requests.user_id at profiles(id) so
-- PostgREST can embed the author's profile via
--   .select('..., profile:profiles!user_id(...)')
--
-- Originally the FK pointed at auth.users(id) which PostgREST can't see
-- (auth schema is hidden), so the admin queue UI errored with:
--   "Could not find a relationship between 'dashboard_insight_requests'
--    and 'profiles' in the schema cache"
--
-- profiles.id == auth.users.id (the profile row is created via signup
-- trigger), so cascade-delete still propagates: auth.users → profiles
-- → dashboard_insight_requests.

-- Drop whatever FK constraint currently exists on user_id (auto-generated
-- name varies). Then add the new one pointing at profiles.
DO $$
DECLARE
  fk_name TEXT;
BEGIN
  SELECT conname INTO fk_name
  FROM pg_constraint
  WHERE conrelid = 'dashboard_insight_requests'::regclass
    AND contype = 'f'
    AND conkey  = (
      SELECT array_agg(attnum)
      FROM pg_attribute
      WHERE attrelid = 'dashboard_insight_requests'::regclass
        AND attname  = 'user_id'
    )
  LIMIT 1;

  IF fk_name IS NOT NULL THEN
    EXECUTE format(
      'ALTER TABLE dashboard_insight_requests DROP CONSTRAINT %I',
      fk_name
    );
  END IF;
END $$;

ALTER TABLE dashboard_insight_requests
  ADD CONSTRAINT dashboard_insight_requests_user_id_fkey
  FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE;
