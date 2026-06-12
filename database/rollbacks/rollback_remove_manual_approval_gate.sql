-- Rollback for remove_manual_approval_gate.sql.
-- NOTE: the pending-queue backfill cannot be selectively undone (accounts
-- approved by the migration are indistinguishable from manually approved
-- ones). This restores the default and turns the invite requirement off.

ALTER TABLE profiles ALTER COLUMN approval_status SET DEFAULT 'pending';

UPDATE app_settings
   SET value = 'false'::jsonb,
       updated_at = now()
 WHERE key = 'require_invite_code';
