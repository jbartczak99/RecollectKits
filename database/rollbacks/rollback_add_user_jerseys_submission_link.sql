-- Rollback for add_user_jerseys_submission_link.sql.
-- NOTE: drops the pending-link column; any uncataloged collection rows lose
-- their identity pointer (they keep existing but render unknown).

DROP INDEX IF EXISTS uq_user_jerseys_submission;
DROP INDEX IF EXISTS idx_user_jerseys_submission_id;
ALTER TABLE user_jerseys DROP COLUMN IF EXISTS submission_id;
