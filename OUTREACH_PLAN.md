# WhatsApp & E-posta Outreach Planı

Bu plan, ürünü sadece işletme verisi çıkaran bir araçtan satış operasyonu
aracına taşımak için hazırlanmıştır. Amaç: kullanıcıların topladıkları lead'lere
kişiselleştirilmiş WhatsApp ve e-posta mesajları hazırlayabilmesi, gönderim
ayarlarını yönetebilmesi ve iletişim sürecini takip edebilmesi.

## Ürün Hedefi

Kullanıcı şunları yapabilmeli:

- Lead listesi oluşturmak.
- WhatsApp ve e-posta mesaj şablonları tanımlamak.
- Şablonlarda işletme verilerini değişken olarak kullanmak.
- Kendi gönderen bilgilerini ve iletişim ayarlarını tanımlamak.
- Lead bazında mesaj hazırlamak.
- Gönderim durumunu takip etmek.
- İlerleyen aşamada kontrollü otomatik gönderim yapmak.

Temel konumlandırma:

> Lead bul, zenginleştir, kişiselleştirilmiş mesaj hazırla ve satış sürecini takip et.

## Aşama 1 — Şablon ve Manuel Gönderim MVP

Bu aşamada otomatik toplu gönderim yoktur. Risk düşük, geliştirme hızlıdır.

### Şablon Yönetimi

Kullanıcı aşağıdaki şablonları oluşturabilmeli:

- WhatsApp mesaj şablonu
- E-posta konu şablonu
- E-posta gövde şablonu

Şablon alanları:

- Şablon adı
- Kanal: `whatsapp` veya `email`
- Konu: sadece e-posta için
- Mesaj gövdesi
- Varsayılan şablon mu?
- Aktif/pasif durumu

Desteklenecek değişkenler:

- `{business_name}`
- `{category}`
- `{city}`
- `{phone}`
- `{email}`
- `{website}`
- `{rating}`
- `{review_count}`
- `{sender_name}`
- `{company_name}`
- `{sender_email}`
- `{sender_phone}`

### Lead Üzerinden Mesaj Hazırlama

Sonuç tablosunda veya job detayında:

- WhatsApp mesajı oluştur
- WhatsApp linkiyle aç: `https://wa.me/<phone>?text=<message>`
- Mesajı panoya kopyala
- E-posta taslağı oluştur: `mailto:` linki
- E-posta konu/gövde kopyala

### Lead Durum Takibi

Lead bazında basit durum alanı eklenmeli:

- Yeni
- Hazırlandı
- WhatsApp açıldı
- E-posta taslağı açıldı
- Gönderildi
- Yanıtladı
- İlgilenmiyor
- Müşteri oldu

İlk MVP'de bu durumlar manuel güncellenebilir.

## Aşama 2 — Gönderim Ayarları

Dashboard ayarlarına yeni bir bölüm eklenir: `Gönderim Ayarları`.

### Profil Bilgileri

Kullanıcı şu bilgileri tanımlar:

- Gönderen adı
- Firma adı
- Varsayılan e-posta adresi
- Reply-to e-posta adresi
- Varsayılan WhatsApp numarası
- E-posta imzası
- Web sitesi

Bu bilgiler şablon değişkenlerinde kullanılabilir.

### E-posta Sağlayıcı Ayarları

İlk teknik seçenek SMTP olmalı:

- SMTP host
- SMTP port
- Kullanıcı adı
- Şifre veya app password
- From e-posta
- From isim
- Test e-postası gönder

İleri aşama sağlayıcılar:

- Resend
- Postmark
- SendGrid
- Gmail OAuth

Not: İlk public versiyonda kullanıcıya ait SMTP/sağlayıcı kullanmak, platformun
mail reputation riskini azaltır.

### WhatsApp Ayarları

İlk MVP'de otomatik gönderim yerine manuel `wa.me` akışı kullanılmalı.

Otomatik gönderim için ileride desteklenebilecek sağlayıcılar:

- WhatsApp Business Cloud API
- Twilio WhatsApp
- 360dialog
- WATI / Interakt benzeri sağlayıcılar

Kişisel WhatsApp Web otomasyonu ürün riski taşır:

- Hesap ban riski
- Abuse/spam riski
- Teknik kırılganlık
- Platform politikası riski

Bu yüzden otomatik WhatsApp gönderimi sadece resmi Business API üzerinden
düşünülmelidir.

## Aşama 3 — Kampanya Sistemi

Bu aşamada ürün satış operasyon aracına dönüşür.

### Kampanya Oluşturma

Kullanıcı:

