-- Rollback for catalog_first_not_found.sql.
-- Drops both RPCs. The old approve_jersey_submission is NOT restored —
-- it was broken (referenced a nonexistent column) and unused by the app.
-- Pending user_jerseys rows created via submit_uncataloged_kit keep their
-- submission_id links (harmless; identity still readable via join).

DROP FUNCTION IF EXISTS submit_uncataloged_kit(text,text,text,text,text,text,text,text,text,text,text,text,text,text);
DROP FUNCTION IF EXISTS approve_submission_link(uuid, uuid);
