import { createClient } from '@/lib/supabase/server'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { ProfileSettings } from '@/components/settings/ProfileSettings'
import { PasswordSettings } from '@/components/settings/PasswordSettings'
import { DangerZone } from '@/components/settings/DangerZone'
import { OutreachSettingsPanel } from '@/components/outreach/OutreachSettingsPanel'
import { EmailProviderPanel } from '@/components/outreach/EmailProviderPanel'
import { MessageTemplatesPanel } from '@/components/outreach/MessageTemplatesPanel'
import { SettingsTabs } from '@/components/settings/SettingsTabs'
import type { MessageTemplate, OutreachSettings } from '@googlebusinessdata/shared-types'

function percentWidthClass(percent: number) {
  if (percent <= 0) return 'w-0'
  if (percent >= 100) return 'w-full'
  const steps = [
    'w-1/12', 'w-1/6', 'w-1/4', 'w-1/3', 'w-5/12', 'w-1/2',
    'w-7/12', 'w-2/3', 'w-3/4', 'w-5/6', 'w-11/12',
  ]
  return steps[Math.min(steps.length - 1, Math.floor(percent / (100 / steps.length)))]
}

export default async function SettingsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user!.id)
    .single()

  const [{ data: outreachSettings }, { data: templates }, { data: emailCfg }] = await Promise.all([
    supabase
      .from('outreach_settings')
      .select('*')
      .eq('user_id', user!.id)
      .maybeSingle(),
    supabase
      .from('message_templates')
      .select('*')
      .eq('user_id', user!.id)
      .order('created_at', { ascending: true }),
    supabase
      .from('email_provider_settings')
      .select('smtp_host, smtp_port, smtp_secure, smtp_user, from_email, from_name, smtp_pass_encrypted')
      .eq('user_id', user!.id)
      .maybeSingle(),
  ])

  const emailInitial = emailCfg
    ? {
        smtp_host: emailCfg.smtp_host,
        smtp_port: emailCfg.smtp_port,
        smtp_secure: emailCfg.smtp_secure,
        smtp_user: emailCfg.smtp_user,
        from_email: emailCfg.from_email,
        from_name: emailCfg.from_name,
        configured: !!emailCfg.smtp_pass_encrypted,
      }
    : null

  const creditsPercent = profile
    ? profile.plan === 'premium'
      ? 100
      : Math.min(100, Math.round((profile.credits_used / profile.credits_total) * 100))
    : 0

  return (
    <div className="p-8 max-w-[1000px]">
      <h1 className="mb-6 text-2xl font-bold text-text">
        Hesap Ayarları
      </h1>

      <SettingsTabs
        account={(
          <>
            <ProfileSettings
              userId={user!.id}
              email={user?.email ?? ''}
              initialName={profile?.display_name ?? ''}
              initialAvatar={profile?.avatar_url ?? null}
            />
            <PasswordSettings />
          </>
        )}
        outreach={(
          <>
            <OutreachSettingsPanel
              initialSettings={outreachSettings as OutreachSettings | null}
              fallbackEmail={user?.email ?? ''}
              fallbackName={profile?.display_name ?? ''}
            />
            <EmailProviderPanel initial={emailInitial} fallbackEmail={user?.email ?? ''} />
            <MessageTemplatesPanel initialTemplates={(templates ?? []) as MessageTemplate[]} />
          </>
        )}
        plan={(
          <Card className="mb-4">
            <h2 className="mb-5 text-lg font-semibold text-text">
              Plan & Krediler
            </h2>
            <div className="flex flex-col gap-3.5">
              <div className="flex justify-between items-center">
                <span className="text-sm text-textMuted">Mevcut Plan</span>
                <Badge variant={profile?.plan === 'premium' ? 'success' : 'default'}>
                  {profile?.plan === 'premium' ? '⭐ Premium' : 'Ücretsiz'}
                </Badge>
              </div>

              <div>
                <div className="flex justify-between mb-1.5">
                  <span className="text-sm text-textMuted">Kredi Kullanımı</span>
                  <span className="text-sm font-semibold text-text">
                    {profile?.credits_used ?? 0} / {profile?.plan === 'premium' ? '∞' : (profile?.credits_total ?? 100)}
                  </span>
                </div>
                {profile?.plan === 'premium' ? (
                  <div className="text-xs text-textMuted">
                    Premium planında kredi limiti yoktur.
                  </div>
                ) : (
                  <>
                    <div className="h-2 bg-border rounded overflow-hidden">
                      <div className={`h-full rounded transition-all ${creditsPercent > 80 ? 'bg-red-600' : 'bg-blue-500'} ${percentWidthClass(creditsPercent)}`} />
                    </div>
                    <div className="text-xs text-textMuted mt-1.5">
                      {Math.max(0, (profile?.credits_total ?? 100) - (profile?.credits_used ?? 0))} kredi kaldı
                    </div>
                  </>
                )}
              </div>
            </div>
          </Card>
        )}
        danger={<DangerZone />}
      />
    </div>
  )
}
