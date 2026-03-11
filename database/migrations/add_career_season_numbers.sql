-- Migration: Add season_numbers JSONB column to player_careers
-- Allows per-season shirt number overrides
-- e.g. shirt_number = 9 (default), season_numbers = {"2023-24": 7} (override)
-- Date: 2026-03-10

ALTER TABLE player_careers ADD COLUMN IF NOT EXISTS season_numbers JSONB DEFAULT '{}';
