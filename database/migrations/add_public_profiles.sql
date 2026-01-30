-- Migration: Add public profile functionality
-- Run this in your Supabase SQL editor

-- Add public profile columns to profiles table
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS is_public BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS top_3_jersey_ids UUID[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS bio TEXT;

-- Add index for faster queries on public profiles
CREATE INDEX IF NOT EXISTS idx_profiles_is_public ON profiles(is_public);
CREATE INDEX IF NOT EXISTS idx_profiles_username ON profiles(username);

-- RLS Policy: Allow anyone to read public profiles by username
-- First, drop if exists to avoid conflicts
DROP POLICY IF EXISTS "Anyone can view public profiles" ON profiles;

CREATE POLICY "Anyone can view public profiles" ON profiles
  FOR SELECT USING (
    is_public = true
    OR id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM profiles admin_profile
      WHERE admin_profile.id = auth.uid()
      AND admin_profile.is_admin = true
    )
  );

-- Function to get public profile by username
CREATE OR REPLACE FUNCTION get_public_profile(profile_username TEXT)
RETURNS TABLE (
  id UUID,
  username TEXT,
  full_name TEXT,
  avatar_url TEXT,
  bio TEXT,
  is_public BOOLEAN,
  top_3_jersey_ids UUID[],
  created_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    p.id,
    p.username,
    p.full_name,
    p.avatar_url,
    p.bio,
    p.is_public,
    p.top_3_jersey_ids,
    p.requested_at as created_at
  FROM profiles p
  WHERE p.username = profile_username
    AND p.is_public = true
    AND p.approval_status = 'approved';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get public collections for a user
CREATE OR REPLACE FUNCTION get_public_collections(profile_user_id UUID)
RETURNS TABLE (
  id UUID,
  name TEXT,
  description TEXT,
  jersey_count BIGINT,
  thumbnail_urls TEXT[]
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    c.id,
    c.name,
    c.description,
    COUNT(cj.id)::BIGINT as jersey_count,
    (ARRAY_AGG(DISTINCT pj.front_image_url) FILTER (WHERE pj.front_image_url IS NOT NULL))[1:4] as thumbnail_urls
  FROM collections c
  LEFT JOIN collection_jerseys cj ON c.id = cj.collection_id
  LEFT JOIN user_jerseys uj ON cj.user_jersey_id = uj.id
  LEFT JOIN public_jerseys pj ON uj.public_jersey_id = pj.id
  WHERE c.user_id = profile_user_id
    AND c.is_public = true
  GROUP BY c.id, c.name, c.description
  ORDER BY c.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get user stats for public profile
CREATE OR REPLACE FUNCTION get_public_profile_stats(profile_user_id UUID)
RETURNS TABLE (
  total_jerseys BIGINT,
  public_collections BIGINT,
  liked_jerseys BIGINT
) AS $$
DECLARE
  profile_public BOOLEAN;
  all_kits_public BOOLEAN;
BEGIN
  -- Check if profile is public
  SELECT p.is_public, COALESCE(p.all_kits_public, false)
  INTO profile_public, all_kits_public
  FROM profiles p
  WHERE p.id = profile_user_id;

  IF NOT profile_public THEN
    RETURN QUERY SELECT 0::BIGINT, 0::BIGINT, 0::BIGINT;
    RETURN;
  END IF;

  RETURN QUERY
  SELECT
    CASE WHEN all_kits_public THEN
      (SELECT COUNT(*)::BIGINT FROM user_jerseys WHERE user_id = profile_user_id)
    ELSE 0::BIGINT END as total_jerseys,
    (SELECT COUNT(*)::BIGINT FROM collections WHERE user_id = profile_user_id AND is_public = true) as public_collections,
    (SELECT COUNT(*)::BIGINT FROM jersey_likes WHERE user_id = profile_user_id) as liked_jerseys;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get top 3 jerseys for public profile
CREATE OR REPLACE FUNCTION get_top_3_jerseys(jersey_ids UUID[])
RETURNS TABLE (
  id UUID,
  user_jersey_id UUID,
  team_name TEXT,
  player_name TEXT,
  season TEXT,
  jersey_type TEXT,
  kit_type TEXT,
  manufacturer TEXT,
  front_image_url TEXT,
  back_image_url TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    pj.id,
    uj.id as user_jersey_id,
    pj.team_name,
    pj.player_name,
    pj.season,
    pj.jersey_type,
    pj.kit_type,
    pj.manufacturer,
    pj.front_image_url,
    pj.back_image_url
  FROM unnest(jersey_ids) WITH ORDINALITY AS t(jersey_id, ord)
  JOIN user_jerseys uj ON uj.id = t.jersey_id
  JOIN public_jerseys pj ON uj.public_jersey_id = pj.id
  ORDER BY t.ord;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
