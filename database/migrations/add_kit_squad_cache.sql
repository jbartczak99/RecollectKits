-- Migration: Add kit_squad_cache table for caching Wikidata squad lookups
-- Date: 2026-03-10

CREATE TABLE IF NOT EXISTS kit_squad_cache (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  team_wikidata_id TEXT NOT NULL,
  team_name TEXT NOT NULL,
  season TEXT NOT NULL,
  player_wikidata_id TEXT NOT NULL,
  player_name TEXT NOT NULL,
  shirt_number INTEGER,
  player_id UUID REFERENCES players(id),
  fetched_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(team_wikidata_id, season, player_wikidata_id)
);

CREATE INDEX IF NOT EXISTS idx_kit_squad_team_season ON kit_squad_cache(team_wikidata_id, season);
CREATE INDEX IF NOT EXISTS idx_kit_squad_team_name_season ON kit_squad_cache(team_name, season);

-- RLS
ALTER TABLE kit_squad_cache ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Squad cache viewable by everyone"
  ON kit_squad_cache FOR SELECT USING (true);

CREATE POLICY "Authenticated users can insert squad cache"
  ON kit_squad_cache FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update squad cache"
  ON kit_squad_cache FOR UPDATE
  USING (auth.role() = 'authenticated');
