-- Migration: 006 — Server-side scraping source
-- Run order: 6th (after 005_email_enrichment.sql)
--
-- Scraping now runs on a backend service (Playwright) instead of the browser
-- extension. Allow 'server' as a job source.

ALTER TABLE public.scraping_jobs
  DROP CONSTRAINT IF EXISTS scraping_jobs_source_check;

ALTER TABLE public.scraping_jobs
  ADD CONSTRAINT scraping_jobs_source_check
  CHECK (source IN ('extension', 'places_api', 'server'));
