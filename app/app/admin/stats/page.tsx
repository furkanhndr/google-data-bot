import { createServiceClient } from '@/lib/supabase/server'
import { StatCard } from '@/components/ui/Card'
import { COLORS, FONT_SIZE } from '@/lib/constants'

export default async function AdminStatsPage() {
  const serviceClient = await createServiceClient()
  const { data: stats } = await serviceClient.rpc('get_admin_stats')

  const s = (stats as Record<string, number>) ?? {}

  return (
    <div style={{ padding: '32px' }}>
      <h1 style={{ margin: '0 0 8px', fontSize: FONT_SIZE['2xl'], fontWeight: '700', color: COLORS.text }}>
        İstatistikler
      </h1>
      <p style={{ margin: '0 0 28px', fontSize: FONT_SIZE.sm, color: COLORS.textMuted }}>
        Platform geneli kullanım verileri
      </p>

      {/* Overview */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '32px' }}>
        <StatCard label="Toplam Kullanıcı"   value={s.total_users ?? 0}    color={COLORS.primary} />
        <StatCard label="Aktif (7 gün)"       value={s.active_users_7d ?? 0} color={COLORS.success} />
        <StatCard label="Toplam İş"           value={s.total_jobs ?? 0}      color="#7C3AED" />
        <StatCard label="Toplam Sonuç"        value={(s.total_results ?? 0).toLocaleString('tr-TR')} color="#D97706" />
      </div>

      {/* Plans + exports */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '32px' }}>
        <StatCard label="Ücretsiz Plan"     value={s.free_users ?? 0}      color={COLORS.textMuted} />
        <StatCard label="Premium Plan"      value={s.premium_users ?? 0}   color="#FBBF24" />
        <StatCard label="Askıya Alınan"     value={s.suspended_users ?? 0} color={COLORS.danger} />
        <StatCard label="Toplam Export"     value={s.total_exports ?? 0}   color={COLORS.success} />
      </div>

      {/* Last 7 days */}
      <h2 style={{ margin: '0 0 16px', fontSize: FONT_SIZE.lg, fontWeight: '600', color: COLORS.text }}>
        Son 7 Gün
      </h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
        <StatCard label="Yeni İş"           value={s.jobs_last_7d ?? 0}    color={COLORS.primary} />
        <StatCard label="Yeni Sonuç"        value={(s.results_last_7d ?? 0).toLocaleString('tr-TR')} color={COLORS.success} />
        <StatCard label="Tamamlanan İş"     value={s.completed_jobs ?? 0}  color="#7C3AED" />
      </div>
    </div>
  )
}
