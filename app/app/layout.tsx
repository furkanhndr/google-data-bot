import type { Metadata } from 'next'
import type { ReactNode } from 'react'
import { COLORS } from '@/lib/constants'
import { ToastProvider } from '@/components/ui/Toast'

export const metadata: Metadata = {
  title: 'Google Business Data',
  description: 'Google Maps business data scraping platform',
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="tr">
      <body style={{
        margin: 0,
        padding: 0,
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        backgroundColor: COLORS.bg,
        color: COLORS.text,
        lineHeight: '1.5',
      }}>
        <ToastProvider>
          {children}
        </ToastProvider>
      </body>
    </html>
  )
}
