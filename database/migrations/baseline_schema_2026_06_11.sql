-- ============================================================================
-- RecollectKits — BASELINE SCHEMA SNAPSHOT
-- Captured: 2026-06-11, from live production via read-only catalog queries
-- (pg_catalog / information_schema through the Supabase MCP — NOT pg_dump;
-- replace with a `supabase db dump` artifact once the CLI is set up).
--
-- Purpose: documents live prod state at the start of the SQL-editor
-- moratorium (Sprint 0, Blitz Plan June 11). From this point on, all schema
-- changes go through committed migration files.
--
-- NOTE ON POLICIES: section 9 reflects the state AFTER
-- database/migrations/sprint0_rls_tightening.sql (applied to prod
-- 2026-06-11 morning, verified against pg_policies + advisors).
--
-- Postgres version at capture: supabase-postgres-17.4.1.075
-- (security patches outstanding — dashboard upgrade pending, see plan).
-- ============================================================================


-- ============================================================
-- 1. Extensions (installed at capture)
-- ============================================================
-- pg_graphql 1.5.11
-- pg_stat_statements 1.11
-- pgcrypto 1.3
-- plpgsql 1.0
-- supabase_vault 0.3.1
-- uuid-ossp 1.1
CREATE EXTENSION IF NOT EXISTS pgcrypto;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";


-- ============================================================
-- 2. Tables
-- ============================================================

CREATE TABLE badges (
  id uuid DEFAULT gen_random_uuid() NOT NULL,
  name text NOT NULL,
  description text NOT NULL,
  icon text DEFAULT '🏆'::text,
  color text DEFAULT '#f59e0b'::text,
  rarity text DEFAULT 'common'::text NOT NULL,
  created_at timestamp with time zone DEFAULT now()
);

CREATE TABLE club_suggestions (
  id uuid DEFAULT gen_random_uuid() NOT NULL,
  suggested_name text NOT NULL,
  suggested_country text,
  suggested_league text,
  suggested_by uuid,
  status text DEFAULT 'pending'::text NOT NULL,
  notes text,
  resolved_club_id uuid,
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  resolved_at timestamp with time zone,
  resolved_by uuid
);

