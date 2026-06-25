# Yapılacaklar & Kritik Maddeler

> Bu dosya, projenin üretime (production) hazır hale gelmesi için gereken
> işleri öncelik sırasına göre listeler. Senior kod incelemesi sonucu çıkan
> bulgulara dayanır. İşaretleme: 🔴 bloklayıcı · 🟡 önemli · 🟢 iyileştirme.

> **🔀 Mimari karar:** Scraping artık tarayıcı eklentisinde değil, **harici
> backend servisinde** (`scraper-service/`, Playwright) çalışıyor. Bu, Chrome
> Web Store onayı ve kullanıcı Google hesabının banlanma riskini ortadan
> kaldırır. Eklentinin scraping akışı ([scraper.ts](extension/src/content/scraper.ts))
> artık kullanılmıyor; sadece [extractor.ts](extension/src/content/extractor.ts)
> ortak kaynak olarak korunuyor.

---

## 🔴 Bloklayıcı — bunlar olmadan canlıya çıkılmaz

### 1. Proxy altyapısı (harici scraping ölçeği)
- **Sorun:** Harici servis tek IP'den çok istek atınca Google datacenter
  IP'lerini hızla engeller. Canlı testte bu doğrulandı (headless'ta detay
  paneli boş/degrade geldi).
- **Yapılacak:**
  - Rotating **residential proxy** entegre et (servis `PROXY_SERVER` ile hazır).
  - Anti-detection'ı sertleştir: `playwright-extra` + stealth, gerçekçi
    gecikme/hareket. Servis şu an sadece `navigator.webdriver` gizliyor.

### 2. Hukuki zemin
- **Sorun:** Google Maps scraping Google ToS'una aykırı (Chrome Web Store riski
  harici servise geçince ortadan kalktı, ama scraping'in kendisi hâlâ ToS dışı).
- **Yapılacak:** Kullanım koşulları + risk uyarısı; ölçek hedefine göre resmi
  Places API yolunu değerlendir.

