-- Partner Applications table
CREATE TABLE IF NOT EXISTS partner_applications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text NOT NULL,
  username text,
  partner_type text NOT NULL,  -- collector, creator, shop, club, retail
  tier text,  -- free, creator, shop, club, retail
  description text NOT NULL,
  links text,
  status text DEFAULT 'pending',  -- pending, contacted, approved, rejected
  created_at timestamptz DEFAULT now(),
  notes text  -- for admin use
);

-- RLS
ALTER TABLE partner_applications ENABLE ROW LEVEL SECURITY;

-- Anyone can insert (public application form)
CREATE POLICY "Anyone can submit partner applications"
  ON partner_applications
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Only admins can read
CREATE POLICY "Admins can view partner applications"
  ON partner_applications
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = true
    )
  );

-- Only admins can update
CREATE POLICY "Admins can update partner applications"
  ON partner_applications
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = true
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = true
    )
  );
