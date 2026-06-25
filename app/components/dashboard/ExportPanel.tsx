'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { useToast } from '@/components/ui/Toast'

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
    <div className="bg-successLight border border-green-300 rounded-lg px-5 py-4 mb-6 flex items-center justify-between gap-4 flex-wrap">
      <div>
        <div className="font-semibold text-success text-sm">
          ✓ İş tamamlandı — {resultCount.toLocaleString('tr-TR')} sonuç hazır
        </div>
        <div className="text-xs text-green-800 mt-0.5">
          Tüm verileri dışa aktarmak için format seçin.
        </div>
      </div>

      <div className="flex items-center gap-2.5">
        {/* Format toggle */}
        <div className="flex border border-green-300 rounded-md overflow-hidden">
          {(['csv', 'xlsx'] as const).map(f => (
            <button
              key={f}
              onClick={() => setFormat(f)}
              className={`px-3.5 py-1.5 border-none cursor-pointer text-sm font-medium transition-colors ${
                format === f ? 'bg-success text-white' : 'bg-transparent text-success'
              }`}
            >
              {f.toUpperCase()}
            </button>
          ))}
        </div>

        <Button
          size="sm"
          loading={loading}
          onClick={handleExport}
          className="bg-success"
        >
          ↓ İndir
        </Button>
      </div>
    </div>
  )
}
