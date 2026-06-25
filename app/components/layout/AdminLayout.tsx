'use client'

import Link from 'next/link'
import { useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useMediaQuery } from '@/lib/hooks/useMediaQuery'
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
    <aside className="w-60 flex-shrink-0 bg-gray-800 flex flex-col">
      {/* Logo */}
      <div className="px-5 py-4 border-b border-white border-opacity-5">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-purple-600 rounded flex items-center justify-center text-white text-sm font-bold">A</div>
          <div>
            <div className="text-white font-bold text-sm">Admin Panel</div>
            <div className="text-slate-500 text-xs">BusinessData</div>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 py-3">
        {ADMIN_NAV.map(item => {
          const active = pathname.startsWith(item.href) && item.href !== '/dashboard'
          return (
            <Link key={item.href} href={item.href} className="no-underline block" onClick={() => setDrawerOpen(false)}>
              <div className={`flex items-center gap-2.5 px-5 py-2.5 transition-colors ${
                active
                  ? 'bg-purple-600 bg-opacity-25 border-l-3 border-purple-600 text-white font-semibold'
                  : 'border-l-3 border-transparent text-slate-300 font-normal hover:bg-gray-700'
              }`}>
                <span className="text-base">{item.icon}</span>
                {item.label}
              </div>
            </Link>
          )
        })}
      </nav>

      {/* User + logout */}
      <div className="px-4 py-3 border-t border-white border-opacity-5 flex items-center gap-2.5">
        <div className="w-7.5 h-7.5 rounded-full bg-purple-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
          {email[0].toUpperCase()}
        </div>
        <div className="flex-1 min-w-0 text-xs text-slate-400 overflow-hidden overflow-ellipsis whitespace-nowrap">
          {email}
        </div>
        <button onClick={handleLogout} title="Çıkış yap" className="bg-none border-none cursor-pointer text-slate-300 text-base flex-shrink-0 hover:text-white transition-colors">↩</button>
      </div>
    </aside>
  )

  // ── Mobile: top bar + slide-in drawer ──────────────────────────────────────
  if (isMobile) {
    return (
      <div className="min-h-screen bg-gray-50">
        <header className="fixed top-0 left-0 right-0 h-14 z-50 bg-gray-800 flex items-center gap-3 px-4">
          <button onClick={() => setDrawerOpen(true)} aria-label="Menüyü aç" className="bg-none border-none text-white text-2xl cursor-pointer p-1 leading-none hover:text-gray-300 transition-colors">☰</button>
          <span className="text-white font-bold text-sm">Admin Panel</span>
        </header>

        {drawerOpen && (
          <div onClick={() => setDrawerOpen(false)} className="fixed inset-0 bg-black bg-opacity-50 z-30" />
        )}

        <div className={`fixed top-0 bottom-0 left-0 z-40 flex transition-transform duration-200 ${
          drawerOpen ? 'translate-x-0' : '-translate-x-full'
        } ${drawerOpen ? 'shadow-lg' : ''}`}>
          {sidebar}
        </div>

        <main className="pt-14 min-h-screen">{children}</main>
      </div>
    )
  }

  // ── Desktop ─────────────────────────────────────────────────────────────────
  return (
    <div className="flex min-h-screen bg-gray-50">
      {sidebar}
      <main className="flex-1 min-w-0 overflow-auto">{children}</main>
    </div>
  )
}