CREATE TABLE clubs (
  id uuid DEFAULT gen_random_uuid() NOT NULL,
  name text NOT NULL,
  short_name text,
  aliases text[] DEFAULT '{}'::text[] NOT NULL,
  country text NOT NULL,
  city text,
  primary_league text,
  founded_year integer,
  latitude numeric(9,6),
  longitude numeric(9,6),
  stadium_name text,
  wikidata_id text,
  source text DEFAULT 'manual'::text NOT NULL,
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  updated_at timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE collection_jerseys (
  id uuid DEFAULT extensions.uuid_generate_v4() NOT NULL,
  collection_id uuid NOT NULL,
  user_jersey_id uuid NOT NULL,
  created_at timestamp with time zone DEFAULT now()
);

CREATE TABLE collections (
  id uuid DEFAULT gen_random_uuid() NOT NULL,
  user_id uuid NOT NULL,
  name text NOT NULL,
  description text,
  is_public boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE dashboard_insight_requests (
  id uuid DEFAULT gen_random_uuid() NOT NULL,
  user_id uuid NOT NULL,
  content text NOT NULL,
  status text DEFAULT 'pending'::text NOT NULL,
  admin_notes text,
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  updated_at timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE jersey_likes (
  id uuid DEFAULT gen_random_uuid() NOT NULL,
  jersey_id uuid NOT NULL,
  user_id uuid NOT NULL,
  created_at timestamp with time zone DEFAULT now()
);

CREATE TABLE jersey_submissions (
  id uuid DEFAULT gen_random_uuid() NOT NULL,
  submitted_by uuid NOT NULL,
  team_name text NOT NULL,
  player_name text,
  jersey_number text,
  season text NOT NULL,
  jersey_type text NOT NULL,
  league text,
  brand text,
  official_release_date date,
  description text,
  tags text[],
  status text DEFAULT 'pending'::text,
  admin_notes text,
  reviewed_by uuid,
  reviewed_at timestamp with time zone,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  kit_type text,
  primary_color text,
  secondary_color text,
  main_sponsor text,
  additional_sponsors text,
  front_image_url text,
  back_image_url text,
  additional_image_urls text[],
  updated_by uuid,
  competition_gender text DEFAULT 'mens'::text,
  jersey_fit text DEFAULT 'mens'::text
);

CREATE TABLE kit_squad_cache (
  id uuid DEFAULT gen_random_uuid() NOT NULL,
  team_wikidata_id text NOT NULL,
  team_name text NOT NULL,
  season text NOT NULL,
  player_wikidata_id text NOT NULL,
  player_name text NOT NULL,
  shirt_number integer,
  player_id uuid,
  fetched_at timestamp with time zone DEFAULT now()
);

CREATE TABLE notifications (
  id uuid DEFAULT gen_random_uuid() NOT NULL,
  user_id uuid NOT NULL,
  type text NOT NULL,
  category text NOT NULL,
  title text NOT NULL,
  message text NOT NULL,
  link_url text,
  actor_id uuid,
  read_at timestamp with time zone,
  created_at timestamp with time zone DEFAULT now()
);

CREATE TABLE partner_applications (
  id uuid DEFAULT gen_random_uuid() NOT NULL,
  name text NOT NULL,
  email text NOT NULL,
  username text,
  partner_type text NOT NULL,
  description text NOT NULL,
  links text,
  status text DEFAULT 'pending'::text,
  created_at timestamp with time zone DEFAULT now(),
  notes text,
  tier text
);

CREATE TABLE player_careers (
  id uuid DEFAULT gen_random_uuid() NOT NULL,
  player_id uuid NOT NULL,
  team_name text NOT NULL,
  season_start text,
  season_end text,
  shirt_number integer,
  is_international boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now(),
  season_numbers jsonb DEFAULT '{}'::jsonb
);

CREATE TABLE players (
  id uuid DEFAULT gen_random_uuid() NOT NULL,
  name text NOT NULL,
  "position" text,
  nationality text,
  date_of_birth date,
  wikidata_id text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

CREATE TABLE profiles (
  id uuid NOT NULL,
  username text,
  full_name text,
  avatar_url text,
  bio text,
  is_admin boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  approval_status text DEFAULT 'pending'::text,
  approved_at timestamp with time zone,
  approved_by uuid,
  admin_notes text,
  requested_at timestamp with time zone DEFAULT now(),
  all_kits_public boolean DEFAULT true,
  is_public boolean DEFAULT false,
  top_3_jersey_ids uuid[] DEFAULT '{}'::uuid[],
  username_changed_at timestamp with time zone,
  show_full_name boolean DEFAULT true,
  country text,
  dream_kit_ids uuid[] DEFAULT '{}'::uuid[],
  email_preferences jsonb DEFAULT '{"newsletter": false, "transactional": true, "friend_requests": true, "partner_updates": true, "product_updates": false, "featured_notifications": true}'::jsonb
);

CREATE TABLE public_jerseys (
  id uuid DEFAULT gen_random_uuid() NOT NULL,
  team_name text NOT NULL,
  player_name text,
  jersey_number text,
  season text NOT NULL,
  jersey_type text NOT NULL,
  league text,
  brand text,
  official_release_date date,
  image_urls text[],
  description text,
  tags text[],
  is_featured boolean DEFAULT false,
  view_count integer DEFAULT 0,
  created_by uuid,
  approved_by uuid,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  additional_sponsors text[],
  front_image_url text,
  back_image_url text,
  main_sponsor text,
  manufacturer text,
  primary_color text,
  secondary_color text,
  kit_type text,
  competition_gender text DEFAULT 'mens'::text,
  player_id uuid,
  player_number integer,
  club_id uuid
);

CREATE TABLE team_squads (
  id uuid DEFAULT gen_random_uuid() NOT NULL,
  team_name text NOT NULL,
  season text NOT NULL,
  player_name text NOT NULL,
  shirt_number integer,
  "position" text,
  player_id uuid,
  wikidata_id text,
  created_at timestamp with time zone DEFAULT now(),
  nationality text
);

CREATE TABLE user_badges (
  id uuid DEFAULT gen_random_uuid() NOT NULL,
  user_id uuid NOT NULL,
  badge_id uuid NOT NULL,
  awarded_at timestamp with time zone DEFAULT now()
);

CREATE TABLE user_friends (
  id uuid DEFAULT gen_random_uuid() NOT NULL,
  requester_id uuid NOT NULL,
  addressee_id uuid NOT NULL,
  status text DEFAULT 'pending'::text NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

CREATE TABLE user_jerseys (
  id uuid DEFAULT gen_random_uuid() NOT NULL,
  user_id uuid NOT NULL,
  public_jersey_id uuid,
  size text,
  condition text,
  purchase_location text,
  personal_images text[],
  personal_notes text,
  is_for_sale boolean DEFAULT false,
  sale_price numeric(10,2),
  is_authentic boolean DEFAULT true,
  certificate_of_authenticity boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
  notes text,
  acquired_from text,
  details_completed boolean DEFAULT true,
  jersey_fit text DEFAULT 'mens'::text
);

CREATE TABLE user_rejections (
  id uuid DEFAULT gen_random_uuid() NOT NULL,
  user_id uuid NOT NULL,
  admin_id uuid,
  notes text,
  rejected_at timestamp with time zone DEFAULT now()
);

CREATE TABLE user_wishlist (
  id uuid DEFAULT gen_random_uuid() NOT NULL,
  user_id uuid NOT NULL,
  public_jersey_id uuid NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  notes text
);

CREATE TABLE waitlist_signups (
  id uuid DEFAULT gen_random_uuid() NOT NULL,
  email text NOT NULL,
  first_name text,
  interest text,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);


-- ============================================================
-- 3. Constraints (PK, then UNIQUE, CHECK, FK)
-- ============================================================

ALTER TABLE badges ADD CONSTRAINT badges_pkey PRIMARY KEY (id);
ALTER TABLE club_suggestions ADD CONSTRAINT club_suggestions_pkey PRIMARY KEY (id);
ALTER TABLE clubs ADD CONSTRAINT clubs_pkey PRIMARY KEY (id);
ALTER TABLE collection_jerseys ADD CONSTRAINT collection_jerseys_pkey PRIMARY KEY (id);
ALTER TABLE collections ADD CONSTRAINT collections_pkey PRIMARY KEY (id);
ALTER TABLE dashboard_insight_requests ADD CONSTRAINT dashboard_insight_requests_pkey PRIMARY KEY (id);
ALTER TABLE jersey_likes ADD CONSTRAINT jersey_likes_pkey PRIMARY KEY (id);
ALTER TABLE jersey_submissions ADD CONSTRAINT jersey_submissions_pkey PRIMARY KEY (id);
ALTER TABLE kit_squad_cache ADD CONSTRAINT kit_squad_cache_pkey PRIMARY KEY (id);
ALTER TABLE notifications ADD CONSTRAINT notifications_pkey PRIMARY KEY (id);
ALTER TABLE partner_applications ADD CONSTRAINT partner_applications_pkey PRIMARY KEY (id);
ALTER TABLE player_careers ADD CONSTRAINT player_careers_pkey PRIMARY KEY (id);
ALTER TABLE players ADD CONSTRAINT players_pkey PRIMARY KEY (id);
ALTER TABLE profiles ADD CONSTRAINT profiles_pkey PRIMARY KEY (id);
ALTER TABLE public_jerseys ADD CONSTRAINT public_jerseys_pkey PRIMARY KEY (id);
ALTER TABLE team_squads ADD CONSTRAINT team_squads_pkey PRIMARY KEY (id);
ALTER TABLE user_badges ADD CONSTRAINT user_badges_pkey PRIMARY KEY (id);
ALTER TABLE user_friends ADD CONSTRAINT user_friends_pkey PRIMARY KEY (id);
ALTER TABLE user_jerseys ADD CONSTRAINT user_jerseys_pkey PRIMARY KEY (id);
ALTER TABLE user_rejections ADD CONSTRAINT user_rejections_pkey PRIMARY KEY (id);
ALTER TABLE user_wishlist ADD CONSTRAINT user_wishlist_pkey PRIMARY KEY (id);
ALTER TABLE waitlist_signups ADD CONSTRAINT waitlist_signups_pkey PRIMARY KEY (id);

ALTER TABLE badges ADD CONSTRAINT badges_name_key UNIQUE (name);
ALTER TABLE clubs ADD CONSTRAINT clubs_name_key UNIQUE (name);
ALTER TABLE clubs ADD CONSTRAINT clubs_wikidata_id_key UNIQUE (wikidata_id);
ALTER TABLE collection_jerseys ADD CONSTRAINT collection_jerseys_collection_id_user_jersey_id_key UNIQUE (collection_id, user_jersey_id);
ALTER TABLE jersey_likes ADD CONSTRAINT jersey_likes_jersey_id_user_id_key UNIQUE (jersey_id, user_id);
ALTER TABLE kit_squad_cache ADD CONSTRAINT kit_squad_cache_team_wikidata_id_season_player_wikidata_id_key UNIQUE (team_wikidata_id, season, player_wikidata_id);
ALTER TABLE players ADD CONSTRAINT players_wikidata_id_key UNIQUE (wikidata_id);
ALTER TABLE profiles ADD CONSTRAINT profiles_username_key UNIQUE (username);
ALTER TABLE team_squads ADD CONSTRAINT team_squads_team_name_season_player_name_key UNIQUE (team_name, season, player_name);
ALTER TABLE user_badges ADD CONSTRAINT user_badges_user_id_badge_id_key UNIQUE (user_id, badge_id);
ALTER TABLE user_friends ADD CONSTRAINT unique_friendship UNIQUE (requester_id, addressee_id);
ALTER TABLE user_jerseys ADD CONSTRAINT user_jerseys_user_id_public_jersey_id_key UNIQUE (user_id, public_jersey_id);
ALTER TABLE user_wishlist ADD CONSTRAINT user_wishlist_user_id_public_jersey_id_key UNIQUE (user_id, public_jersey_id);

ALTER TABLE badges ADD CONSTRAINT badges_rarity_check CHECK ((rarity = ANY (ARRAY['common'::text, 'uncommon'::text, 'rare'::text, 'epic'::text, 'legendary'::text])));
ALTER TABLE club_suggestions ADD CONSTRAINT club_suggestions_status_check CHECK ((status = ANY (ARRAY['pending'::text, 'approved'::text, 'rejected'::text, 'duplicate'::text])));
ALTER TABLE dashboard_insight_requests ADD CONSTRAINT dashboard_insight_requests_content_check CHECK (((char_length(content) >= 3) AND (char_length(content) <= 2000)));
ALTER TABLE dashboard_insight_requests ADD CONSTRAINT dashboard_insight_requests_status_check CHECK ((status = ANY (ARRAY['pending'::text, 'reviewing'::text, 'planned'::text, 'shipped'::text, 'declined'::text])));
ALTER TABLE notifications ADD CONSTRAINT notifications_category_check CHECK ((category = ANY (ARRAY['social'::text, 'community'::text, 'system'::text, 'partner'::text])));
ALTER TABLE profiles ADD CONSTRAINT profiles_approval_status_check CHECK ((approval_status = ANY (ARRAY['pending'::text, 'approved'::text, 'rejected'::text])));
ALTER TABLE public_jerseys ADD CONSTRAINT public_jerseys_competition_gender_check CHECK ((competition_gender = ANY (ARRAY['mens'::text, 'womens'::text])));
ALTER TABLE public_jerseys ADD CONSTRAINT require_front_image CHECK ((front_image_url IS NOT NULL));
ALTER TABLE user_friends ADD CONSTRAINT no_self_friending CHECK ((requester_id <> addressee_id));
ALTER TABLE user_friends ADD CONSTRAINT user_friends_status_check CHECK ((status = ANY (ARRAY['pending'::text, 'accepted'::text])));
ALTER TABLE user_jerseys ADD CONSTRAINT user_jerseys_jersey_fit_check CHECK ((jersey_fit = ANY (ARRAY['mens'::text, 'womens'::text, 'youth'::text])));
ALTER TABLE waitlist_signups ADD CONSTRAINT waitlist_signups_interest_check CHECK ((interest = ANY (ARRAY['collector'::text, 'creator'::text, 'shop'::text, 'club'::text])));

ALTER TABLE club_suggestions ADD CONSTRAINT club_suggestions_resolved_by_fkey FOREIGN KEY (resolved_by) REFERENCES profiles(id) ON DELETE SET NULL;
ALTER TABLE club_suggestions ADD CONSTRAINT club_suggestions_resolved_club_id_fkey FOREIGN KEY (resolved_club_id) REFERENCES clubs(id) ON DELETE SET NULL;
ALTER TABLE club_suggestions ADD CONSTRAINT club_suggestions_suggested_by_fkey FOREIGN KEY (suggested_by) REFERENCES profiles(id) ON DELETE SET NULL;
ALTER TABLE collection_jerseys ADD CONSTRAINT collection_jerseys_collection_id_fkey FOREIGN KEY (collection_id) REFERENCES collections(id) ON DELETE CASCADE;
ALTER TABLE collection_jerseys ADD CONSTRAINT collection_jerseys_user_jersey_id_fkey FOREIGN KEY (user_jersey_id) REFERENCES user_jerseys(id) ON DELETE CASCADE;
ALTER TABLE collections ADD CONSTRAINT collections_user_id_fkey FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE;
ALTER TABLE dashboard_insight_requests ADD CONSTRAINT dashboard_insight_requests_user_id_fkey FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE;
ALTER TABLE jersey_likes ADD CONSTRAINT jersey_likes_jersey_id_fkey FOREIGN KEY (jersey_id) REFERENCES public_jerseys(id) ON DELETE CASCADE;
ALTER TABLE jersey_likes ADD CONSTRAINT jersey_likes_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE jersey_submissions ADD CONSTRAINT jersey_submissions_reviewed_by_fkey FOREIGN KEY (reviewed_by) REFERENCES profiles(id);
ALTER TABLE jersey_submissions ADD CONSTRAINT jersey_submissions_submitted_by_fkey FOREIGN KEY (submitted_by) REFERENCES profiles(id) ON DELETE CASCADE;
ALTER TABLE jersey_submissions ADD CONSTRAINT jersey_submissions_updated_by_fkey FOREIGN KEY (updated_by) REFERENCES auth.users(id);
ALTER TABLE kit_squad_cache ADD CONSTRAINT kit_squad_cache_player_id_fkey FOREIGN KEY (player_id) REFERENCES players(id);
ALTER TABLE notifications ADD CONSTRAINT notifications_actor_id_fkey FOREIGN KEY (actor_id) REFERENCES profiles(id) ON DELETE SET NULL;
ALTER TABLE notifications ADD CONSTRAINT notifications_user_id_fkey FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE;
ALTER TABLE player_careers ADD CONSTRAINT player_careers_player_id_fkey FOREIGN KEY (player_id) REFERENCES players(id) ON DELETE CASCADE;
ALTER TABLE profiles ADD CONSTRAINT profiles_approved_by_fkey FOREIGN KEY (approved_by) REFERENCES profiles(id);
ALTER TABLE profiles ADD CONSTRAINT profiles_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE public_jerseys ADD CONSTRAINT public_jerseys_approved_by_fkey FOREIGN KEY (approved_by) REFERENCES profiles(id);
ALTER TABLE public_jerseys ADD CONSTRAINT public_jerseys_club_id_fkey FOREIGN KEY (club_id) REFERENCES clubs(id) ON DELETE SET NULL;
ALTER TABLE public_jerseys ADD CONSTRAINT public_jerseys_created_by_fkey FOREIGN KEY (created_by) REFERENCES profiles(id);
ALTER TABLE public_jerseys ADD CONSTRAINT public_jerseys_player_id_fkey FOREIGN KEY (player_id) REFERENCES players(id);
ALTER TABLE team_squads ADD CONSTRAINT team_squads_player_id_fkey FOREIGN KEY (player_id) REFERENCES players(id);
ALTER TABLE user_badges ADD CONSTRAINT user_badges_badge_id_fkey FOREIGN KEY (badge_id) REFERENCES badges(id) ON DELETE CASCADE;
ALTER TABLE user_badges ADD CONSTRAINT user_badges_user_id_fkey FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE;
ALTER TABLE user_friends ADD CONSTRAINT user_friends_addressee_id_fkey FOREIGN KEY (addressee_id) REFERENCES profiles(id) ON DELETE CASCADE;
ALTER TABLE user_friends ADD CONSTRAINT user_friends_requester_id_fkey FOREIGN KEY (requester_id) REFERENCES profiles(id) ON DELETE CASCADE;
ALTER TABLE user_jerseys ADD CONSTRAINT user_jerseys_public_jersey_id_fkey FOREIGN KEY (public_jersey_id) REFERENCES public_jerseys(id) ON DELETE CASCADE;
ALTER TABLE user_jerseys ADD CONSTRAINT user_jerseys_user_id_fkey FOREIGN KEY (user_id) REFERENCES profiles(id) ON DELETE CASCADE;
ALTER TABLE user_rejections ADD CONSTRAINT user_rejections_admin_id_fkey FOREIGN KEY (admin_id) REFERENCES profiles(id);
ALTER TABLE user_wishlist ADD CONSTRAINT user_wishlist_public_jersey_id_fkey FOREIGN KEY (public_jersey_id) REFERENCES public_jerseys(id) ON DELETE CASCADE;
ALTER TABLE user_wishlist ADD CONSTRAINT user_wishlist_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;


-- ============================================================
-- 4. Indexes (non-constraint)
-- ============================================================

CREATE INDEX idx_club_suggestions_created_at ON public.club_suggestions USING btree (created_at DESC);
CREATE INDEX idx_club_suggestions_status ON public.club_suggestions USING btree (status);
CREATE INDEX idx_clubs_aliases ON public.clubs USING gin (aliases);
CREATE INDEX idx_clubs_country ON public.clubs USING btree (country);
CREATE INDEX idx_clubs_name_lower ON public.clubs USING btree (lower(name));
CREATE INDEX idx_clubs_primary_league ON public.clubs USING btree (primary_league);
CREATE INDEX idx_collection_jerseys_collection_id ON public.collection_jerseys USING btree (collection_id);
CREATE INDEX idx_collection_jerseys_user_jersey_id ON public.collection_jerseys USING btree (user_jersey_id);
CREATE INDEX idx_collections_user ON public.collections USING btree (user_id);
CREATE INDEX idx_collections_user_id ON public.collections USING btree (user_id);
CREATE INDEX idx_dashboard_insights_status_created ON public.dashboard_insight_requests USING btree (status, created_at DESC);
CREATE INDEX idx_dashboard_insights_user_id ON public.dashboard_insight_requests USING btree (user_id);
CREATE INDEX idx_jersey_likes_created_at ON public.jersey_likes USING btree (created_at);
CREATE INDEX idx_jersey_likes_jersey_id ON public.jersey_likes USING btree (jersey_id);
CREATE INDEX idx_jersey_submissions_reviewed_at ON public.jersey_submissions USING btree (reviewed_at);
CREATE INDEX idx_jersey_submissions_reviewed_by ON public.jersey_submissions USING btree (reviewed_by);
CREATE INDEX idx_jersey_submissions_status ON public.jersey_submissions USING btree (status);
CREATE INDEX idx_jersey_submissions_updated_at ON public.jersey_submissions USING btree (updated_at);
CREATE INDEX idx_jersey_submissions_updated_by ON public.jersey_submissions USING btree (updated_by);
CREATE INDEX idx_jersey_submissions_user ON public.jersey_submissions USING btree (submitted_by);
CREATE INDEX idx_kit_squad_team_name_season ON public.kit_squad_cache USING btree (team_name, season);
CREATE INDEX idx_kit_squad_team_season ON public.kit_squad_cache USING btree (team_wikidata_id, season);
CREATE INDEX idx_notifications_created_at ON public.notifications USING btree (user_id, created_at DESC);
CREATE INDEX idx_notifications_read_at ON public.notifications USING btree (user_id, read_at);
CREATE INDEX idx_notifications_user_id ON public.notifications USING btree (user_id);
CREATE INDEX idx_player_careers_player_id ON public.player_careers USING btree (player_id);
CREATE INDEX idx_players_name ON public.players USING btree (name);
CREATE INDEX idx_players_wikidata_id ON public.players USING btree (wikidata_id);
CREATE INDEX idx_profiles_approval_status ON public.profiles USING btree (approval_status);
CREATE INDEX idx_profiles_is_admin ON public.profiles USING btree (is_admin) WHERE (is_admin = true);
CREATE INDEX idx_profiles_is_public ON public.profiles USING btree (is_public);
CREATE INDEX idx_profiles_username ON public.profiles USING btree (username);
CREATE INDEX idx_public_jerseys_club_id ON public.public_jerseys USING btree (club_id);
CREATE INDEX idx_public_jerseys_featured ON public.public_jerseys USING btree (is_featured);
CREATE INDEX idx_public_jerseys_league ON public.public_jerseys USING btree (league);
CREATE INDEX idx_public_jerseys_player_id ON public.public_jerseys USING btree (player_id);
CREATE INDEX idx_public_jerseys_season ON public.public_jerseys USING btree (season);
CREATE INDEX idx_public_jerseys_team ON public.public_jerseys USING btree (team_name);
CREATE INDEX idx_team_squads_team_season ON public.team_squads USING btree (team_name, season);
CREATE INDEX idx_user_friends_addressee ON public.user_friends USING btree (addressee_id);
CREATE INDEX idx_user_friends_addressee_status ON public.user_friends USING btree (addressee_id, status);
CREATE INDEX idx_user_friends_requester ON public.user_friends USING btree (requester_id);
CREATE INDEX idx_user_friends_requester_status ON public.user_friends USING btree (requester_id, status);
CREATE INDEX idx_user_friends_status ON public.user_friends USING btree (status);
CREATE INDEX idx_user_jerseys_public_jersey_id ON public.user_jerseys USING btree (public_jersey_id);
CREATE INDEX idx_user_jerseys_user ON public.user_jerseys USING btree (user_id);
CREATE INDEX idx_user_jerseys_user_id ON public.user_jerseys USING btree (user_id);
CREATE UNIQUE INDEX waitlist_signups_email_key ON public.waitlist_signups USING btree (lower(email));

-- Note: duplicate indexes exist (idx_collections_user/idx_collections_user_id,
-- idx_user_jerseys_user/idx_user_jerseys_user_id) — cleanup candidate, not urgent.


-- ============================================================
-- 5. Views
-- ============================================================
-- (none — public.pending_accounts was dropped 2026-06-10 in Sprint 0)


-- ============================================================
-- 6. Functions (verbatim from pg_get_functiondef)
--    EXECUTE grants per 2026-06-10 Sprint 0 revoke pass are noted
--    after each function.
-- ============================================================

CREATE OR REPLACE FUNCTION public.approve_jersey_submission(submission_id uuid, admin_id uuid)
 RETURNS uuid
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
declare
  new_jersey_id uuid;
  submission_data record;
begin
  -- Get the submission data
  select * into submission_data from jersey_submissions where id = submission_id;

  -- Insert into public_jerseys
  insert into public_jerseys (
    team_name, player_name, jersey_number, season, jersey_type, league, brand,
    official_release_date, image_urls, description, tags, created_by, approved_by
  ) values (
    submission_data.team_name, submission_data.player_name, submission_data.jersey_number,
    submission_data.season, submission_data.jersey_type, submission_data.league, submission_data.brand,
    submission_data.official_release_date, submission_data.image_urls, submission_data.description,
    submission_data.tags, submission_data.submitted_by, admin_id
  ) returning id into new_jersey_id;

  -- Update submission status
  update jersey_submissions
  set status = 'approved', reviewed_by = admin_id, reviewed_at = now()
  where id = submission_id;

  return new_jersey_id;
end;
$function$;
-- ACL: authenticated=X, service_role=X (anon revoked 6/10)
-- ⚠ KNOWN ISSUE: references submission_data.image_urls but jersey_submissions
--   has no image_urls column (front/back/additional_image_urls instead) —
--   will fail at runtime if called. Relevant to the June 20 approval-linkage work.

CREATE OR REPLACE FUNCTION public.approve_user_account(user_id uuid, notes text DEFAULT NULL::text)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'auth'
AS $function$
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
$function$;
-- ACL: authenticated=X, service_role=X

CREATE OR REPLACE FUNCTION public.are_friends(user_a uuid, user_b uuid)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM user_friends
    WHERE status = 'accepted'
      AND (
        (requester_id = user_a AND addressee_id = user_b)
        OR (requester_id = user_b AND addressee_id = user_a)
      )
  );
END;
$function$;
-- ACL: authenticated=X, service_role=X

CREATE OR REPLACE FUNCTION public.get_friend_count(user_id uuid)
 RETURNS bigint
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
BEGIN
  RETURN (
    SELECT COUNT(*)
    FROM user_friends
    WHERE status = 'accepted'
      AND (requester_id = user_id OR addressee_id = user_id)
  );
END;
$function$;
-- ACL: authenticated=X, service_role=X

CREATE OR REPLACE FUNCTION public.get_friendship_status(current_user_id uuid, other_user_id uuid)
 RETURNS text
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
  friendship RECORD;
BEGIN
  SELECT * INTO friendship
  FROM user_friends
  WHERE (requester_id = current_user_id AND addressee_id = other_user_id)
     OR (requester_id = other_user_id AND addressee_id = current_user_id)
  LIMIT 1;

  IF friendship IS NULL THEN
    RETURN 'none';
  ELSIF friendship.status = 'accepted' THEN
    RETURN 'accepted';
  ELSIF friendship.requester_id = current_user_id THEN
    RETURN 'pending_sent';
  ELSE
    RETURN 'pending_received';
  END IF;
END;
$function$;
-- ACL: authenticated=X, service_role=X

CREATE OR REPLACE FUNCTION public.get_pending_accounts()
 RETURNS TABLE(id uuid, username text, full_name text, avatar_url text, email text, approval_status text, requested_at timestamp with time zone, approved_at timestamp with time zone, admin_notes text, approved_by_username text)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'auth'
AS $function$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid()
      AND profiles.is_admin = TRUE
  ) THEN
    RAISE EXCEPTION 'Admin access required';
  END IF;

  RETURN QUERY
  SELECT
    p.id,
    p.username,
    p.full_name,
    p.avatar_url,
    u.email::TEXT,
    p.approval_status,
    p.requested_at,
    p.approved_at,
    p.admin_notes,
    approver.username AS approved_by_username
  FROM public.profiles p
  LEFT JOIN auth.users u ON p.id = u.id
  LEFT JOIN public.profiles approver ON p.approved_by = approver.id
  WHERE p.approval_status IN ('pending', 'rejected')
  ORDER BY p.requested_at DESC;
END;
$function$;
-- ACL: authenticated=X, service_role=X (admin check inside)

CREATE OR REPLACE FUNCTION public.get_public_collections(profile_user_id uuid)
 RETURNS TABLE(id uuid, name text, description text, jersey_count bigint, thumbnail_urls text[])
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
BEGIN
  RETURN QUERY
  SELECT
    c.id,
    c.name,
    c.description,
    COUNT(cj.id)::BIGINT as jersey_count,
    (ARRAY_AGG(DISTINCT pj.front_image_url) FILTER (WHERE pj.front_image_url IS NOT NULL))[1:4] as thumbnail_urls
  FROM collections c
  LEFT JOIN collection_jerseys cj ON c.id = cj.collection_id
  LEFT JOIN user_jerseys uj ON cj.user_jersey_id = uj.id
  LEFT JOIN public_jerseys pj ON uj.public_jersey_id = pj.id
  WHERE c.user_id = profile_user_id
    AND c.is_public = true
  GROUP BY c.id, c.name, c.description
  ORDER BY c.created_at DESC;
END;
$function$;
-- ACL: anon=X, authenticated=X, service_role=X (public-profile path, kept by design)

CREATE OR REPLACE FUNCTION public.get_public_profile(profile_username text)
 RETURNS TABLE(id uuid, username text, full_name text, avatar_url text, bio text, is_public boolean, top_3_jersey_ids uuid[], created_at timestamp with time zone)
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
BEGIN
  RETURN QUERY
  SELECT
    p.id,
    p.username,
    p.full_name,
    p.avatar_url,
    p.bio,
    p.is_public,
    p.top_3_jersey_ids,
    p.requested_at as created_at
  FROM profiles p
  WHERE p.username = profile_username
    AND p.is_public = true
    AND p.approval_status = 'approved';
END;
$function$;
-- ACL: anon=X, authenticated=X, service_role=X (public-profile path, kept by design)

CREATE OR REPLACE FUNCTION public.get_public_profile_stats(profile_user_id uuid)
 RETURNS TABLE(total_jerseys bigint, public_collections bigint, liked_jerseys bigint)
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$
DECLARE
  profile_public BOOLEAN;
  all_kits_public BOOLEAN;
BEGIN
  -- Check if profile is public
  SELECT p.is_public, COALESCE(p.all_kits_public, false)
  INTO profile_public, all_kits_public
  FROM profiles p
  WHERE p.id = profile_user_id;

  IF NOT profile_public THEN
    RETURN QUERY SELECT 0::BIGINT, 0::BIGINT, 0::BIGINT;
    RETURN;
  END IF;

  RETURN QUERY
  SELECT
    CASE WHEN all_kits_public THEN
      (SELECT COUNT(*)::BIGINT FROM user_jerseys WHERE user_id = profile_user_id)
    ELSE 0::BIGINT END as total_jerseys,
    (SELECT COUNT(*)::BIGINT FROM collections WHERE user_id = profile_user_id AND is_public = true) as public_collections,
    (SELECT COUNT(*)::BIGINT FROM jersey_likes WHERE user_id = profile_user_id) as liked_jerseys;
END;
$function$;
-- ACL: anon=X, authenticated=X, service_role=X (public-profile path, kept by design)

CREATE OR REPLACE FUNCTION public.get_top_3_jerseys(jersey_ids uuid[])
 RETURNS SETOF public_jerseys
 LANGUAGE sql
 SECURITY DEFINER
 SET search_path TO 'public', 'auth'
AS $function$
        SELECT pj.*
        FROM public_jerseys pj
        JOIN user_jerseys uj ON uj.public_jersey_id = pj.id
        JOIN profiles p ON p.id = uj.user_id
        WHERE pj.id = ANY(jersey_ids)
          AND COALESCE(p.is_public, TRUE) = TRUE
        ORDER BY array_position(jersey_ids, pj.id);
      $function$;
-- ACL: anon=X, authenticated=X, service_role=X (OG/public path, kept by design)

CREATE OR REPLACE FUNCTION public.grant_admin(target_user_id uuid, is_admin_new boolean)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'auth'
AS $function$
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
$function$;
-- ACL: authenticated=X, service_role=X (admin check inside)

CREATE OR REPLACE FUNCTION public.is_admin_user()
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public', 'auth'
AS $function$
  SELECT COALESCE(
    (SELECT is_admin FROM profiles WHERE id = auth.uid()),
    FALSE
  );
$function$;
-- ACL: anon=X, authenticated=X, service_role=X (used in RLS policies, kept by design)

CREATE OR REPLACE FUNCTION public.propagate_club_name_to_jerseys()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
  IF OLD.name IS DISTINCT FROM NEW.name THEN
    UPDATE public_jerseys SET team_name = NEW.name WHERE club_id = NEW.id;
  END IF;
  RETURN NEW;
END;
$function$;
-- ACL: default (trigger function)

CREATE OR REPLACE FUNCTION public.protect_profile_admin_fields()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'auth'
AS $function$
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
$function$;
-- ACL: postgres + service_role only (locked 6/10)

CREATE OR REPLACE FUNCTION public.reject_user_account(user_id uuid, notes text DEFAULT NULL::text)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'auth'
AS $function$
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
$function$;
-- ACL: authenticated=X, service_role=X (admin check inside)
-- ⚠ KNOWN ISSUE: inserts (user_id, username, rejected_by, notes) but the live
--   user_rejections table has columns (user_id, admin_id, notes) — no username
--   or rejected_by. Will fail at runtime if called. Moot if the manual-approval
--   gate is removed June 13 as planned, but fix or drop with that work.

CREATE OR REPLACE FUNCTION public.set_clubs_updated_at()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
  NEW.updated_at := now();
  RETURN NEW;
END;
$function$;
-- ACL: default (trigger function)

CREATE OR REPLACE FUNCTION public.set_dashboard_insights_updated_at()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
  NEW.updated_at := now();
  RETURN NEW;
END;
$function$;
-- ACL: default (trigger function)

CREATE OR REPLACE FUNCTION public.sync_jersey_team_name_from_club()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
DECLARE
  canonical TEXT;
BEGIN
  IF NEW.club_id IS NOT NULL THEN
    SELECT name INTO canonical FROM clubs WHERE id = NEW.club_id;
    IF canonical IS NOT NULL THEN
      NEW.team_name := canonical;
    END IF;
  END IF;
  RETURN NEW;
END;
$function$;
-- ACL: default (trigger function)

CREATE OR REPLACE FUNCTION public.update_players_updated_at()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$function$;
-- ACL: default (trigger function)

CREATE OR REPLACE FUNCTION public.update_user_friends_updated_at()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$function$;
-- ACL: default (trigger function)


-- ============================================================
-- 7. Triggers
-- ============================================================

CREATE TRIGGER trg_clubs_propagate_name AFTER UPDATE OF name ON public.clubs FOR EACH ROW EXECUTE FUNCTION propagate_club_name_to_jerseys();
CREATE TRIGGER trg_clubs_updated_at BEFORE UPDATE ON public.clubs FOR EACH ROW EXECUTE FUNCTION set_clubs_updated_at();
CREATE TRIGGER trg_dashboard_insights_updated_at BEFORE UPDATE ON public.dashboard_insight_requests FOR EACH ROW EXECUTE FUNCTION set_dashboard_insights_updated_at();
CREATE TRIGGER players_updated_at BEFORE UPDATE ON public.players FOR EACH ROW EXECUTE FUNCTION update_players_updated_at();
CREATE TRIGGER trg_profiles_protect_admin_fields BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION protect_profile_admin_fields();
CREATE TRIGGER trg_jersey_team_name_sync BEFORE INSERT OR UPDATE OF club_id ON public.public_jerseys FOR EACH ROW EXECUTE FUNCTION sync_jersey_team_name_from_club();
CREATE TRIGGER user_friends_updated_at BEFORE UPDATE ON public.user_friends FOR EACH ROW EXECUTE FUNCTION update_user_friends_updated_at();


-- ============================================================
-- 8. Row Level Security (enabled on ALL public tables)
-- ============================================================

ALTER TABLE badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE club_suggestions ENABLE ROW LEVEL SECURITY;
ALTER TABLE clubs ENABLE ROW LEVEL SECURITY;
ALTER TABLE collection_jerseys ENABLE ROW LEVEL SECURITY;
ALTER TABLE collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE dashboard_insight_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE jersey_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE jersey_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE kit_squad_cache ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE partner_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE player_careers ENABLE ROW LEVEL SECURITY;
ALTER TABLE players ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public_jerseys ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_squads ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_friends ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_jerseys ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_rejections ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_wishlist ENABLE ROW LEVEL SECURITY;
ALTER TABLE waitlist_signups ENABLE ROW LEVEL SECURITY;


-- ============================================================
-- 9. Policies (post-sprint0_rls_tightening, verified 2026-06-11)
-- ============================================================

-- badges
CREATE POLICY "Admins can manage badges" ON badges FOR ALL
  USING (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.is_admin = true));
CREATE POLICY "Badges are viewable by everyone" ON badges FOR SELECT USING (true);

-- club_suggestions
CREATE POLICY "Admins can update suggestions" ON club_suggestions FOR UPDATE TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.is_admin = true));
CREATE POLICY "Users can suggest clubs" ON club_suggestions FOR INSERT TO authenticated
  WITH CHECK (suggested_by = auth.uid());
