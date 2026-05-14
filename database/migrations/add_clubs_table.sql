-- Migration: Add clubs table as canonical source of truth for club kits.
--
-- Phase 1 columns: name, aliases, country, city, primary_league — enough to
-- power the country-shade map and the strict-name submission wizard.
--
-- Phase 2 columns: latitude, longitude, stadium_name, wikidata_id — populated
-- via Wikidata enrichment later. Stored on the same row so no migration is
-- needed between phases.

-- ============================================================
-- 1. Clubs table
-- ============================================================

CREATE TABLE IF NOT EXISTS clubs (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Identity
  name            TEXT NOT NULL UNIQUE,            -- canonical, e.g. "Swansea City AFC"
  short_name      TEXT,                            -- "Swansea"
  aliases         TEXT[] NOT NULL DEFAULT '{}',    -- ["Swansea", "Swansea City", "SCFC"]

  -- Phase 1: country shading
  country         TEXT NOT NULL,                   -- "Wales" (folds to UK polygon at render time)
  city            TEXT,                            -- "Swansea"
  primary_league  TEXT,                            -- "Championship"
  founded_year    INTEGER,

  -- Phase 2: stadium pin (Wikidata P115 → P625)
  latitude        NUMERIC(9, 6),
  longitude       NUMERIC(9, 6),
  stadium_name    TEXT,                            -- "Swansea.com Stadium"

  -- Provenance
  wikidata_id     TEXT UNIQUE,                     -- "Q132590"
  source          TEXT NOT NULL DEFAULT 'manual',  -- 'manual' | 'wikidata' | 'import'

  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_clubs_name_lower    ON clubs (LOWER(name));
CREATE INDEX IF NOT EXISTS idx_clubs_aliases       ON clubs USING GIN (aliases);
CREATE INDEX IF NOT EXISTS idx_clubs_country       ON clubs (country);
CREATE INDEX IF NOT EXISTS idx_clubs_primary_league ON clubs (primary_league);

-- Keep updated_at fresh on any edit.
CREATE OR REPLACE FUNCTION set_clubs_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at := now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_clubs_updated_at ON clubs;
CREATE TRIGGER trg_clubs_updated_at
BEFORE UPDATE ON clubs
FOR EACH ROW EXECUTE FUNCTION set_clubs_updated_at();


-- ============================================================
-- 2. Link from public_jerseys
-- ============================================================

ALTER TABLE public_jerseys
  ADD COLUMN IF NOT EXISTS club_id UUID REFERENCES clubs(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_public_jerseys_club_id ON public_jerseys (club_id);

-- When a jersey is linked to a club, snap team_name to the canonical name.
-- This keeps existing search/display code working without joining everywhere.
CREATE OR REPLACE FUNCTION sync_jersey_team_name_from_club()
RETURNS TRIGGER AS $$
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
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_jersey_team_name_sync ON public_jerseys;
CREATE TRIGGER trg_jersey_team_name_sync
BEFORE INSERT OR UPDATE OF club_id ON public_jerseys
FOR EACH ROW EXECUTE FUNCTION sync_jersey_team_name_from_club();

-- If admin renames a club, propagate the new name to every linked jersey.
CREATE OR REPLACE FUNCTION propagate_club_name_to_jerseys()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.name IS DISTINCT FROM NEW.name THEN
    UPDATE public_jerseys SET team_name = NEW.name WHERE club_id = NEW.id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_clubs_propagate_name ON clubs;
CREATE TRIGGER trg_clubs_propagate_name
AFTER UPDATE OF name ON clubs
FOR EACH ROW EXECUTE FUNCTION propagate_club_name_to_jerseys();


-- ============================================================
-- 3. Suggestions queue (users propose new clubs at submission time)
-- ============================================================

CREATE TABLE IF NOT EXISTS club_suggestions (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  suggested_name    TEXT NOT NULL,
  suggested_country TEXT,
  suggested_league  TEXT,
  suggested_by      UUID REFERENCES profiles(id) ON DELETE SET NULL,

  status            TEXT NOT NULL DEFAULT 'pending'
                    CHECK (status IN ('pending', 'approved', 'rejected', 'duplicate')),
  notes             TEXT,
  resolved_club_id  UUID REFERENCES clubs(id) ON DELETE SET NULL,

  created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  resolved_at       TIMESTAMPTZ,
  resolved_by       UUID REFERENCES profiles(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_club_suggestions_status ON club_suggestions (status);
CREATE INDEX IF NOT EXISTS idx_club_suggestions_created_at ON club_suggestions (created_at DESC);


-- ============================================================
-- 4. Row-level security
-- ============================================================

ALTER TABLE clubs ENABLE ROW LEVEL SECURITY;
ALTER TABLE club_suggestions ENABLE ROW LEVEL SECURITY;

-- Clubs are read by everyone (used by the submission typeahead).
DROP POLICY IF EXISTS "Anyone can read clubs" ON clubs;
CREATE POLICY "Anyone can read clubs"
  ON clubs FOR SELECT USING (true);

-- Only admins write.
DROP POLICY IF EXISTS "Admins can insert clubs" ON clubs;
CREATE POLICY "Admins can insert clubs"
  ON clubs FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = TRUE)
  );

DROP POLICY IF EXISTS "Admins can update clubs" ON clubs;
CREATE POLICY "Admins can update clubs"
  ON clubs FOR UPDATE TO authenticated
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = TRUE)
  );

DROP POLICY IF EXISTS "Admins can delete clubs" ON clubs;
CREATE POLICY "Admins can delete clubs"
  ON clubs FOR DELETE TO authenticated
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = TRUE)
  );

-- Suggestions: a user can insert their own, see their own; admins see all.
DROP POLICY IF EXISTS "Users can suggest clubs" ON club_suggestions;
CREATE POLICY "Users can suggest clubs"
  ON club_suggestions FOR INSERT TO authenticated
  WITH CHECK (suggested_by = auth.uid());

DROP POLICY IF EXISTS "Users see own suggestions, admins see all" ON club_suggestions;
CREATE POLICY "Users see own suggestions, admins see all"
  ON club_suggestions FOR SELECT TO authenticated
  USING (
    suggested_by = auth.uid()
    OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = TRUE)
  );

DROP POLICY IF EXISTS "Admins can update suggestions" ON club_suggestions;
CREATE POLICY "Admins can update suggestions"
  ON club_suggestions FOR UPDATE TO authenticated
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = TRUE)
  );
