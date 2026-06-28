-- Migration: 011 — Email campaigns (Outreach Phase 3)
-- Run order: after 010_email_provider.sql
--
-- Bulk email campaigns. Sending is processed in client-driven batches (no
-- worker): the campaign detail page loops a run endpoint until done. WhatsApp
-- campaigns are intentionally NOT supported (manual wa.me only).

CREATE TABLE IF NOT EXISTS public.campaigns (
  id               uuid        NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id          uuid        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name             text        NOT NULL,
  channel          text        NOT NULL DEFAULT 'email' CHECK (channel IN ('email')),
  template_id      uuid        REFERENCES public.message_templates(id) ON DELETE SET NULL,
  status           text        NOT NULL DEFAULT 'draft'
                               CHECK (status IN ('draft', 'running', 'completed', 'stopped', 'failed')),
  daily_limit      integer     NOT NULL DEFAULT 50,
  total_recipients integer     NOT NULL DEFAULT 0,
  sent_count       integer     NOT NULL DEFAULT 0,
  failed_count     integer     NOT NULL DEFAULT 0,
  created_at       timestamptz NOT NULL DEFAULT now(),
  updated_at       timestamptz NOT NULL DEFAULT now(),
  started_at       timestamptz,
  completed_at     timestamptz
);

CREATE INDEX IF NOT EXISTS idx_campaigns_user_id ON public.campaigns(user_id);

CREATE TABLE IF NOT EXISTS public.campaign_recipients (
  id                  uuid        NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id         uuid        NOT NULL REFERENCES public.campaigns(id) ON DELETE CASCADE,
  user_id             uuid        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  business_result_id  uuid        NOT NULL REFERENCES public.business_results(id) ON DELETE CASCADE,
  status              text        NOT NULL DEFAULT 'pending'
                                  CHECK (status IN ('pending', 'sent', 'failed', 'skipped')),
  error_message       text,
  sent_at             timestamptz,
  created_at          timestamptz NOT NULL DEFAULT now(),
  UNIQUE (campaign_id, business_result_id)
);

CREATE INDEX IF NOT EXISTS idx_campaign_recipients_campaign ON public.campaign_recipients(campaign_id);
CREATE INDEX IF NOT EXISTS idx_campaign_recipients_pending
  ON public.campaign_recipients(campaign_id) WHERE status = 'pending';

-- ── RLS ──────────────────────────────────────────────────────
ALTER TABLE public.campaigns           ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.campaign_recipients ENABLE ROW LEVEL SECURITY;

CREATE POLICY "campaigns_select_own" ON public.campaigns FOR SELECT
  USING (auth.uid() = user_id OR public.is_admin());
CREATE POLICY "campaigns_insert_own" ON public.campaigns FOR INSERT
  WITH CHECK (auth.uid() = user_id);
CREATE POLICY "campaigns_update_own" ON public.campaigns FOR UPDATE
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "campaigns_delete_own" ON public.campaigns FOR DELETE
  USING (auth.uid() = user_id);

CREATE POLICY "campaign_recipients_select_own" ON public.campaign_recipients FOR SELECT
  USING (auth.uid() = user_id OR public.is_admin());
CREATE POLICY "campaign_recipients_insert_own" ON public.campaign_recipients FOR INSERT
  WITH CHECK (auth.uid() = user_id);
CREATE POLICY "campaign_recipients_update_own" ON public.campaign_recipients FOR UPDATE
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE TRIGGER set_campaigns_updated_at
  BEFORE UPDATE ON public.campaigns
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
