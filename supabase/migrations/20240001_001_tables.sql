-- Migration: 001 — Core Tables
-- Run order: 1st

-- ============================================================
-- profiles
-- Extends auth.users. Created automatically via trigger.
-- ============================================================
CREATE TABLE public.profiles (
  id              uuid        NOT NULL PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role            text        NOT NULL DEFAULT 'customer' CHECK (role IN ('admin', 'customer')),
  plan            text        NOT NULL DEFAULT 'free'     CHECK (plan IN ('free', 'premium')),
  credits_total   integer     NOT NULL DEFAULT 100,
  credits_used    integer     NOT NULL DEFAULT 0,
  display_name    text,
  avatar_url      text,
  is_suspended    boolean     NOT NULL DEFAULT false,
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now()
);

-- ============================================================
-- scraping_jobs
-- ============================================================
CREATE TABLE public.scraping_jobs (
  id              uuid        NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         uuid        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  query           text        NOT NULL,
  location        text        NOT NULL,
  filters         jsonb       NOT NULL DEFAULT '{}',
  status          text        NOT NULL DEFAULT 'pending'
                              CHECK (status IN ('pending', 'running', 'completed', 'failed', 'cancelled')),
  total_found     integer     NOT NULL DEFAULT 0,
  scraped_count   integer     NOT NULL DEFAULT 0,
  error_message   text,
  source          text        NOT NULL DEFAULT 'extension'
                              CHECK (source IN ('extension', 'places_api')),
  created_at      timestamptz NOT NULL DEFAULT now(),
  started_at      timestamptz,
  completed_at    timestamptz
);

CREATE INDEX idx_scraping_jobs_user_id  ON public.scraping_jobs(user_id);
CREATE INDEX idx_scraping_jobs_status   ON public.scraping_jobs(status);
CREATE INDEX idx_scraping_jobs_created  ON public.scraping_jobs(created_at DESC);

-- ============================================================
-- business_results
-- Holds all scraped business data (60+ fields).
-- ============================================================
CREATE TABLE public.business_results (
  id                      uuid        NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id                  uuid        NOT NULL REFERENCES public.scraping_jobs(id) ON DELETE CASCADE,
  user_id                 uuid        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Core identity
  place_id                text,
  name                    text        NOT NULL,
  category                text,
  sub_categories          text[],

  -- Contact
  phone                   text,
  phone_secondary         text,
  email                   text,
  email_secondary         text,
  website                 text,

  -- Location
  address_full            text,
  street                  text,
  city                    text,
  state                   text,
  postal_code             text,
  country                 text,
  latitude                numeric(10, 7),
  longitude               numeric(10, 7),
  plus_code               text,

  -- Quality signals
  rating                  numeric(3, 1),
  review_count            integer,
  price_level             text,

  -- Hours (structured JSON: { monday: "9am-5pm", ... })
  hours                   jsonb,
  is_permanently_closed   boolean     NOT NULL DEFAULT false,
  is_temporarily_closed   boolean     NOT NULL DEFAULT false,

  -- Online presence
  social_facebook         text,
  social_instagram        text,
  social_twitter          text,
  social_linkedin         text,
  social_youtube          text,
  social_tiktok           text,

  -- Rich content
  description             text,
  menu_url                text,
  booking_url             text,
  order_url               text,
  photos_count            integer,
  thumbnail_url           text,

  -- Google-specific
  maps_url                text,
  claimed                 boolean,
  attributes              jsonb,

  -- Metadata
  scraped_at              timestamptz NOT NULL DEFAULT now(),
  raw_data                jsonb
);

CREATE INDEX idx_business_results_job_id  ON public.business_results(job_id);
CREATE INDEX idx_business_results_user_id ON public.business_results(user_id);
CREATE INDEX idx_business_results_name    ON public.business_results(name);
CREATE INDEX idx_business_results_city    ON public.business_results(city);

-- ============================================================
-- export_history
-- ============================================================
CREATE TABLE public.export_history (
  id              uuid        NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         uuid        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  job_id          uuid        REFERENCES public.scraping_jobs(id) ON DELETE SET NULL,
  format          text        NOT NULL CHECK (format IN ('csv', 'xlsx')),
  row_count       integer     NOT NULL,
  file_size_bytes integer,
  storage_path    text,
  download_url    text,
  created_at      timestamptz NOT NULL DEFAULT now(),
  expires_at      timestamptz
);

CREATE INDEX idx_export_history_user_id ON public.export_history(user_id);
CREATE INDEX idx_export_history_job_id  ON public.export_history(job_id);

-- ============================================================
-- places_api_quota
-- Placeholder for future Google Places API usage tracking.
-- ============================================================
CREATE TABLE public.places_api_quota (
  id              uuid        NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
  date            date        NOT NULL UNIQUE,
  requests_made   integer     NOT NULL DEFAULT 0,
  cost_usd        numeric(10, 4) NOT NULL DEFAULT 0,
  created_at      timestamptz NOT NULL DEFAULT now()
);
