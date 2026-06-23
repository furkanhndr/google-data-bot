# Scraper Service

Harici (server-side) Google Maps scraping servisi. Tarayıcı eklentisi yerine
backend'de **Playwright** ile çalışır → Chrome Web Store riski ve kullanıcının
Google hesabının banlanma riski yoktur.

## Nasıl çalışır

1. Supabase'de `status = 'pending'` olan işleri **atomik** olarak sahiplenir
   (birden çok worker aynı işi almaz).
2. Google Maps'te arama yapar, sonuç akışını kaydırıp işletme URL'lerini toplar.
3. Her işletme URL'sine **doğrudan gider** (karta tıklamak güvenilmez) ve
   paylaşılan [extractor](../extension/src/content/extractor.ts) ile veriyi çıkarır.
4. Sonuçları batch'ler halinde `business_results`'a yazar; `scraped_count`'u
   **gerçekten yazılan satır sayısıyla** günceller → kredi faturalandırması doğru.

> Extractor tek kaynaktan gelir: `scripts/build-extractor.mjs`, eklentideki
> `extractor.ts`'i tarayıcıya enjekte edilebilir bir JS string'ine derler.
> Böylece seçiciler tek yerde tutulur.

## Kurulum

```bash
cp scraper-service/.env.example scraper-service/.env   # değerleri doldur
npm install                                            # repo kökünde
npx playwright install chromium                        # tarayıcı binary'si
npm run start --workspace=@googlebusinessdata/scraper-service
```

## Ortam değişkenleri

| Değişken | Açıklama |
|----------|----------|
| `SUPABASE_URL` | Supabase proje URL'si |
| `SUPABASE_SERVICE_ROLE_KEY` | RLS'i aşıp yazmak için (gizli!) |
| `PROXY_SERVER` | **Üretimde şart.** Rotating residential proxy URL'si. Boşsa direkt bağlanır. |
| `JOB_CONCURRENCY` | Eş zamanlı iş sayısı (varsayılan 2) |
| `POLL_INTERVAL_MS` | Yeni iş tarama aralığı (varsayılan 5000) |
| `HEADLESS` | `true`/`false` |

## Docker

```bash
docker build -f scraper-service/Dockerfile -t gbd-scraper .
docker run --env-file scraper-service/.env gbd-scraper
```

## ⚠️ Üretim notları

- **Proxy olmadan ölçeklenmez.** Google datacenter IP'lerini hızla engeller;
  rotating residential proxy kullan.
- Anti-detection minimaldir (`navigator.webdriver` gizleme). Ölçekte
  `playwright-extra` + stealth eklentisi, gerçekçi gecikme/hareket ekle.
- Şu an migration 006 ile `source = 'server'` destekleniyor.
