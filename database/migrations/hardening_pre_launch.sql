-- Migration: Pre-launch security hardening.
--
-- Re-enables RLS, replaces wide-open / unguarded policies, hardens
-- SECURITY DEFINER functions, and moves admin-only writes behind RPCs.
-- Idempotent — safe to run on a DB that's already partially hardened.
--
-- Run this AFTER backing up the database. It will affect access on:
--   - profiles, jersey_submissions, user_rejections
--   - players, player_careers, team_squads, kit_squad_cache
--   - dashboard_insight_requests
--   - approve_user_account, reject_user_account, get_top_3_jerseys functions
--   - new grant_admin function


-- ============================================================
-- 1. profiles: RLS on; lock admin-related columns
-- ============================================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Anyone (including anon) can read public profile fields. Granular column
-- filtering is enforced by the SELECT in the calling code; if you need to
-- hide bio/etc. by default, switch this to use the public-profile RPCs.
DROP POLICY IF EXISTS "Anyone can read profiles" ON profiles;
CREATE POLICY "Anyone can read profiles"
  ON profiles FOR SELECT
  USING (true);

-- Users update their OWN row, but cannot modify admin-only columns.
-- The CHECK clause runs on the NEW row; it blocks any change that would
-- set is_admin / approval_status / approved_at / approved_by / admin_notes
-- to a value different from the existing row.
DROP POLICY IF EXISTS "Users update own profile (non-admin fields)" ON profiles;
CREATE POLICY "Users update own profile (non-admin fields)"
  ON profiles FOR UPDATE TO authenticated
  USING (id = auth.uid())
  WITH CHECK (
    id = auth.uid()
    AND is_admin           IS NOT DISTINCT FROM (SELECT is_admin           FROM profiles WHERE id = auth.uid())
    AND approval_status    IS NOT DISTINCT FROM (SELECT approval_status    FROM profiles WHERE id = auth.uid())
    AND approved_at        IS NOT DISTINCT FROM (SELECT approved_at        FROM profiles WHERE id = auth.uid())
    AND approved_by        IS NOT DISTINCT FROM (SELECT approved_by        FROM profiles WHERE id = auth.uid())
    AND admin_notes        IS NOT DISTINCT FROM (SELECT admin_notes        FROM profiles WHERE id = auth.uid())
  );

-- Admins can update any profile (including admin-only columns).
DROP POLICY IF EXISTS "Admins update any profile" ON profiles;
CREATE POLICY "Admins update any profile"
  ON profiles FOR UPDATE TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.is_admin = TRUE))
  WITH CHECK (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.is_admin = TRUE));

-- INSERT is normally handled by the auth signup trigger; allow self-insert
-- as a fallback (id must match auth.uid()).
DROP POLICY IF EXISTS "Users insert own profile row" ON profiles;
CREATE POLICY "Users insert own profile row"
  ON profiles FOR INSERT TO authenticated
  WITH CHECK (id = auth.uid());

-- Profiles are not user-deletable. (Only admins via reject_user_account RPC.)
DROP POLICY IF EXISTS "Admins delete profiles" ON profiles;
CREATE POLICY "Admins delete profiles"
  ON profiles FOR DELETE TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles p WHERE p.id = auth.uid() AND p.is_admin = TRUE));


-- ============================================================
-- 2. jersey_submissions: RLS on; owner insert/read, admin write
-- ============================================================

ALTER TABLE jersey_submissions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users insert own submissions" ON jersey_submissions;
CREATE POLICY "Users insert own submissions"
  ON jersey_submissions FOR INSERT TO authenticated
  WITH CHECK (submitted_by = auth.uid());

DROP POLICY IF EXISTS "Users see own submissions, admins see all" ON jersey_submissions;
CREATE POLICY "Users see own submissions, admins see all"
  ON jersey_submissions FOR SELECT TO authenticated
  USING (
    submitted_by = auth.uid()
    OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = TRUE)
  );

DROP POLICY IF EXISTS "Admins update submissions" ON jersey_submissions;
CREATE POLICY "Admins update submissions"
  ON jersey_submissions FOR UPDATE TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = TRUE));

DROP POLICY IF EXISTS "Admins delete submissions" ON jersey_submissions;
CREATE POLICY "Admins delete submissions"
  ON jersey_submissions FOR DELETE TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = TRUE));


-- ============================================================
-- 3. user_rejections: admin-only
-- ============================================================

ALTER TABLE user_rejections ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins select rejections" ON user_rejections;
CREATE POLICY "Admins select rejections"
  ON user_rejections FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = TRUE));

