-- Add tier column to partner_applications if it doesn't exist
ALTER TABLE partner_applications ADD COLUMN IF NOT EXISTS tier text;
