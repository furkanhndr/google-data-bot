'use client'

import Link from 'next/link'
import { useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useMediaQuery } from '@/lib/hooks/useMediaQuery'
import { COLORS, FONT_SIZE } from '@/lib/constants'
import type { ReactNode } from 'react'

const ADMIN_NAV = [
  { href: '/admin/users',   label: 'Kullanıcılar', icon: '👥' },
  { href: '/admin/jobs',    label: 'İşler',         icon: '⚡' },
  { href: '/admin/stats',   label: 'İstatistikler', icon: '📊' },
  { href: '/dashboard',     label: 'Dashboard',     icon: '↩' },
]

export function AdminLayout({ children, email }: { children: ReactNode; email: string }) {
  const pathname = usePathname()
  const router   = useRouter()
  const isMobile = useMediaQuery('(max-width: 767px)')
  const [drawerOpen, setDrawerOpen] = useState(false)

  async function handleLogout() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/auth/login')
    router.refresh()
  }

  const sidebar = (
    <aside style={{
      width: '240px', minWidth: '240px', height: '100%',
      backgroundColor: COLORS.adminSidebar,
      display: 'flex', flexDirection: 'column',
    }}>
      {/* Logo */}
      <div style={{ padding: '20px 20px 16px', borderBottom: `1px solid rgba(255,255,255,0.08)` }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: '32px', height: '32px', backgroundColor: '#7C3AED', borderRadius: '8px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#fff', fontSize: '14px', fontWeight: '700',
          }}>A</div>
          <div>
            <div style={{ color: '#fff', fontWeight: '700', fontSize: FONT_SIZE.sm }}>Admin Panel</div>
            <div style={{ color: '#64748B', fontSize: '11px' }}>BusinessData</div>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: '12px 0' }}>
        {ADMIN_NAV.map(item => {
          const active = pathname.startsWith(item.href) && item.href !== '/dashboard'
          return (
            <Link key={item.href} href={item.href} style={{ textDecoration: 'none' }} onClick={() => setDrawerOpen(false)}>
              <div style={{
                display: 'flex', alignItems: 'center', gap: '10px',
                padding: '10px 20px',
                backgroundColor: active ? 'rgba(124,58,237,0.25)' : 'transparent',
                borderLeft: `3px solid ${active ? '#7C3AED' : 'transparent'}`,
                color: active ? '#fff' : COLORS.sidebarText,
                fontSize: FONT_SIZE.sm,
                fontWeight: active ? '600' : '400',
                cursor: 'pointer',
              }}>
                <span style={{ fontSize: '15px' }}>{item.icon}</span>
                {item.label}
              </div>
            </Link>
          )
        })}
      </nav>

      {/* User + logout */}
      <div style={{
        padding: '12px 16px', borderTop: `1px solid rgba(255,255,255,0.08)`,
        display: 'flex', alignItems: 'center', gap: '10px',
      }}>
        <div style={{
          width: '30px', height: '30px', borderRadius: '50%', backgroundColor: '#7C3AED',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: '#fff', fontSize: '13px', fontWeight: '700', flexShrink: 0,
        }}>
          {email[0].toUpperCase()}
        </div>
        <div style={{ flex: 1, minWidth: 0, fontSize: '12px', color: '#94A3B8', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {email}
        </div>
        <button onClick={handleLogout} title="Çıkış yap" style={{
          background: 'none', border: 'none', cursor: 'pointer',
          color: COLORS.sidebarText, fontSize: '16px', flexShrink: 0,
        }}>↩</button>
      </div>
    </aside>
  )

  // ── Mobile: top bar + slide-in drawer ──────────────────────────────────────
  if (isMobile) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: COLORS.bg }}>
        <header style={{
          position: 'fixed', top: 0, left: 0, right: 0, height: '56px', zIndex: 50,
          backgroundColor: COLORS.adminSidebar, display: 'flex', alignItems: 'center', gap: '12px', padding: '0 16px',
        }}>
          <button onClick={() => setDrawerOpen(true)} aria-label="Menüyü aç" style={{
            background: 'none', border: 'none', color: '#fff', fontSize: '22px', cursor: 'pointer', padding: '4px', lineHeight: 1,
          }}>☰</button>
          <span style={{ color: '#fff', fontWeight: '700', fontSize: FONT_SIZE.sm }}>Admin Panel</span>
        </header>

        {drawerOpen && (
          <div onClick={() => setDrawerOpen(false)} style={{
            position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 60,
          }} />
        )}

        <div style={{
          position: 'fixed', top: 0, bottom: 0, left: 0, zIndex: 70,
          transform: drawerOpen ? 'translateX(0)' : 'translateX(-100%)',
          transition: 'transform 0.2s ease',
          boxShadow: drawerOpen ? '2px 0 16px rgba(0,0,0,0.3)' : 'none',
        }}>
          {sidebar}
        </div>

        <main style={{ paddingTop: '56px', minHeight: '100vh' }}>{children}</main>
      </div>
    )
  }

  // ── Desktop ─────────────────────────────────────────────────────────────────
  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: COLORS.bg }}>
      {sidebar}
      <main style={{ flex: 1, minWidth: 0, overflow: 'auto' }}>{children}</main>
    </div>
  )
}
