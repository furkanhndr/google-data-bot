import * as XLSX from 'xlsx'
import { EXPORT_COLUMNS } from '@/lib/constants'
import type { BusinessResult } from '@googlebusinessdata/shared-types'

// Human-readable labels for the email enrichment status.
const EMAIL_STATUS_LABELS: Record<string, string> = {
  found:      'Bulundu',
  not_found:  'Bulunamadı',
  no_website: 'Web sitesi yok',
  pending:    'Aranıyor',
}

function flattenRow(r: BusinessResult): Record<string, string | number | boolean | null> {
  return {
    name:                   r.name,
    category:               r.category,
    phone:                  r.phone,
    email:                  r.email,
    email_status:           r.email_status ? (EMAIL_STATUS_LABELS[r.email_status] ?? r.email_status) : 'Denenmedi',
    website:                r.website,
    address_full:           r.address_full,
    city:                   r.city,
    state:                  r.state,
    country:                r.country,
    postal_code:            r.postal_code,
    rating:                 r.rating,
    review_count:           r.review_count,
    price_level:            r.price_level,
    social_facebook:        r.social_facebook,
    social_instagram:       r.social_instagram,
    social_twitter:         r.social_twitter,
    social_linkedin:        r.social_linkedin,
    social_youtube:         r.social_youtube,
    social_tiktok:          r.social_tiktok,
    description:            r.description,
    menu_url:               r.menu_url,
    booking_url:            r.booking_url,
    order_url:              r.order_url,
    maps_url:               r.maps_url,
    place_id:               r.place_id,
    latitude:               r.latitude,
    longitude:              r.longitude,
    is_permanently_closed:  r.is_permanently_closed ? 'Evet' : 'Hayır',
    is_temporarily_closed:  r.is_temporarily_closed ? 'Evet' : 'Hayır',
    scraped_at:             r.scraped_at,
  }
}

const COLUMN_HEADERS: Record<string, string> = {
  name:                   'İşletme Adı',
  category:               'Kategori',
  phone:                  'Telefon',
  email:                  'E-posta',
  email_status:           'E-posta Durumu',
  website:                'Web Site',
  address_full:           'Adres',
  city:                   'Şehir',
  state:                  'İl',
  country:                'Ülke',
  postal_code:            'Posta Kodu',
  rating:                 'Puan',
  review_count:           'Yorum Sayısı',
  price_level:            'Fiyat Seviyesi',
  social_facebook:        'Facebook',
  social_instagram:       'Instagram',
  social_twitter:         'Twitter/X',
  social_linkedin:        'LinkedIn',
  social_youtube:         'YouTube',
  social_tiktok:          'TikTok',
  description:            'Açıklama',
  menu_url:               'Menü URL',
  booking_url:            'Rezervasyon URL',
  order_url:              'Sipariş URL',
  maps_url:               'Google Maps URL',
  place_id:               'Place ID',
  latitude:               'Enlem',
  longitude:              'Boylam',
  is_permanently_closed:  'Kalıcı Kapalı',
  is_temporarily_closed:  'Geçici Kapalı',
  scraped_at:             'Çekilme Tarihi',
}

export function getCsvHeader(): string {
  return EXPORT_COLUMNS.map(k => COLUMN_HEADERS[k] ?? k).join(',')
}

export function serializeCsvRow(result: BusinessResult): string {
  const flat = flattenRow(result)
  return EXPORT_COLUMNS.map(k => {
    const val = flat[k]
    if (val == null) return ''
    const str = String(val)
    if (str.includes(',') || str.includes('"') || str.includes('\n')) {
      return `"${str.replace(/"/g, '""')}"`
    }
    return str
  }).join(',')
}

export function generateCSV(results: BusinessResult[]): Buffer {
  const header = getCsvHeader()
  const rows = results.map(result => serializeCsvRow(result))
  const csv = [header, ...rows].join('\n')
  return Buffer.concat([Buffer.from('﻿', 'utf8'), Buffer.from(csv, 'utf8')])
}

export function generateXLSX(results: BusinessResult[]): Buffer {
  const wsData = [
    // Header row
    EXPORT_COLUMNS.map(k => COLUMN_HEADERS[k] ?? k),
    // Data rows
    ...results.map(r => {
      const flat = flattenRow(r)
      return EXPORT_COLUMNS.map(k => flat[k] ?? '')
    }),
  ]

  const wb = XLSX.utils.book_new()
  const ws = XLSX.utils.aoa_to_sheet(wsData)

  // Column widths
  ws['!cols'] = EXPORT_COLUMNS.map(k => ({
    wch: ['name', 'address_full', 'description'].includes(k) ? 30
       : ['website', 'maps_url', 'menu_url', 'booking_url'].includes(k) ? 40
       : ['email', 'social_facebook', 'social_instagram'].includes(k) ? 28
       : 18,
  }))

  XLSX.utils.book_append_sheet(wb, ws, 'Sonuçlar')
  const buf = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' })
  return Buffer.from(buf)
}
