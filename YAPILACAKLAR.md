# Yapılacaklar & Kritik Maddeler

> Bu dosya, projenin üretime (production) hazır hale gelmesi için gereken
> işleri öncelik sırasına göre listeler. İşaretleme: 🔴 bloklayıcı · 🟡 önemli · 🟢 iyileştirme.

> **🔀 Mimari (güncel):** Scraping artık **resmi Google Places API (New)**
> üzerinden, Next.js API route içinde **sunucu taraflı ve senkron** çalışıyor
> ([app/lib/places.ts](app/lib/places.ts), `POST /api/jobs`). Ayrı worker host,
> Playwright, tarayıcı eklentisi ve proxy yok — tek host (Vercel). Bu, Google
> ToS riskini ve eklenti onay/ban riskini ortadan kaldırdı. Eski
> `scraper-service/` ve `extension/` paketleri tamamen kaldırıldı.

---

## 🔴 Bloklayıcı — bunlar olmadan canlıya çıkılmaz

### 1. Supabase Auth prod ayarları
- **Sorun:** Authentication → URL Configuration hâlâ varsayılan/localhost
  olabilir. Kayıt onayı ve şifre sıfırlama e-postalarındaki linkler yanlış
  domain'e gidebilir.
- **Yapılacak:**
  - **Site URL** → prod domain.
  - **Redirect URLs** → `https://<domain>/auth/callback`.
  - `app/.env.local` / Vercel env: `NEXT_PUBLIC_APP_URL` → prod domain.

### 2. Supabase SMTP
- **Sorun:** Supabase'in varsayılan e-posta servisi düşük rate-limitli,
  sadece test için. Kayıt onayı + şifre sıfırlama bunu kullanıyor.
- **Yapılacak:** Authentication → Emails → SMTP Settings'ten kendi SMTP'ni
  (Resend, Postmark vb.) bağla.

### 3. Vercel ortam değişkenleri doğrulaması
- **Yapılacak:** Production deployment'ta şu değişkenlerin gerçek (placeholder
  olmayan) değerlerle ayarlı olduğunu doğrula:
  `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`,
  `SUPABASE_SERVICE_ROLE_KEY`, `PLACES_API_KEY`, `OUTREACH_ENCRYPTION_KEY`,
  `NEXT_PUBLIC_APP_URL`.

---

## 🟡 Önemli — kısa vadede yapılmalı

### 4. Places API maliyet izleme
- `places_api_quota` tablosu her job sonrası güncelleniyor ama henüz hiçbir
  UI'da gösterilmiyor (admin panelinde maliyet/kota grafiği yok).
- **Yapılacak:** Admin → İstatistikler sayfasına günlük Places API maliyetini
  ekle; ani artışlar için basit bir eşik uyarısı düşünülebilir.

### 5. E-posta zenginleştirme — ölçek
- Mevcut tasarım MVP olarak çalışıyor ama büyük işlerde dış sitelere çok
  istek atıyor (tek serverless invocation içinde sınırlı paralellik).
- **Yapılacak:** Gerçek ölçekte arka plan kuyruğu (Supabase Edge Function /
  cron worker) değerlendir; şimdilik `ENRICH_BATCH_SIZE`/`ENRICH_CONCURRENCY`
  ile sınırlı, kabul edilebilir.

### 6. 60 sonuç sınırı (Places API)
- Google Places Text Search tek sorguda en fazla 60 sonuç döndürüyor
  (sayfalama yapılsa da). Geniş şehir aramalarında bu, gerçek lead hacmini
  sınırlıyor.
- **Yapılacak (opsiyonel, maliyet etkili):** Premium plan için otomatik
  ilçe/alt-bölge bazlı bölme + tekilleştirme — ayrı bir görev olarak ele alınacak.

---

## 🟢 İyileştirmeler

- **7.** Kök dizinde proje README'si yok — kurulum/onboarding dokümanı ekle.
- **8.** `places_api_quota` tablosu yazılıyor ama hiçbir yerde okunup
  gösterilmiyor (bkz. madde 4) — ya tamamla ya tabloyu kaldır.

---

## ✅ Tamamlanan (özet)

- **Mimari geçiş:** Playwright/scraper-service/extension kaldırıldı, resmi
  Places API'ye geçildi (`app/lib/places.ts`, `POST /api/jobs`, inline işleme,
  `maxDuration=60`). Canlı doğrulandı.
- **Veritabanı:** 11 migration uygulanmış — tablolar, RLS (tüm tablolarda
  aktif), trigger'lar, storage bucket'lar (`exports` private, `avatars`
  public), realtime publication (`scraping_jobs`, `business_results`).
- **Test ve CI:** Vitest + GitHub Actions (`type-check` + test + build).
- **Export:** CSV stream + sayfalama (500'lük chunk), XLSX 2000 satıra kadar.
- **Admin paneli:** Kullanıcı yönetimi (rol/plan/kredi/askıya alma), iş
  takibi, istatistikler — ve artık dashboard sidebar'ında admin'e görünen
  bir giriş linki var.
- **Hesap yönetimi:** Profil/avatar, şifre değiştirme, hesap silme, şifremi
  unuttum akışı.
- **Mobil uyumluluk:** Dashboard + Admin layout responsive (drawer + sabit
  sidebar).
- **Outreach (Aşama 1-3):** Şablonlar, WhatsApp/e-posta hazırlama, lead durum
  takibi, SMTP ile gönderim, e-posta kampanyaları (toplu gönderim).
- **E-posta zenginleştirme:** Website taramasından e-posta çıkarımı,
  batch'li/paralel işleme, export'a "E-posta Durumu" kolonu.
- **Dead code temizliği:** Kullanılmayan `/api/extension/validate-session`
  endpoint'i ve artık tracked olmayan `scraper-service/` klasörü kaldırıldı.
