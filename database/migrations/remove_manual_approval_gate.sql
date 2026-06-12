-- Remove the manual account-approval gate (June 13 plan item, done June 12).
--
-- Access control hands over from post-signup human review to at-signup
-- invite codes (add_invite_codes.sql). This migration:
--   1. makes new profiles approved by default (client now also sets it),
--   2. approves everyone currently stuck in the pending queue,
--   3. flips require_invite_code ON — from this moment signup requires a
--      valid invite code, and none have been distributed yet, so signup is
--      effectively closed until codes go out (beta open, June 26).
--
-- Left in place, now vestigial: get_pending_accounts / approve_user_account /
-- reject_user_account functions and the admin pending-accounts UI (shows
-- zero). Sweep with the June 20 admin work.
-- Rollback: database/rollbacks/rollback_remove_manual_approval_gate.sql

ALTER TABLE profiles ALTER COLUMN approval_status SET DEFAULT 'approved';

UPDATE profiles
   SET approval_status = 'approved',
       approved_at     = now()
 WHERE approval_status = 'pending';

UPDATE app_settings
   SET value = 'true'::jsonb,
       updated_at = now()
 WHERE key = 'require_invite_code';