CREATE POLICY "Users see own suggestions, admins see all" ON club_suggestions FOR SELECT TO authenticated
  USING (suggested_by = auth.uid() OR EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.is_admin = true));

-- clubs
CREATE POLICY "Admins can delete clubs" ON clubs FOR DELETE TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.is_admin = true));
CREATE POLICY "Admins can insert clubs" ON clubs FOR INSERT TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.is_admin = true));
CREATE POLICY "Admins can update clubs" ON clubs FOR UPDATE TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.is_admin = true));
CREATE POLICY "Anyone can read clubs" ON clubs FOR SELECT USING (true);

-- collection_jerseys
CREATE POLICY "Users can delete from their collections" ON collection_jerseys FOR DELETE
  USING (EXISTS (SELECT 1 FROM collections WHERE collections.id = collection_jerseys.collection_id AND collections.user_id = auth.uid()));
CREATE POLICY "Users can insert into their collections" ON collection_jerseys FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM collections WHERE collections.id = collection_jerseys.collection_id AND collections.user_id = auth.uid()));
CREATE POLICY "Users can view collection jerseys for their collections" ON collection_jerseys FOR SELECT
  USING (EXISTS (SELECT 1 FROM collections WHERE collections.id = collection_jerseys.collection_id AND collections.user_id = auth.uid()));

