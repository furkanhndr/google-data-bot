import { Suspense } from 'react'
import { createClient } from '@/lib/supabase/server'
import { getEffectivePlan } from '@/lib/plan'
import { PREMIUM_PRICE_TRY, CREDIT_PACKAGES } from '@/lib/constants'
import { BillingPanel } from '@/components/dashboard/BillingPanel'

export default async function BillingPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const [{ data: profile }, { data: payments }] = await Promise.all([
    supabase.from('profiles').select('plan, premium_until').eq('id', user!.id).single(),
    supabase
      .from('payments')
      .select('id, amount, currency, plan, credits_amount, status, created_at')
      .eq('user_id', user!.id)
      .order('created_at', { ascending: false })
      .limit(20),
  ])

  const effectivePlan = profile ? getEffectivePlan(profile.plan, profile.premium_until) : 'free'

  return (
    <div className="p-8 max-w-[700px]">
      <h1 className="mb-6 text-2xl font-bold text-text">
        Faturalandırma
      </h1>

      <Suspense>
        <BillingPanel
          effectivePlan={effectivePlan}
          premiumUntil={profile?.premium_until ?? null}
          priceTRY={PREMIUM_PRICE_TRY}
          creditPackages={CREDIT_PACKAGES}
          payments={payments ?? []}
        />
      </Suspense>
    </div>
  )
}
