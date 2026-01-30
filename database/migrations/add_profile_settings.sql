-- Migration: Add profile settings columns
-- Run this in your Supabase SQL editor

-- Track when username was last changed (30-day cooldown)
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS username_changed_at TIMESTAMP WITH TIME ZONE;

-- Control whether full name is shown on public profile
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS show_full_name BOOLEAN DEFAULT true;

-- Create avatars storage bucket (if not exists)
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

-- Allow authenticated users to upload their own avatar
DROP POLICY IF EXISTS "Users can upload their own avatar" ON storage.objects;
CREATE POLICY "Users can upload their own avatar" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'avatars'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- Allow authenticated users to update their own avatar
DROP POLICY IF EXISTS "Users can update their own avatar" ON storage.objects;
CREATE POLICY "Users can update their own avatar" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'avatars'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- Allow authenticated users to delete their own avatar
DROP POLICY IF EXISTS "Users can delete their own avatar" ON storage.objects;
CREATE POLICY "Users can delete their own avatar" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'avatars'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- Allow anyone to view avatars (public bucket)
DROP POLICY IF EXISTS "Anyone can view avatars" ON storage.objects;
CREATE POLICY "Anyone can view avatars" ON storage.objects
  FOR SELECT USING (bucket_id = 'avatars');
