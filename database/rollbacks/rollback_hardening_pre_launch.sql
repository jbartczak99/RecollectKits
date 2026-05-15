-- =========================================================================
-- ROLLBACK: hardening_pre_launch.sql
--
-- ⚠️  WARNING — this script restores the INSECURE pre-hardening state:
--      - RLS disabled on profiles / jersey_submissions / user_rejections
--      - Any authenticated user can write players / squads / cache
--      - approve_user_account / reject_user_account become unguarded
--      - grant_admin RPC is dropped (admin toggle won't work)
--
-- Use this ONLY in an emergency where the hardening migration locked you
-- out or broke a flow you can't otherwise repair. The intended path is to
-- run this, regain access, diagnose the issue, then re-run a corrected
-- version of hardening_pre_launch.sql.
--
-- DO NOT leave the DB in this state with public users on the platform.
-- The known issues this restores include trivial admin self-promotion.
-- =========================================================================


-- ============================================================
-- 1. profiles
-- ============================================================

DROP POLICY IF EXISTS "Anyone can read profiles"                    ON profiles;
DROP POLICY IF EXISTS "Users update own profile (non-admin fields)" ON profiles;
DROP POLICY IF EXISTS "Admins update any profile"                   ON profiles;
DROP POLICY IF EXISTS "Users insert own profile row"                ON profiles;
DROP POLICY IF EXISTS "Admins delete profiles"                      ON profiles;

ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;


-- ============================================================
-- 2. jersey_submissions
-- ============================================================

DROP POLICY IF EXISTS "Users insert own submissions"             ON jersey_submissions;
DROP POLICY IF EXISTS "Users see own submissions, admins see all" ON jersey_submissions;
DROP POLICY IF EXISTS "Admins update submissions"                 ON jersey_submissions;
DROP POLICY IF EXISTS "Admins delete submissions"                 ON jersey_submissions;

ALTER TABLE jersey_submissions DISABLE ROW LEVEL SECURITY;


-- ============================================================
-- 3. user_rejections
-- ============================================================

DROP POLICY IF EXISTS "Admins select rejections" ON user_rejections;
DROP POLICY IF EXISTS "Admins insert rejections" ON user_rejections;

ALTER TABLE user_rejections DISABLE ROW LEVEL SECURITY;


-- ============================================================
-- 4. players / player_careers / team_squads / kit_squad_cache
--    Restore wide-open authenticated writes (prior state).
-- ============================================================

-- players
DROP POLICY IF EXISTS "Anyone can view players"   ON players;
DROP POLICY IF EXISTS "Admins insert players"     ON players;
DROP POLICY IF EXISTS "Admins update players"     ON players;
DROP POLICY IF EXISTS "Admins delete players"     ON players;

CREATE POLICY "Anyone can view players"
  ON players FOR SELECT USING (true);
CREATE POLICY "Authenticated users can insert players"
  ON players FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update players"
  ON players FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Authenticated users can delete players"
  ON players FOR DELETE TO authenticated USING (true);

-- player_careers
DROP POLICY IF EXISTS "Anyone can view player_careers"   ON player_careers;
DROP POLICY IF EXISTS "Admins insert player_careers"     ON player_careers;
DROP POLICY IF EXISTS "Admins update player_careers"     ON player_careers;
DROP POLICY IF EXISTS "Admins delete player_careers"     ON player_careers;

CREATE POLICY "Anyone can view player_careers"
  ON player_careers FOR SELECT USING (true);
CREATE POLICY "Authenticated users can insert player_careers"
  ON player_careers FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update player_careers"
  ON player_careers FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Authenticated users can delete player_careers"
  ON player_careers FOR DELETE TO authenticated USING (true);

-- team_squads
DROP POLICY IF EXISTS "Anyone can view team_squads"   ON team_squads;
DROP POLICY IF EXISTS "Admins insert team_squads"     ON team_squads;
DROP POLICY IF EXISTS "Admins update team_squads"     ON team_squads;
DROP POLICY IF EXISTS "Admins delete team_squads"     ON team_squads;

CREATE POLICY "Anyone can view team_squads"
  ON team_squads FOR SELECT USING (true);
CREATE POLICY "Authenticated users can insert team_squads"
  ON team_squads FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update team_squads"
  ON team_squads FOR UPDATE TO authenticated USING (true);
CREATE POLICY "Authenticated users can delete team_squads"
  ON team_squads FOR DELETE TO authenticated USING (true);

-- kit_squad_cache
DROP POLICY IF EXISTS "Anyone can view kit_squad_cache"   ON kit_squad_cache;
DROP POLICY IF EXISTS "Admins insert kit_squad_cache"     ON kit_squad_cache;
DROP POLICY IF EXISTS "Admins update kit_squad_cache"     ON kit_squad_cache;
DROP POLICY IF EXISTS "Admins delete kit_squad_cache"     ON kit_squad_cache;

CREATE POLICY "Anyone can view kit_squad_cache"
  ON kit_squad_cache FOR SELECT USING (true);
CREATE POLICY "Authenticated users can insert kit_squad_cache"
  ON kit_squad_cache FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Authenticated users can update kit_squad_cache"
  ON kit_squad_cache FOR UPDATE TO authenticated USING (true);


-- ============================================================
-- 5. dashboard_insight_requests
-- ============================================================

DROP POLICY IF EXISTS "Users delete own insight requests" ON dashboard_insight_requests;


-- ============================================================
-- 6. Revert approve_user_account / reject_user_account
--    Prior signature took an explicit admin_id parameter and did NOT
--    verify that the caller was actually that admin (the unguarded
--    version the audit flagged).
-- ============================================================

DROP FUNCTION IF EXISTS approve_user_account(UUID, TEXT);
DROP FUNCTION IF EXISTS reject_user_account(UUID, TEXT);

CREATE OR REPLACE FUNCTION approve_user_account(
  user_id  UUID,
  admin_id UUID,
  notes    TEXT DEFAULT NULL
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE profiles
     SET approval_status = 'approved',
         approved_at     = now(),
         approved_by     = admin_id,
         admin_notes     = notes
   WHERE id = user_id;
END;
$$;

CREATE OR REPLACE FUNCTION reject_user_account(
  user_id  UUID,
  admin_id UUID,
  notes    TEXT DEFAULT NULL
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  rejected_username TEXT;
BEGIN
  SELECT username INTO rejected_username FROM profiles WHERE id = user_id;
  INSERT INTO user_rejections (user_id, username, rejected_by, notes)
  VALUES (user_id, rejected_username, admin_id, notes);
  DELETE FROM profiles WHERE id = user_id;
END;
$$;


-- ============================================================
-- 7. Drop grant_admin RPC
--    NOTE: After rollback, the client's AdminUsers.jsx will fail because
--    it calls grant_admin. To restore the admin-toggle UI, either revert
--    AdminUsers.jsx to its prior direct-UPDATE form OR keep this function
--    in place (it's safe to leave) and rely on it.
-- ============================================================

DROP FUNCTION IF EXISTS grant_admin(UUID, BOOLEAN);


-- ============================================================
-- 8. get_top_3_jerseys
--    Restore the version without the is_public check (matches prior
--    behaviour, where the function returned data regardless of owner
--    privacy setting).
-- ============================================================

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_proc WHERE proname = 'get_top_3_jerseys'
  ) THEN
    EXECUTE $f$
      CREATE OR REPLACE FUNCTION get_top_3_jerseys(jersey_ids UUID[])
      RETURNS SETOF public_jerseys
      LANGUAGE sql
      SECURITY DEFINER
      AS $body$
        SELECT *
        FROM public_jerseys
        WHERE id = ANY(jersey_ids)
        ORDER BY array_position(jersey_ids, id);
      $body$;
    $f$;
  END IF;
END $$;
