'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { useToast } from '@/components/ui/Toast'
import { COLORS, FONT_SIZE } from '@/lib/constants'

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
  const [maxResults, setMaxResults] = useState(100)
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

    toast('İş oluşturuldu! Extension ile scraping başlatabilirsiniz.', 'success')
    router.push(`/dashboard/jobs/${data.job.id}`)
  }

  return (
    <form onSubmit={handleSubmit}>
      <Card>
        <h2 style={{ margin: '0 0 24px', fontSize: FONT_SIZE.lg, fontWeight: '600', color: COLORS.text }}>
          İş Detayları
        </h2>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
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

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '20px', marginBottom: '24px' }}>
          {/* Category */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <label style={{ fontSize: FONT_SIZE.sm, fontWeight: '500', color: COLORS.text }}>
              Kategori <span style={{ color: COLORS.textMuted, fontWeight: '400' }}>(opsiyonel)</span>
            </label>
            <select
              value={category}
              onChange={e => setCategory(e.target.value)}
              style={{
                padding: '9px 12px',
                border: `1px solid ${COLORS.border}`,
                borderRadius: '8px',
                fontSize: FONT_SIZE.base,
                color: COLORS.text,
                backgroundColor: '#fff',
                outline: 'none',
                cursor: 'pointer',
              }}
            >
              {CATEGORY_OPTIONS.map(opt => (
                <option key={opt} value={opt}>{opt || 'Tümü'}</option>
              ))}
            </select>
          </div>

          {/* Max results */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <label style={{ fontSize: FONT_SIZE.sm, fontWeight: '500', color: COLORS.text }}>
              Maks. Sonuç
            </label>
            <input
              type="number"
              min={1}
              max={5000}
              value={maxResults}
              onChange={e => setMaxResults(parseInt(e.target.value) || 100)}
              style={{
                padding: '9px 12px',
                border: `1px solid ${COLORS.border}`,
                borderRadius: '8px',
                fontSize: FONT_SIZE.base,
                color: COLORS.text,
                backgroundColor: '#fff',
                outline: 'none',
              }}
            />
          </div>

          {/* Min rating */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <label style={{ fontSize: FONT_SIZE.sm, fontWeight: '500', color: COLORS.text }}>
              Min. Puan <span style={{ color: COLORS.textMuted, fontWeight: '400' }}>(opsiyonel)</span>
            </label>
            <select
              value={minRating}
              onChange={e => setMinRating(e.target.value)}
              style={{
                padding: '9px 12px',
                border: `1px solid ${COLORS.border}`,
                borderRadius: '8px',
                fontSize: FONT_SIZE.base,
                color: COLORS.text,
                backgroundColor: '#fff',
                outline: 'none',
                cursor: 'pointer',
              }}
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
        <div style={{
          padding: '12px 16px', marginBottom: '24px',
          backgroundColor: COLORS.primaryLight,
          border: `1px solid #BFDBFE`,
          borderRadius: '8px',
          fontSize: FONT_SIZE.sm, color: COLORS.primary,
          display: 'flex', alignItems: 'flex-start', gap: '8px',
        }}>
          <span>ℹ</span>
          <span>
            İş oluşturduktan sonra Chrome Extension ile Google Maps sekmesini açık tutarak scraping başlatın.
            Sonuçlar bu sayfaya otomatik yansıyacak.
          </span>
        </div>

        <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
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
