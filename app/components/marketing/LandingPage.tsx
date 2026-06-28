'use client'

import { useEffect, useRef, useState, type ReactNode } from 'react'
import Link from 'next/link'

function useReveal<T extends HTMLElement>() {
  const ref = useRef<T | null>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true)
          observer.disconnect()
        }
      },
      { threshold: 0.15 }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  return { ref, visible }
}

function Reveal({
  children,
  delay = 0,
  className = '',
}: {
  children: ReactNode
  delay?: number
  className?: string
}) {
  const { ref, visible } = useReveal<HTMLDivElement>()
  return (
    <div
      ref={ref}
      style={{ transitionDelay: visible ? `${delay}ms` : '0ms' }}
      className={`transition-all duration-700 ease-out motion-reduce:transition-none motion-reduce:transform-none ${
        visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
      } ${className}`}
    >
      {children}
    </div>
  )
}

function IconBolt({ className = 'w-6 h-6' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path d="M13 2 4 14h6l-1 8 9-12h-6l1-8Z" fill="currentColor" />
    </svg>
  )
}

function IconMap({ className = 'w-6 h-6' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path
        d="M12 21s-7-6.1-7-11a7 7 0 1 1 14 0c0 4.9-7 11-7 11Z"
        stroke="currentColor"
        strokeWidth="1.7"
      />
      <circle cx="12" cy="10" r="2.4" stroke="currentColor" strokeWidth="1.7" />
    </svg>
  )
}

function IconFilter({ className = 'w-6 h-6' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path d="M4 5h16M7 12h10M10 19h4" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
    </svg>
  )
}

function IconChat({ className = 'w-6 h-6' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path
        d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5Z"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function IconMail({ className = 'w-6 h-6' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <rect x="3" y="5" width="18" height="14" rx="2" stroke="currentColor" strokeWidth="1.7" />
      <path d="m3.5 6.5 8.5 6 8.5-6" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
    </svg>
  )
}

