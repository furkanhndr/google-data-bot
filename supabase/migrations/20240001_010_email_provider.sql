-- Migration: 010 — Per-user SMTP email provider settings
-- Run order: after 009_outreach_status_events.sql
--
-- Users send outreach email from their OWN SMTP (keeps the platform's mail
-- reputation isolated). The SMTP password is stored AES-256-GCM encrypted in
-- `smtp_pass_encrypted` and is NEVER returned to the client.

CREATE TABLE IF NOT EXISTS public.email_provider_settings (
  id                  uuid        NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id             uuid        NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  smtp_host           text        NOT NULL,
  smtp_port           integer     NOT NULL DEFAULT 587,
  smtp_secure         boolean     NOT NULL DEFAULT false,
  smtp_user           text,
  smtp_pass_encrypted text,       -- AES-256-GCM; server-side only
  from_email          text        NOT NULL,
  from_name           text,
  created_at          timestamptz NOT NULL DEFAULT now(),
  updated_at          timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_email_provider_settings_user_id
  ON public.email_provider_settings(user_id);

ALTER TABLE public.email_provider_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "email_provider_select_own"
  ON public.email_provider_settings FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "email_provider_insert_own"
  ON public.email_provider_settings FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "email_provider_update_own"
  ON public.email_provider_settings FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "email_provider_delete_own"
  ON public.email_provider_settings FOR DELETE
  USING (auth.uid() = user_id);

CREATE TRIGGER set_email_provider_settings_updated_at
  BEFORE UPDATE ON public.email_provider_settings
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();
