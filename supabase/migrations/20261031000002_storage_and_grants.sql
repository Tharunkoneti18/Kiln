-- Career OS Migration 2: Storage Buckets, Storage Policies & Explicit Grants
-- Complies with October 30, 2026 Supabase Data API exposure and storage access rules

-- 1. Storage Buckets Creation (Private)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES
  ('resumes', 'resumes', false, 10485760, ARRAY['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain']),
  ('portfolio_evidence', 'portfolio_evidence', false, 52428800, NULL),
  ('lesson_assets', 'lesson_assets', false, 52428800, NULL)
ON CONFLICT (id) DO UPDATE SET
  public = false;


-- 2. Storage Objects RLS Policies
-- Users can only upload, read, update, and delete objects in their own folder: <user_id>/*
CREATE POLICY "resumes_owner_select" ON storage.objects
  FOR SELECT TO authenticated
  USING (bucket_id = 'resumes' AND (storage.foldername(name))[1] = (select auth.uid()::text));

CREATE POLICY "resumes_owner_insert" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'resumes' AND (storage.foldername(name))[1] = (select auth.uid()::text));

CREATE POLICY "resumes_owner_update" ON storage.objects
  FOR UPDATE TO authenticated
  USING (bucket_id = 'resumes' AND (storage.foldername(name))[1] = (select auth.uid()::text))
  WITH CHECK (bucket_id = 'resumes' AND (storage.foldername(name))[1] = (select auth.uid()::text));

CREATE POLICY "resumes_owner_delete" ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id = 'resumes' AND (storage.foldername(name))[1] = (select auth.uid()::text));


CREATE POLICY "portfolio_evidence_owner_select" ON storage.objects
  FOR SELECT TO authenticated
  USING (bucket_id = 'portfolio_evidence' AND (storage.foldername(name))[1] = (select auth.uid()::text));

CREATE POLICY "portfolio_evidence_owner_insert" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'portfolio_evidence' AND (storage.foldername(name))[1] = (select auth.uid()::text));

CREATE POLICY "portfolio_evidence_owner_update" ON storage.objects
  FOR UPDATE TO authenticated
  USING (bucket_id = 'portfolio_evidence' AND (storage.foldername(name))[1] = (select auth.uid()::text))
  WITH CHECK (bucket_id = 'portfolio_evidence' AND (storage.foldername(name))[1] = (select auth.uid()::text));

CREATE POLICY "portfolio_evidence_owner_delete" ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id = 'portfolio_evidence' AND (storage.foldername(name))[1] = (select auth.uid()::text));


CREATE POLICY "lesson_assets_select" ON storage.objects
  FOR SELECT TO authenticated
  USING (bucket_id = 'lesson_assets');


-- 3. Explicit SQL Grants for Data API
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL ROUTINES IN SCHEMA public TO authenticated;

-- Public catalog reads for anonymous users if allowed
GRANT USAGE ON SCHEMA public TO anon;
GRANT SELECT ON public.skills, public.lessons TO anon;

ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO authenticated;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO authenticated;
