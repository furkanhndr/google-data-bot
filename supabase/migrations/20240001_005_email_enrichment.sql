-- Migration: 005 — Email Enrichment
-- Run order: 5th (after 004_storage.sql)
--
-- Adds per-result email discovery status so the dashboard can show
-- progress and the enrichment endpoint can resume where it left off.
--   null         → not attempted yet
--   'pending'    → reserved for in-flight work (optional, currently unused)
--   'found'      → an email was discovered and written to `email`
--   'not_found'  → the site was crawled but no email was found
--   'no_website' → the business has no website to crawl

ALTER TABLE public.business_results
  ADD COLUMN IF NOT EXISTS email_status text
    CHECK (email_status IN ('pending', 'found', 'not_found', 'no_website'));

-- Helps the enrichment endpoint quickly find rows still needing work.
CREATE INDEX IF NOT EXISTS idx_business_results_email_status
  ON public.business_results (job_id)
  WHERE email_status IS NULL;
