import { createServiceClient } from '@/lib/supabase/server'
import { StatCard } from '@/components/ui/Card'
import { COLORS } from '@/lib/constants'

function formatUsd(value: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 2,
  }).format(value)
}

export default async function AdminStatsPage() {
  const serviceClient = await createServiceClient()
  const { data: stats } = await serviceClient.rpc('get_admin_stats')
  const since = new Date()
  since.setDate(since.getDate() - 30)

  const { data: quotaRows } = await serviceClient
    .from('places_api_quota')
    .select('date, requests_made, cost_usd')
    .gte('date', since.toISOString().slice(0, 10))
    .order('date', { ascending: false })

  const s = (stats as Record<string, number>) ?? {}
  const quota = quotaRows ?? []
  const totalPlacesRequests = quota.reduce((sum, row) => sum + Number(row.requests_made ?? 0), 0)
  const totalPlacesCost = quota.reduce((sum, row) => sum + Number(row.cost_usd ?? 0), 0)
  const today = quota.find(row => row.date === new Date().toISOString().slice(0, 10))

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

      {/* Places API cost */}
      <h2 className="mt-8 mb-4 text-lg font-semibold text-text">
        Places API Maliyet Tahmini
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 mb-4">
        <StatCard label="Bugünkü API İsteği" value={Number(today?.requests_made ?? 0).toLocaleString('tr-TR')} color={COLORS.primary} />
        <StatCard label="Bugünkü Maliyet" value={formatUsd(Number(today?.cost_usd ?? 0))} color="#D97706" />
        <StatCard label="Son 30 Gün İstek" value={totalPlacesRequests.toLocaleString('tr-TR')} color="#7C3AED" />
        <StatCard label="Son 30 Gün Maliyet" value={formatUsd(totalPlacesCost)} color={COLORS.danger} />
      </div>
      <p className="text-xs text-textMuted">
        Maliyet tahmini Places Text Search isteği başına yapılandırılan birim maliyetle hesaplanır.
        Google faturası SKU ve hacim indirimlerine göre değişebilir.
      </p>
    </div>
  )
}
