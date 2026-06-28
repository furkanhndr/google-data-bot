'use client'

import { useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { useToast } from '@/components/ui/Toast'
import type { UserPlan } from '@googlebusinessdata/shared-types'

interface PaymentRow {
  id: string
  amount: number
  currency: string
  plan: 'premium' | 'credits'
  credits_amount: number | null
  status: 'pending' | 'success' | 'failed'
  created_at: string
}

interface CreditPackage {
  id: string
  credits: number
  priceTRY: number
}

interface BillingPanelProps {
  effectivePlan: UserPlan
  premiumUntil: string | null
  priceTRY: number
  creditPackages: readonly CreditPackage[]
  payments: PaymentRow[]
}

const STATUS_LABEL: Record<PaymentRow['status'], { label: string; variant: 'success' | 'danger' | 'default' }> = {
  success: { label: 'Başarılı', variant: 'success' },
  failed:  { label: 'Başarısız', variant: 'danger' },
  pending: { label: 'Beklemede', variant: 'default' },
}

type Product = 'premium' | string

export function BillingPanel({ effectivePlan, premiumUntil, priceTRY, creditPackages, payments }: BillingPanelProps) {
  const searchParams = useSearchParams()
  const { toast } = useToast()
  const status = searchParams.get('status')
  const purchaseType = searchParams.get('type')

  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    name: '', surname: '', identityNumber: '', gsmNumber: '', address: '', city: '',
  })

  function update(field: keyof typeof form, value: string) {
    setForm(f => ({ ...f, [field]: value }))
  }

  async function handlePay(e: React.FormEvent) {
    e.preventDefault()
    if (!selectedProduct) return
    setLoading(true)

    const res = await fetch('/api/payments/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, product: selectedProduct }),
    })
    const data = await res.json()

    if (!res.ok) {
      toast(data.error ?? 'Ödeme başlatılamadı.', 'error')
      setLoading(false)
      return
    }

    window.location.href = data.paymentPageUrl
  }

  const selectedPackage = selectedProduct && selectedProduct !== 'premium'
    ? creditPackages.find(p => p.id === selectedProduct)
    : undefined

  return (
    <div className="flex flex-col gap-4">
      {status === 'success' && (
        <div className="px-4 py-3 bg-successLight border border-green-300 rounded-lg text-sm text-success">
          {purchaseType === 'credits'
            ? 'Ödemeniz alındı, kredileriniz hesabınıza eklendi.'
            : 'Ödemeniz alındı, premium üyeliğiniz aktif edildi.'}
        </div>
      )}
      {status === 'failed' && (
        <div className="px-4 py-3 bg-dangerLight border border-red-300 rounded-lg text-sm text-danger">
          Ödeme tamamlanamadı. Kart bilgilerinizi kontrol edip tekrar deneyin.
        </div>
      )}
      {status === 'error' && (
        <div className="px-4 py-3 bg-dangerLight border border-red-300 rounded-lg text-sm text-danger">
          Ödeme işlenirken bir hata oluştu. Lütfen tekrar deneyin veya destek ile iletişime geçin.
        </div>
      )}

      <Card>
        <div className="flex items-center justify-between mb-1">
          <h2 className="text-lg font-semibold text-text">Premium Üyelik</h2>
          <Badge variant={effectivePlan === 'premium' ? 'success' : 'default'}>
            {effectivePlan === 'premium' ? '⭐ Premium' : 'Ücretsiz'}
          </Badge>
        </div>

        {effectivePlan === 'premium' && premiumUntil ? (
          <p className="text-sm text-textMuted mb-4">
            Premium üyeliğiniz{' '}
            <strong className="text-text">
              {new Intl.DateTimeFormat('tr-TR', { day: '2-digit', month: 'long', year: 'numeric' }).format(new Date(premiumUntil))}
            </strong>{' '}
            tarihine kadar aktif. Süre dolmadan tekrar ödeme yaparsanız kalan günlerin üzerine eklenir.
          </p>
        ) : (
          <p className="text-sm text-textMuted mb-4">
            Sınırsız tarama hakkı ve yüksek günlük iş limiti için premium&apos;a geçin.
          </p>
        )}

        <p className="text-2xl font-bold text-text mb-4">
          {priceTRY.toLocaleString('tr-TR')} ₺ <span className="text-sm font-normal text-textMuted">/ 30 gün</span>
        </p>

        {selectedProduct !== 'premium' && (
          <Button onClick={() => setSelectedProduct('premium')}>
            {effectivePlan === 'premium' ? 'Premium\'u Uzat' : 'Premium\'a Geç'}
          </Button>
        )}
      </Card>

      <Card>
        <h2 className="text-lg font-semibold text-text mb-1">Ek Kredi Satın Al</h2>
        <p className="text-sm text-textMuted mb-4">
          {effectivePlan === 'premium'
            ? 'Premium planında kredi limiti yoktur, ek kredi almanıza gerek yok — ama isterseniz biriktirebilirsiniz.'
            : 'Aylık kredinizi tükettiyseniz, plan kotanızdan bağımsız olarak anında ek kredi satın alabilirsiniz. Krediler süresiz geçerlidir.'}
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {creditPackages.map(pkg => (
            <button
              key={pkg.id}
              type="button"
              onClick={() => setSelectedProduct(pkg.id)}
              className={`flex flex-col items-start gap-1 p-3.5 rounded-lg border-2 cursor-pointer text-left transition-colors ${
                selectedProduct === pkg.id
                  ? 'border-primary bg-primaryLight'
                  : 'border-border bg-white hover:border-blue-300'
              }`}
            >
              <span className="text-base font-semibold text-text">{pkg.credits.toLocaleString('tr-TR')} kredi</span>
              <span className="text-sm text-textMuted">{pkg.priceTRY.toLocaleString('tr-TR')} ₺</span>
            </button>
          ))}
        </div>
      </Card>

      {selectedProduct && (
        <Card>
          <h2 className="text-lg font-semibold text-text mb-1">Fatura Bilgileri</h2>
          <p className="text-sm text-textMuted mb-4">
            Satın alınacak:{' '}
            <strong className="text-text">
              {selectedPackage ? `${selectedPackage.credits.toLocaleString('tr-TR')} Kredi` : 'Premium Üyelik (30 gün)'}
            </strong>{' '}
            — {(selectedPackage?.priceTRY ?? priceTRY).toLocaleString('tr-TR')} ₺
          </p>
          <form onSubmit={handlePay} className="flex flex-col gap-4 max-w-md">
            <p className="text-xs text-textMuted -mt-1">
              iyzico ödeme formuna yönlendirilmeden önce fatura bilgilerinizi girin.
            </p>
            <div className="grid grid-cols-2 gap-3">
              <Input label="Ad" required value={form.name} onChange={e => update('name', e.target.value)} />
              <Input label="Soyad" required value={form.surname} onChange={e => update('surname', e.target.value)} />
            </div>
            <Input
              label="TC Kimlik No"
              required
              inputMode="numeric"
              maxLength={11}
              value={form.identityNumber}
              onChange={e => update('identityNumber', e.target.value.replace(/\D/g, ''))}
              hint="iyzico ödeme altyapısının zorunlu kıldığı fatura bilgisi"
            />
            <Input
              label="Telefon"
              required
              placeholder="05XXXXXXXXX"
              value={form.gsmNumber}
              onChange={e => update('gsmNumber', e.target.value)}
            />
            <Input label="Adres" required value={form.address} onChange={e => update('address', e.target.value)} />
            <Input label="Şehir" required value={form.city} onChange={e => update('city', e.target.value)} />

            <div className="flex gap-2.5">
              <Button type="button" variant="secondary" onClick={() => setSelectedProduct(null)}>İptal</Button>
              <Button type="submit" loading={loading}>Ödemeye Geç</Button>
            </div>
          </form>
        </Card>
      )}

      <Card>
        <h2 className="text-lg font-semibold text-text mb-4">Ödeme Geçmişi</h2>
        {payments.length === 0 ? (
          <p className="text-sm text-textMuted">Henüz bir ödeme yapılmadı.</p>
        ) : (
          <div className="flex flex-col gap-2">
            {payments.map(p => (
              <div key={p.id} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                <div>
                  <div className="text-sm text-text font-medium">
                    {p.plan === 'credits' ? `${p.credits_amount?.toLocaleString('tr-TR')} Kredi` : 'Premium Üyelik'}
                    {' — '}
                    {p.amount.toLocaleString('tr-TR')} {p.currency}
                  </div>
                  <div className="text-xs text-textMuted">
                    {new Intl.DateTimeFormat('tr-TR', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }).format(new Date(p.created_at))}
                  </div>
                </div>
                <Badge variant={STATUS_LABEL[p.status].variant}>{STATUS_LABEL[p.status].label}</Badge>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  )
}
