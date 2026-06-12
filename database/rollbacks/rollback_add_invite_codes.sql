-- Rollback for add_invite_codes.sql — removes the invite-code system
-- entirely. Signups revert to today's behavior (no code involved).
-- NOTE: drops redemption history with the tables; export first if needed.

DROP TRIGGER IF EXISTS trg_enforce_invite_code ON auth.users;
DROP FUNCTION IF EXISTS enforce_invite_code_on_signup();
DROP FUNCTION IF EXISTS validate_invite_code(text);

DROP TABLE IF EXISTS invite_redemptions;
DROP TABLE IF EXISTS invite_codes;

-- app_settings may be shared by later flags; only remove the invite flag.
DELETE FROM app_settings WHERE key = 'require_invite_code';
-- If nothing else uses app_settings yet and you want it gone entirely:
-- DROP TABLE IF EXISTS app_settings;
