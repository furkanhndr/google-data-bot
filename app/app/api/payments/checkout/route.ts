import { NextResponse, type NextRequest } from 'next/server'
import { createClient, createServiceClient } from '@/lib/supabase/server'
import { createCheckoutForm } from '@/lib/iyzico'
import { PREMIUM_PRICE_TRY, CREDIT_PACKAGES, type CreditPackageId } from '@/lib/constants'

// POST /api/payments/checkout — start an iyzico Checkout Form session for
// either the one-time 30-day premium pass, or a one-time credit top-up.
// Returns the hosted payment page URL; the client redirects the browser
// there.
export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json().catch(() => ({}))
  const { name, surname, identityNumber, gsmNumber, address, city, product } = body as {
    name?: string
    surname?: string
    identityNumber?: string
    gsmNumber?: string
    address?: string
    city?: string
    product?: 'premium' | CreditPackageId
  }

  if (!name?.trim() || !surname?.trim() || !identityNumber?.trim() || !gsmNumber?.trim() || !address?.trim() || !city?.trim()) {
    return NextResponse.json({ error: 'Fatura bilgileri eksik.' }, { status: 400 })
  }
  if (!/^\d{11}$/.test(identityNumber.trim())) {
    return NextResponse.json({ error: 'TC Kimlik No 11 haneli olmalıdır.' }, { status: 400 })
  }

  const creditPackage = product && product !== 'premium'
    ? CREDIT_PACKAGES.find(p => p.id === product)
    : undefined
  if (product !== 'premium' && !creditPackage) {
    return NextResponse.json({ error: 'Geçersiz ürün.' }, { status: 400 })
  }

  const price = creditPackage ? creditPackage.priceTRY : PREMIUM_PRICE_TRY
  const itemName = creditPackage ? `${creditPackage.credits} Kredi Paketi` : 'Premium Üyelik (30 gün)'

  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? request.nextUrl.origin
  const conversationId = crypto.randomUUID()
  const buyerInfo = {
    name: name.trim(),
    surname: surname.trim(),
    identityNumber: identityNumber.trim(),
    email: user.email ?? '',
    gsmNumber: gsmNumber.trim(),
    address: address.trim(),
    city: city.trim(),
  }

  const service = await createServiceClient()
  const { error: insertError } = await service.from('payments').insert({
    user_id: user.id,
    conversation_id: conversationId,
    amount: price,
    currency: 'TRY',
    plan: creditPackage ? 'credits' : 'premium',
    credits_amount: creditPackage?.credits ?? null,
    status: 'pending',
    buyer_info: buyerInfo,
  })
  if (insertError) return NextResponse.json({ error: insertError.message }, { status: 500 })

  try {
    const result = await createCheckoutForm({
      conversationId,
      price,
      callbackUrl: `${appUrl}/api/payments/callback`,
      buyer: buyerInfo,
      basketId: user.id,
      itemName,
      ip: request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || '85.34.78.112',
    })

    if (result.status !== 'success') {
      await service.from('payments')
        .update({ status: 'failed', failure_reason: result.errorMessage ?? 'checkout_init_failed' })
        .eq('conversation_id', conversationId)
      return NextResponse.json({ error: result.errorMessage ?? 'Ödeme başlatılamadı.' }, { status: 502 })
    }

    await service.from('payments')
      .update({ iyzico_token: result.token })
      .eq('conversation_id', conversationId)

    return NextResponse.json({ paymentPageUrl: result.paymentPageUrl })
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e)
    await service.from('payments')
      .update({ status: 'failed', failure_reason: message })
      .eq('conversation_id', conversationId)
    return NextResponse.json({ error: 'Ödeme başlatılamadı.' }, { status: 502 })
  }
}
