import Link from 'next/link'
import type { ReactNode } from 'react'

function IconMap() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" aria-hidden="true">
      <path
        d="M12 21s-7-6.1-7-11a7 7 0 1 1 14 0c0 4.9-7 11-7 11Z"
        stroke="currentColor"
        strokeWidth="1.7"
      />
      <circle cx="12" cy="10" r="2.4" stroke="currentColor" strokeWidth="1.7" />
    </svg>
  )
}

function IconCheck() {
  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-3.5 w-3.5 shrink-0" aria-hidden="true">
      <path d="M20 6 9 17l-5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

const VALUE_PROPS = [
  'Google Maps\'ten saniyeler içinde binlerce işletme verisi',
  'WhatsApp ve e-posta şablonlarıyla kişiselleştirilmiş gönderim',
  'Lead durumu takibi ve Excel/CSV dışa aktarma',
]

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen bg-bg">
      {/* Brand panel — desktop only */}
      <div className="relative hidden w-[44%] flex-col justify-between overflow-hidden bg-[#06080F] px-12 py-12 lg:flex">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -top-32 left-1/2 h-[480px] w-[480px] -translate-x-1/2 rounded-full bg-cyan-500/20 blur-[120px]" />
          <div className="absolute bottom-0 -left-20 h-[360px] w-[360px] rounded-full bg-blue-600/20 blur-[120px]" />
        </div>

        <Link href="/" className="relative z-10 flex items-center gap-2.5 no-underline">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-cyan-400 to-blue-600 text-[#06080F]">
            <IconMap />
          </span>
          <span className="font-[family-name:var(--font-heading)] text-base font-semibold text-white">
            Google Business Data
          </span>
        </Link>

        <div className="relative z-10">
          <h2 className="font-[family-name:var(--font-heading)] text-3xl font-semibold leading-tight text-white">
            Bir sonraki müşterin{' '}
            <span className="bg-gradient-to-r from-cyan-300 to-blue-400 bg-clip-text text-transparent">
              Google Maps&apos;te
            </span>{' '}
            seni bekliyor.
          </h2>
          <ul className="mt-8 flex flex-col gap-3.5">
            {VALUE_PROPS.map((item) => (
              <li key={item} className="flex items-start gap-3 text-sm text-slate-300">
                <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-cyan-400/15 text-cyan-300">
                  <IconCheck />
                </span>
                {item}
              </li>
            ))}
          </ul>
        </div>

        <p className="relative z-10 text-xs text-slate-500">
          © {new Date().getFullYear()} Google Business Data. Tüm hakları saklıdır.
        </p>
      </div>

      {/* Form panel */}
      <div className="flex flex-1 flex-col items-center justify-center px-6 py-12">
        <div className="w-full max-w-[420px]">
          <div className="mb-8 text-center lg:hidden">
            <Link href="/" className="inline-flex items-center gap-2.5 no-underline">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-lg font-bold text-white">
                G
              </div>
              <span className="text-xl font-bold text-text">BusinessData</span>
            </Link>
          </div>

          <div className="rounded-2xl border border-border bg-bgCard p-8 shadow-sm">
            {children}
          </div>
        </div>
      </div>
    </div>
  )
}
