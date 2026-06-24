-- Rollback for all_kits_public_default_false.sql.
-- NOTE: restores the old default; the row flip cannot distinguish
-- pre-migration true values (none were explicit choices — see audit
-- in the migration header), so this sets all rows back to true.

ALTER TABLE profiles ALTER COLUMN all_kits_public SET DEFAULT true;

UPDATE profiles SET all_kits_public = true;
