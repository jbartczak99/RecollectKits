-- =========================================================================
-- HOTFIX for hardening_pre_launch.sql
--
-- The hardening migration introduced policies on `profiles` that contain
-- subqueries on `profiles` itself (EXISTS for admin checks, SELECT for
-- "did you change this column"). Combined with the older
-- "Anyone can view public profiles" policy from add_public_profiles.sql
-- (also recursive), every SELECT on `profiles` now returns:
--
--   code: 42P17  "infinite recursion detected in policy for relation 'profiles'"
--
-- Fix: introduce a SECURITY DEFINER helper that returns the caller's
-- admin status (bypassing RLS), rewrite the policies to use it, and move
-- the admin-field protection into a BEFORE UPDATE trigger so the policy
-- itself doesn't need a subquery.
--
-- Idempotent. Re-runnable.
-- =========================================================================


-- ============================================================
-- 1. Helper: is the current caller an admin?
--    SECURITY DEFINER reads `profiles` without invoking RLS.
-- ============================================================

CREATE OR REPLACE FUNCTION is_admin_user()
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = public, auth
STABLE
AS $$
  SELECT COALESCE(
    (SELECT is_admin FROM profiles WHERE id = auth.uid()),
    FALSE
  );
$$;

REVOKE ALL ON FUNCTION is_admin_user() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION is_admin_user() TO anon, authenticated;


-- ============================================================
-- 2. Drop the recursive / overlapping profile policies
-- ============================================================

DROP POLICY IF EXISTS "Anyone can view public profiles"            ON profiles;
DROP POLICY IF EXISTS "Anyone can read profiles"                   ON profiles;
DROP POLICY IF EXISTS "Admins update any profile"                  ON profiles;
DROP POLICY IF EXISTS "Admins delete profiles"                     ON profiles;
DROP POLICY IF EXISTS "Users update own profile (non-admin fields)" ON profiles;


-- ============================================================
-- 3. New SELECT policy: visible to owner, admins, or anyone if
--    is_public is true. Matches the original intent without recursion.
-- ============================================================

CREATE POLICY "Profiles visible by owner / admin / public"
  ON profiles FOR SELECT
  USING (
    id = auth.uid()
    OR is_admin_user()
    OR COALESCE(is_public, TRUE) = TRUE
  );


-- ============================================================
-- 4. UPDATE: owner OR admin. Admin-field protection is enforced
--    by the trigger below, so the WITH CHECK stays simple.
-- ============================================================

CREATE POLICY "Users update own profile"
  ON profiles FOR UPDATE TO authenticated
  USING (id = auth.uid() OR is_admin_user())
  WITH CHECK (id = auth.uid() OR is_admin_user());


-- ============================================================
-- 5. DELETE: admins only.
-- ============================================================

CREATE POLICY "Admins delete profiles"
  ON profiles FOR DELETE TO authenticated
  USING (is_admin_user());


-- ============================================================
-- 6. BEFORE UPDATE trigger: block non-admins from modifying
--    admin-only columns. Replaces the WITH CHECK subqueries.
-- ============================================================

CREATE OR REPLACE FUNCTION protect_profile_admin_fields()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
DECLARE
  caller_admin BOOLEAN;
BEGIN
  -- Read admin status directly (we're SECURITY DEFINER, RLS doesn't apply).
  SELECT COALESCE(is_admin, FALSE) INTO caller_admin
  FROM profiles WHERE id = auth.uid();

  IF NOT caller_admin THEN
    IF NEW.is_admin IS DISTINCT FROM OLD.is_admin THEN
      RAISE EXCEPTION 'permission denied to modify is_admin';
    END IF;
    IF NEW.approval_status IS DISTINCT FROM OLD.approval_status THEN
      RAISE EXCEPTION 'permission denied to modify approval_status';
    END IF;
    IF NEW.approved_at IS DISTINCT FROM OLD.approved_at THEN
      RAISE EXCEPTION 'permission denied to modify approved_at';
    END IF;
    IF NEW.approved_by IS DISTINCT FROM OLD.approved_by THEN
      RAISE EXCEPTION 'permission denied to modify approved_by';
    END IF;
    IF NEW.admin_notes IS DISTINCT FROM OLD.admin_notes THEN
      RAISE EXCEPTION 'permission denied to modify admin_notes';
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_profiles_protect_admin_fields ON profiles;
CREATE TRIGGER trg_profiles_protect_admin_fields
BEFORE UPDATE ON profiles
FOR EACH ROW EXECUTE FUNCTION protect_profile_admin_fields();
