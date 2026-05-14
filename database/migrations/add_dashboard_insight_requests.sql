-- Migration: Capture user-submitted dashboard insight requests.
--
-- Users propose new stats / charts / insights they want to see on their
-- collection dashboard. Admins triage and decide what to build.

CREATE TABLE IF NOT EXISTS dashboard_insight_requests (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content     TEXT NOT NULL CHECK (char_length(content) BETWEEN 3 AND 2000),

  status      TEXT NOT NULL DEFAULT 'pending'
              CHECK (status IN ('pending', 'reviewing', 'planned', 'shipped', 'declined')),
  admin_notes TEXT,

  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_dashboard_insights_user_id
  ON dashboard_insight_requests (user_id);
CREATE INDEX IF NOT EXISTS idx_dashboard_insights_status_created
  ON dashboard_insight_requests (status, created_at DESC);

CREATE OR REPLACE FUNCTION set_dashboard_insights_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at := now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_dashboard_insights_updated_at
  ON dashboard_insight_requests;
CREATE TRIGGER trg_dashboard_insights_updated_at
BEFORE UPDATE ON dashboard_insight_requests
FOR EACH ROW EXECUTE FUNCTION set_dashboard_insights_updated_at();

ALTER TABLE dashboard_insight_requests ENABLE ROW LEVEL SECURITY;

-- Users submit their own requests.
DROP POLICY IF EXISTS "Users insert own insight requests" ON dashboard_insight_requests;
CREATE POLICY "Users insert own insight requests"
  ON dashboard_insight_requests FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

-- Users see their own; admins see all.
DROP POLICY IF EXISTS "Users see own insight requests, admins see all"
  ON dashboard_insight_requests;
CREATE POLICY "Users see own insight requests, admins see all"
  ON dashboard_insight_requests FOR SELECT TO authenticated
  USING (
    user_id = auth.uid()
    OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = TRUE)
  );

-- Only admins update (to set status / admin_notes).
DROP POLICY IF EXISTS "Admins update insight requests" ON dashboard_insight_requests;
CREATE POLICY "Admins update insight requests"
  ON dashboard_insight_requests FOR UPDATE TO authenticated
  USING (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = TRUE)
  );
