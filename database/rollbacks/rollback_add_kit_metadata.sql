-- Rollback for add_kit_metadata.sql. Drops the metadata columns (and any data
-- in them — export first if needed).

ALTER TABLE user_jerseys
  DROP COLUMN IF EXISTS match_worn,
  DROP COLUMN IF EXISTS signed,
  DROP COLUMN IF EXISTS player_issue,
  DROP COLUMN IF EXISTS acquisition_price,
  DROP COLUMN IF EXISTS acquisition_date;
