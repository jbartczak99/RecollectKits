-- Migration: Add friends system
-- Run this in your Supabase SQL editor

-- Create user_friends table
CREATE TABLE IF NOT EXISTS user_friends (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  requester_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  addressee_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  -- Prevent duplicate friend requests (either direction)
  CONSTRAINT unique_friendship UNIQUE (requester_id, addressee_id),
  -- Prevent self-friending
  CONSTRAINT no_self_friending CHECK (requester_id != addressee_id)
);

-- Create indexes for faster lookups
CREATE INDEX IF NOT EXISTS idx_user_friends_requester ON user_friends(requester_id);
CREATE INDEX IF NOT EXISTS idx_user_friends_addressee ON user_friends(addressee_id);
CREATE INDEX IF NOT EXISTS idx_user_friends_status ON user_friends(status);
CREATE INDEX IF NOT EXISTS idx_user_friends_requester_status ON user_friends(requester_id, status);
CREATE INDEX IF NOT EXISTS idx_user_friends_addressee_status ON user_friends(addressee_id, status);

-- Enable RLS
ALTER TABLE user_friends ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- Users can view friendships they are part of
DROP POLICY IF EXISTS "Users can view own friendships" ON user_friends;
CREATE POLICY "Users can view own friendships" ON user_friends
  FOR SELECT USING (
    auth.uid() = requester_id OR auth.uid() = addressee_id
  );

-- Only requester can create friend requests
DROP POLICY IF EXISTS "Users can send friend requests" ON user_friends;
CREATE POLICY "Users can send friend requests" ON user_friends
  FOR INSERT WITH CHECK (
    auth.uid() = requester_id
  );

-- Requester can cancel pending requests, either party can remove accepted friendships
DROP POLICY IF EXISTS "Users can delete friendships" ON user_friends;
CREATE POLICY "Users can delete friendships" ON user_friends
  FOR DELETE USING (
    -- Requester can cancel pending requests
    (auth.uid() = requester_id AND status = 'pending')
    OR
    -- Either party can remove accepted friendships
    ((auth.uid() = requester_id OR auth.uid() = addressee_id) AND status = 'accepted')
  );

-- Only addressee can update (accept) pending requests
DROP POLICY IF EXISTS "Addressee can accept friend requests" ON user_friends;
CREATE POLICY "Addressee can accept friend requests" ON user_friends
  FOR UPDATE USING (
    auth.uid() = addressee_id AND status = 'pending'
  ) WITH CHECK (
    auth.uid() = addressee_id AND status = 'accepted'
  );

-- Helper function: Get friend count for a user
CREATE OR REPLACE FUNCTION get_friend_count(user_id UUID)
RETURNS BIGINT AS $$
BEGIN
  RETURN (
    SELECT COUNT(*)
    FROM user_friends
    WHERE status = 'accepted'
      AND (requester_id = user_id OR addressee_id = user_id)
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Helper function: Check if two users are friends
CREATE OR REPLACE FUNCTION are_friends(user_a UUID, user_b UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM user_friends
    WHERE status = 'accepted'
      AND (
        (requester_id = user_a AND addressee_id = user_b)
        OR (requester_id = user_b AND addressee_id = user_a)
      )
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Helper function: Get friendship status between two users
-- Returns: 'none', 'pending_sent', 'pending_received', 'accepted'
CREATE OR REPLACE FUNCTION get_friendship_status(current_user_id UUID, other_user_id UUID)
RETURNS TEXT AS $$
DECLARE
  friendship RECORD;
BEGIN
  SELECT * INTO friendship
  FROM user_friends
  WHERE (requester_id = current_user_id AND addressee_id = other_user_id)
     OR (requester_id = other_user_id AND addressee_id = current_user_id)
  LIMIT 1;

  IF friendship IS NULL THEN
    RETURN 'none';
  ELSIF friendship.status = 'accepted' THEN
    RETURN 'accepted';
  ELSIF friendship.requester_id = current_user_id THEN
    RETURN 'pending_sent';
  ELSE
    RETURN 'pending_received';
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_user_friends_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS user_friends_updated_at ON user_friends;
CREATE TRIGGER user_friends_updated_at
  BEFORE UPDATE ON user_friends
  FOR EACH ROW
  EXECUTE FUNCTION update_user_friends_updated_at();
