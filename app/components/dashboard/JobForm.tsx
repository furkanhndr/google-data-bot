'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { useToast } from '@/components/ui/Toast'

const CATEGORY_OPTIONS = [
  '', 'Restoran', 'Kafe', 'Otel', 'Hastane', 'Diş Kliniği',
  'Eczane', 'Güzellik Salonu', 'Spor Salonu', 'Oto Servis',
  'Hukuk Bürosu', 'Muhasebe', 'Emlak', 'Diğer',
]

export function JobForm() {
  const router   = useRouter()
  const { toast } = useToast()

  const [query,      setQuery]      = useState('')
  const [location,   setLocation]   = useState('')
  const [category,   setCategory]   = useState('')
  const [maxResults, setMaxResults] = useState(60)
  const [minRating,  setMinRating]  = useState('')
  const [loading,    setLoading]    = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)

    const res = await fetch('/api/jobs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query,
        location,
        filters: {
          max_results: maxResults,
          ...(category   && { category }),
          ...(minRating  && { min_rating: parseFloat(minRating) }),
        },
      }),
    })

    const data = await res.json()

    if (!res.ok) {
      toast(data.error ?? 'Bir hata oluştu.', 'error')
      setLoading(false)
      return
    }

    toast('İş oluşturuldu! Veri toplama otomatik başlayacak.', 'success')
    router.push(`/dashboard/jobs/${data.job.id}`)
  }

  return (
    <form onSubmit={handleSubmit}>
      <Card>
        <h2 className="mb-6 text-lg font-semibold text-text">
          İş Detayları
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
          <Input
            label="Arama Sorgusu"
            placeholder="örn: Diş kliniği, Restoran, Avukat"
            value={query}
            onChange={e => setQuery(e.target.value)}
            required
            hint="Google Maps'te aranacak işletme türü"
          />
          <Input
            label="Konum"
            placeholder="örn: Kadıköy, İstanbul"
            value={location}
            onChange={e => setLocation(e.target.value)}
            required
            hint="Şehir, ilçe veya tam adres"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-6">
          {/* Category */}
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-text">
              Kategori <span className="text-textMuted font-normal">(opsiyonel)</span>
            </label>
            <select
              value={category}
              onChange={e => setCategory(e.target.value)}
              className="px-3 py-2 border border-border rounded-lg text-base text-text bg-white outline-none cursor-pointer"
            >
              {CATEGORY_OPTIONS.map(opt => (
                <option key={opt} value={opt}>{opt || 'Tümü'}</option>
              ))}
            </select>
          </div>

          {/* Max results */}
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-text">
              Maks. Sonuç
            </label>
            <input
              type="number"
              min={1}
              max={60}
              value={maxResults}
              onChange={e => setMaxResults(Math.min(60, parseInt(e.target.value) || 60))}
              className="px-3 py-2 border border-border rounded-lg text-base text-text bg-white outline-none"
            />
          </div>

          {/* Min rating */}
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-text">
              Min. Puan <span className="text-textMuted font-normal">(opsiyonel)</span>
            </label>
            <select
              value={minRating}
              onChange={e => setMinRating(e.target.value)}
              className="px-3 py-2 border border-border rounded-lg text-base text-text bg-white outline-none cursor-pointer"
            >
              <option value="">Tümü</option>
              <option value="3">3+ ⭐</option>
              <option value="3.5">3.5+ ⭐</option>
              <option value="4">4+ ⭐</option>
              <option value="4.5">4.5+ ⭐</option>
            </select>
          </div>
        </div>

        {/* Info box */}
        <div className="px-4 py-3 mb-6 bg-primaryLight border border-blue-200 rounded-lg text-sm text-primary flex items-start gap-2">
          <span>ℹ</span>
          <span>
            İş oluşturulduktan sonra veri toplama sunucuda otomatik başlar.
            Sonuçlar bu sayfaya canlı olarak yansıyacak.
          </span>
        </div>

        <div className="px-4 py-3 mb-6 bg-warningLight border border-yellow-300 rounded-lg text-sm text-warning">
          <div className="font-semibold mb-1">Kredi kullanımı</div>
          <div>
            Bu arama en fazla <strong>{maxResults}</strong> kredi harcar.
          </div>
          <div className="mt-1 text-xs text-textMuted">
            Başarısız aramalarda kredi düşülmez; kredi yalnızca başarıyla kaydedilen sonuç kadar harcanır.
          </div>
        </div>

        <div className="flex gap-3 justify-end">
          <Button
            type="button"
            variant="secondary"
            onClick={() => router.back()}
          >
            İptal
          </Button>
          <Button type="submit" loading={loading}>
            İş Oluştur
          </Button>
        </div>
      </Card>
    </form>
  )
}
