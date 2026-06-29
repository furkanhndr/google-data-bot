import type { Metadata, Viewport } from 'next'
import type { ReactNode } from 'react'
import { Space_Grotesk, DM_Sans } from 'next/font/google'
import { ToastProvider } from '@/components/ui/Toast'
import './globals.css'

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  weight: ['500', '600', '700'],
  variable: '--font-heading',
  display: 'swap',
})

const dmSans = DM_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '700'],
  variable: '--font-body',
  display: 'swap',
})

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'
const TITLE = 'Google Business Data — Google Maps\'ten Satışa Hazır Lead Çıkar'
const DESCRIPTION =
  'Şehir ve kategori seç, binlerce işletmeyi saniyeler içinde tara, filtrele ve kişiselleştirilmiş WhatsApp/e-posta mesajlarıyla satış sürecini tek panelden yönet.'

export const metadata: Metadata = {
  metadataBase: new URL(APP_URL),
  title: {
    default: TITLE,
    template: '%s — Google Business Data',
  },
  description: DESCRIPTION,
  keywords: ['google maps veri', 'lead bulma', 'işletme verisi', 'whatsapp pazarlama', 'b2b lead generation'],
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: APP_URL,
    siteName: 'Google Business Data',
    locale: 'tr_TR',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: TITLE,
    description: DESCRIPTION,
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="tr" className={`${spaceGrotesk.variable} ${dmSans.variable}`}>
      <body>
        <ToastProvider>
          {children}
        </ToastProvider>
      </body>
    </html>
  )
}
