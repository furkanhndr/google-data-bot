import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import type { Campaign, CampaignStatus } from '@googlebusinessdata/shared-types'

const STATUS: Record<CampaignStatus, { label: string; variant: 'default' | 'info' | 'success' | 'warning' | 'danger' }> = {
  draft:     { label: 'Taslak',       variant: 'default' },
  running:   { label: 'Devam ediyor', variant: 'info' },
  completed: { label: 'Tamamlandı',   variant: 'success' },
  stopped:   { label: 'Durduruldu',   variant: 'warning' },
  failed:    { label: 'Hatalı',       variant: 'danger' },
}

export default async function CampaignsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const { data } = await supabase
    .from('campaigns')
    .select('*')
    .eq('user_id', user!.id)
    .order('created_at', { ascending: false })

  const campaigns = (data ?? []) as Campaign[]

  return (
    <div className="p-8">
      <h1 className="mb-1 text-2xl font-bold text-text">E-posta Kampanyaları</h1>
      <p className="mb-6 text-sm text-textMuted">
        Bir iş sonucundan kampanya oluşturmak için iş detay sayfasındaki “Toplu E-posta Kampanyası”nı kullanın.
      </p>

      {campaigns.length === 0 ? (
        <Card>
          <div className="text-center py-10 text-textMuted text-sm">
            Henüz kampanya yok. Tamamlanmış bir işin sonuçlarından e-posta kampanyası başlatabilirsiniz.
          </div>
        </Card>
      ) : (
        <Card padding="0">
          {campaigns.map(c => {
            const total = c.total_recipients || 1
            const pct = Math.round(((c.sent_count + c.failed_count) / total) * 100)
            return (
              <Link key={c.id} href={`/dashboard/campaigns/${c.id}`} className="no-underline">
                <div className="flex items-center justify-between gap-3 px-5 py-4 border-b border-border">
                  <div className="min-w-0">
                    <div className="text-sm font-medium text-text truncate">{c.name}</div>
                    <div className="text-xs text-textMuted mt-0.5">
                      {c.total_recipients} alıcı · {c.sent_count} gönderildi · {c.failed_count} hata
                    </div>
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0">
                    <span className="text-xs text-textMuted">%{pct}</span>
                    <Badge variant={STATUS[c.status].variant}>{STATUS[c.status].label}</Badge>
                  </div>
                </div>
              </Link>
            )
          })}
        </Card>
      )}
    </div>
  )
}