- Lead listesi seçer.
- Kanal seçer: WhatsApp veya e-posta.
- Şablon seçer.
- Kişiselleştirilmiş önizleme görür.
- Gönderim limitini belirler.
- Kampanyayı başlatır veya taslak olarak saklar.

### Kampanya Durumları

- Taslak
- Hazır
- Devam ediyor
- Tamamlandı
- Durduruldu
- Hatalı

### Lead Gönderim Geçmişi

Her lead için:

- Hangi şablon kullanıldı?
- Hangi kanal kullanıldı?
- Mesaj içeriği neydi?
- Ne zaman hazırlandı?
- Ne zaman gönderildi?
- Hata oldu mu?
- Yanıt geldi mi?

Durum: İlk lead geçmişi ekranı eklendi. Kopyalama/açma/gönderildi ve manuel
durum değişiklikleri lead modalında geçmiş olarak listeleniyor.

## Veri Modeli Taslağı

### `outreach_settings`

Kullanıcı bazlı gönderim ayarları.

- `id`
- `user_id`
- `sender_name`
- `company_name`
- `sender_email`
- `reply_to_email`
- `sender_phone`
- `website`
- `email_signature`
- `created_at`
- `updated_at`

### `message_templates`

WhatsApp/e-posta şablonları.

- `id`
- `user_id`
- `channel`
- `name`
- `subject`
- `body`
- `is_default`
- `is_active`
- `created_at`
- `updated_at`

### `lead_outreach_status`

Lead bazlı durum ve son iletişim bilgisi.

- `id`
- `user_id`
- `business_result_id`
- `status`
- `last_channel`
- `last_template_id`
- `last_contacted_at`
- `notes`
- `created_at`
- `updated_at`

### `outreach_events`

Mesaj hazırlama/gönderim geçmişi.

- `id`
- `user_id`
- `business_result_id`
- `template_id`
- `channel`
- `event_type`
- `subject`
- `body`
- `provider`
- `provider_message_id`
- `error_message`
- `created_at`

### `campaigns`

İleri aşama kampanyalar.

- `id`
- `user_id`
- `name`
- `channel`
- `template_id`
- `status`
- `daily_limit`
- `created_at`
- `started_at`
- `completed_at`

## UI Alanları

### Ayarlar

Yeni menü:

- Gönderim Ayarları
- Şablonlar
- Entegrasyonlar

### Job Detay / Sonuç Tablosu

Yeni aksiyonlar:

- WhatsApp hazırla
- WhatsApp'ta aç
- E-posta hazırla
- Mesajı kopyala
- Durum değiştir
- Not ekle

### Lead Detay Paneli

İleride tablo satırına tıklayınca açılabilir:

- İşletme bilgileri
- İletişim bilgileri
- Şablon seçimi
- Mesaj önizleme
- Gönderim geçmişi
- Notlar

## MVP Öncelik Sırası

1. `message_templates` tablosu ve şablon CRUD.
2. `outreach_settings` tablosu ve ayarlar ekranı.
3. Şablon değişkenlerini render eden helper.
4. Lead tablosunda WhatsApp mesajı kopyala / WhatsApp'ta aç.
5. Lead tablosunda e-posta taslağı kopyala / `mailto:` aç.
6. `lead_outreach_status` ile manuel durum takibi.
7. `outreach_events` ile hazırlanan mesaj geçmişi.

## Başarı Metrikleri

- Oluşturulan şablon sayısı.
- WhatsApp açma/kopyalama sayısı.
- E-posta taslağı oluşturma sayısı.
- Lead başına iletişim oranı.
- Yanıtladı / müşteri oldu olarak işaretlenen lead oranı.
- Export yerine ürün içinden takip edilen lead oranı.

## Riskler

- Otomatik WhatsApp gönderimi erken eklenirse ban ve abuse riski yüksek olur.
- Platform üzerinden e-posta gönderimi yapılırsa mail reputation riski doğar.
- Kullanıcılar spam amaçlı kullanabilir; günlük limit ve abuse monitoring gerekir.
- KVKK/GDPR ve izinli iletişim metinleri net hazırlanmalıdır.

## PM Kararı

İlk sürümde otomatik toplu gönderim yerine mesaj hazırlama, kopyalama, `wa.me`
ile açma ve `mailto:` taslak oluşturma yapılmalı. Bu, değeri hızlı gösterir ve
riski düşük tutar. Otomatik gönderim, kullanıcıların gerçekten bu akışı kullandığı
kanıtlandıktan sonra resmi sağlayıcı entegrasyonlarıyla eklenmelidir.
