-- Migration: Add account approval functionality
-- Run this in your Supabase SQL editor

-- Add approval columns to profiles table
ALTER TABLE profiles
ADD COLUMN approval_status TEXT DEFAULT 'pending' CHECK (approval_status IN ('pending', 'approved', 'rejected')),
ADD COLUMN approved_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN approved_by UUID REFERENCES profiles(id),
ADD COLUMN admin_notes TEXT,
ADD COLUMN requested_at TIMESTAMP WITH TIME ZONE DEFAULT now();

-- Add index for faster queries on approval status
CREATE INDEX idx_profiles_approval_status ON profiles(approval_status);

-- Create admin role tracking
ALTER TABLE profiles
ADD COLUMN is_admin BOOLEAN DEFAULT FALSE;

-- Create RLS policies for admin access to approval data
-- Note: You'll need to set up RLS policies in Supabase dashboard
-- These are example policies:

-- Allow admins to see all profiles with approval data
-- CREATE POLICY "Admins can view all profiles" ON profiles
--   FOR SELECT USING (
--     EXISTS (
--       SELECT 1 FROM profiles admin_profile
--       WHERE admin_profile.id = auth.uid()
--       AND admin_profile.is_admin = true
--     )
--   );

-- Allow admins to update approval status
-- CREATE POLICY "Admins can update approval status" ON profiles
--   FOR UPDATE USING (
--     EXISTS (
--       SELECT 1 FROM profiles admin_profile
--       WHERE admin_profile.id = auth.uid()
--       AND admin_profile.is_admin = true
--     )
--   );

-- Users can only see their own profile
-- CREATE POLICY "Users can view own profile" ON profiles
--   FOR SELECT USING (auth.uid() = id);

-- Function to approve a user account
CREATE OR REPLACE FUNCTION approve_user_account(
  user_id UUID,
  admin_id UUID,
  notes TEXT DEFAULT NULL
) RETURNS void AS $$
BEGIN
  UPDATE profiles
  SET
    approval_status = 'approved',
    approved_at = now(),
    approved_by = admin_id,
    admin_notes = notes
  WHERE id = user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to reject a user account
CREATE OR REPLACE FUNCTION reject_user_account(
  user_id UUID,
  admin_id UUID,
  notes TEXT DEFAULT NULL
) RETURNS void AS $$
BEGIN
  UPDATE profiles
  SET
    approval_status = 'rejected',
    approved_at = now(),
    approved_by = admin_id,
    admin_notes = notes
  WHERE id = user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- View for admin panel to easily see pending accounts
CREATE OR REPLACE VIEW pending_accounts AS
SELECT
  p.id,
  p.username,
  p.full_name,
  p.avatar_url,
  u.email,
  p.approval_status,
  p.requested_at,
  p.approved_at,
  p.admin_notes,
  approver.username as approved_by_username
FROM profiles p
LEFT JOIN auth.users u ON p.id = u.id
LEFT JOIN profiles approver ON p.approved_by = approver.id
WHERE p.approval_status IN ('pending', 'rejected')
ORDER BY p.requested_at DESC;

-- Insert a default admin user (replace with your actual admin email/id)
-- You'll need to run this after creating your first admin account:
-- UPDATE profiles SET is_admin = true WHERE email = 'your-admin@email.com';