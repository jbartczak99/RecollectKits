-- Waitlist signups table — stores what api/waitlist.js previously discarded
-- (interest segment, signup time) so beta recruitment (June 24) can target
-- by collector type and signup recency. Resend remains the email-delivery
-- mechanism; this table is the queryable source of truth.

CREATE TABLE IF NOT EXISTS public.waitlist_signups (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL,
  first_name text,
  interest text CHECK (interest IN ('collector', 'creator', 'shop', 'club')),
  created_at timestamptz NOT NULL DEFAULT timezone('utc', now())
);

-- One row per email, case-insensitive
CREATE UNIQUE INDEX IF NOT EXISTS waitlist_signups_email_key
  ON public.waitlist_signups (lower(email));

ALTER TABLE public.waitlist_signups ENABLE ROW LEVEL SECURITY;

-- Insert-only for clients: the serverless endpoint writes with the anon key.
-- Mirrors the partner_applications posture (accepted advisor WARN). No
-- SELECT/UPDATE/DELETE for anon — emails are not readable from the client.
CREATE POLICY "Anyone can join the waitlist"
  ON public.waitlist_signups FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Admins can read waitlist"
  ON public.waitlist_signups FOR SELECT
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid() AND profiles.is_admin = true
  ));