-- collections
CREATE POLICY "Public collections are viewable by everyone." ON collections FOR SELECT
  USING (is_public = true OR auth.uid() = user_id);
CREATE POLICY "Users can insert their own collections" ON collections FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own collections" ON collections FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own collections" ON collections FOR DELETE USING (auth.uid() = user_id);

-- dashboard_insight_requests
CREATE POLICY "Admins update insight requests" ON dashboard_insight_requests FOR UPDATE TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.is_admin = true));
CREATE POLICY "Users delete own insight requests" ON dashboard_insight_requests FOR DELETE TO authenticated
  USING (user_id = auth.uid());
CREATE POLICY "Users insert own insight requests" ON dashboard_insight_requests FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users see own insight requests, admins see all" ON dashboard_insight_requests FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.is_admin = true));

-- jersey_likes (public read required by anon like-count features)
CREATE POLICY "Anyone can read likes" ON jersey_likes FOR SELECT USING (true);
CREATE POLICY "Users can delete own likes" ON jersey_likes FOR DELETE USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own likes" ON jersey_likes FOR INSERT WITH CHECK (auth.uid() = user_id);

-- jersey_submissions
CREATE POLICY "Admins delete submissions" ON jersey_submissions FOR DELETE TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.is_admin = true));
CREATE POLICY "Admins update submissions" ON jersey_submissions FOR UPDATE TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.is_admin = true));
CREATE POLICY "Users insert own submissions" ON jersey_submissions FOR INSERT TO authenticated
  WITH CHECK (submitted_by = auth.uid());
