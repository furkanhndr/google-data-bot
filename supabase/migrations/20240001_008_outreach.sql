-- Migration: 008 — Outreach settings, templates, and events
-- Run order: after 007_realtime.sql

-- ============================================================
-- outreach_settings
-- Per-user sender identity used when rendering message templates.
-- ============================================================
CREATE TABLE IF NOT EXISTS public.outreach_settings (
  id                uuid        NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id           uuid        NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  sender_name       text,
  company_name      text,
  sender_email      text,
  reply_to_email    text,
  sender_phone      text,
  website           text,
  email_signature   text,
  created_at        timestamptz NOT NULL DEFAULT now(),
  updated_at        timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_outreach_settings_user_id ON public.outreach_settings(user_id);

-- ============================================================
-- message_templates
-- User-defined WhatsApp/email templates with variable placeholders.
-- ============================================================
CREATE TABLE IF NOT EXISTS public.message_templates (
  id          uuid        NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  channel     text        NOT NULL CHECK (channel IN ('whatsapp', 'email')),
  name        text        NOT NULL,
  subject     text,
  body        text        NOT NULL,
  is_default  boolean     NOT NULL DEFAULT false,
  is_active   boolean     NOT NULL DEFAULT true,
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_message_templates_user_id ON public.message_templates(user_id);
CREATE INDEX IF NOT EXISTS idx_message_templates_channel ON public.message_templates(channel);

-- ============================================================
-- lead_outreach_status
-- Manual lead status tracking for outreach workflow.
-- ============================================================
CREATE TABLE IF NOT EXISTS public.lead_outreach_status (
  id                  uuid        NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id             uuid        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  business_result_id  uuid        NOT NULL REFERENCES public.business_results(id) ON DELETE CASCADE,
  status              text        NOT NULL DEFAULT 'new'
                                  CHECK (status IN ('new', 'prepared', 'whatsapp_opened', 'email_draft_opened', 'sent', 'replied', 'not_interested', 'customer')),
  last_channel        text        CHECK (last_channel IN ('whatsapp', 'email')),
  last_template_id    uuid        REFERENCES public.message_templates(id) ON DELETE SET NULL,
  last_contacted_at   timestamptz,
  notes               text,
  created_at          timestamptz NOT NULL DEFAULT now(),
  updated_at          timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, business_result_id)
);

CREATE INDEX IF NOT EXISTS idx_lead_outreach_status_user_id ON public.lead_outreach_status(user_id);
CREATE INDEX IF NOT EXISTS idx_lead_outreach_status_result_id ON public.lead_outreach_status(business_result_id);

-- ============================================================
-- outreach_events
-- Immutable history of prepared/opened/copied/sent outreach actions.
-- ============================================================
CREATE TABLE IF NOT EXISTS public.outreach_events (
  id                  uuid        NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id             uuid        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  business_result_id  uuid        NOT NULL REFERENCES public.business_results(id) ON DELETE CASCADE,
  template_id         uuid        REFERENCES public.message_templates(id) ON DELETE SET NULL,
  channel             text        NOT NULL CHECK (channel IN ('whatsapp', 'email')),
  event_type          text        NOT NULL CHECK (event_type IN ('prepared', 'copied', 'opened', 'sent', 'failed')),
  subject             text,
  body                text,
  provider            text,
  provider_message_id text,
  error_message       text,
  created_at          timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_outreach_events_user_id ON public.outreach_events(user_id);
CREATE INDEX IF NOT EXISTS idx_outreach_events_result_id ON public.outreach_events(business_result_id);

-- ============================================================
-- RLS
-- ============================================================
ALTER TABLE public.outreach_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.message_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lead_outreach_status ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.outreach_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "outreach_settings_select_own"
  ON public.outreach_settings FOR SELECT
  USING (auth.uid() = user_id OR public.is_admin());

CREATE POLICY "outreach_settings_insert_own"
  ON public.outreach_settings FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "outreach_settings_update_own"
  ON public.outreach_settings FOR UPDATE
  USING (auth.uid() = user_id OR public.is_admin())
  WITH CHECK (auth.uid() = user_id OR public.is_admin());

CREATE POLICY "message_templates_select_own"
  ON public.message_templates FOR SELECT
  USING (auth.uid() = user_id OR public.is_admin());

CREATE POLICY "message_templates_insert_own"
  ON public.message_templates FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "message_templates_update_own"
  ON public.message_templates FOR UPDATE
  USING (auth.uid() = user_id OR public.is_admin())
  WITH CHECK (auth.uid() = user_id OR public.is_admin());

CREATE POLICY "message_templates_delete_own"
  ON public.message_templates FOR DELETE
  USING (auth.uid() = user_id OR public.is_admin());

CREATE POLICY "lead_outreach_status_select_own"
  ON public.lead_outreach_status FOR SELECT
  USING (auth.uid() = user_id OR public.is_admin());

CREATE POLICY "lead_outreach_status_insert_own"
  ON public.lead_outreach_status FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "lead_outreach_status_update_own"
  ON public.lead_outreach_status FOR UPDATE
  USING (auth.uid() = user_id OR public.is_admin())
  WITH CHECK (auth.uid() = user_id OR public.is_admin());

CREATE POLICY "outreach_events_select_own"
  ON public.outreach_events FOR SELECT
  USING (auth.uid() = user_id OR public.is_admin());

CREATE POLICY "outreach_events_insert_own"
  ON public.outreach_events FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Keep updated_at current.
CREATE TRIGGER set_outreach_settings_updated_at
  BEFORE UPDATE ON public.outreach_settings
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER set_message_templates_updated_at
  BEFORE UPDATE ON public.message_templates
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER set_lead_outreach_status_updated_at
  BEFORE UPDATE ON public.lead_outreach_status
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();
