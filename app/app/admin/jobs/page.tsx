import { createServiceClient } from '@/lib/supabase/server'
import { JobStatusBadge } from '@/components/ui/Badge'
import { Card } from '@/components/ui/Card'
import { COLORS, FONT_SIZE } from '@/lib/constants'

function formatDate(iso: string) {
  return new Intl.DateTimeFormat('tr-TR', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  }).format(new Date(iso))
}

export default async function AdminJobsPage() {
  const serviceClient = await createServiceClient()

  const { data: jobs } = await serviceClient
    .from('scraping_jobs')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(100)

  const { data: authUsers } = await serviceClient.auth.admin.listUsers({ perPage: 1000 })
  const emailMap = new Map((authUsers?.users ?? []).map(u => [u.id, u.email]))

  return (
    <div style={{ padding: '32px' }}>
      <h1 style={{ margin: '0 0 8px', fontSize: FONT_SIZE['2xl'], fontWeight: '700', color: COLORS.text }}>
        Tüm İşler
      </h1>
      <p style={{ margin: '0 0 24px', fontSize: FONT_SIZE.sm, color: COLORS.textMuted }}>
        {jobs?.length ?? 0} iş gösteriliyor (son 100)
      </p>

      <Card padding="0">
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: FONT_SIZE.sm }}>
            <thead>
              <tr style={{ backgroundColor: COLORS.bg }}>
                {['Kullanıcı', 'Sorgu', 'Konum', 'Durum', 'Sonuç', 'Kaynak', 'Tarih'].map(h => (
                  <th key={h} style={{
                    padding: '10px 14px', textAlign: 'left',
                    fontWeight: '600', color: COLORS.textMuted,
                    borderBottom: `2px solid ${COLORS.border}`,
                    whiteSpace: 'nowrap',
                  }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {(jobs ?? []).length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ padding: '40px', textAlign: 'center', color: COLORS.textMuted }}>
                    Henüz iş yok.
                  </td>
                </tr>
              ) : (jobs ?? []).map(job => (
                <tr key={job.id} style={{ borderBottom: `1px solid ${COLORS.border}` }}>
                  <td style={{ padding: '10px 14px', color: COLORS.textMuted, fontSize: FONT_SIZE.xs }}>
                    {emailMap.get(job.user_id) ?? job.user_id.slice(0, 8) + '...'}
                  </td>
                  <td style={{ padding: '10px 14px', fontWeight: '500', color: COLORS.text, maxWidth: '160px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {job.query}
                  </td>
                  <td style={{ padding: '10px 14px', color: COLORS.textMuted, maxWidth: '130px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {job.location}
                  </td>
                  <td style={{ padding: '10px 14px' }}>
                    <JobStatusBadge status={job.status} />
                  </td>
                  <td style={{ padding: '10px 14px', fontWeight: '600', color: COLORS.text }}>
                    {job.scraped_count.toLocaleString('tr-TR')}
                  </td>
                  <td style={{ padding: '10px 14px', color: COLORS.textMuted, fontSize: FONT_SIZE.xs }}>
                    {job.source}
                  </td>
                  <td style={{ padding: '10px 14px', color: COLORS.textMuted, fontSize: FONT_SIZE.xs, whiteSpace: 'nowrap' }}>
                    {formatDate(job.created_at)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}