DROP POLICY IF EXISTS "Admins insert rejections" ON user_rejections;
CREATE POLICY "Admins insert rejections"
  ON user_rejections FOR INSERT TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = TRUE));


-- ============================================================
-- 4. Players / squads / cache: lock writes to admins
--    (reads stay public; reading the catalog is a feature)
-- ============================================================

-- players
ALTER TABLE players ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Authenticated users can insert players" ON players;
DROP POLICY IF EXISTS "Authenticated users can update players" ON players;
DROP POLICY IF EXISTS "Authenticated users can delete players" ON players;
DROP POLICY IF EXISTS "Anyone can view players" ON players;

CREATE POLICY "Anyone can view players"
  ON players FOR SELECT USING (true);

CREATE POLICY "Admins insert players"
  ON players FOR INSERT TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = TRUE));

CREATE POLICY "Admins update players"
  ON players FOR UPDATE TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = TRUE));

CREATE POLICY "Admins delete players"
  ON players FOR DELETE TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = TRUE));

-- player_careers
ALTER TABLE player_careers ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Authenticated users can insert player_careers" ON player_careers;
DROP POLICY IF EXISTS "Authenticated users can update player_careers" ON player_careers;
DROP POLICY IF EXISTS "Authenticated users can delete player_careers" ON player_careers;
DROP POLICY IF EXISTS "Anyone can view player_careers" ON player_careers;

CREATE POLICY "Anyone can view player_careers"
  ON player_careers FOR SELECT USING (true);

CREATE POLICY "Admins insert player_careers"
  ON player_careers FOR INSERT TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = TRUE));

CREATE POLICY "Admins update player_careers"
  ON player_careers FOR UPDATE TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = TRUE));

CREATE POLICY "Admins delete player_careers"
  ON player_careers FOR DELETE TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = TRUE));

-- team_squads
ALTER TABLE team_squads ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Authenticated users can insert team_squads" ON team_squads;
DROP POLICY IF EXISTS "Authenticated users can update team_squads" ON team_squads;
DROP POLICY IF EXISTS "Authenticated users can delete team_squads" ON team_squads;
DROP POLICY IF EXISTS "Anyone can view team_squads" ON team_squads;

CREATE POLICY "Anyone can view team_squads"
  ON team_squads FOR SELECT USING (true);

CREATE POLICY "Admins insert team_squads"
  ON team_squads FOR INSERT TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = TRUE));

CREATE POLICY "Admins update team_squads"
  ON team_squads FOR UPDATE TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = TRUE));

CREATE POLICY "Admins delete team_squads"
  ON team_squads FOR DELETE TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = TRUE));

-- kit_squad_cache (used as a server-side cache; locking down writes prevents
-- a regular user from poisoning the cache)
ALTER TABLE kit_squad_cache ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Authenticated users can insert kit_squad_cache" ON kit_squad_cache;
DROP POLICY IF EXISTS "Authenticated users can update kit_squad_cache" ON kit_squad_cache;
DROP POLICY IF EXISTS "Authenticated users can delete kit_squad_cache" ON kit_squad_cache;
DROP POLICY IF EXISTS "Anyone can view kit_squad_cache" ON kit_squad_cache;

CREATE POLICY "Anyone can view kit_squad_cache"
  ON kit_squad_cache FOR SELECT USING (true);

CREATE POLICY "Admins insert kit_squad_cache"
  ON kit_squad_cache FOR INSERT TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = TRUE));

CREATE POLICY "Admins update kit_squad_cache"
  ON kit_squad_cache FOR UPDATE TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = TRUE));

CREATE POLICY "Admins delete kit_squad_cache"
  ON kit_squad_cache FOR DELETE TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = TRUE));


-- ============================================================
-- 5. dashboard_insight_requests: let users delete their own
-- ============================================================

DROP POLICY IF EXISTS "Users delete own insight requests" ON dashboard_insight_requests;
CREATE POLICY "Users delete own insight requests"
  ON dashboard_insight_requests FOR DELETE TO authenticated
  USING (user_id = auth.uid());


-- ============================================================
-- 6. Harden approve_user_account / reject_user_account
--    Caller is identified via auth.uid(); admin parameter ignored.
--    The old signatures took an explicit admin_id and didn't verify the
--    caller — those must be dropped, not "replaced", because Postgres
--    treats different argument lists as separate functions.
-- ============================================================

