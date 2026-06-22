-- Migration: 003 — Triggers and Functions
-- Run order: 3rd (after 002_rls.sql)

-- ============================================================
-- Trigger 1: handle_new_user
-- Automatically creates a profiles row when a new user signs up.
-- ============================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name'),
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- ============================================================
-- Trigger 2: update_credits_on_scrape
-- When a job transitions to 'completed', increment credits_used
-- by the number of results scraped in that job.
-- ============================================================
CREATE OR REPLACE FUNCTION public.update_credits_on_scrape()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Only fire when status changes to 'completed'
  IF NEW.status = 'completed' AND OLD.status != 'completed' THEN
    UPDATE public.profiles
    SET credits_used = credits_used + NEW.scraped_count
    WHERE id = NEW.user_id;
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_job_completed
  AFTER UPDATE ON public.scraping_jobs
  FOR EACH ROW
  EXECUTE FUNCTION public.update_credits_on_scrape();

-- ============================================================
-- Trigger 3: update_updated_at
-- Keeps profiles.updated_at current on every update.
-- ============================================================
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER set_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

-- ============================================================
-- RPC: admin_update_user
-- Called from /api/admin/users/[userId] with service role.
-- Allows updating role, plan, credits_total, is_suspended.
-- ============================================================
CREATE OR REPLACE FUNCTION public.admin_update_user(
  target_user_id  uuid,
  new_role        text    DEFAULT NULL,
  new_plan        text    DEFAULT NULL,
  new_credits     integer DEFAULT NULL,
  new_suspended   boolean DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.profiles
  SET
    role          = COALESCE(new_role,      role),
    plan          = COALESCE(new_plan,      plan),
    credits_total = COALESCE(new_credits,   credits_total),
    is_suspended  = COALESCE(new_suspended, is_suspended)
  WHERE id = target_user_id;
END;
$$;

-- ============================================================
-- RPC: get_admin_stats
-- Returns aggregated usage statistics for the admin dashboard.
-- Called from /api/admin/stats with service role.
-- ============================================================
CREATE OR REPLACE FUNCTION public.get_admin_stats()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  result jsonb;
BEGIN
  SELECT jsonb_build_object(
    'total_users',         (SELECT COUNT(*) FROM public.profiles),
    'active_users_7d',     (SELECT COUNT(DISTINCT user_id) FROM public.scraping_jobs
                            WHERE created_at >= now() - interval '7 days'),
    'total_jobs',          (SELECT COUNT(*) FROM public.scraping_jobs),
    'completed_jobs',      (SELECT COUNT(*) FROM public.scraping_jobs WHERE status = 'completed'),
    'total_results',       (SELECT COUNT(*) FROM public.business_results),
    'total_exports',       (SELECT COUNT(*) FROM public.export_history),
    'free_users',          (SELECT COUNT(*) FROM public.profiles WHERE plan = 'free'),
    'premium_users',       (SELECT COUNT(*) FROM public.profiles WHERE plan = 'premium'),
    'suspended_users',     (SELECT COUNT(*) FROM public.profiles WHERE is_suspended = true),
    'jobs_last_7d',        (SELECT COUNT(*) FROM public.scraping_jobs
                            WHERE created_at >= now() - interval '7 days'),
    'results_last_7d',     (SELECT COUNT(*) FROM public.business_results
                            WHERE scraped_at >= now() - interval '7 days')
  ) INTO result;

  RETURN result;
END;
$$;