CREATE POLICY "Users see own submissions, admins see all" ON jersey_submissions FOR SELECT TO authenticated
  USING (submitted_by = auth.uid() OR EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.is_admin = true));

-- kit_squad_cache (admin-only writes)
CREATE POLICY "Admins delete kit_squad_cache" ON kit_squad_cache FOR DELETE TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.is_admin = true));
CREATE POLICY "Admins insert kit_squad_cache" ON kit_squad_cache FOR INSERT TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.is_admin = true));
CREATE POLICY "Admins update kit_squad_cache" ON kit_squad_cache FOR UPDATE TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.is_admin = true));
CREATE POLICY "Anyone can view kit_squad_cache" ON kit_squad_cache FOR SELECT USING (true);

-- notifications (insert scoped to recipient-or-actor)
CREATE POLICY "Users create notifications they are part of" ON notifications FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid() OR actor_id = auth.uid());
CREATE POLICY "Users can update own notifications" ON notifications FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can view own notifications" ON notifications FOR SELECT USING (auth.uid() = user_id);

-- partner_applications (public form; submitters cannot set status/notes)
CREATE POLICY "Admins can update partner applications" ON partner_applications FOR UPDATE TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.is_admin = true))
  WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.is_admin = true));
CREATE POLICY "Admins can view partner applications" ON partner_applications FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.is_admin = true));
CREATE POLICY "Anyone can submit partner applications" ON partner_applications FOR INSERT TO anon, authenticated
  WITH CHECK (status = 'pending' AND notes IS NULL);

