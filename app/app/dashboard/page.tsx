import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { Card, StatCard } from '@/components/ui/Card'
import { JobStatusBadge } from '@/components/ui/Badge'
import { COLORS, FONT_SIZE } from '@/lib/constants'
import type { ScrapingJob } from '@googlebusinessdata/shared-types'

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
    <div style={{ padding: '32px' }}>
      <h1 style={{ margin: '0 0 24px', fontSize: FONT_SIZE['2xl'], fontWeight: '700', color: COLORS.text }}>
        Genel Bakış
      </h1>

      {/* Stat cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '16px', marginBottom: '24px' }}>
        <StatCard label="Toplam İş" value={totalJobs.count ?? 0} />
        <StatCard label="Tamamlanan İş" value={completedJobs.count ?? 0} color={COLORS.success} />
        <StatCard label="Toplam Sonuç" value={(totalResults.count ?? 0).toLocaleString('tr-TR')} />
        <StatCard
          label="Kalan Kredi"
          value={profile?.plan === 'premium' ? '∞' : credremaining}
          sub={profile?.plan === 'premium' ? 'Premium' : `${profile?.credits_total ?? 0} krediden`}
          color={credremaining === 0 && profile?.plan !== 'premium' ? COLORS.danger : COLORS.primary}
        />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '16px', alignItems: 'start' }}>
        {/* 7-day activity */}
        <Card>
          <h2 style={{ margin: '0 0 20px', fontSize: FONT_SIZE.lg, fontWeight: '600', color: COLORS.text }}>
            Son 7 Gün — Oluşturulan İşler
          </h2>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: '10px', height: '120px' }}>
            {counts.map((c, i) => (
              <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
                <div style={{ fontSize: FONT_SIZE.xs, color: COLORS.textMuted }}>{c || ''}</div>
                <div style={{
                  width: '100%',
                  height: `${(c / maxCount) * 90}px`,
                  minHeight: c > 0 ? '4px' : '0',
                  backgroundColor: COLORS.primary,
                  borderRadius: '4px 4px 0 0',
                  transition: 'height 0.3s',
                }} />
                <div style={{ fontSize: FONT_SIZE.xs, color: COLORS.textLight }}>
                  {days[i].toLocaleDateString('tr-TR', { weekday: 'short' })}
                </div>
              </div>
            ))}
          </div>
          <div style={{ marginTop: '16px', fontSize: FONT_SIZE.xs, color: COLORS.textMuted }}>
            Toplam {totalExports.count ?? 0} dışa aktarma yapıldı.
          </div>
        </Card>

        {/* Recent jobs */}
        <Card padding="0">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 20px 12px' }}>
            <h2 style={{ margin: 0, fontSize: FONT_SIZE.lg, fontWeight: '600', color: COLORS.text }}>Son İşler</h2>
            <Link href="/dashboard/jobs" style={{ fontSize: FONT_SIZE.sm, color: COLORS.primary, textDecoration: 'none' }}>
              Tümü →
            </Link>
          </div>
          {recent.length === 0 ? (
            <div style={{ padding: '32px', textAlign: 'center', color: COLORS.textMuted, fontSize: FONT_SIZE.sm }}>
              Henüz iş yok. <Link href="/dashboard/jobs/new" style={{ color: COLORS.primary }}>İlk işini oluştur →</Link>
            </div>
          ) : (
            <div>
              {recent.map(job => (
                <Link key={job.id} href={`/dashboard/jobs/${job.id}`} style={{ textDecoration: 'none' }}>
                  <div style={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    padding: '12px 20px', borderTop: `1px solid ${COLORS.border}`,
                  }}>
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontSize: FONT_SIZE.sm, fontWeight: '500', color: COLORS.text, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {job.query}
                      </div>
                      <div style={{ fontSize: FONT_SIZE.xs, color: COLORS.textMuted }}>
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
