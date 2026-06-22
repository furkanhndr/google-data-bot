'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { useToast } from '@/components/ui/Toast'
import { COLORS, FONT_SIZE, RADIUS } from '@/lib/constants'

interface ExportPanelProps {
  jobId: string
  resultCount: number
}

export function ExportPanel({ jobId, resultCount }: ExportPanelProps) {
  const [format,   setFormat]   = useState<'csv' | 'xlsx'>('csv')
  const [loading,  setLoading]  = useState(false)
  const { toast } = useToast()

  async function handleExport() {
    setLoading(true)
    const res = await fetch(`/api/jobs/${jobId}/export`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ format }),
    })

    const data = await res.json()

    if (!res.ok) {
      toast(data.error ?? 'Export başarısız.', 'error')
      setLoading(false)
      return
    }

    // Auto-download
    const a = document.createElement('a')
    a.href = data.url
    a.download = data.filename
    a.click()

    toast(`${resultCount.toLocaleString('tr-TR')} satır ${format.toUpperCase()} olarak indirildi.`, 'success')
    setLoading(false)
  }

  return (
    <div style={{
      backgroundColor: COLORS.successLight,
      border: `1px solid #86EFAC`,
      borderRadius: RADIUS.lg,
      padding: '16px 20px',
      marginBottom: '24px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: '16px',
      flexWrap: 'wrap',
    }}>
      <div>
        <div style={{ fontWeight: '600', color: COLORS.success, fontSize: FONT_SIZE.sm }}>
          ✓ İş tamamlandı — {resultCount.toLocaleString('tr-TR')} sonuç hazır
        </div>
        <div style={{ fontSize: FONT_SIZE.xs, color: '#166534', marginTop: '2px' }}>
          Tüm verileri dışa aktarmak için format seçin.
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        {/* Format toggle */}
        <div style={{
          display: 'flex',
          border: `1px solid #86EFAC`,
          borderRadius: RADIUS.md,
          overflow: 'hidden',
        }}>
          {(['csv', 'xlsx'] as const).map(f => (
            <button
              key={f}
              onClick={() => setFormat(f)}
              style={{
                padding: '6px 14px',
                border: 'none',
                cursor: 'pointer',
                fontSize: FONT_SIZE.sm,
                fontWeight: '500',
                backgroundColor: format === f ? COLORS.success : 'transparent',
                color: format === f ? '#fff' : COLORS.success,
                transition: 'background-color 0.15s',
              }}
            >
              {f.toUpperCase()}
            </button>
          ))}
        </div>

        <Button
          size="sm"
          loading={loading}
          onClick={handleExport}
          style={{ backgroundColor: COLORS.success }}
        >
          ↓ İndir
        </Button>
      </div>
    </div>
  )
}
