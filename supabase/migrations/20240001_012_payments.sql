-- Migration: 012 — Payments (iyzico)
-- Run order: 12th
--
-- Premium is sold as a one-time 30-day pass, paid via iyzico's hosted
-- Checkout Form. There is no recurring/subscription billing: the user pays
-- again to renew. `profiles.premium_until` tracks the expiry; when it's null
-- the premium grant is treated as permanent (used for admin-granted premium,
-- which never expires). Effective plan is computed in app code
-- (see app/lib/plan.ts getEffectivePlan) rather than trusted blindly from
-- `profiles.plan`, since a paid premium can silently expire.

ALTER TABLE public.profiles
  ADD COLUMN premium_until timestamptz;

-- ============================================================
-- payments
-- One row per checkout attempt. Created as 'pending' before redirecting the
-- user to iyzico, then flipped to 'success'/'failed' from the callback after
-- iyzico's result is verified server-side (retrieve-by-token, never trusted
-- from the redirect alone).
-- ============================================================
CREATE TABLE public.payments (
  id               uuid        NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id          uuid        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  conversation_id  text        NOT NULL UNIQUE,
  iyzico_token     text,
  iyzico_payment_id text,
  amount           numeric(10, 2) NOT NULL,
  currency         text        NOT NULL DEFAULT 'TRY',
  -- 'premium' = 30-day pass (period_days applies). 'credits' = one-time
  -- top-up added straight to profiles.credits_total (credits_amount applies),
  -- independent of plan/expiry — usable by free and premium accounts alike.
  plan             text        NOT NULL DEFAULT 'premium' CHECK (plan IN ('premium', 'credits')),
  period_days      integer     NOT NULL DEFAULT 30,
  credits_amount   integer,
  status           text        NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'success', 'failed')),
  -- iyzico requires buyer name/identity/address/phone at checkout time. We
  -- don't have a persistent billing-profile table yet, so it's captured
  -- ad-hoc per purchase here instead.
  buyer_info       jsonb       NOT NULL DEFAULT '{}',
  failure_reason   text,
  created_at       timestamptz NOT NULL DEFAULT now(),
  updated_at       timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX payments_user_id_idx ON public.payments(user_id);

ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

-- Users can read their own payment history. All writes happen server-side
-- via the service role (checkout creation + callback verification), so there
-- are no insert/update policies for the authenticated role.
CREATE POLICY "payments_select_own"
  ON public.payments FOR SELECT
  USING (auth.uid() = user_id OR public.is_admin());

CREATE TRIGGER set_payments_updated_at
  BEFORE UPDATE ON public.payments
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Atomic credit top-up — avoids a read-then-write race if a user somehow
-- has two successful credit purchases land at nearly the same time.
CREATE OR REPLACE FUNCTION public.increment_credits(p_user_id uuid, p_amount integer)
RETURNS void
LANGUAGE sql
SECURITY DEFINER
AS $$
  UPDATE public.profiles
  SET credits_total = credits_total + p_amount
  WHERE id = p_user_id;
$$;
