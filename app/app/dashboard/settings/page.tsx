import { createClient } from '@/lib/supabase/server'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { COLORS, FONT_SIZE } from '@/lib/constants'

export default async function SettingsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user!.id)
    .single()

  const creditsPercent = profile
    ? Math.min(100, Math.round((profile.credits_used / profile.credits_total) * 100))
    : 0

  return (
    <div style={{ padding: '32px', maxWidth: '600px' }}>
      <h1 style={{ margin: '0 0 24px', fontSize: FONT_SIZE['2xl'], fontWeight: '700', color: COLORS.text }}>
        Hesap Ayarları
      </h1>

      {/* Profile card */}
      <Card style={{ marginBottom: '16px' }}>
        <h2 style={{ margin: '0 0 20px', fontSize: FONT_SIZE.lg, fontWeight: '600', color: COLORS.text }}>
          Profil Bilgileri
        </h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <Row label="E-posta" value={user?.email ?? '—'} />
          <Row label="Ad Soyad" value={profile?.display_name ?? '—'} />
          <Row label="Üyelik tarihi" value={profile ? new Intl.DateTimeFormat('tr-TR').format(new Date(profile.created_at)) : '—'} />
        </div>
      </Card>

      {/* Plan & credits card */}
      <Card>
        <h2 style={{ margin: '0 0 20px', fontSize: FONT_SIZE.lg, fontWeight: '600', color: COLORS.text }}>
          Plan & Krediler
        </h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: FONT_SIZE.sm, color: COLORS.textMuted }}>Mevcut Plan</span>
            <Badge variant={profile?.plan === 'premium' ? 'success' : 'default'}>
              {profile?.plan === 'premium' ? '⭐ Premium' : 'Ücretsiz'}
            </Badge>
          </div>

          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
              <span style={{ fontSize: FONT_SIZE.sm, color: COLORS.textMuted }}>Kredi Kullanımı</span>
              <span style={{ fontSize: FONT_SIZE.sm, fontWeight: '600', color: COLORS.text }}>
                {profile?.credits_used ?? 0} / {profile?.credits_total ?? 100}
              </span>
            </div>
            <div style={{ height: '8px', backgroundColor: COLORS.border, borderRadius: '4px' }}>
              <div style={{
                height: '100%',
                width: `${creditsPercent}%`,
                backgroundColor: creditsPercent > 80 ? COLORS.danger : COLORS.primary,
                borderRadius: '4px',
                transition: 'width 0.3s',
              }} />
            </div>
            <div style={{ fontSize: FONT_SIZE.xs, color: COLORS.textMuted, marginTop: '6px' }}>
              {profile?.credits_total ?? 100 - (profile?.credits_used ?? 0)} kredi kaldı
            </div>
          </div>
        </div>
      </Card>
    </div>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <span style={{ fontSize: FONT_SIZE.sm, color: COLORS.textMuted }}>{label}</span>
      <span style={{ fontSize: FONT_SIZE.sm, color: COLORS.text, fontWeight: '500' }}>{value}</span>
    </div>
  )
}