### 3. Servis canlı doğrulama
- **Yapılacak:** `scraper-service`'i gerçek Supabase kimlik bilgileri + proxy ile
  uçtan uca test et (job oluştur → işlensin → sonuçlar DB'ye yazılsın).
  Çekirdek çıkarım akışı kanıtlandı; DB/worker bağlantısı henüz canlı denenmedi.

---

## 🚀 Deploy / Yapılandırma notları

Canlıya alırken yapılması gerekenler (kod hazır, sadece yapılandırma):

1. **Şifre sıfırlama e-postası — SMTP gerekir.** `resetPasswordForEmail` ve
   kayıt onayı e-postaları Supabase'in varsayılan e-posta servisini kullanır;
   bu servis **düşük rate-limitli, sadece test için**. Üretimde Supabase →
   **Authentication → Emails → SMTP Settings**'ten kendi SMTP'ni (örn. Resend,
   Postmark) bağla.
2. **Auth redirect URL'leri.** Supabase → **Authentication → URL Configuration**:
   - **Site URL**: prod domain
   - **Redirect URLs**: `https://<domain>/auth/callback` (şifre sıfırlama linki
     `/auth/callback?redirectTo=/auth/reset-password` adresine döner).
3. **E-posta onayı (opsiyonel).** Kayıt sonrası anında giriş istiyorsan
   Authentication → Providers → Email → "Confirm email" kapatılabilir
   (güvenlik tercihi).

---

## 🟡 Önemli — kısa vadede yapılmalı

### 4. Test ve CI yokluğu
- Kredi/faturalandırma mantığı, RLS politikaları ve `extractor` için **hiç test yok**.
- **Yapılacak:**
  - `extractor.ts` için sabit HTML fixture'larıyla birim testleri.
  - RLS politikaları için entegrasyon testleri (yetki sızıntısı kontrolü).
  - Faturalandırma akışı için test.
  - GitHub Actions: `type-check` + test + build.

### 5. Extractor kırılganlığı (sağlık izleme)
- **Sorun:** [extractor.ts](extension/src/content/extractor.ts) Google'ın obfuscate
  edilmiş class'larına bağlı (`.DUwDvf`, `.qBF1Pd`). Google bunları sık değiştirir;
  bozulduğunda sessizce boş veri toplanır.
- **Yapılacak:** "Beklenen alan doluluk oranı X'in altına düştü" alarmı / metriği.
  En azından iş başına `name` + `address` doluluk yüzdesini logla.

### 6. Export ölçeklenebilirliği
- **Sorun:** [export/route.ts](app/app/api/jobs/[jobId]/export/route.ts#L36) tüm
  satırları belleğe çekip serverless'ta XLSX üretiyor → 5000 satırda timeout/memory
  riski. Bucket yoksa fallback dosya dönüyor ama `export_history`'ye yazmıyor.
- **Yapılacak:** Büyük export'ları stream'le veya arka plan işine taşı; fallback
  yolunda da geçmişi kaydet.

### 7. E-posta zenginleştirme — ölçek (bkz. ✅ Tamamlanan)
- Mevcut tasarım MVP olarak çalışıyor ama büyük işlerde dış sitelere çok istek atar.
- **Yapılacak:** Gerçek ölçekte arka plan kuyruğu (Supabase Edge Function / cron
  worker) + proxy havuzu + IP rate-limit yönetimi.

### 8. Auth modeli tutarlılığı
- **Sorun:** [validate-session](app/app/api/extension/validate-session/route.ts)
  cookie tabanlı `createClient()` kullanıyor ama eklenti bearer token ile çalışıyor.
- **Yapılacak:** Endpoint'i bearer token'ı doğrulayacak şekilde düzelt veya kaldır.

---

## 🟢 İyileştirmeler

- **10.** Premium `credits_total` DB'de 100 kalıyor ama kod plan kontrolüyle baypas
  ediyor — tek doğruluk kaynağına indir.
- **11.** Ölü scaffolding: `places_api_quota` tablosu ve `source: 'places_api'`
  enum'u implemente edilmemiş — ya tamamla ya temizle.
- **12.** Kök dizinde proje README'si yok — kurulum/onboarding dokümanı ekle.
- **13.** Servis: tek tarayıcı örneği `jobConcurrency` job'ı paylaşıyor; ölçekte
  context/sayfa havuzu sınırı ve job başına timeout ekle.

---

## ✅ Tamamlanan

### Sonuç tablosu — kopyalama butonu
- Telefon ve (dolu olduğunda) e-posta hücrelerine **📋 kopyala** butonu
  ([ResultsTable](app/components/dashboard/ResultsTable.tsx)); panoya kopyalar,
  kısa ✓ geri bildirim, satır tıklamasını engellemez.

### Sidebar tam-yükseklik düzeltmesi
- Mobil drawer için eklenen `height:100%` masaüstü flex-stretch'i bozuyordu
  (sidebar kısa kalıyordu). Kaldırıldı; mobil sarmalayıcıya `display:flex` eklendi.
  Hem Dashboard hem Admin layout.

### Test altyapısı + CI
- **Vitest** kuruldu, 16 test geçiyor: `buildSearchTerm` (kategori dedupe),
  `email-enrich` (mailto `<br` temizleme, blocklist, rol-adresi önceliği,
  concurrency), `extractor` saf fonksiyonları (`extractCity`, `extractPostalCode`).
- **GitHub Actions** ([ci.yml](.github/workflows/ci.yml)) — push/PR'da install +
  extractor build + type-check (app/extension/scraper-service) + test.
- `buildSearchTerm` test edilebilir saf modüle çıkarıldı ([search-term.ts](scraper-service/src/search-term.ts)).

### Admin paneli mobil
- [AdminLayout](app/components/layout/AdminLayout.tsx) responsive drawer'a çevrildi
  (DashboardLayout ile aynı desen).

### Premium kredi gösterimi düzeltmesi
- Premium planda kredi `106 / 100` yerine `106 / ∞` gösteriliyor (sidebar + Ayarlar);
  premium'da ilerleme çubuğu/"kaldı" gizlendi. (YAPILACAKLAR #10 kısmen kapandı.)

### Mobil uyumluluk (kullanıcı paneli)
- **Responsive DashboardLayout** ([DashboardLayout](app/components/layout/DashboardLayout.tsx)) —
  mobilde (<768px) üst bar + soldan kayan drawer (hamburger menü, karartma overlay),
  masaüstünde sabit sidebar. [useMediaQuery](app/lib/hooks/useMediaQuery.ts) hook'u.
- **Responsive grid'ler** — overview + JobForm sabit kolonlar `auto-fit`'e çevrildi
  (dar ekranda tek kolona iner).
- **Viewport meta** root layout'a eklendi. Bonus: avatar artık sidebar'da da görünüyor.
- Playwright ile 375px genişlikte görsel doğrulandı (overview + drawer).
- ⏳ **Kalan:** tam Tailwind geçişi (tüm inline style'lar) ayrı büyük bir refactor;
  admin paneli mobil uyumu henüz yapılmadı.

### Dashboard genel bakış + bildirimler
- **Genel Bakış sayfası** ([dashboard/page.tsx](app/app/dashboard/page.tsx)) —
  istatistik kartları (toplam/tamamlanan iş, toplam sonuç, kalan kredi),
  son 7 gün aktivite grafiği, son işler listesi. Sidebar'a eklendi.
- **İş tamamlandı bildirimi** ([JobNotifier](app/components/layout/JobNotifier.tsx)) —
  Supabase Realtime ile iş `completed`/`failed` olunca in-app toast.
- **Realtime etkinleştirildi** ([migration 007](supabase/migrations/20240001_007_realtime.sql)) —
  `scraping_jobs` + `business_results` publication'a eklendi (canlı sonuç akışı da bundan faydalanır).

### Hesap yönetimi (kullanıcı paneli)
- **Profil düzenleme + avatar** ([ProfileSettings](app/components/settings/ProfileSettings.tsx)) —
  ad değiştirme, foto yükleme (`avatars` bucket, 2 MB).
- **Şifre değiştirme** ([PasswordSettings](app/components/settings/PasswordSettings.tsx)).
- **Hesap silme** ([DangerZone](app/components/settings/DangerZone.tsx) +
  [api/account](app/app/api/account/route.ts)) — "SİL" onayı, service-role, cascade.
- **Şifremi unuttum + sıfırlama** ([forgot-password](app/app/auth/forgot-password/page.tsx),
  [reset-password](app/app/auth/reset-password/page.tsx)) + middleware muafiyeti + login linki.
- Doğrulandı: profil güncelleme RLS altında çalışır, `is_suspended` yükseltme 403.
- ⚠️ E-posta gönderimi için SMTP gerekir (bkz. Deploy notları).

### Harici scraper servisi (`scraper-service/`)
Scraping eklentiden backend'e taşındı. Playwright ile arama → işletme
URL'lerini toplama → **doğrudan navigasyon** → ortak extractor ile çıkarım →
service-role ile DB'ye yazım.
- Atomik job sahiplenme (worker'lar aynı işi almaz), `jobConcurrency`, polling.
- **Faturalandırma düzeltildi:** `scraped_count` artık **gerçekten yazılan**
  satır sayısı; insert hatası işi `failed` yapar (eski sessiz veri kaybı yok).
- Extractor tek kaynaktan derlenip enjekte ediliyor
  ([build-extractor.mjs](scraper-service/scripts/build-extractor.mjs)).
- Proxy desteği (`PROXY_SERVER`), Dockerfile, `source = 'server'`
  ([migration 006](supabase/migrations/20240001_006_server_source.sql)).

### Extractor bug düzeltmeleri (canlı doğrulandı)
- **Puan (rating):** boş `span.ceNzKf` gerçek değeri gölgeliyordu → %0'dan %100'e.
- **Telefon:** tehlikeli "tüm metni tara" fallback'i `06091215182100` gibi çöp
  üretiyordu → kaldırıldı, artık sadece `data-item-id="phone"`/aria-label.
- Canlı test (Kadıköy kafeler): name/category/address/review_count %100,
  rating %100, phone doğru (sahte yok).

### E-posta zenginleştirme (Seçenek A)
Google Maps e-posta vermediği için, toplanan `website` alanından işletmenin
kendi sitesi taranarak e-posta çıkarılıyor.

- **DB:** `business_results.email_status` kolonu
  ([migration 005](supabase/migrations/20240001_005_email_enrichment.sql)).
- **Motor:** [email-enrich.ts](app/lib/utils/email-enrich.ts) — ana sayfa +
  iletişim sayfaları taraması, `mailto:` + regex, sahte adres filtresi,
  rol-adresi önceliği, sınırlı paralellik.
- **API:** [enrich/route.ts](app/app/api/jobs/[jobId]/enrich/route.ts) —
  batch'li (40) + paralel (5), sahiplik kontrollü, ilerleme döndürür.
- **UI:** [EnrichPanel.tsx](app/components/dashboard/EnrichPanel.tsx) ile
  "E-postaları bul" butonu (döngüsel batch), tabloda `mailto:` linki + durum rozeti.
- **Export:** CSV/XLSX'e "E-posta Durumu" kolonu eklendi.

> ⚠️ **Beklenti notu:** Web sitesi olan işletmelerde tipik yakalama oranı
> **%30–60**. İletişim formu kullananlarda e-posta çıkmaz. Bu, müşteriye
> şeffaf şekilde iletilmeli.
