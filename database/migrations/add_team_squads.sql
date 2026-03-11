-- Migration: Add team_squads table as our own source of truth for squad rosters
-- Date: 2026-03-10

CREATE TABLE IF NOT EXISTS team_squads (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  team_name TEXT NOT NULL,
  season TEXT NOT NULL,
  player_name TEXT NOT NULL,
  shirt_number INTEGER,
  position TEXT,
  player_id UUID REFERENCES players(id),
  wikidata_id TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(team_name, season, player_name)
);

CREATE INDEX IF NOT EXISTS idx_team_squads_team_season ON team_squads(team_name, season);

ALTER TABLE team_squads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Team squads viewable by everyone"
  ON team_squads FOR SELECT USING (true);

CREATE POLICY "Authenticated users can insert team squads"
  ON team_squads FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update team squads"
  ON team_squads FOR UPDATE
  USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can delete team squads"
  ON team_squads FOR DELETE
  USING (auth.role() = 'authenticated');
