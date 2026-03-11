-- Migration: Add players and player_careers tables for player profile pages
-- Date: 2026-03-10

-- Players table
CREATE TABLE IF NOT EXISTS players (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  position TEXT,
  nationality TEXT,
  date_of_birth DATE,
  wikidata_id TEXT UNIQUE,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Player careers table (club + international history)
CREATE TABLE IF NOT EXISTS player_careers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  player_id UUID NOT NULL REFERENCES players(id) ON DELETE CASCADE,
  team_name TEXT NOT NULL,
  season_start TEXT,
  season_end TEXT,
  shirt_number INTEGER,
  is_international BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Add player_id foreign key to public_jerseys (nullable for backwards compat)
ALTER TABLE public_jerseys ADD COLUMN IF NOT EXISTS player_id UUID REFERENCES players(id);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_players_name ON players(name);
CREATE INDEX IF NOT EXISTS idx_players_wikidata_id ON players(wikidata_id);
CREATE INDEX IF NOT EXISTS idx_player_careers_player_id ON player_careers(player_id);
CREATE INDEX IF NOT EXISTS idx_public_jerseys_player_id ON public_jerseys(player_id);

-- RLS policies for players
ALTER TABLE players ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Players are viewable by everyone"
  ON players FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can insert players"
  ON players FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update players"
  ON players FOR UPDATE
  USING (auth.role() = 'authenticated');

-- RLS policies for player_careers
ALTER TABLE player_careers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Careers are viewable by everyone"
  ON player_careers FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can insert careers"
  ON player_careers FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update careers"
  ON player_careers FOR UPDATE
  USING (auth.role() = 'authenticated');

-- Updated_at trigger for players
CREATE OR REPLACE FUNCTION update_players_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER players_updated_at
  BEFORE UPDATE ON players
  FOR EACH ROW
  EXECUTE FUNCTION update_players_updated_at();
