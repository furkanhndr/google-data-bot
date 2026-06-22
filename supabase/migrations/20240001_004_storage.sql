-- Migration: 004 — Storage Buckets and Policies
-- Run order: 4th (after 003_triggers.sql)
-- NOTE: Run this AFTER creating the 'exports' bucket manually in the
--       Supabase dashboard (Storage → New bucket → Name: "exports", Private: ON)
--       OR uncomment the insert below if using the Supabase CLI.

-- ============================================================
-- Create exports bucket (via SQL — only works with Supabase CLI)
-- If using dashboard, create the bucket manually and skip this block.
-- ============================================================
-- INSERT INTO storage.buckets (id, name, public)
-- VALUES ('exports', 'exports', false)
-- ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- Storage RLS policies for the 'exports' bucket
-- ============================================================

-- Users can read their own export files
CREATE POLICY "exports_storage_select"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'exports' AND
    (
      -- Path structure: exports/{user_id}/{job_id}/{filename}
      (storage.foldername(name))[1] = auth.uid()::text
      OR
      public.is_admin()
    )
  );

-- Users can upload their own export files
CREATE POLICY "exports_storage_insert"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'exports' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

-- Users can delete their own export files
CREATE POLICY "exports_storage_delete"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'exports' AND
    (
      (storage.foldername(name))[1] = auth.uid()::text
      OR
      public.is_admin()
    )
  );

-- ============================================================
-- Avatars bucket (for user profile pictures)
-- ============================================================
-- INSERT INTO storage.buckets (id, name, public)
-- VALUES ('avatars', 'avatars', true)
-- ON CONFLICT (id) DO NOTHING;

CREATE POLICY "avatars_storage_select"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'avatars');

CREATE POLICY "avatars_storage_insert"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'avatars' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "avatars_storage_update"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'avatars' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "avatars_storage_delete"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'avatars' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );
