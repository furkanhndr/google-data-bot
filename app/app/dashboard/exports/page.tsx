import { createClient } from '@/lib/supabase/server'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { COLORS, FONT_SIZE } from '@/lib/constants'

function formatDate(iso: string) {
  return new Intl.DateTimeFormat('tr-TR', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  }).format(new Date(iso))
}

function formatBytes(bytes: number | null) {
  if (!bytes) return '—'
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export default async function ExportsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: exports } = await supabase
    .from('export_history')
    .select('*')
    .eq('user_id', user!.id)
    .order('created_at', { ascending: false })
    .limit(50)

  return (
    <div style={{ padding: '32px' }}>
      <h1 style={{ margin: '0 0 24px', fontSize: FONT_SIZE['2xl'], fontWeight: '700', color: COLORS.text }}>
        Dışa Aktarma Geçmişi
      </h1>

      {(!exports || exports.length === 0) ? (
        <Card>
          <div style={{ textAlign: 'center', padding: '40px', color: COLORS.textMuted }}>
            <div style={{ fontSize: '40px', marginBottom: '12px' }}>📤</div>
            <div style={{ fontWeight: '600', color: COLORS.text }}>Henüz dışa aktarma yok</div>
            <div style={{ marginTop: '6px', fontSize: FONT_SIZE.sm }}>
              Tamamlanmış bir iş sonucunu dışa aktardığınızda burada görünecek.
            </div>
          </div>
        </Card>
      ) : (
        <Card padding="0">
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: FONT_SIZE.sm }}>
            <thead>
              <tr style={{ backgroundColor: COLORS.bg }}>
                {['Tarih', 'Format', 'Satır', 'Boyut', 'İndir'].map(h => (
                  <th key={h} style={{
                    padding: '12px 16px', textAlign: 'left',
                    fontWeight: '600', color: COLORS.textMuted,
                    borderBottom: `2px solid ${COLORS.border}`,
                  }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {exports.map((exp) => (
                <tr key={exp.id} style={{ borderBottom: `1px solid ${COLORS.border}` }}>
                  <td style={{ padding: '12px 16px', color: COLORS.text }}>{formatDate(exp.created_at)}</td>
                  <td style={{ padding: '12px 16px' }}>
                    <Badge variant={exp.format === 'xlsx' ? 'success' : 'info'}>
                      {exp.format.toUpperCase()}
                    </Badge>
                  </td>
                  <td style={{ padding: '12px 16px', color: COLORS.text }}>
                    {exp.row_count.toLocaleString('tr-TR')}
                  </td>
                  <td style={{ padding: '12px 16px', color: COLORS.textMuted }}>
                    {formatBytes(exp.file_size_bytes)}
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    {exp.download_url ? (
                      <a
                        href={exp.download_url}
                        download
                        style={{ color: COLORS.primary, fontSize: FONT_SIZE.sm, textDecoration: 'none', fontWeight: '500' }}
                      >
                        ↓ İndir
                      </a>
                    ) : (
                      <span style={{ color: COLORS.textLight, fontSize: FONT_SIZE.xs }}>Süresi doldu</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}
    </div>
  )
}
