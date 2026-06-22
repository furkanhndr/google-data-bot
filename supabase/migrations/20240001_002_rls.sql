-- Migration: 002 — Row Level Security Policies
-- Run order: 2nd (after 001_tables.sql)

-- ============================================================
-- Enable RLS on all tables
-- ============================================================
ALTER TABLE public.profiles        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scraping_jobs   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.business_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.export_history  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.places_api_quota ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- Helper function: check if caller is admin
-- ============================================================
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
$$;

-- ============================================================
-- profiles policies
-- ============================================================
-- Own row read
CREATE POLICY "profiles_select_own"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id OR public.is_admin());

-- Self-update (non-privileged fields only — role/plan/is_suspended handled by admin API)
CREATE POLICY "profiles_update_own"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (
    auth.uid() = id AND
    -- Prevent users from escalating their own role/plan
    role = (SELECT role FROM public.profiles WHERE id = auth.uid()) AND
    plan = (SELECT plan FROM public.profiles WHERE id = auth.uid()) AND
    is_suspended = (SELECT is_suspended FROM public.profiles WHERE id = auth.uid())
  );

-- No direct INSERT — handled by trigger
-- No direct DELETE

-- ============================================================
-- scraping_jobs policies
-- ============================================================
CREATE POLICY "jobs_select"
  ON public.scraping_jobs FOR SELECT
  USING (auth.uid() = user_id OR public.is_admin());

CREATE POLICY "jobs_insert"
  ON public.scraping_jobs FOR INSERT
  WITH CHECK (
    auth.uid() = user_id AND
    -- Suspended users cannot create jobs
    NOT EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND is_suspended = true
    ) AND
    -- Free plan credit check
    NOT EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid()
        AND plan = 'free'
        AND credits_used >= credits_total
    )
  );

-- Users can cancel own jobs; admins can update any
CREATE POLICY "jobs_update"
  ON public.scraping_jobs FOR UPDATE
  USING (auth.uid() = user_id OR public.is_admin());

-- Admin-only delete
CREATE POLICY "jobs_delete"
  ON public.scraping_jobs FOR DELETE
  USING (public.is_admin());

-- ============================================================
-- business_results policies
-- ============================================================
CREATE POLICY "results_select"
  ON public.business_results FOR SELECT
  USING (auth.uid() = user_id OR public.is_admin());

CREATE POLICY "results_insert"
  ON public.business_results FOR INSERT
  WITH CHECK (
    auth.uid() = user_id AND
    EXISTS (
      SELECT 1 FROM public.scraping_jobs
      WHERE id = job_id AND user_id = auth.uid()
    )
  );

-- Admin-only update/delete
CREATE POLICY "results_update"
  ON public.business_results FOR UPDATE
  USING (public.is_admin());

CREATE POLICY "results_delete"
  ON public.business_results FOR DELETE
  USING (public.is_admin());

-- ============================================================
-- export_history policies
-- ============================================================
CREATE POLICY "exports_select"
  ON public.export_history FOR SELECT
  USING (auth.uid() = user_id OR public.is_admin());

CREATE POLICY "exports_insert"
  ON public.export_history FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- No update or delete by users

-- ============================================================
-- places_api_quota policies
-- Admin read; service role only for writes (via API routes)
-- ============================================================
CREATE POLICY "quota_select"
  ON public.places_api_quota FOR SELECT
  USING (public.is_admin());
