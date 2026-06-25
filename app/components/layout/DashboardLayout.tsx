'use client'

import Link from 'next/link'
import { useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { JobNotifier } from '@/components/layout/JobNotifier'
import { useMediaQuery } from '@/lib/hooks/useMediaQuery'
import type { ReactNode } from 'react'
import type { UserProfile } from '@googlebusinessdata/shared-types'

const NAV_ITEMS = [
  { href: '/dashboard',          label: 'Genel Bakış', icon: '📊', exact: true },
  { href: '/dashboard/jobs',     label: 'İşler',      icon: '⚡' },
  { href: '/dashboard/exports',  label: 'Dışa Aktarma', icon: '📤' },
  { href: '/dashboard/settings', label: 'Ayarlar',    icon: '⚙' },
]

interface DashboardLayoutProps {
  children: ReactNode
  profile: UserProfile & { email?: string }
}

function percentWidthClass(percent: number) {
  if (percent <= 0) return 'w-0'
  if (percent >= 100) return 'w-full'
  const steps = [
    'w-1/12', 'w-1/6', 'w-1/4', 'w-1/3', 'w-5/12', 'w-1/2',
    'w-7/12', 'w-2/3', 'w-3/4', 'w-5/6', 'w-11/12',
  ]
  return steps[Math.min(steps.length - 1, Math.floor(percent / (100 / steps.length)))]
}

export function DashboardLayout({ children, profile }: DashboardLayoutProps) {
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

  const creditsPercent = profile.plan === 'premium'
    ? 100
    : Math.min(100, Math.round((profile.credits_used / profile.credits_total) * 100))

  const sidebar = (
    <aside className="w-60 flex-shrink-0 bg-gray-800 flex flex-col">
      {/* Logo */}
      <div className="px-5 py-4 border-b border-white border-opacity-10">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center text-white text-base font-bold">
            G
          </div>
          <span className="text-white font-bold text-base">BusinessData</span>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 py-3">
        {NAV_ITEMS.map(item => {
          const active = item.exact ? pathname === item.href : pathname.startsWith(item.href)
          return (
            <Link key={item.href} href={item.href} className="no-underline" onClick={() => setDrawerOpen(false)}>
              <div className={`
                flex items-center gap-2.5 px-5 py-2.5 border-l-[3px] transition-colors
                ${active 
                  ? 'bg-blue-600 bg-opacity-25 border-blue-500 text-white font-semibold' 
                  : 'border-transparent text-gray-300 font-normal hover:bg-gray-700'
                }
              `}>
                <span className="text-[15px]">{item.icon}</span>
                {item.label}
              </div>
            </Link>
          )
        })}
      </nav>

      {/* Credits widget */}
      <div className="mx-3 mb-3 p-3 bg-white bg-opacity-6 rounded-lg">
        <div className="flex justify-between mb-1.5">
          <span className="text-xs text-gray-300">Krediler</span>
          <span className="text-xs text-white font-semibold">
            {profile.credits_used} / {profile.plan === 'premium' ? '∞' : profile.credits_total}
          </span>
        </div>
        {profile.plan === 'free' && (
          <div className="h-1 bg-white bg-opacity-15 rounded-sm overflow-hidden">
            <div className={`
              h-full transition-all rounded-sm
              ${creditsPercent > 80 ? 'bg-red-500' : 'bg-blue-500'}
              ${percentWidthClass(creditsPercent)}
            `} />
          </div>
        )}
        <div className="mt-1.5 text-xs text-gray-300">
          Plan: <span className={`font-semibold ${profile.plan === 'premium' ? 'text-amber-400' : 'text-gray-400'}`}>
            {profile.plan === 'premium' ? 'Premium' : 'Ücretsiz'}
          </span>
        </div>
      </div>

      {/* User + logout */}
      <div className="px-4 py-3 border-t border-white border-opacity-10 flex items-center gap-2.5">
        <div className="w-7.5 h-7.5 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0 overflow-hidden">
          {profile.avatar_url
            ? <img src={profile.avatar_url} alt="" className="w-full h-full object-cover" />
            : (profile.display_name ?? profile.email ?? 'U')[0].toUpperCase()}
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-xs font-medium text-white truncate">
            {profile.display_name ?? profile.email ?? 'Kullanıcı'}
          </div>
        </div>
        <button onClick={handleLogout} title="Çıkış yap" className="
          bg-none border-none cursor-pointer text-gray-300 text-base p-0.5 flex-shrink-0 hover:text-white
        ">↩</button>
      </div>
    </aside>
  )

  // ── Mobile: top bar + slide-in drawer ──────────────────────────────────────
  if (isMobile) {
    return (
      <div className="min-h-screen bg-gray-50">
        <JobNotifier userId={profile.id} />

        {/* Top bar */}
        <header className="
          fixed top-0 left-0 right-0 h-14 z-50 bg-gray-800 flex items-center gap-3 px-4
        ">
          <button onClick={() => setDrawerOpen(true)} aria-label="Menüyü aç" className="
            bg-none border-none text-white text-2xl cursor-pointer p-1 leading-none
          ">☰</button>
          <span className="text-white font-bold text-base">BusinessData</span>
        </header>

        {/* Overlay */}
        {drawerOpen && (
          <div onClick={() => setDrawerOpen(false)} className="
            fixed inset-0 bg-black bg-opacity-50 z-60
          " />
        )}

        {/* Drawer */}
        <div className={`
          fixed top-0 bottom-0 left-0 z-70 flex
          transition-transform duration-200 ease-out
          ${drawerOpen ? 'translate-x-0 shadow-lg' : '-translate-x-full'}
        `}>
          {sidebar}
        </div>

        {/* Content */}
        <main className="pt-14 min-h-screen">
          {children}
        </main>
      </div>
    )
  }

  // ── Desktop: fixed sidebar + content ────────────────────────────────────────
  return (
    <div className="flex min-h-screen bg-gray-50">
      <JobNotifier userId={profile.id} />
      {sidebar}
      <main className="flex-1 min-w-0 overflow-auto">{children}</main>
    </div>
  )
}
