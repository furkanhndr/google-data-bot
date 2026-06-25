import { createServiceClient } from '@/lib/supabase/server'
import { JobStatusBadge } from '@/components/ui/Badge'
import { Card } from '@/components/ui/Card'

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
    <div className="p-8">
      <h1 className="mb-2 text-2xl font-bold text-text">
        Tüm İşler
      </h1>
      <p className="mb-6 text-sm text-textMuted">
        {jobs?.length ?? 0} iş gösteriliyor (son 100)
      </p>

      <Card padding="0">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="bg-bg">
                {['Kullanıcı', 'Sorgu', 'Konum', 'Durum', 'Sonuç', 'Kaynak', 'Tarih'].map(h => (
                  <th key={h} className="px-3.5 py-2.5 text-left font-semibold text-textMuted border-b-2 border-border whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {(jobs ?? []).length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-10 text-center text-textMuted">
                    Henüz iş yok.
                  </td>
                </tr>
              ) : (jobs ?? []).map(job => (
                <tr key={job.id} className="border-b border-border">
                  <td className="px-3.5 py-2.5 text-textMuted text-xs">
                    {emailMap.get(job.user_id) ?? job.user_id.slice(0, 8) + '...'}
                  </td>
                  <td className="px-3.5 py-2.5 font-medium text-text max-w-[160px] overflow-hidden overflow-ellipsis whitespace-nowrap">
                    {job.query}
                  </td>
                  <td className="px-3.5 py-2.5 text-textMuted max-w-[130px] overflow-hidden overflow-ellipsis whitespace-nowrap">
                    {job.location}
                  </td>
                  <td className="px-3.5 py-2.5">
                    <JobStatusBadge status={job.status} />
                  </td>
                  <td className="px-3.5 py-2.5 font-semibold text-text">
                    {job.scraped_count.toLocaleString('tr-TR')}
                  </td>
                  <td className="px-3.5 py-2.5 text-textMuted text-xs">
                    {job.source}
                  </td>
                  <td className="px-3.5 py-2.5 text-textMuted text-xs whitespace-nowrap">
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
