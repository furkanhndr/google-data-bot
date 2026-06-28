'use client'

import { useEffect, useMemo, useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { useToast } from '@/components/ui/Toast'
import {
  buildMailtoUrl,
  buildWhatsAppUrl,
  getDefaultTemplate,
  renderTemplate,
} from '@/lib/outreach'
import type {
  BusinessResult,
  LeadOutreachState,
  LeadOutreachStatus,
  MessageTemplate,
  OutreachChannel,
  OutreachEvent,
  OutreachEventType,
  OutreachSettings,
} from '@googlebusinessdata/shared-types'

const COLUMNS = [
  { key: 'name',         label: 'İşletme Adı',  widthClass: 'w-[200px]', maxWidthClass: 'max-w-[200px]' },
  { key: 'category',     label: 'Kategori',      widthClass: 'w-[130px]', maxWidthClass: 'max-w-[130px]' },
  { key: 'phone',        label: 'Telefon',       widthClass: 'w-[130px]', maxWidthClass: 'max-w-[130px]' },
  { key: 'email',        label: 'E-posta',       widthClass: 'w-[180px]', maxWidthClass: 'max-w-[180px]' },
  { key: 'website',      label: 'Web Site',      widthClass: 'w-[160px]', maxWidthClass: 'max-w-[160px]' },
  { key: 'address_full', label: 'Adres',         widthClass: 'w-[200px]', maxWidthClass: 'max-w-[200px]' },
  { key: 'city',         label: 'Şehir',         widthClass: 'w-[100px]', maxWidthClass: 'max-w-[100px]' },
  { key: 'rating',       label: 'Puan',          widthClass: 'w-[70px]',  maxWidthClass: 'max-w-[70px]' },
  { key: 'review_count', label: 'Yorum',         widthClass: 'w-[70px]',  maxWidthClass: 'max-w-[70px]' },
  { key: 'outreach',     label: 'İletişim',      widthClass: 'w-[120px]', maxWidthClass: 'max-w-[120px]' },
]

// Hint shown in the email column when no email was found, reflecting why.
const EMAIL_STATUS_HINT: Record<string, string> = {
  not_found:  'bulunamadı',
  no_website: 'web sitesi yok',
  pending:    'aranıyor…',
}

const statusLabels: Record<LeadOutreachStatus, string> = {
  new: 'Yeni',
  prepared: 'Hazırlandı',
  whatsapp_opened: 'WhatsApp açıldı',
  email_draft_opened: 'E-posta açıldı',
  sent: 'Gönderildi',
  replied: 'Yanıtladı',
  not_interested: 'İlgilenmiyor',
  customer: 'Müşteri',
}

const statusClasses: Record<LeadOutreachStatus, string> = {
  new: 'bg-gray-50 text-textMuted',
  prepared: 'bg-blue-50 text-primary',
  whatsapp_opened: 'bg-green-50 text-green-700',
  email_draft_opened: 'bg-blue-50 text-primary',
  sent: 'bg-yellow-50 text-yellow-700',
  replied: 'bg-green-50 text-green-700',
  not_interested: 'bg-red-50 text-danger',
  customer: 'bg-green-50 text-success',
}

const eventLabels: Record<OutreachEventType, string> = {
  prepared: 'Taslak hazırlandı',
  copied: 'Mesaj kopyalandı',
  opened: 'Gönderim ekranı açıldı',
  sent: 'Gönderildi',
  failed: 'Hata aldı',
  status_changed: 'Durum güncellendi',
}

// Small inline button that copies a value to the clipboard with brief feedback.
function CopyButton({ value }: { value: string }) {
  const [copied, setCopied] = useState(false)
  return (
    <button
      type="button"
      title="Kopyala"
      aria-label="Kopyala"
      onClick={e => {
        e.stopPropagation()
        navigator.clipboard?.writeText(value).then(() => {
          setCopied(true)
          setTimeout(() => setCopied(false), 1200)
        }).catch(() => {})
      }}
      className={`bg-none border-none cursor-pointer p-0.5 ml-1 flex-shrink-0 leading-none text-xs transition-colors ${
        copied ? 'text-green-600' : 'text-gray-400'
      }`}
    >
      {copied ? '✓' : '📋'}
    </button>
  )
}

function CellValue({
  col,
  row,
  status,
  onOutreach,
}: {
  col: string
  row: BusinessResult
  status?: LeadOutreachState
  onOutreach: (row: BusinessResult, channel: OutreachChannel) => void
}) {
  if (col === 'outreach') {
    const leadStatus = status?.status ?? 'new'
    return (
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-1">
          <span className={`inline-flex w-fit rounded-full px-2 py-0.5 text-[11px] font-medium ${statusClasses[leadStatus]}`}>
            {statusLabels[leadStatus]}
          </span>
          {status?.notes && (
            <span title={status.notes} className="text-[11px] text-textMuted">📝</span>
          )}
        </div>
        <div className="flex flex-col gap-1">
          <button
            type="button"
            title="WhatsApp mesajı hazırla"
            disabled={!row.phone}
            onClick={e => { e.stopPropagation(); onOutreach(row, 'whatsapp') }}
            className="inline-flex items-center justify-center gap-1 px-2 py-1 rounded border border-green-300 text-xs text-green-700 disabled:border-border disabled:text-textLight disabled:cursor-not-allowed"
          >
            <span>💬</span>
            <span>WhatsApp</span>
          </button>
          <button
            type="button"
            title="E-posta hazırla"
            disabled={!row.email}
            onClick={e => { e.stopPropagation(); onOutreach(row, 'email') }}
            className="inline-flex items-center justify-center gap-1 px-2 py-1 rounded border border-blue-300 text-xs text-primary disabled:border-border disabled:text-textLight disabled:cursor-not-allowed"
          >
            <span>✉</span>
            <span>E-posta</span>
          </button>
        </div>
      </div>
    )
  }

  const val = (row as unknown as Record<string, unknown>)[col]

  if (col === 'email' && (val == null || val === '')) {
    const hint = row.email_status ? EMAIL_STATUS_HINT[row.email_status] : undefined
    return (
      <span className="text-textLight text-xs italic">
        {hint ?? '—'}
      </span>
    )
  }

  if (val == null || val === '') return <span className="text-textLight">—</span>

  if (col === 'email') {
    return (
      <span className="inline-flex items-center max-w-full">
        <a href={`mailto:${String(val)}`}
          className="text-primary text-xs overflow-hidden overflow-ellipsis whitespace-nowrap"
          onClick={e => e.stopPropagation()}
        >
          {String(val)}
        </a>
        <CopyButton value={String(val)} />
      </span>
    )
  }

  if (col === 'phone') {
    return (
      <span className="inline-flex items-center">
        <span className="whitespace-nowrap">{String(val)}</span>
        <CopyButton value={String(val)} />
      </span>
    )
  }

  if (col === 'website' || col === 'maps_url') {
    return (
      <a href={String(val)} target="_blank" rel="noopener noreferrer"
        className="text-primary text-xs overflow-hidden overflow-ellipsis whitespace-nowrap block max-w-xs"
        onClick={e => e.stopPropagation()}
      >
        {String(val).replace(/^https?:\/\//, '')}
      </a>
    )
  }
  if (col === 'rating') {
    return <span className="font-semibold text-amber-600">⭐ {String(val)}</span>
  }
  return (
    <span className="block overflow-hidden overflow-ellipsis whitespace-nowrap max-w-xs">
      {String(val)}
    </span>
  )
}

interface ResultsTableProps {
  results: BusinessResult[]
  total: number
}

const PAGE_SIZE = 50

export function ResultsTable({ results, total }: ResultsTableProps) {
  const [search, setSearch] = useState('')
  const [page,   setPage]   = useState(1)
  const [settings, setSettings] = useState<OutreachSettings | null>(null)
  const [templates, setTemplates] = useState<MessageTemplate[]>([])
  const [outreachLoading, setOutreachLoading] = useState(true)
  const [selectedRow, setSelectedRow] = useState<BusinessResult | null>(null)
  const [channel, setChannel] = useState<OutreachChannel>('whatsapp')
  const [selectedTemplateId, setSelectedTemplateId] = useState('')
  const [copied, setCopied] = useState(false)
  const [leadStatuses, setLeadStatuses] = useState<Record<string, LeadOutreachState>>({})
  const [statusFilter, setStatusFilter] = useState<LeadOutreachStatus | 'all'>('all')
  const [notes, setNotes] = useState('')
  const [events, setEvents] = useState<OutreachEvent[]>([])
  const [sending, setSending] = useState(false)
  const { toast } = useToast()
  const [eventsLoading, setEventsLoading] = useState(false)

  useEffect(() => {
    Promise.all([
      fetch('/api/outreach/settings').then(r => r.ok ? r.json() : { settings: null }),
      fetch('/api/outreach/templates').then(r => r.ok ? r.json() : { templates: [] }),
    ]).then(([settingsRes, templatesRes]) => {
      setSettings(settingsRes.settings ?? null)
      setTemplates(templatesRes.templates ?? [])
    }).catch(() => {}).finally(() => setOutreachLoading(false))
  }, [])

  useEffect(() => {
    const ids = results.map(r => r.id).join(',')
    if (!ids) return
    fetch(`/api/outreach/lead-status?ids=${encodeURIComponent(ids)}`)
      .then(r => r.ok ? r.json() : { statuses: [] })
      .then(data => {
        const map: Record<string, LeadOutreachState> = {}
        for (const state of data.statuses ?? []) map[state.business_result_id] = state
        setLeadStatuses(map)
      })
      .catch(() => {})
  }, [results])

  const filtered = search
    ? results.filter(r =>
        r.name?.toLowerCase().includes(search.toLowerCase()) ||
        r.city?.toLowerCase().includes(search.toLowerCase()) ||
        r.category?.toLowerCase().includes(search.toLowerCase())
      )
    : results
  const statusFiltered = statusFilter === 'all'
    ? filtered
    : filtered.filter(r => (leadStatuses[r.id]?.status ?? 'new') === statusFilter)

  const totalPages = Math.max(1, Math.ceil(statusFiltered.length / PAGE_SIZE))
  const safePage   = Math.min(page, totalPages)
  const paged      = statusFiltered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE)

  function handleSearch(val: string) {
    setSearch(val)
    setPage(1)
  }

  function openOutreach(row: BusinessResult, nextChannel: OutreachChannel) {
    const available = templates.filter(t => t.channel === nextChannel && t.is_active)
    const defaultTemplate = available.find(t => t.is_default) ?? available[0]
    setSelectedRow(row)
    setChannel(nextChannel)
    setSelectedTemplateId(defaultTemplate?.id ?? '')
    setNotes(leadStatuses[row.id]?.notes ?? '')
    setCopied(false)
    loadEvents(row.id)
  }

  async function loadEvents(businessResultId: string) {
    setEvents([])
    setEventsLoading(true)
    try {
      const res = await fetch(`/api/outreach/events?business_result_id=${encodeURIComponent(businessResultId)}`)
      const data = await res.json()
      setEvents(res.ok ? data.events ?? [] : [])
    } catch {
      setEvents([])
    } finally {
      setEventsLoading(false)
    }
  }

  function handleStatusFilter(next: LeadOutreachStatus | 'all') {
    setStatusFilter(next)
    setPage(1)
  }

  const channelTemplates = templates.filter(t => t.channel === channel && t.is_active)
  const selectedTemplate = channelTemplates.find(t => t.id === selectedTemplateId)
  const fallbackTemplate = getDefaultTemplate(channel)
  const templateNames = useMemo(() => new Map(templates.map(t => [t.id, t.name])), [templates])

  const rendered = useMemo(() => {
    if (!selectedRow) return { subject: '', body: '' }
    const subjectTemplate = selectedTemplate?.subject ?? fallbackTemplate.subject ?? ''
    const bodyTemplate = selectedTemplate?.body ?? fallbackTemplate.body
    return {
      subject: renderTemplate(subjectTemplate, selectedRow, settings),
      body: renderTemplate(bodyTemplate, selectedRow, settings),
    }
  }, [fallbackTemplate.body, fallbackTemplate.subject, selectedRow, selectedTemplate, settings])

  async function logEvent(eventType: 'prepared' | 'copied' | 'opened') {
    if (!selectedRow) return
    const res = await fetch('/api/outreach/events', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        business_result_id: selectedRow.id,
        template_id: selectedTemplate?.id ?? null,
        channel,
        event_type: eventType,
        subject: rendered.subject,
        body: rendered.body,
      }),
    }).catch(() => {})
    if (res?.ok) loadEvents(selectedRow.id)
  }

  async function copyMessage() {
    await navigator.clipboard?.writeText(channel === 'email'
      ? `Konu: ${rendered.subject}\n\n${rendered.body}`
      : rendered.body)
    setCopied(true)
    setTimeout(() => setCopied(false), 1200)
    logEvent('copied')
  }

  function openNativeComposer() {
    if (!selectedRow) return
    if (channel === 'whatsapp' && selectedRow.phone) {
      window.open(buildWhatsAppUrl(selectedRow.phone, rendered.body), '_blank', 'noopener,noreferrer')
      logEvent('opened')
      return
    }
    if (channel === 'email' && selectedRow.email) {
      window.location.href = buildMailtoUrl(selectedRow.email, rendered.subject, rendered.body)
      logEvent('opened')
    }
  }

  async function sendEmailNow() {
    if (!selectedRow) return
    setSending(true)
    const res = await fetch('/api/outreach/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        business_result_id: selectedRow.id,
        subject: rendered.subject,
        body: rendered.body,
        template_id: selectedTemplate?.id ?? null,
      }),
    })
    setSending(false)
    const data = await res.json().catch(() => ({}))
    if (!res.ok) { toast(data.error ?? 'Gönderim başarısız.', 'error'); return }
    toast('E-posta gönderildi ✅', 'success')
    setLeadStatuses(prev => ({
      ...prev,
      [selectedRow.id]: { ...(prev[selectedRow.id] ?? {}), status: 'sent' } as LeadOutreachState,
    }))
    loadEvents(selectedRow.id)
  }

  async function saveLeadStatus(status: LeadOutreachStatus, markContacted = false) {
    if (!selectedRow) return
    const res = await fetch('/api/outreach/lead-status', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        business_result_id: selectedRow.id,
        status,
        last_channel: channel,
        last_template_id: selectedTemplate?.id ?? null,
        mark_contacted: markContacted,
        notes,
      }),
    })
    const data = await res.json()
    if (res.ok && data.status) {
      setLeadStatuses(prev => ({ ...prev, [selectedRow.id]: data.status }))
      loadEvents(selectedRow.id)
    }
  }

  function formatEventTime(value: string) {
    return new Intl.DateTimeFormat('tr-TR', {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(value))
  }

  return (
    <div>
      {/* Toolbar */}
      <div className="flex items-center justify-between mb-3 gap-3">
        <span className="text-sm text-textMuted">
          {total.toLocaleString('tr-TR')} sonuç
          {(search || statusFilter !== 'all') && ` · ${statusFiltered.length} eşleşme`}
        </span>
        <div className="flex flex-wrap items-center justify-end gap-2">
          <select
            value={statusFilter}
            onChange={e => handleStatusFilter(e.target.value as LeadOutreachStatus | 'all')}
            className="px-3 py-[7px] border border-border rounded-md text-sm outline-none bg-white"
          >
            <option value="all">Tüm durumlar</option>
            {Object.entries(statusLabels).map(([value, label]) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
          <input
            placeholder="İsim, şehir veya kategori ara..."
            value={search}
            onChange={e => handleSearch(e.target.value)}
            className="px-3 py-[7px] border border-border rounded-md text-sm outline-none w-64"
          />
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto border border-border rounded-md">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="bg-bg">
              {COLUMNS.map(col => (
                <th key={col.key}
                  className={`px-3 py-2.5 text-left font-semibold text-textMuted border-b-2 border-border whitespace-nowrap ${col.widthClass}`}>
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {paged.length === 0 ? (
              <tr>
                <td colSpan={COLUMNS.length} className="p-10 text-center text-textMuted">
                  {search || statusFilter !== 'all' ? 'Arama sonucu bulunamadı.' : 'Henüz sonuç yok — scraping başlatıldığında burada görünecek.'}
                </td>
              </tr>
            ) : paged.map(row => (
              <tr key={row.id} className="border-b border-border">
                {COLUMNS.map(col => (
                  <td key={col.key} className={`px-3 py-2.5 align-middle ${col.maxWidthClass}`}>
                    <CellValue col={col.key} row={row} status={leadStatuses[row.id]} onOutreach={openOutreach} />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-4">
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={safePage === 1}
            className="px-3 py-1.5 rounded-md border border-border text-sm disabled:bg-bg disabled:text-textMuted disabled:cursor-default hover:enabled:bg-white transition-colors"
          >
            ← Önceki
          </button>
          <span className="text-sm text-textMuted">
            {safePage} / {totalPages}
          </span>
          <button
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={safePage === totalPages}
            className="px-3 py-1.5 rounded-md border border-border text-sm disabled:bg-bg disabled:text-textMuted disabled:cursor-default hover:enabled:bg-white transition-colors"
          >
            Sonraki →
          </button>
        </div>
      )}

      <Modal
        open={Boolean(selectedRow)}
        onClose={() => setSelectedRow(null)}
        title={channel === 'whatsapp' ? 'WhatsApp Mesajı' : 'E-posta Taslağı'}
        width={640}
      >
        {selectedRow && (
          <div>
            <div className="mb-4 text-sm">
              <div className="font-semibold text-text">{selectedRow.name}</div>
              <div className="text-xs text-textMuted">{selectedRow.city ?? selectedRow.address_full ?? 'Konum yok'}</div>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-4">
              <button
                type="button"
                onClick={() => openOutreach(selectedRow, 'whatsapp')}
                className={`px-3 py-2 rounded-md border text-sm ${channel === 'whatsapp' ? 'bg-primaryLight border-primary text-primary font-semibold' : 'border-border text-text'}`}
              >
                WhatsApp
              </button>
              <button
                type="button"
                onClick={() => openOutreach(selectedRow, 'email')}
                className={`px-3 py-2 rounded-md border text-sm ${channel === 'email' ? 'bg-primaryLight border-primary text-primary font-semibold' : 'border-border text-text'}`}
              >
                E-posta
              </button>
            </div>

            <label className="block mb-4 text-sm font-medium text-text">
              Şablon
              <select
                value={selectedTemplateId}
                onChange={e => setSelectedTemplateId(e.target.value)}
                disabled={outreachLoading}
                className="mt-1 w-full px-3 py-2 border border-border rounded-md bg-white text-sm"
              >
                {outreachLoading ? (
                  <option value="">Şablonlar yükleniyor...</option>
                ) : channelTemplates.length === 0 ? (
                  <option value="">Varsayılan taslak</option>
                ) : channelTemplates.map(t => (
                  <option key={t.id} value={t.id}>{t.name}{t.is_default ? ' (varsayılan)' : ''}</option>
                ))}
              </select>
            </label>
            {!outreachLoading && channelTemplates.length === 0 && (
              <div className="mb-4 rounded-md border border-yellow-300 bg-warningLight p-3 text-xs text-warning">
                Henüz bu kanal için şablon yok. Varsayılan taslak kullanılıyor; kalıcı şablon eklemek için Ayarlar → Gönderim sekmesine gidin.
              </div>
            )}

            {channel === 'email' && (
              <label className="block mb-4 text-sm font-medium text-text">
                Konu
                <input
                  readOnly
                  value={rendered.subject}
                  className="mt-1 w-full px-3 py-2 border border-border rounded-md bg-bg text-sm font-normal"
                />
              </label>
            )}

            <label className="block mb-4 text-sm font-medium text-text">
              Mesaj
              <textarea
                readOnly
                value={rendered.body}
                rows={8}
                className="mt-1 w-full px-3 py-2 border border-border rounded-md bg-bg text-sm font-normal"
              />
            </label>

            <label className="block mb-4 text-sm font-medium text-text">
              Not
              <textarea
                value={notes}
                onChange={e => setNotes(e.target.value)}
                rows={3}
                placeholder="Bu lead hakkında kısa not..."
                className="mt-1 w-full px-3 py-2 border border-border rounded-md bg-white text-sm font-normal"
              />
            </label>

            <div className="mb-4 grid grid-cols-2 md:grid-cols-4 gap-2">
              <button type="button" onClick={() => saveLeadStatus('sent', true)} className="px-3 py-2 rounded-md border border-border text-sm text-text">
                Gönderildi
              </button>
              <button type="button" onClick={() => saveLeadStatus('replied', true)} className="px-3 py-2 rounded-md border border-green-300 text-sm text-green-700">
                Yanıtladı
              </button>
              <button type="button" onClick={() => saveLeadStatus('not_interested', true)} className="px-3 py-2 rounded-md border border-red-300 text-sm text-danger">
                İlgilenmiyor
              </button>
              <button type="button" onClick={() => saveLeadStatus('customer', true)} className="px-3 py-2 rounded-md border border-green-300 text-sm text-success">
                Müşteri oldu
              </button>
            </div>

            <div className="flex flex-wrap justify-end gap-2">
              <Button variant="secondary" onClick={copyMessage}>{copied ? 'Kopyalandı' : 'Kopyala'}</Button>
              <Button
                variant="secondary"
                onClick={() => { logEvent('prepared'); openNativeComposer() }}
                disabled={channel === 'whatsapp' ? !selectedRow.phone : !selectedRow.email}
              >
                {channel === 'whatsapp' ? 'WhatsApp’ta Aç' : 'E-posta Aç'}
              </Button>
              {channel === 'email' && (
                <Button
                  loading={sending}
                  disabled={!selectedRow.email}
                  onClick={sendEmailNow}
                  title="SMTP ile gönder"
                >
                  E-posta Gönder
                </Button>
              )}
            </div>

            <div className="mt-5 rounded-md border border-border bg-bg p-4">
              <div className="mb-3 flex items-center justify-between">
                <h3 className="m-0 text-sm font-semibold text-text">Gönderim Geçmişi</h3>
                <span className="text-xs text-textMuted">{events.length > 0 ? `Son ${events.length} kayıt` : ''}</span>
              </div>
              {eventsLoading ? (
                <div className="text-sm text-textMuted">Geçmiş yükleniyor...</div>
              ) : events.length === 0 ? (
                <div className="text-sm text-textMuted">Bu lead için henüz geçmiş yok.</div>
              ) : (
                <div className="max-h-48 space-y-2 overflow-y-auto pr-1">
                  {events.map(event => (
                    <div key={event.id} className="rounded-md border border-border bg-white p-3">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="text-sm font-medium text-text">
                            {eventLabels[event.event_type]}
                          </div>
                          <div className="mt-0.5 text-xs text-textMuted">
                            {event.channel === 'whatsapp' ? 'WhatsApp' : 'E-posta'}
                            {event.subject && event.event_type === 'status_changed' ? ` · ${statusLabels[event.subject as LeadOutreachStatus] ?? event.subject}` : ''}
                            {event.template_id ? ` · ${templateNames.get(event.template_id) ?? 'Şablon'}` : ''}
                          </div>
                        </div>
                        <span className="whitespace-nowrap text-xs text-textMuted">{formatEventTime(event.created_at)}</span>
                      </div>
                      {event.error_message && (
                        <div className="mt-2 text-xs text-danger">{event.error_message}</div>
                      )}
                      {event.body && event.event_type === 'status_changed' && (
                        <div className="mt-2 line-clamp-2 text-xs text-textMuted">{event.body}</div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}
