-- Kit metadata layer (blitz plan June 22 item, built 6/24).
-- Provenance flags + acquisition fields on user_jerseys. The condition scale
-- is enforced in the UI (CONDITION_OPTIONS), not a DB CHECK, so legacy values
-- ('new'/'used') on existing rows aren't invalidated.
--
-- PRIVACY: acquisition_price is owner-only — it must NEVER be selected in any
-- public-facing query (usePublicProfile selects an explicit column list, not
-- *, so this stays private by construction). acquisition_date may be shown.
--
-- Rollback: database/rollbacks/rollback_add_kit_metadata.sql

ALTER TABLE user_jerseys
  ADD COLUMN IF NOT EXISTS match_worn       boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS signed           boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS player_issue     boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS acquisition_price numeric(10,2),
  ADD COLUMN IF NOT EXISTS acquisition_date  date;

COMMENT ON COLUMN user_jerseys.acquisition_price IS
  'What the owner paid. PRIVATE — never select in public-facing queries.';
