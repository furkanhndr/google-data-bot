import { JobForm } from '@/components/dashboard/JobForm'
import { COLORS, FONT_SIZE } from '@/lib/constants'

export default function NewJobPage() {
  return (
    <div style={{ padding: '32px', maxWidth: '800px' }}>
      <div style={{ marginBottom: '28px' }}>
        <h1 style={{ margin: 0, fontSize: FONT_SIZE['2xl'], fontWeight: '700', color: COLORS.text }}>
          Yeni İş
        </h1>
        <p style={{ margin: '4px 0 0', fontSize: FONT_SIZE.sm, color: COLORS.textMuted }}>
          Google Maps'ten çekilecek veri için parametreleri belirleyin.
        </p>
      </div>
      <JobForm />
    </div>
  )
}