-- player_careers (admin-only writes)
CREATE POLICY "Admins delete player_careers" ON player_careers FOR DELETE TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.is_admin = true));
CREATE POLICY "Admins insert player_careers" ON player_careers FOR INSERT TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.is_admin = true));
CREATE POLICY "Admins update player_careers" ON player_careers FOR UPDATE TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.is_admin = true));
CREATE POLICY "Anyone can view player_careers" ON player_careers FOR SELECT USING (true);

-- players
CREATE POLICY "Admins delete players" ON players FOR DELETE TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.is_admin = true));
CREATE POLICY "Admins insert players" ON players FOR INSERT TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.is_admin = true));
CREATE POLICY "Admins update players" ON players FOR UPDATE TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.is_admin = true));
CREATE POLICY "Anyone can view players" ON players FOR SELECT USING (true);

-- profiles (admin columns additionally protected by trg_profiles_protect_admin_fields)
CREATE POLICY "Admins delete profiles" ON profiles FOR DELETE TO authenticated USING (is_admin_user());
CREATE POLICY "Profiles visible by owner / admin / public" ON profiles FOR SELECT
  USING (id = auth.uid() OR is_admin_user() OR COALESCE(is_public, true) = true);
CREATE POLICY "Users insert own profile row" ON profiles FOR INSERT TO authenticated
  WITH CHECK (id = auth.uid());
