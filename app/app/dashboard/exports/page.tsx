import { createClient } from '@/lib/supabase/server'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'

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
    <div className="p-8">
      <h1 className="mb-6 text-2xl font-bold text-text">
        Dışa Aktarma Geçmişi
      </h1>

      {(!exports || exports.length === 0) ? (
        <Card>
          <div className="text-center p-10 text-textMuted">
            <div className="text-[40px] mb-3">📤</div>
            <div className="font-semibold text-text">Henüz dışa aktarma yok</div>
            <div className="mt-1.5 text-sm">
              Tamamlanmış bir iş sonucunu dışa aktardığınızda burada görünecek.
            </div>
          </div>
        </Card>
      ) : (
        <Card padding="0">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="bg-bg">
                {['Tarih', 'Format', 'Satır', 'Boyut', 'İndir'].map(h => (
                  <th key={h} className="px-4 py-3 text-left font-semibold text-textMuted border-b-2 border-border">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {exports.map((exp) => (
                <tr key={exp.id} className="border-b border-border">
                  <td className="px-4 py-3 text-text">{formatDate(exp.created_at)}</td>
                  <td className="px-4 py-3">
                    <Badge variant={exp.format === 'xlsx' ? 'success' : 'info'}>
                      {exp.format.toUpperCase()}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-text">
                    {exp.row_count.toLocaleString('tr-TR')}
                  </td>
                  <td className="px-4 py-3 text-textMuted">
                    {formatBytes(exp.file_size_bytes)}
                  </td>
                  <td className="px-4 py-3">
                    {exp.download_url ? (
                      <a
                        href={exp.download_url}
                        download
                        className="text-sm text-primary no-underline font-medium hover:underline"
                      >
                        ↓ İndir
                      </a>
                    ) : (
                      <span className="text-xs text-textLight">Süresi doldu</span>
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
