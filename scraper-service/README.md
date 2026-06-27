# Scraper Service

İşletme verisi toplama servisi. **Varsayılan kaynak: resmi Google Places API
(New)** — yasal, izinli ve kararlı. Eski **Playwright scraping** yolu kodda
duruyor ama varsayılan kapalı (`SCRAPE_PROVIDER=scrape` ile açılır).

> ⚠️ **Önemli ürün kısıtı:** Places API sorgu başına **en fazla 60 sonuç**
> döndürür. İş başına sonuç sayısı her planda 60 ile sınırlıdır.

## Nasıl çalışır (Places API — varsayılan)

1. Supabase'de `status = 'pending'` işleri **atomik** sahiplenir.
2. Places API **Text Search (New)**'e tek sorgu atar; field-mask ile telefon,
   web, puan, çalışma saatleri dahil tüm alanları **tek çağrıda** alır
   (ayrı Place Details gerekmez → daha ucuz). 20'şer, en fazla 60 sonuç.
3. [place-mapper](src/place-mapper.ts) ile `business_results` şemasına eşler.
4. Sonuçları batch'ler halinde yazar; `scraped_count` = gerçekten yazılan satır.
5. İş bitince web sitesi olan kayıtlar için e-posta zenginleştirmesi çalışır
   (Places API e-posta vermez; bu adım web sitesinden bulur).

## Eski yol (Playwright scraping)

`SCRAPE_PROVIDER=scrape` ile etkinleşir. Google Maps'te arama → işletme URL'lerine
doğrudan gidip [extractor](../extension/src/content/extractor.ts) ile çıkarır.
Yasal risk (Google ToS) ve ölçekte bot tespiti taşır; sadece yedek/opsiyonel.

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