CREATE POLICY "Users update own profile" ON profiles FOR UPDATE TO authenticated
  USING (id = auth.uid() OR is_admin_user())
  WITH CHECK (id = auth.uid() OR is_admin_user());

-- public_jerseys
CREATE POLICY "Admins can delete public jerseys" ON public_jerseys FOR DELETE
  USING (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.is_admin = true));
CREATE POLICY "Admins can insert public jerseys" ON public_jerseys FOR INSERT
  WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.is_admin = true));
CREATE POLICY "Admins can update public jerseys" ON public_jerseys FOR UPDATE
  USING (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.is_admin = true));
CREATE POLICY "Public jerseys are viewable by everyone." ON public_jerseys FOR SELECT USING (true);

-- team_squads (admin-only writes)
CREATE POLICY "Admins delete team_squads" ON team_squads FOR DELETE TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.is_admin = true));
CREATE POLICY "Admins insert team_squads" ON team_squads FOR INSERT TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.is_admin = true));
CREATE POLICY "Admins update team_squads" ON team_squads FOR UPDATE TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.is_admin = true));
CREATE POLICY "Anyone can view team_squads" ON team_squads FOR SELECT USING (true);

-- user_badges (self-award only — supports client-side First-100 auto-award;
-- trigger/RPC hardening deferred)
CREATE POLICY "Admins can award badges" ON user_badges FOR ALL
  USING (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.is_admin = true));
