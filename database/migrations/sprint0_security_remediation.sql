-- Sprint 0 security remediation — Blitz Plan "Tonight (June 10)" block
-- Fixes both ERROR-level Supabase advisor findings and locks down
-- SECURITY DEFINER function execution.
--
-- Context: fix_pending_accounts_exposure.sql dropped the pending_accounts
-- view and replaced it with the admin-gated get_pending_accounts() function,
-- but the live database still has the view (recreated or fix never applied).
-- The view joins auth.users and exposes email/full_name/admin_notes with
-- FULL grants to anon (relacl: anon=arwdDxtm).

-- ============================================================
-- 1) Drop the exposed view (clears both advisor ERRORs:
--    auth_users_exposed + security_definer_view)
-- ============================================================
-- App code only calls the get_pending_accounts() RPC (AuthContext.jsx);
-- nothing references the view.
DROP VIEW IF EXISTS public.pending_accounts;

-- ============================================================
-- 2) Lock down EXECUTE on SECURITY DEFINER functions
-- ============================================================
-- Admin-only RPCs: authenticated only. Each already has an internal
-- is_admin check; this removes the anon attack surface entirely.
REVOKE ALL ON FUNCTION public.grant_admin(uuid, boolean) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.grant_admin(uuid, boolean) TO authenticated;

REVOKE ALL ON FUNCTION public.approve_user_account(uuid, text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.approve_user_account(uuid, text) TO authenticated;

REVOKE ALL ON FUNCTION public.reject_user_account(uuid, text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.reject_user_account(uuid, text) TO authenticated;

REVOKE ALL ON FUNCTION public.approve_jersey_submission(uuid, uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.approve_jersey_submission(uuid, uuid) TO authenticated;

REVOKE ALL ON FUNCTION public.get_pending_accounts() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.get_pending_accounts() TO authenticated;

-- Friend helpers: no client code calls these (no .rpc() references);
-- keep them available to signed-in users only.
REVOKE ALL ON FUNCTION public.are_friends(uuid, uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.are_friends(uuid, uuid) TO authenticated;

REVOKE ALL ON FUNCTION public.get_friend_count(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.get_friend_count(uuid) TO authenticated;

REVOKE ALL ON FUNCTION public.get_friendship_status(uuid, uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.get_friendship_status(uuid, uuid) TO authenticated;

-- Trigger function: never called directly; EXECUTE is checked at trigger
-- creation time, not fire time, so revoking from all client roles is safe.
REVOKE ALL ON FUNCTION public.protect_profile_admin_fields() FROM PUBLIC, anon, authenticated;

-- ============================================================
-- 3) Intentionally KEPT anon-executable (documented deviation from the
--    plan's "revoke anon on all 13" — revoking these breaks the product):
--
--    get_public_profile(text)         — called by api/og/[username].js with
--    get_public_profile_stats(uuid)     the anon key for social crawlers
--    get_public_collections(uuid)     — public-profile read paths; return
--    get_top_3_jerseys(uuid[])          only is_public-filtered data
--    is_admin_user()                  — referenced inside RLS policies that
--                                       anon SELECTs evaluate; revoking would
--                                       break public reads on profiles
--
-- These remain as accepted advisor WARNs; the launch gate is the two ERRORs.
-- ============================================================
