-- Sprint 0 (June 11): RLS tightening + legacy policy dedupe.
--
-- Context: hardening_pre_launch.sql created admin-scoped write policies for
-- the catalog tables, but its DROPs targeted policy names that don't match
-- the live ones (e.g. "...insert kit_squad_cache" vs live "...insert squad
-- cache"), so the old wide-open authenticated policies survived alongside
-- the admin ones. This migration removes them by their real names, scopes
-- the two client-written tables (notifications, user_badges), tightens the
-- partner_applications public insert, and drops duplicate legacy policies.
--
-- All names verified against live pg_policies on 2026-06-11.
-- Rollback: database/rollbacks/rollback_sprint0_rls_tightening.sql

-- ============================================================
-- 1. Remove leftover wide-open write policies (admin policies
--    already exist live for all three tables; all app write
--    paths are admin-gated UI)
-- ============================================================

-- team_squads (admin writes via SquadImportPanel, behind profile.is_admin)
DROP POLICY IF EXISTS "Authenticated users can insert team squads" ON team_squads;
DROP POLICY IF EXISTS "Authenticated users can update team squads" ON team_squads;
DROP POLICY IF EXISTS "Authenticated users can delete team squads" ON team_squads;

-- kit_squad_cache (server-side cache; writes were never needed client-side)
DROP POLICY IF EXISTS "Authenticated users can insert squad cache" ON kit_squad_cache;
DROP POLICY IF EXISTS "Authenticated users can update squad cache" ON kit_squad_cache;
DROP POLICY IF EXISTS "Authenticated users can delete squad cache" ON kit_squad_cache;

-- player_careers (admin writes via PlayerProfile/AdminPanel, behind is_admin)
DROP POLICY IF EXISTS "Authenticated users can insert careers" ON player_careers;
DROP POLICY IF EXISTS "Authenticated users can update careers" ON player_careers;

-- ============================================================
-- 2. notifications: any authed user could create a notification
--    for ANY user with arbitrary content. Scope to rows where the
--    caller is the recipient (welcome/milestone/badge flows) or
--    the actor (friend-request flows).
-- ============================================================

DROP POLICY IF EXISTS "Authenticated users can create notifications" ON notifications;
CREATE POLICY "Users create notifications they are part of"
  ON notifications FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid() OR actor_id = auth.uid());

-- ============================================================
-- 3. user_badges: any authed user could award any badge to any
--    user. Scope to self-award only (needed by the client-side
--    First-100 auto-award at signup). Residual risk: a user can
--    still self-insert other badges via the API; the proper fix
--    is moving awards behind a trigger/RPC — deferred, tracked.
-- ============================================================

DROP POLICY IF EXISTS "Authenticated users can insert user_badges" ON user_badges;
CREATE POLICY "Users can award badges to themselves"
  ON user_badges FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

-- ============================================================
-- 4. partner_applications: public form stays open (accepted
--    advisor WARN), but submitters can no longer pre-set the
--    review status or inject admin notes.
-- ============================================================

DROP POLICY IF EXISTS "Anyone can submit partner applications" ON partner_applications;
CREATE POLICY "Anyone can submit partner applications"
  ON partner_applications FOR INSERT TO anon, authenticated
  WITH CHECK (status = 'pending' AND notes IS NULL);

-- ============================================================
-- 5. Dedupe legacy policies (exact or subsumed duplicates).
--    Keeping one policy per command; the kept policy is named in
--    each comment.
-- ============================================================

-- collections — keep "Public collections are viewable by everyone."
-- (is_public OR owner), "Users can insert their own collections",
-- "Users can update their own collections", "Users can delete their own collections"
DROP POLICY IF EXISTS "Public collections viewable" ON collections;
DROP POLICY IF EXISTS "Users can view public collections" ON collections;
DROP POLICY IF EXISTS "Users can view their own collections" ON collections;
DROP POLICY IF EXISTS "Users can insert their own collections." ON collections;
DROP POLICY IF EXISTS "Users can update own collections." ON collections;
DROP POLICY IF EXISTS "Users can delete own collections." ON collections;

-- user_jerseys — keep "Users can insert their own jerseys",
-- "Users can update their own jerseys", "Users can delete their own jerseys"
DROP POLICY IF EXISTS "Users can insert jerseys to their collections." ON user_jerseys;
DROP POLICY IF EXISTS "Users can update their own jerseys." ON user_jerseys;
DROP POLICY IF EXISTS "Users can delete their own jerseys." ON user_jerseys;

-- players / player_careers / team_squads / kit_squad_cache —
-- keep the "Anyone can view ..." variants
DROP POLICY IF EXISTS "Players are viewable by everyone" ON players;
DROP POLICY IF EXISTS "Careers are viewable by everyone" ON player_careers;
DROP POLICY IF EXISTS "Team squads viewable by everyone" ON team_squads;
DROP POLICY IF EXISTS "Squad cache viewable by everyone" ON kit_squad_cache;

-- jersey_likes — "Anyone can read likes" (USING true) is required by the
-- anon-client like-count reads (most-liked-this-week feature); the scoped
-- "Public Liked Kits viewable" policy was dead code underneath it.
DROP POLICY IF EXISTS "Public Liked Kits viewable" ON jersey_likes;
