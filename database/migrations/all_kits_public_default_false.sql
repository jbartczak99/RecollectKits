-- Privacy: all_kits_public defaults to FALSE (blitz plan, June 13 batch
-- item c). Collections become public by explicit choice, not by default.
--
-- Existing-row audit (run 2026-06-12): 4 profiles, every one sitting on the
-- unchosen default of true; 3 of 4 have zero kits. Nobody opted in, so
-- existing rows are flipped to false as well — owners re-enable in profile
-- settings if they want their All Kits page public. (Founder: that includes
-- you — re-toggle after this runs.)
--
-- Affected read paths (verified):
--   * RLS "Public All Kits viewable" on user_jerseys — checks = true, so
--     flipped rows simply stop matching; owners still see everything.
--   * get_public_profile_stats() — already COALESCEs to false.
--   * createProfile() client-side — doesn't set the column; new rows take
--     the new default.
--
-- Rollback: database/rollbacks/rollback_all_kits_public_default_false.sql

ALTER TABLE profiles ALTER COLUMN all_kits_public SET DEFAULT false;

UPDATE profiles
   SET all_kits_public = false
 WHERE all_kits_public IS DISTINCT FROM false;