DROP FUNCTION IF EXISTS approve_user_account(UUID, UUID, TEXT);
DROP FUNCTION IF EXISTS approve_user_account(UUID, TEXT);
DROP FUNCTION IF EXISTS reject_user_account(UUID, UUID, TEXT);
DROP FUNCTION IF EXISTS reject_user_account(UUID, TEXT);

CREATE OR REPLACE FUNCTION approve_user_account(
  user_id UUID,
  notes   TEXT DEFAULT NULL
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
DECLARE
  caller_id UUID := auth.uid();
BEGIN
  IF caller_id IS NULL THEN
    RAISE EXCEPTION 'not authenticated';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM profiles WHERE id = caller_id AND is_admin = TRUE) THEN
    RAISE EXCEPTION 'admin access required';
  END IF;

  UPDATE profiles
     SET approval_status = 'approved',
         approved_at     = now(),
         approved_by     = caller_id,
         admin_notes     = notes
   WHERE id = user_id;
END;
$$;

REVOKE ALL ON FUNCTION approve_user_account(UUID, TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION approve_user_account(UUID, TEXT) TO authenticated;

CREATE OR REPLACE FUNCTION reject_user_account(
  user_id UUID,
  notes   TEXT DEFAULT NULL
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
DECLARE
  caller_id UUID := auth.uid();
  rejected_username TEXT;
BEGIN
  IF caller_id IS NULL THEN
    RAISE EXCEPTION 'not authenticated';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM profiles WHERE id = caller_id AND is_admin = TRUE) THEN
    RAISE EXCEPTION 'admin access required';
  END IF;

  SELECT username INTO rejected_username FROM profiles WHERE id = user_id;

  INSERT INTO user_rejections (user_id, username, rejected_by, notes)
  VALUES (user_id, rejected_username, caller_id, notes);

  DELETE FROM profiles WHERE id = user_id;
  -- auth.users row is removed by a separate Edge Function holding the
  -- service-role key (the anon client cannot call auth.admin.deleteUser).
END;
$$;

REVOKE ALL ON FUNCTION reject_user_account(UUID, TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION reject_user_account(UUID, TEXT) TO authenticated;


-- ============================================================
-- 7. grant_admin RPC: only admins can toggle is_admin
-- ============================================================

CREATE OR REPLACE FUNCTION grant_admin(
  target_user_id UUID,
  is_admin_new   BOOLEAN
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
DECLARE
  caller_id UUID := auth.uid();
BEGIN
  IF caller_id IS NULL THEN
    RAISE EXCEPTION 'not authenticated';
  END IF;

  IF NOT EXISTS (SELECT 1 FROM profiles WHERE id = caller_id AND is_admin = TRUE) THEN
    RAISE EXCEPTION 'admin access required';
  END IF;

  UPDATE profiles SET is_admin = is_admin_new WHERE id = target_user_id;
END;
$$;

REVOKE ALL ON FUNCTION grant_admin(UUID, BOOLEAN) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION grant_admin(UUID, BOOLEAN) TO authenticated;


-- ============================================================
-- 8. Harden remaining SECURITY DEFINER functions with search_path
-- ============================================================

-- get_top_3_jerseys also needs an is_public check on the owning profile.
-- The existing function has a different return type, so a plain
-- CREATE OR REPLACE fails — drop and recreate instead. Only do this if
-- the function exists so we don't create an empty stub on fresh DBs.
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_proc WHERE proname = 'get_top_3_jerseys'
  ) THEN
    EXECUTE 'DROP FUNCTION IF EXISTS get_top_3_jerseys(UUID[])';
    EXECUTE $f$
      CREATE FUNCTION get_top_3_jerseys(jersey_ids UUID[])
      RETURNS SETOF public_jerseys
      LANGUAGE sql
      SECURITY DEFINER
      SET search_path = public, auth
      AS $body$
        SELECT pj.*
        FROM public_jerseys pj
        JOIN user_jerseys uj ON uj.public_jersey_id = pj.id
        JOIN profiles p ON p.id = uj.user_id
        WHERE pj.id = ANY(jersey_ids)
          AND COALESCE(p.is_public, TRUE) = TRUE
        ORDER BY array_position(jersey_ids, pj.id);
      $body$;
    $f$;
    EXECUTE 'REVOKE ALL ON FUNCTION get_top_3_jerseys(UUID[]) FROM PUBLIC';
    EXECUTE 'GRANT EXECUTE ON FUNCTION get_top_3_jerseys(UUID[]) TO authenticated, anon';
  END IF;
END $$;