function IconTrack({ className = 'w-6 h-6' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path d="M20 6 9 17l-5-5" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function IconDownload({ className = 'w-6 h-6' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path
        d="M12 3v12m0 0-4-4m4 4 4-4M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function IconArrowRight({ className = 'w-5 h-5' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <path d="M5 12h14m0 0-6-6m6 6-6 6" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function IconPlay({ className = 'w-5 h-5' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M8 5.5v13l11-6.5-11-6.5Z" />
    </svg>
  )
}

const NAV_LINKS = [
  { href: '#ozellikler', label: 'Özellikler' },
  { href: '#nasil-calisir', label: 'Nasıl Çalışır' },
  { href: '#fiyatlandirma', label: 'Fiyatlandırma' },
  { href: '#sss', label: 'SSS' },
]

const FEATURES = [
  {
    icon: IconMap,
    title: 'Google Maps Tarama',
    desc: 'Şehir, kategori ve anahtar kelime ile dakikalar içinde binlerce işletmeyi tarayıp ham veriyi çıkarır.',
    span: 'md:col-span-2',
  },
  {
    icon: IconFilter,
    title: 'Akıllı Filtreleme',
    desc: 'Puan, yorum sayısı, telefon/website varlığı gibi kriterlerle gerçek fırsatları ayıkla.',
    span: '',
  },
  {
    icon: IconChat,
    title: 'WhatsApp Şablonları',
    desc: 'Değişkenli mesaj şablonları hazırla, tek tıkla wa.me linkiyle gönderime hazır mesaj oluştur.',
    span: '',
  },
  {
    icon: IconMail,
    title: 'E-posta Taslakları',
    desc: 'Kişiselleştirilmiş konu ve gövde şablonlarından otomatik mailto taslakları üret.',
    span: 'md:col-span-2',
  },
  {
    icon: IconTrack,
    title: 'Lead Takibi',
    desc: 'Her lead için durum geçmişi: hazırlandı, gönderildi, yanıtladı, müşteri oldu.',
    span: '',
  },
  {
    icon: IconDownload,
    title: 'Excel / CSV Export',
    desc: 'Topladığın tüm veriyi tek tıkla dışa aktar, kendi CRM akışına bağla.',
    span: '',
  },
]

const STEPS = [
  {
    n: '01',
    title: 'Arama oluştur',
    desc: 'Şehir, kategori ve anahtar kelime belirt; tarama işini başlat.',
  },
  {
    n: '02',
    title: 'Sonuçları filtrele',
    desc: 'Puan, yorum sayısı ve iletişim bilgisi olan işletmeleri tek bakışta ayır.',
  },
  {
    n: '03',
    title: 'Şablon seç',
    desc: 'WhatsApp veya e-posta şablonunu değişkenlerle kişiselleştir.',
  },
  {
    n: '04',
    title: 'Gönder ve takip et',
    desc: 'Mesajı aç, gönder, durumu güncelle — lead\'i satışa kadar takip et.',
  },
]

const FAQS = [
  {
    q: 'Hangi verileri çıkarabiliyorum?',
    a: 'İşletme adı, kategori, adres, telefon, web sitesi, puan ve yorum sayısı gibi Google Maps üzerinde herkese açık işletme bilgilerini yapılandırılmış şekilde toplayabilirsin.',
  },
  {
    q: 'Otomatik toplu mesaj gönderimi var mı?',
    a: 'İlk sürümde bilinçli olarak manuel akış kullanılıyor: mesajı hazırlarsın, wa.me veya mailto ile açarsın, sen gönderirsin. Bu hem hesap güvenliğini korur hem de mesajların gerçekten kişiselleştirilmiş kalmasını sağlar.',
  },
  {
    q: 'Kendi e-posta adresimi kullanabilir miyim?',
    a: 'Evet. SMTP ayarlarını tanımlayarak kendi e-posta adresinden gönderim yapabilir, gönderen adı ve imzanı şablonlara otomatik yansıtabilirsin.',
  },
  {
    q: 'Verileri dışa aktarabilir miyim?',
    a: 'Tüm sonuçları Excel veya CSV olarak dışa aktarabilir, kendi CRM ya da tablo akışına aktarabilirsin.',
  },
]

function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="border-b border-white/10">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="flex w-full cursor-pointer items-center justify-between gap-4 py-5 text-left"
      >
        <span className="font-[family-name:var(--font-heading)] text-base font-medium text-white sm:text-lg">
          {q}
        </span>
        <span
          className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-white/15 text-cyan-300 transition-transform duration-300 ${
            open ? 'rotate-45' : ''
          }`}
          aria-hidden="true"
        >
          <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4">
            <path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </span>
      </button>
      <div
        className={`grid overflow-hidden transition-all duration-300 ease-out ${
          open ? 'grid-rows-[1fr] pb-5 opacity-100' : 'grid-rows-[0fr] opacity-0'
        }`}
      >
        <p className="min-h-0 text-sm leading-relaxed text-slate-400 sm:text-base">{a}</p>
      </div>
    </div>
  )
}

export function LandingPage() {
  const [menuOpen, setMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <div
      className="relative min-h-screen overflow-x-hidden bg-[#06080F] font-[family-name:var(--font-body)] text-slate-200 selection:bg-cyan-400/30"
    >
      {/* ambient background layers */}
      <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-40 left-1/2 h-[560px] w-[900px] -translate-x-1/2 rounded-full bg-cyan-500/20 blur-[140px]" />
        <div className="absolute top-[40%] -left-40 h-[420px] w-[420px] rounded-full bg-blue-600/20 blur-[130px]" />
        <div className="absolute bottom-0 right-0 h-[460px] w-[460px] rounded-full bg-orange-500/10 blur-[150px]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.06)_1px,transparent_0)] [background-size:28px_28px] opacity-40" />
      </div>

      {/* NAVBAR */}
      <header className="fixed inset-x-4 top-4 z-50 sm:inset-x-6">
        <div
          className={`mx-auto flex max-w-6xl items-center justify-between rounded-2xl border px-4 py-3 backdrop-blur-xl transition-all duration-300 sm:px-6 ${
            scrolled
              ? 'border-white/10 bg-[#0B0F1A]/80 shadow-[0_8px_30px_rgba(0,0,0,0.4)]'
              : 'border-white/5 bg-[#0B0F1A]/40'
          }`}
        >
          <Link href="/" className="flex items-center gap-2.5">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-cyan-400 to-blue-600 text-[#06080F]">
              <IconMap className="h-5 w-5" />
            </span>
            <span className="font-[family-name:var(--font-heading)] text-sm font-semibold tracking-tight text-white sm:text-base">
              Google Business Data
            </span>
          </Link>

          <nav className="hidden items-center gap-8 md:flex">
            {NAV_LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="text-sm text-slate-300 transition-colors duration-200 hover:text-white"
              >
                {link.label}
              </a>
            ))}
          </nav>

          <div className="hidden items-center gap-3 md:flex">
            <Link
              href="/auth/login"
              className="text-sm font-medium text-slate-300 transition-colors duration-200 hover:text-white"
            >
              Giriş Yap
            </Link>
            <Link
              href="/auth/register"
              className="group flex items-center gap-1.5 rounded-xl bg-white px-4 py-2 text-sm font-semibold text-[#06080F] transition-all duration-200 hover:bg-cyan-300"
            >
              Ücretsiz Başla
              <IconArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" />
            </Link>
          </div>

          <button
            type="button"
            onClick={() => setMenuOpen((o) => !o)}
            aria-label={menuOpen ? 'Menüyü kapat' : 'Menüyü aç'}
            aria-expanded={menuOpen}
            className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-lg border border-white/10 text-white md:hidden"
          >
            <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5">
              {menuOpen ? (
                <path d="M6 6l12 12M18 6 6 18" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
              ) : (
                <path d="M4 7h16M4 12h16M4 17h16" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
              )}
            </svg>
          </button>
        </div>

        {menuOpen && (
          <div className="mx-auto mt-2 max-w-6xl rounded-2xl border border-white/10 bg-[#0B0F1A]/95 p-4 backdrop-blur-xl md:hidden">
            <nav className="flex flex-col gap-1">
              {NAV_LINKS.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={() => setMenuOpen(false)}
                  className="rounded-lg px-3 py-2.5 text-sm text-slate-200 transition-colors duration-200 hover:bg-white/5 hover:text-white"
                >
                  {link.label}
                </a>
              ))}
              <div className="mt-2 flex flex-col gap-2 border-t border-white/10 pt-3">
                <Link
                  href="/auth/login"
                  className="rounded-lg px-3 py-2.5 text-center text-sm font-medium text-slate-200 hover:bg-white/5"
                >
                  Giriş Yap
                </Link>
                <Link
                  href="/auth/register"
                  className="rounded-lg bg-white px-3 py-2.5 text-center text-sm font-semibold text-[#06080F]"
                >
                  Ücretsiz Başla
                </Link>
              </div>
            </nav>
          </div>
        )}
      </header>

      <main className="relative z-10">
        {/* HERO */}
        <section className="px-4 pt-40 pb-24 sm:px-6 sm:pt-48 sm:pb-32">
          <div className="mx-auto max-w-6xl">
            <Reveal className="flex justify-center">
              <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-xs font-medium text-cyan-300">
                <IconBolt className="h-3.5 w-3.5" />
                Lead bul, zenginleştir, satışa dönüştür
              </span>
            </Reveal>

            <Reveal delay={100}>
              <h1 className="mx-auto mt-6 max-w-4xl text-center font-[family-name:var(--font-heading)] text-4xl font-semibold leading-[1.08] tracking-tight text-white sm:text-6xl md:text-7xl">
                Google Maps&apos;ten{' '}
                <span className="bg-gradient-to-r from-cyan-300 via-blue-400 to-orange-400 bg-clip-text text-transparent">
                  satışa hazır lead
                </span>{' '}
                çıkar.
              </h1>
            </Reveal>

            <Reveal delay={180}>
              <p className="mx-auto mt-6 max-w-2xl text-center text-base leading-relaxed text-slate-400 sm:text-lg">
                Şehir ve kategori seç, binlerce işletmeyi saniyeler içinde tara, filtrele
                ve kişiselleştirilmiş WhatsApp / e-posta mesajlarıyla satış sürecini
                tek panelden yönet.
              </p>
            </Reveal>

            <Reveal delay={260}>
              <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
                <Link
                  href="/auth/register"
                  className="group flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-400 to-blue-500 px-7 py-3.5 text-sm font-semibold text-[#06080F] shadow-[0_0_40px_rgba(34,211,238,0.35)] transition-transform duration-200 hover:scale-[1.02] sm:w-auto"
                >
                  Ücretsiz Başla
                  <IconArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" />
                </Link>
                <a
                  href="#nasil-calisir"
                  className="flex w-full items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/5 px-7 py-3.5 text-sm font-semibold text-white transition-colors duration-200 hover:bg-white/10 sm:w-auto"
                >
                  <IconPlay className="h-4 w-4" />
                  Nasıl Çalışır
                </a>
              </div>
            </Reveal>

            {/* hero visual: live-feed mock */}
            <Reveal delay={340}>
              <div className="relative mx-auto mt-16 max-w-4xl">
                <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-1.5 shadow-[0_30px_80px_-20px_rgba(0,0,0,0.6)] backdrop-blur-xl sm:p-2">
                  <div className="flex items-center gap-2 px-3 py-2.5">
                    <span className="h-2.5 w-2.5 rounded-full bg-red-400/70" />
                    <span className="h-2.5 w-2.5 rounded-full bg-yellow-400/70" />
                    <span className="h-2.5 w-2.5 rounded-full bg-green-400/70" />
                    <span className="ml-3 text-xs text-slate-500">Tarama: &quot;kuaför &middot; İstanbul&quot;</span>
                  </div>
                  <div className="rounded-xl border border-white/5 bg-[#070A12] p-4 sm:p-6">
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                      {[
                        { name: 'Atelier Hair Studio', meta: '4.8 ★ · 212 yorum · web sitesi yok', tag: 'Yeni' },
                        { name: 'Modern Kuaför', meta: '4.6 ★ · 98 yorum · telefon var', tag: 'Hazırlandı' },
                        { name: 'StyleHouse', meta: '4.9 ★ · 340 yorum · email var', tag: 'Gönderildi' },
                      ].map((row) => (
                        <div
                          key={row.name}
                          className="rounded-lg border border-white/5 bg-white/[0.02] p-3.5 transition-colors duration-200 hover:border-cyan-400/30"
                        >
                          <div className="flex items-center justify-between gap-2">
                            <p className="text-sm font-medium text-white">{row.name}</p>
                            <span className="shrink-0 rounded-full bg-cyan-400/10 px-2 py-0.5 text-[11px] font-medium text-cyan-300">
                              {row.tag}
                            </span>
                          </div>
                          <p className="mt-1.5 text-xs text-slate-500">{row.meta}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="absolute -bottom-5 left-1/2 h-10 w-2/3 -translate-x-1/2 rounded-full bg-cyan-500/20 blur-2xl" />
              </div>
            </Reveal>
          </div>
        </section>

        {/* FEATURES — bento grid */}
        <section id="ozellikler" className="px-4 py-24 sm:px-6 sm:py-32">
          <div className="mx-auto max-w-6xl">
            <Reveal className="mx-auto max-w-2xl text-center">
              <h2 className="font-[family-name:var(--font-heading)] text-3xl font-semibold tracking-tight text-white sm:text-4xl">
                Tek panel, baştan sona satış akışı
              </h2>
              <p className="mt-4 text-base leading-relaxed text-slate-400 sm:text-lg">
                Veriyi bulmaktan mesajı göndermeye, lead durumunu takip etmekten dışa
                aktarmaya kadar her şey bir arada.
              </p>
            </Reveal>

            <div className="mt-14 grid grid-cols-1 gap-4 md:grid-cols-3">
              {FEATURES.map((f, i) => {
                const Icon = f.icon
                return (
                  <Reveal key={f.title} delay={i * 80} className={f.span}>
                    <div className="group h-full cursor-pointer rounded-2xl border border-white/10 bg-white/[0.03] p-6 transition-all duration-300 hover:border-cyan-400/30 hover:bg-white/[0.05]">
                      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-400/20 to-blue-500/20 text-cyan-300 transition-transform duration-300 group-hover:scale-105">
                        <Icon className="h-5.5 w-5.5" />
                      </div>
                      <h3 className="mt-5 font-[family-name:var(--font-heading)] text-lg font-medium text-white">
                        {f.title}
                      </h3>
                      <p className="mt-2 text-sm leading-relaxed text-slate-400">{f.desc}</p>
                    </div>
                  </Reveal>
                )
              })}
            </div>
          </div>
        </section>

        {/* HOW IT WORKS */}
        <section id="nasil-calisir" className="px-4 py-24 sm:px-6 sm:py-32">
          <div className="mx-auto max-w-6xl">
            <Reveal className="mx-auto max-w-2xl text-center">
              <h2 className="font-[family-name:var(--font-heading)] text-3xl font-semibold tracking-tight text-white sm:text-4xl">
                4 adımda lead&apos;den müşteriye
              </h2>
            </Reveal>

            <div className="mt-14 grid grid-cols-1 gap-px overflow-hidden rounded-2xl border border-white/10 bg-white/10 sm:grid-cols-2 lg:grid-cols-4">
              {STEPS.map((step, i) => (
                <Reveal key={step.n} delay={i * 100} className="bg-[#0A0D17] p-7">
                  <span className="font-[family-name:var(--font-heading)] text-3xl font-semibold text-white/15">
                    {step.n}
                  </span>
                  <h3 className="mt-4 font-[family-name:var(--font-heading)] text-base font-medium text-white">
                    {step.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-slate-400">{step.desc}</p>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* OUTREACH SHOWCASE */}
        <section className="px-4 py-24 sm:px-6 sm:py-32">
          <div className="mx-auto grid max-w-6xl grid-cols-1 items-center gap-12 lg:grid-cols-2">
            <Reveal>
              <span className="text-xs font-semibold uppercase tracking-widest text-orange-400">
                Kişiselleştirilmiş Mesaj
              </span>
              <h2 className="mt-4 font-[family-name:var(--font-heading)] text-3xl font-semibold tracking-tight text-white sm:text-4xl">
                Her lead için hazır, kişisel bir mesaj
              </h2>
              <p className="mt-5 text-base leading-relaxed text-slate-400 sm:text-lg">
                Şablonlarına <code className="rounded bg-white/10 px-1.5 py-0.5 text-cyan-300">
                  {'{business_name}'}
                </code>{' '}
                gibi değişkenler ekle, sistem her lead için otomatik doldursun. Tek
                tıkla WhatsApp&apos;ta aç veya e-posta taslağını kopyala.
              </p>
              <ul className="mt-6 space-y-3">
                {['wa.me linkiyle anında aç', 'mailto taslağı otomatik hazırlanır', 'Gönderim ve yanıt durumu lead geçmişinde'].map(
                  (item) => (
                    <li key={item} className="flex items-center gap-3 text-sm text-slate-300">
                      <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-cyan-400/15 text-cyan-300">
                        <IconTrack className="h-3 w-3" />
                      </span>
                      {item}
                    </li>
                  )
                )}
              </ul>
            </Reveal>

            <Reveal delay={120}>
              <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 backdrop-blur-xl">
                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <IconChat className="h-4 w-4 text-cyan-300" />
                  WhatsApp şablonu
                </div>
                <div className="mt-4 rounded-xl bg-[#070A12] p-4 text-sm leading-relaxed text-slate-300">
                  Merhaba <span className="rounded bg-cyan-400/15 px-1 text-cyan-300">{'{business_name}'}</span>, sizi{' '}
                  <span className="rounded bg-cyan-400/15 px-1 text-cyan-300">{'{city}'}</span> bölgesinde{' '}
                  <span className="rounded bg-cyan-400/15 px-1 text-cyan-300">{'{category}'}</span> aramaları arasında
                  fark ettim. {'{sender_name}'} olarak kısa bir bilgi vermek isterim...
                </div>
                <button
                  type="button"
                  disabled
                  className="mt-4 flex w-full cursor-not-allowed items-center justify-center gap-2 rounded-lg bg-cyan-400/15 px-4 py-2.5 text-sm font-medium text-cyan-300"
                >
                  <IconChat className="h-4 w-4" />
                  WhatsApp&apos;ta Aç (önizleme)
                </button>
              </div>
            </Reveal>
          </div>
        </section>

        {/* PRICING */}
        <section id="fiyatlandirma" className="px-4 py-24 sm:px-6 sm:py-32">
          <div className="mx-auto max-w-6xl">
            <Reveal className="mx-auto max-w-2xl text-center">
              <h2 className="font-[family-name:var(--font-heading)] text-3xl font-semibold tracking-tight text-white sm:text-4xl">
                Basit, şeffaf fiyatlandırma
              </h2>
              <p className="mt-4 text-base text-slate-400 sm:text-lg">İstediğin an yükselt veya düşür.</p>
            </Reveal>

            <div className="mx-auto mt-14 grid max-w-4xl grid-cols-1 gap-6 sm:grid-cols-2">
              <Reveal>
                <div className="h-full rounded-2xl border border-white/10 bg-white/[0.03] p-8">
                  <h3 className="font-[family-name:var(--font-heading)] text-xl font-medium text-white">Başlangıç</h3>
                  <p className="mt-1 text-sm text-slate-400">Denemek isteyenler için</p>
                  <p className="mt-6 font-[family-name:var(--font-heading)] text-4xl font-semibold text-white">
                    Ücretsiz
                  </p>
                  <ul className="mt-6 space-y-3 text-sm text-slate-300">
                    {['Aylık sınırlı tarama kotası', 'Temel filtreleme', 'Excel/CSV export', 'Tek kullanıcı'].map(
                      (item) => (
                        <li key={item} className="flex items-center gap-3">
                          <IconTrack className="h-4 w-4 shrink-0 text-cyan-300" />
                          {item}
                        </li>
                      )
                    )}
                  </ul>
                  <Link
                    href="/auth/register"
                    className="mt-8 flex w-full items-center justify-center rounded-xl border border-white/15 px-5 py-3 text-sm font-semibold text-white transition-colors duration-200 hover:bg-white/10"
                  >
                    Ücretsiz Başla
                  </Link>
                </div>
              </Reveal>

              <Reveal delay={100}>
                <div className="relative h-full rounded-2xl border border-cyan-400/40 bg-gradient-to-b from-cyan-400/10 to-transparent p-8">
                  <span className="absolute -top-3 right-8 rounded-full bg-gradient-to-r from-cyan-400 to-blue-500 px-3 py-1 text-xs font-semibold text-[#06080F]">
                    Önerilen
                  </span>
                  <h3 className="font-[family-name:var(--font-heading)] text-xl font-medium text-white">Pro</h3>
                  <p className="mt-1 text-sm text-slate-400">Aktif satış ekipleri için</p>
                  <p className="mt-6 font-[family-name:var(--font-heading)] text-4xl font-semibold text-white">
                    Aylık plan
                  </p>
                  <ul className="mt-6 space-y-3 text-sm text-slate-300">
                    {[
                      'Yüksek tarama kotası',
                      'Gelişmiş filtreleme ve zenginleştirme',
                      'WhatsApp + e-posta şablonları',
                      'Lead durumu ve gönderim geçmişi',
                      'Kendi SMTP/e-posta entegrasyonun',
                    ].map((item) => (
                      <li key={item} className="flex items-center gap-3">
                        <IconTrack className="h-4 w-4 shrink-0 text-cyan-300" />
                        {item}
                      </li>
                    ))}
                  </ul>
                  <Link
                    href="/auth/register"
                    className="mt-8 flex w-full items-center justify-center rounded-xl bg-gradient-to-r from-cyan-400 to-blue-500 px-5 py-3 text-sm font-semibold text-[#06080F] transition-transform duration-200 hover:scale-[1.02]"
                  >
                    Pro&apos;ya Geç
                  </Link>
                </div>
              </Reveal>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section id="sss" className="px-4 py-24 sm:px-6 sm:py-32">
          <div className="mx-auto max-w-3xl">
            <Reveal className="text-center">
              <h2 className="font-[family-name:var(--font-heading)] text-3xl font-semibold tracking-tight text-white sm:text-4xl">
                Sıkça sorulan sorular
              </h2>
            </Reveal>
            <Reveal delay={100} className="mt-12">
              <div>
                {FAQS.map((item) => (
                  <FaqItem key={item.q} q={item.q} a={item.a} />
                ))}
              </div>
            </Reveal>
          </div>
        </section>

        {/* FINAL CTA */}
        <section className="px-4 py-24 sm:px-6 sm:py-32">
          <Reveal className="mx-auto max-w-4xl">
            <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-[#0B0F1A] via-[#0B0F1A] to-cyan-950/40 px-6 py-16 text-center sm:px-16">
              <div className="pointer-events-none absolute -top-24 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-cyan-500/20 blur-[100px]" />
              <h2 className="relative font-[family-name:var(--font-heading)] text-3xl font-semibold tracking-tight text-white sm:text-4xl">
                Bir sonraki müşterin Google Maps&apos;te seni bekliyor.
              </h2>
              <p className="relative mx-auto mt-4 max-w-xl text-base text-slate-400 sm:text-lg">
                Ücretsiz başla, ilk taramanı dakikalar içinde tamamla.
              </p>
              <Link
                href="/auth/register"
                className="relative mt-8 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-cyan-400 to-blue-500 px-8 py-3.5 text-sm font-semibold text-[#06080F] shadow-[0_0_40px_rgba(34,211,238,0.35)] transition-transform duration-200 hover:scale-[1.02]"
              >
                Ücretsiz Başla
                <IconArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </Reveal>
        </section>
      </main>

      <footer className="border-t border-white/10 px-4 py-10 sm:px-6">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 sm:flex-row">
          <div className="flex items-center gap-2.5">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-cyan-400 to-blue-600 text-[#06080F]">
              <IconMap className="h-4 w-4" />
            </span>
            <span className="font-[family-name:var(--font-heading)] text-sm font-medium text-white">
              Google Business Data
            </span>
          </div>
          <p className="text-xs text-slate-500">
            © {new Date().getFullYear()} Google Business Data. Tüm hakları saklıdır.
          </p>
        </div>
      </footer>
    </div>
  )
}
