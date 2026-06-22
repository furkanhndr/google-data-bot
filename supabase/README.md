# Supabase Migration Kılavuzu

## Çalıştırma Sırası

Supabase Dashboard → SQL Editor'da aşağıdaki sırayla çalıştır:

| Sıra | Dosya | İçerik |
|------|-------|--------|
| 1 | `migrations/20240001_001_tables.sql` | Tüm tablolar + index'ler |
| 2 | `migrations/20240001_002_rls.sql` | RLS etkinleştirme + politikalar |
| 3 | `migrations/20240001_003_triggers.sql` | Trigger'lar + RPC fonksiyonları |
| 4 | `migrations/20240001_004_storage.sql` | Storage bucket politikaları |

## Storage Bucket'larını Manuel Oluşturma

004 migration'ından önce Supabase Dashboard'da:

1. **Storage** → **New bucket**
   - Name: `exports`
   - Public: **KAPALI** (private)

2. **Storage** → **New bucket**
   - Name: `avatars`
   - Public: **AÇIK** (public)

## Ortam Değişkenleri

Proje kökündeki `.env.local` dosyasına ekle:

```
NEXT_PUBLIC_SUPABASE_URL=https://XXXXX.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
```

> `SUPABASE_SERVICE_ROLE_KEY` sadece sunucu taraflı kullanılır,
> asla client'a expose edilmez.

## İlk Admin Kullanıcısı Oluşturma

Migration'ları çalıştırdıktan sonra Supabase Dashboard → SQL Editor:

```sql
UPDATE public.profiles
SET role = 'admin'
WHERE id = '<kullanıcı_uuid>';
```

Kullanıcı UUID'sini `Authentication → Users` tablosundan bulabilirsin.
