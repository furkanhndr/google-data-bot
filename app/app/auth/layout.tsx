import type { ReactNode } from 'react'

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-bg p-6">
      <div className="w-full max-w-[420px]">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2.5">
            <div className="w-9 h-9 bg-primary rounded-lg flex items-center justify-center text-white text-lg font-bold">G</div>
            <span className="text-xl font-bold text-text">BusinessData</span>
          </div>
        </div>

        {/* Card */}
        <div className="bg-bgCard rounded-xl p-8 shadow-md border border-border">
          {children}
        </div>
      </div>
    </div>
  )
}
