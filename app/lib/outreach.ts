import type {
  BusinessResult,
  MessageTemplate,
  OutreachChannel,
  OutreachSettings,
} from '@googlebusinessdata/shared-types'

export const OUTREACH_VARIABLES = [
  'business_name',
  'category',
  'city',
  'phone',
  'email',
  'website',
  'rating',
  'review_count',
  'sender_name',
  'company_name',
  'sender_email',
  'sender_phone',
] as const

export function getDefaultTemplate(channel: OutreachChannel): Pick<MessageTemplate, 'channel' | 'name' | 'subject' | 'body' | 'is_default' | 'is_active'> {
  if (channel === 'email') {
    return {
      channel,
      name: 'İlk temas e-postası',
      subject: '{business_name} için kısa bir öneri',
      body:
        'Merhaba {business_name},\n\n' +
        '{city} bölgesindeki işletmenizi incelerken size kısa bir öneri iletmek istedim.\n\n' +
        'Uygunsa size nasıl yardımcı olabileceğimizi kısaca paylaşmak isterim.\n\n' +
        'İyi çalışmalar,\n{sender_name}\n{company_name}',
      is_default: true,
      is_active: true,
    }
  }

  return {
    channel,
    name: 'İlk temas WhatsApp',
    subject: null,
    body:
      'Merhaba {business_name}, ben {sender_name}. ' +
      '{city} bölgesindeki işletmenizi gördüm. Size kısa bir öneri iletmek isterim, uygun mudur?',
    is_default: true,
    is_active: true,
  }
}

export function renderTemplate(
  template: string,
  business: BusinessResult,
  settings: Partial<OutreachSettings> | null | undefined,
): string {
  const values: Record<string, string> = {
    business_name: business.name ?? '',
    category: business.category ?? '',
    city: business.city ?? '',
    phone: business.phone ?? '',
    email: business.email ?? '',
    website: business.website ?? '',
    rating: business.rating == null ? '' : String(business.rating),
    review_count: business.review_count == null ? '' : String(business.review_count),
    sender_name: settings?.sender_name ?? '',
    company_name: settings?.company_name ?? '',
    sender_email: settings?.sender_email ?? '',
    sender_phone: settings?.sender_phone ?? '',
  }

  return template.replace(/\{([a-z_]+)\}/g, (_, key: string) => values[key] ?? '')
}

export function buildWhatsAppUrl(phone: string, message: string): string {
  const digits = phone.replace(/\D/g, '')
  return `https://wa.me/${digits}?text=${encodeURIComponent(message)}`
}

export function buildMailtoUrl(email: string, subject: string, body: string): string {
  const params = new URLSearchParams({ subject, body })
  return `mailto:${email}?${params.toString()}`
}
