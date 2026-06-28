import Link from 'next/link'
import type { ReactNode } from 'react'

export function LegalLayout({ title, updatedAt, children }: { title: string; updatedAt: string; children: ReactNode }) {
  return (
    <div className="min-h-screen bg-bg">
      <header className="border-b border-border bg-bgCard">
        <div className="mx-auto max-w-3xl px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 no-underline">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-white text-base font-bold">G</div>
            <span className="text-base font-bold text-text">Google Business Data</span>
          </Link>
          <Link href="/" className="text-sm text-primary no-underline">← Ana sayfa</Link>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-6 py-12">
        <h1 className="text-3xl font-bold text-text mb-2">{title}</h1>
        <p className="text-sm text-textMuted mb-10">Son güncelleme: {updatedAt}</p>

        <div className="flex flex-col gap-8 text-[15px] leading-relaxed text-text [&_h2]:text-xl [&_h2]:font-semibold [&_h2]:text-text [&_h2]:mt-2 [&_p]:text-text [&_li]:text-text [&_strong]:font-semibold [&_a]:text-primary">
          {children}
        </div>
      </main>
    </div>
  )
}
