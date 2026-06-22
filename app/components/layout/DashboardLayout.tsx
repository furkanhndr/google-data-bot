'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { COLORS, FONT_SIZE } from '@/lib/constants'
import type { ReactNode } from 'react'
import type { UserProfile } from '@googlebusinessdata/shared-types'

const NAV_ITEMS = [
  { href: '/dashboard/jobs',     label: 'İşler',      icon: '⚡' },
  { href: '/dashboard/exports',  label: 'Dışa Aktarma', icon: '📤' },
  { href: '/dashboard/settings', label: 'Ayarlar',    icon: '⚙' },
]

interface DashboardLayoutProps {
  children: ReactNode
  profile: UserProfile & { email?: string }
}

export function DashboardLayout({ children, profile }: DashboardLayoutProps) {
  const pathname = usePathname()
  const router   = useRouter()

  async function handleLogout() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/auth/login')
    router.refresh()
  }

  const creditsPercent = Math.min(100, Math.round((profile.credits_used / profile.credits_total) * 100))

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: COLORS.bg }}>
      {/* Sidebar */}
      <aside style={{
        width: '240px',
        minWidth: '240px',
        backgroundColor: COLORS.sidebar,
        display: 'flex',
        flexDirection: 'column',
        padding: '0',
      }}>
        {/* Logo */}
        <div style={{
          padding: '20px 20px 16px',
          borderBottom: `1px solid rgba(255,255,255,0.08)`,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '32px', height: '32px',
              backgroundColor: COLORS.primary,
              borderRadius: '8px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#fff', fontSize: '16px', fontWeight: '700',
            }}>G</div>
            <span style={{ color: '#fff', fontWeight: '700', fontSize: FONT_SIZE.base }}>
              BusinessData
            </span>
          </div>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: '12px 0' }}>
          {NAV_ITEMS.map(item => {
            const active = pathname.startsWith(item.href)
            return (
              <Link key={item.href} href={item.href} style={{ textDecoration: 'none' }}>
                <div style={{
                  display: 'flex', alignItems: 'center', gap: '10px',
                  padding: '10px 20px',
                  backgroundColor: active ? 'rgba(37,99,235,0.25)' : 'transparent',
                  borderLeft: `3px solid ${active ? COLORS.primary : 'transparent'}`,
                  color: active ? '#fff' : COLORS.sidebarText,
                  fontSize: FONT_SIZE.sm,
                  fontWeight: active ? '600' : '400',
                  transition: 'background-color 0.15s',
                  cursor: 'pointer',
                }}>
                  <span style={{ fontSize: '15px' }}>{item.icon}</span>
                  {item.label}
                </div>
              </Link>
            )
          })}
        </nav>

        {/* Credits widget */}
        <div style={{
          margin: '0 12px 12px',
          padding: '12px',
          backgroundColor: 'rgba(255,255,255,0.06)',
          borderRadius: '8px',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
            <span style={{ fontSize: FONT_SIZE.xs, color: COLORS.sidebarText }}>Krediler</span>
            <span style={{ fontSize: FONT_SIZE.xs, color: '#fff', fontWeight: '600' }}>
              {profile.credits_used} / {profile.credits_total === Infinity ? '∞' : profile.credits_total}
            </span>
          </div>
          {profile.plan === 'free' && (
            <div style={{ height: '4px', backgroundColor: 'rgba(255,255,255,0.15)', borderRadius: '2px' }}>
              <div style={{
                height: '100%',
                width: `${creditsPercent}%`,
                backgroundColor: creditsPercent > 80 ? COLORS.danger : COLORS.primary,
                borderRadius: '2px',
                transition: 'width 0.3s',
              }} />
            </div>
          )}
          <div style={{ marginTop: '6px', fontSize: FONT_SIZE.xs, color: COLORS.sidebarText }}>
            Plan: <span style={{ color: profile.plan === 'premium' ? '#FBBF24' : '#94A3B8', fontWeight: '600' }}>
              {profile.plan === 'premium' ? 'Premium' : 'Ücretsiz'}
            </span>
          </div>
        </div>

        {/* User + logout */}
        <div style={{
          padding: '12px 16px',
          borderTop: `1px solid rgba(255,255,255,0.08)`,
          display: 'flex', alignItems: 'center', gap: '10px',
        }}>
          <div style={{
            width: '30px', height: '30px', borderRadius: '50%',
            backgroundColor: COLORS.primary,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#fff', fontSize: '13px', fontWeight: '700', flexShrink: 0,
          }}>
            {(profile.display_name ?? profile.email ?? 'U')[0].toUpperCase()}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: '12px', fontWeight: '500', color: '#fff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {profile.display_name ?? profile.email ?? 'Kullanıcı'}
            </div>
          </div>
          <button onClick={handleLogout} title="Çıkış yap" style={{
            background: 'none', border: 'none', cursor: 'pointer',
            color: COLORS.sidebarText, fontSize: '16px', padding: '2px',
            flexShrink: 0,
          }}>↩</button>
        </div>
      </aside>

      {/* Main content */}
      <main style={{ flex: 1, minWidth: 0, overflow: 'auto' }}>
        {children}
      </main>
    </div>
  )
}
