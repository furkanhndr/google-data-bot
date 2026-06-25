-- Migration: 007 — Enable Realtime
-- Run order: 7th (after 006_server_source.sql)
--
-- Powers live dashboard updates: streaming results on the job detail page and
-- in-app job-completion notifications. Idempotent.

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'scraping_jobs'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.scraping_jobs;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime' AND schemaname = 'public' AND tablename = 'business_results'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.business_results;
  END IF;
END $$;