CREATE POLICY "Users can award badges to themselves" ON user_badges FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());
CREATE POLICY "User badges are viewable by everyone" ON user_badges FOR SELECT USING (true);

-- user_friends
CREATE POLICY "Addressee can accept friend requests" ON user_friends FOR UPDATE
  USING (auth.uid() = addressee_id AND status = 'pending')
  WITH CHECK (auth.uid() = addressee_id AND status = 'accepted');
CREATE POLICY "Users can delete friendships" ON user_friends FOR DELETE
  USING ((auth.uid() = requester_id AND status = 'pending')
      OR ((auth.uid() = requester_id OR auth.uid() = addressee_id) AND status = 'accepted'));
CREATE POLICY "Users can send friend requests" ON user_friends FOR INSERT
  WITH CHECK (auth.uid() = requester_id);
CREATE POLICY "Users can view own friendships" ON user_friends FOR SELECT
  USING (auth.uid() = requester_id OR auth.uid() = addressee_id);

-- user_jerseys
CREATE POLICY "Public All Kits viewable" ON user_jerseys FOR SELECT
  USING (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = user_jerseys.user_id AND profiles.all_kits_public = true));
CREATE POLICY "Users can view their own jerseys" ON user_jerseys FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own jerseys" ON user_jerseys FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own jerseys" ON user_jerseys FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own jerseys" ON user_jerseys FOR DELETE USING (auth.uid() = user_id);

-- user_rejections
CREATE POLICY "Admins insert rejections" ON user_rejections FOR INSERT TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.is_admin = true));
CREATE POLICY "Admins select rejections" ON user_rejections FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.is_admin = true));

-- user_wishlist
CREATE POLICY "Users can delete own wishlist" ON user_wishlist FOR DELETE USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own wishlist" ON user_wishlist FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can read own wishlist" ON user_wishlist FOR SELECT USING (auth.uid() = user_id);

-- waitlist_signups
CREATE POLICY "Admins can read waitlist" ON waitlist_signups FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.is_admin = true));
CREATE POLICY "Anyone can join the waitlist" ON waitlist_signups FOR INSERT TO anon, authenticated
  WITH CHECK (true);


-- ============================================================
-- 10. Storage
-- ============================================================
-- Buckets: avatars (public=true), jersey-images (public=true)
-- Note: both buckets carry a broad SELECT policy that allows listing
-- (advisor WARN public_bucket_allows_listing) — review in Week 6 QA.

CREATE POLICY "Anyone can view avatars" ON storage.objects FOR SELECT TO public
  USING (bucket_id = 'avatars');
CREATE POLICY "Anyone can view jersey images" ON storage.objects FOR SELECT TO public
  USING (bucket_id = 'jersey-images');
CREATE POLICY "Users can delete their own avatar" ON storage.objects FOR DELETE TO public
  USING (bucket_id = 'avatars' AND (auth.uid())::text = (storage.foldername(name))[1]);
CREATE POLICY "Users can delete their uploads" ON storage.objects FOR DELETE TO public
  USING (bucket_id = 'jersey-images' AND (auth.uid())::text = (storage.foldername(name))[1]);
CREATE POLICY "Users can update their own avatar" ON storage.objects FOR UPDATE TO public
  USING (bucket_id = 'avatars' AND (auth.uid())::text = (storage.foldername(name))[1]);
CREATE POLICY "Users can upload jersey images" ON storage.objects FOR INSERT TO public
  WITH CHECK (bucket_id = 'jersey-images' AND auth.role() = 'authenticated');
CREATE POLICY "Users can upload their own avatar" ON storage.objects FOR INSERT TO public
  WITH CHECK (bucket_id = 'avatars' AND (auth.uid())::text = (storage.foldername(name))[1]);


-- ============================================================
-- 11. Grants
-- ============================================================
-- Table-level grants are Supabase defaults (anon/authenticated/service_role
-- granted on public schema tables; RLS is the access gate).
-- Function EXECUTE grants are noted inline per function in section 6,
-- reflecting the 2026-06-10 Sprint 0 revoke pass.
