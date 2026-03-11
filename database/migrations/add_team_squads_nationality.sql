-- Migration: Add nationality column to team_squads
-- Date: 2026-03-10

ALTER TABLE team_squads ADD COLUMN IF NOT EXISTS nationality TEXT;
