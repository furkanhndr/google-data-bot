import { createServiceClient } from '@/lib/supabase/server'
import { StatCard } from '@/components/ui/Card'
import { COLORS } from '@/lib/constants'

export default async function AdminStatsPage() {
  const serviceClient = await createServiceClient()
  const { data: stats } = await serviceClient.rpc('get_admin_stats')

  const s = (stats as Record<string, number>) ?? {}

  return (
    <div className="p-8">
      <h1 className="mb-2 text-2xl font-bold text-text">
        İstatistikler
      </h1>
      <p className="mb-7 text-sm text-textMuted">
        Platform geneli kullanım verileri
      </p>

      {/* Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
        <StatCard label="Toplam Kullanıcı"   value={s.total_users ?? 0}    color={COLORS.primary} />
        <StatCard label="Aktif (7 gün)"       value={s.active_users_7d ?? 0} color={COLORS.success} />
        <StatCard label="Toplam İş"           value={s.total_jobs ?? 0}      color="#7C3AED" />
        <StatCard label="Toplam Sonuç"        value={(s.total_results ?? 0).toLocaleString('tr-TR')} color="#D97706" />
      </div>

      {/* Plans + exports */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
        <StatCard label="Ücretsiz Plan"     value={s.free_users ?? 0}      color={COLORS.textMuted} />
        <StatCard label="Premium Plan"      value={s.premium_users ?? 0}   color="#FBBF24" />
        <StatCard label="Askıya Alınan"     value={s.suspended_users ?? 0} color={COLORS.danger} />
        <StatCard label="Toplam Export"     value={s.total_exports ?? 0}   color={COLORS.success} />
      </div>

      {/* Last 7 days */}
      <h2 className="mb-4 text-lg font-semibold text-text">
        Son 7 Gün
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatCard label="Yeni İş"           value={s.jobs_last_7d ?? 0}    color={COLORS.primary} />
        <StatCard label="Yeni Sonuç"        value={(s.results_last_7d ?? 0).toLocaleString('tr-TR')} color={COLORS.success} />
        <StatCard label="Tamamlanan İş"     value={s.completed_jobs ?? 0}  color="#7C3AED" />
      </div>
    </div>
  )
}
