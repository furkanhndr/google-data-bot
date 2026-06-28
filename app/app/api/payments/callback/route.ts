import { NextResponse, type NextRequest } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import { retrieveCheckoutForm } from '@/lib/iyzico'
import { PREMIUM_PERIOD_DAYS } from '@/lib/constants'

// POST /api/payments/callback — iyzico redirects the buyer's browser here
// (form POST) after the hosted Checkout Form closes. The token in the body
// is NOT proof of payment by itself; we look it up via a signed
// server-to-server call (retrieveCheckoutForm) and only trust that result.
export async function POST(request: NextRequest) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? request.nextUrl.origin
  const formData = await request.formData().catch(() => null)
  const token = formData?.get('token')?.toString()

  if (!token) {
    return NextResponse.redirect(`${appUrl}/dashboard/billing?status=error`, { status: 302 })
  }

  const service = await createServiceClient()
  const { data: payment } = await service
    .from('payments')
    .select('*')
    .eq('iyzico_token', token)
    .maybeSingle()

  if (!payment) {
    return NextResponse.redirect(`${appUrl}/dashboard/billing?status=error`, { status: 302 })
  }

  // Already processed (e.g. iyzico retried the callback) — don't re-credit.
  if (payment.status === 'success') {
    return NextResponse.redirect(`${appUrl}/dashboard/billing?status=success&type=${payment.plan}`, { status: 302 })
  }

  try {
    const result = await retrieveCheckoutForm({ token, conversationId: payment.conversation_id })

    if (result.status !== 'success') {
      await service.from('payments')
        .update({ status: 'failed', failure_reason: result.errorMessage ?? 'payment_not_successful' })
        .eq('id', payment.id)
      return NextResponse.redirect(`${appUrl}/dashboard/billing?status=failed`, { status: 302 })
    }

    if (payment.plan === 'credits') {
      const { error: rpcError } = await service.rpc('increment_credits', {
        p_user_id: payment.user_id,
        p_amount: payment.credits_amount,
      })
      if (rpcError) throw new Error(rpcError.message)
    } else {
      const { data: profile } = await service
        .from('profiles')
        .select('plan, premium_until')
        .eq('id', payment.user_id)
        .single()

      const now = new Date()
      const currentExpiry = profile?.plan === 'premium' && profile.premium_until
        ? new Date(profile.premium_until)
        : now
      const base = currentExpiry > now ? currentExpiry : now
      const premiumUntil = new Date(base.getTime() + PREMIUM_PERIOD_DAYS * 24 * 60 * 60 * 1000)

      await service.from('profiles')
        .update({ plan: 'premium', premium_until: premiumUntil.toISOString() })
        .eq('id', payment.user_id)
    }

    await service.from('payments')
      .update({
        status: 'success',
        iyzico_payment_id: (result as unknown as { paymentId?: string }).paymentId ?? null,
      })
      .eq('id', payment.id)

    return NextResponse.redirect(`${appUrl}/dashboard/billing?status=success&type=${payment.plan}`, { status: 302 })
  } catch {
    await service.from('payments')
      .update({ status: 'failed', failure_reason: 'callback_exception' })
      .eq('id', payment.id)
    return NextResponse.redirect(`${appUrl}/dashboard/billing?status=error`, { status: 302 })
  }
}
