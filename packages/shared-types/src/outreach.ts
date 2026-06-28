export type OutreachChannel = 'whatsapp' | 'email'

export type LeadOutreachStatus =
  | 'new'
  | 'prepared'
  | 'whatsapp_opened'
  | 'email_draft_opened'
  | 'sent'
  | 'replied'
  | 'not_interested'
  | 'customer'

export type OutreachEventType = 'prepared' | 'copied' | 'opened' | 'sent' | 'failed' | 'status_changed'

export interface OutreachSettings {
  id: string
  user_id: string
  sender_name: string | null
  company_name: string | null
  sender_email: string | null
  reply_to_email: string | null
  sender_phone: string | null
  website: string | null
  email_signature: string | null
  created_at: string
  updated_at: string
}

export interface MessageTemplate {
  id: string
  user_id: string
  channel: OutreachChannel
  name: string
  subject: string | null
  body: string
  is_default: boolean
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface LeadOutreachState {
  id: string
  user_id: string
  business_result_id: string
  status: LeadOutreachStatus
  last_channel: OutreachChannel | null
  last_template_id: string | null
  last_contacted_at: string | null
  notes: string | null
  created_at: string
  updated_at: string
}

export interface OutreachEvent {
  id: string
  user_id: string
  business_result_id: string
  template_id: string | null
  channel: OutreachChannel
  event_type: OutreachEventType
  subject: string | null
  body: string | null
  provider: string | null
  provider_message_id: string | null
  error_message: string | null
  created_at: string
}
