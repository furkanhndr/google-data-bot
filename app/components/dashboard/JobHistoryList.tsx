import Link from 'next/link'
import { JobStatusBadge } from '@/components/ui/Badge'
import { COLORS, FONT_SIZE, RADIUS, SHADOW } from '@/lib/constants'
import type { ScrapingJob } from '@googlebusinessdata/shared-types'

function formatDate(iso: string) {
  return new Intl.DateTimeFormat('tr-TR', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  }).format(new Date(iso))
}

export function JobHistoryList({ jobs }: { jobs: ScrapingJob[] }) {
  if (jobs.length === 0) {
    return (
      <div style={{
        textAlign: 'center', padding: '64px 24px',
        color: COLORS.textMuted, fontSize: FONT_SIZE.sm,
      }}>
        <div style={{ fontSize: '40px', marginBottom: '12px' }}>⚡</div>
        <div style={{ fontWeight: '600', color: COLORS.text, marginBottom: '6px' }}>Henüz iş yok</div>
        <div>İlk scraping işinizi başlatmak için "Yeni İş" butonuna tıklayın.</div>
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
      {jobs.map(job => (
        <Link key={job.id} href={`/dashboard/jobs/${job.id}`} style={{ textDecoration: 'none' }}>
          <div style={{
            backgroundColor: COLORS.bgCard,
            border: `1px solid ${COLORS.border}`,
            borderRadius: RADIUS.md,
            padding: '16px 20px',
            boxShadow: SHADOW.sm,
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
            cursor: 'pointer',
            transition: 'border-color 0.15s',
          }}>
            {/* Icon */}
            <div style={{
              width: '40px', height: '40px', flexShrink: 0,
              backgroundColor: COLORS.primaryLight,
              borderRadius: RADIUS.md,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '18px',
            }}>🔍</div>

            {/* Info */}
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{
                fontWeight: '600', color: COLORS.text,
                fontSize: FONT_SIZE.sm,
                overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
              }}>
                {job.query} — {job.location}
              </div>
              <div style={{ fontSize: FONT_SIZE.xs, color: COLORS.textMuted, marginTop: '3px' }}>
                {formatDate(job.created_at)}
              </div>
            </div>

            {/* Stats */}
            <div style={{ textAlign: 'right', flexShrink: 0 }}>
              <div style={{ fontSize: FONT_SIZE.sm, fontWeight: '600', color: COLORS.text }}>
                {job.scraped_count.toLocaleString('tr-TR')} sonuç
              </div>
              <div style={{ marginTop: '4px' }}>
                <JobStatusBadge status={job.status} />
              </div>
            </div>

            <span style={{ color: COLORS.textLight, fontSize: '18px' }}>›</span>
          </div>
        </Link>
      ))}
    </div>
  )
}
