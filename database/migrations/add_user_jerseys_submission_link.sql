-- Catalog-first add flow, schema slice (design: Docs/CATALOG_FIRST_DESIGN.md
-- decision 1). A user_jerseys row is either cataloged (public_jersey_id) or
-- pending (submission_id); pending identity is read from the submission via
-- join. The column lands now so the June 13 found-path build and the June 20
-- not-found build share one schema.
--
-- Rollback: database/rollbacks/rollback_add_user_jerseys_submission_link.sql

ALTER TABLE user_jerseys
  ADD COLUMN IF NOT EXISTS submission_id uuid REFERENCES jersey_submissions(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_user_jerseys_submission_id
  ON user_jerseys (submission_id) WHERE submission_id IS NOT NULL;

-- One pending collection row per submission (the submitter's own).
CREATE UNIQUE INDEX IF NOT EXISTS uq_user_jerseys_submission
  ON user_jerseys (submission_id) WHERE submission_id IS NOT NULL;

COMMENT ON COLUMN user_jerseys.submission_id IS
  'Set while the kit is uncataloged: identity reads from jersey_submissions. Approval sets public_jersey_id; this column is kept for provenance.';
