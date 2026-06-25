import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { Card, StatCard } from '@/components/ui/Card'
import { JobStatusBadge } from '@/components/ui/Badge'
import type { ScrapingJob } from '@googlebusinessdata/shared-types'

function chartBarHeightClass(value: number, max: number) {
  if (value <= 0) return 'h-0'
  const ratio = value / max
  if (ratio >= 0.9) return 'h-[90px]'
  if (ratio >= 0.75) return 'h-20'
  if (ratio >= 0.6) return 'h-16'
  if (ratio >= 0.45) return 'h-12'
  if (ratio >= 0.3) return 'h-8'
  if (ratio >= 0.15) return 'h-5'
  return 'h-1'
}

export default async function OverviewPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const uid = user!.id

  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()

  const [profileRes, totalJobs, completedJobs, totalResults, totalExports, recentRes, weekRes] = await Promise.all([
    supabase.from('profiles').select('plan, credits_used, credits_total').eq('id', uid).single(),
    supabase.from('scraping_jobs').select('id', { count: 'exact', head: true }).eq('user_id', uid),
    supabase.from('scraping_jobs').select('id', { count: 'exact', head: true }).eq('user_id', uid).eq('status', 'completed'),
    supabase.from('business_results').select('id', { count: 'exact', head: true }).eq('user_id', uid),
    supabase.from('export_history').select('id', { count: 'exact', head: true }).eq('user_id', uid),
    supabase.from('scraping_jobs').select('*').eq('user_id', uid).order('created_at', { ascending: false }).limit(5),
    supabase.from('scraping_jobs').select('created_at').eq('user_id', uid).gte('created_at', sevenDaysAgo),
  ])

  const profile = profileRes.data
  const recent  = (recentRes.data ?? []) as ScrapingJob[]
  const credremaining = profile ? Math.max(0, profile.credits_total - profile.credits_used) : 0

  // Bucket jobs into the last 7 days (oldest → newest)
  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(); d.setHours(0, 0, 0, 0); d.setDate(d.getDate() - (6 - i))
    return d
  })
  const counts = days.map(d => {
    const next = new Date(d); next.setDate(d.getDate() + 1)
    return (weekRes.data ?? []).filter(j => {
      const t = new Date(j.created_at).getTime()
      return t >= d.getTime() && t < next.getTime()
    }).length
  })
  const maxCount = Math.max(1, ...counts)

  return (
    <div className="p-8">
      <h1 className="mb-6 text-2xl font-bold text-text">
        Genel Bakış
      </h1>

      {/* Stat cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard label="Toplam İş" value={totalJobs.count ?? 0} />
        <StatCard label="Tamamlanan İş" value={completedJobs.count ?? 0} color="#16A34A" />
        <StatCard label="Toplam Sonuç" value={(totalResults.count ?? 0).toLocaleString('tr-TR')} />
        <StatCard
          label="Kalan Kredi"
          value={profile?.plan === 'premium' ? '∞' : credremaining}
          sub={profile?.plan === 'premium' ? 'Premium' : `${profile?.credits_total ?? 0} krediden`}
          color={credremaining === 0 && profile?.plan !== 'premium' ? '#DC2626' : '#2563EB'}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:items-start">
        {/* 7-day activity */}
        <Card className="lg:col-span-1">
          <h2 className="mb-5 text-lg font-semibold text-text">
            Son 7 Gün — Oluşturulan İşler
          </h2>
          <div className="flex items-end gap-2.5 h-30">
            {counts.map((c, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-1.5">
                <div className="text-xs text-textMuted">{c || ''}</div>
                <div className={`w-full bg-blue-500 rounded-t transition-all ${chartBarHeightClass(c, maxCount)}`} />
                <div className="text-xs text-textLight">
                  {days[i].toLocaleDateString('tr-TR', { weekday: 'short' })}
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 text-xs text-textMuted">
            Toplam {totalExports.count ?? 0} dışa aktarma yapıldı.
          </div>
        </Card>

        {/* Recent jobs */}
        <Card className="lg:col-span-2 p-0">
          <div className="flex justify-between items-center p-5 pb-3">
            <h2 className="m-0 text-lg font-semibold text-text">Son İşler</h2>
            <Link href="/dashboard/jobs" className="text-sm text-primary no-underline hover:underline">
              Tümü →
            </Link>
          </div>
          {recent.length === 0 ? (
            <div className="p-8 text-center text-textMuted text-sm">
              Henüz iş yok. <Link href="/dashboard/jobs/new" className="text-primary hover:underline">İlk işini oluştur →</Link>
            </div>
          ) : (
            <div>
              {recent.map(job => (
                <Link key={job.id} href={`/dashboard/jobs/${job.id}`} className="no-underline block">
                  <div className="flex justify-between items-center px-5 py-3 border-t border-border hover:bg-bg transition-colors">
                    <div className="min-w-0 flex-1">
                      <div className="text-sm font-medium text-text overflow-hidden overflow-ellipsis whitespace-nowrap">
                        {job.query}
                      </div>
                      <div className="text-xs text-textMuted">
                        📍 {job.location} · {job.scraped_count} sonuç
                      </div>
                    </div>
                    <JobStatusBadge status={job.status} />
                  </div>
                </Link>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  )
}
