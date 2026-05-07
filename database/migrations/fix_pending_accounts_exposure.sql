-- Fix: Exposed Auth Users (CRITICAL)
-- The public.pending_accounts view exposed auth.users.email to anon/authenticated
-- roles via PostgREST. Replace the view with a SECURITY DEFINER function that
-- only returns data when the caller is an admin.

-- Drop the exposed view
DROP VIEW IF EXISTS public.pending_accounts;

-- SECURITY DEFINER function: only admins receive rows; everyone else gets nothing.
-- Runs as the function owner so it can read auth.users, but the inline admin check
-- gates access by the calling user's profile.
CREATE OR REPLACE FUNCTION public.get_pending_accounts()
RETURNS TABLE (
  id UUID,
  username TEXT,
  full_name TEXT,
  avatar_url TEXT,
  email TEXT,
  approval_status TEXT,
  requested_at TIMESTAMP WITH TIME ZONE,
  approved_at TIMESTAMP WITH TIME ZONE,
  admin_notes TEXT,
  approved_by_username TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE profiles.id = auth.uid()
      AND profiles.is_admin = TRUE
  ) THEN
    RAISE EXCEPTION 'Admin access required';
  END IF;

  RETURN QUERY
  SELECT
    p.id,
    p.username,
    p.full_name,
    p.avatar_url,
    u.email::TEXT,
    p.approval_status,
    p.requested_at,
    p.approved_at,
    p.admin_notes,
    approver.username AS approved_by_username
  FROM public.profiles p
  LEFT JOIN auth.users u ON p.id = u.id
  LEFT JOIN public.profiles approver ON p.approved_by = approver.id
  WHERE p.approval_status IN ('pending', 'rejected')
  ORDER BY p.requested_at DESC;
END;
$$;

-- Lock down execute privileges. anon must never call this; authenticated users
-- can call it but the admin check inside will reject non-admins.
REVOKE ALL ON FUNCTION public.get_pending_accounts() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.get_pending_accounts() FROM anon;
GRANT EXECUTE ON FUNCTION public.get_pending_accounts() TO authenticated;
