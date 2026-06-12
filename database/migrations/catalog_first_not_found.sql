-- Catalog-first NOT-FOUND path (Docs/CATALOG_FIRST_DESIGN.md decisions 1-3,5).
--
--   * submit_uncataloged_kit(): one atomic call from the slim wizard —
--     queues the jersey_submissions row AND writes the user's pending
--     user_jerseys row (submission_id link, details_completed false).
--     The kit is in their collection the instant they add it.
--   * approve_submission_link(): replaces the BROKEN approve_jersey_submission
--     (referenced a nonexistent image_urls column). Creates the catalog row —
--     or links an existing one the admin picks — then points the submitter's
--     user_jerseys row at it WITHOUT touching size/condition/notes/photos.
--     If the user already had that exact kit cataloged (unique conflict on
--     link-to-existing), nothing is changed and the submission is marked
--     'duplicate' for a quick manual merge.
--
-- Rollback: database/rollbacks/rollback_catalog_first_not_found.sql

-- ============================================================
-- 1. submit_uncataloged_kit — called by the slim wizard
-- ============================================================

CREATE OR REPLACE FUNCTION submit_uncataloged_kit(
  p_team_name           text,
  p_season              text,
  p_jersey_type         text,
  p_kit_type            text DEFAULT 'club',
  p_competition_gender  text DEFAULT 'mens',
  p_league              text DEFAULT NULL,
  p_brand               text DEFAULT NULL,
  p_front_image_url     text DEFAULT NULL,
  p_back_image_url      text DEFAULT NULL,
  p_primary_color       text DEFAULT NULL,
  p_secondary_color     text DEFAULT NULL,
  p_main_sponsor        text DEFAULT NULL,
  p_player_name         text DEFAULT NULL,
  p_description         text DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  caller uuid := auth.uid();
  v_submission_id uuid;
  v_user_jersey_id uuid;
BEGIN
  IF caller IS NULL THEN
    RAISE EXCEPTION 'not authenticated';
  END IF;
  IF coalesce(trim(p_team_name), '') = '' OR coalesce(trim(p_season), '') = ''
     OR coalesce(trim(p_jersey_type), '') = '' THEN
    RAISE EXCEPTION 'team, season and kit type are required';
  END IF;

  INSERT INTO jersey_submissions (
    submitted_by, status, team_name, season, jersey_type, kit_type,
    competition_gender, league, brand, front_image_url, back_image_url,
    primary_color, secondary_color, main_sponsor, player_name, description
  ) VALUES (
    caller, 'pending', trim(p_team_name), trim(p_season), p_jersey_type, p_kit_type,
    p_competition_gender, p_league, p_brand, p_front_image_url, p_back_image_url,
    p_primary_color, p_secondary_color, p_main_sponsor, p_player_name, p_description
  ) RETURNING id INTO v_submission_id;

  INSERT INTO user_jerseys (user_id, submission_id, details_completed)
  VALUES (caller, v_submission_id, false)
  RETURNING id INTO v_user_jersey_id;

  RETURN jsonb_build_object(
    'submission_id', v_submission_id,
    'user_jersey_id', v_user_jersey_id
  );
END;
$$;

REVOKE ALL ON FUNCTION submit_uncataloged_kit(text,text,text,text,text,text,text,text,text,text,text,text,text,text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION submit_uncataloged_kit(text,text,text,text,text,text,text,text,text,text,text,text,text,text) TO authenticated;

-- ============================================================
-- 2. approve_submission_link — admin approval with linkage
-- ============================================================

CREATE OR REPLACE FUNCTION approve_submission_link(
  p_submission_id uuid,
  p_target_public_jersey_id uuid DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  caller uuid := auth.uid();
  sub jersey_submissions%ROWTYPE;
  v_target uuid := p_target_public_jersey_id;
BEGIN
  IF caller IS NULL THEN
    RAISE EXCEPTION 'not authenticated';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM profiles WHERE id = caller AND is_admin = TRUE) THEN
    RAISE EXCEPTION 'admin access required';
  END IF;

  SELECT * INTO sub FROM jersey_submissions WHERE id = p_submission_id FOR UPDATE;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'submission not found';
  END IF;
  IF sub.status <> 'pending' THEN
    RAISE EXCEPTION 'submission is not pending (status: %)', sub.status;
  END IF;

  IF v_target IS NULL THEN
    -- Creating a fresh catalog row: public_jerseys requires a front image.
    IF sub.front_image_url IS NULL THEN
      RAISE EXCEPTION 'front image required to create a catalog row — attach one to the submission or link an existing kit';
    END IF;

    INSERT INTO public_jerseys (
      team_name, player_name, jersey_number, season, jersey_type, kit_type,
      competition_gender, league, brand, description, tags,
      front_image_url, back_image_url, additional_image_urls,
      primary_color, secondary_color, main_sponsor,
      created_by, approved_by
    )
    SELECT
      s.team_name, s.player_name, s.jersey_number, s.season, s.jersey_type, s.kit_type,
      s.competition_gender, s.league, s.brand, s.description, s.tags,
      s.front_image_url, s.back_image_url, s.additional_image_urls,
      s.primary_color, s.secondary_color, s.main_sponsor,
      s.submitted_by, caller
    FROM jersey_submissions s WHERE s.id = p_submission_id
    RETURNING id INTO v_target;
  ELSE
    IF NOT EXISTS (SELECT 1 FROM public_jerseys WHERE id = v_target) THEN
      RAISE EXCEPTION 'target catalog kit not found';
    END IF;

    -- Link-to-existing can collide with a kit the user already has cataloged.
    IF EXISTS (
      SELECT 1 FROM user_jerseys
      WHERE user_id = sub.submitted_by AND public_jersey_id = v_target
    ) THEN
      UPDATE jersey_submissions
         SET status = 'duplicate', reviewed_by = caller, reviewed_at = now()
       WHERE id = p_submission_id;
      RETURN jsonb_build_object('status', 'duplicate', 'public_jersey_id', v_target);
    END IF;
  END IF;

  -- Point the submitter's pending row at the catalog. User data (size,
  -- condition, notes, personal photos) is never modified; submission_id is
  -- kept for provenance.
  UPDATE user_jerseys
     SET public_jersey_id = v_target
   WHERE submission_id = p_submission_id;

  UPDATE jersey_submissions
     SET status = 'approved', reviewed_by = caller, reviewed_at = now()
   WHERE id = p_submission_id;

  RETURN jsonb_build_object('status', 'approved', 'public_jersey_id', v_target);
END;
$$;

REVOKE ALL ON FUNCTION approve_submission_link(uuid, uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION approve_submission_link(uuid, uuid) TO authenticated;

-- ============================================================
-- 3. Drop the broken predecessor (referenced submission_data.image_urls,
--    a column jersey_submissions doesn't have; unused by app code — the
--    admin panel did inline inserts, which now also move to the RPC)
-- ============================================================

DROP FUNCTION IF EXISTS approve_jersey_submission(uuid, uuid);
