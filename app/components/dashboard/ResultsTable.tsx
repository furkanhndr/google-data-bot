'use client'

import { useState } from 'react'
import type { BusinessResult } from '@googlebusinessdata/shared-types'

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
]

// Hint shown in the email column when no email was found, reflecting why.
const EMAIL_STATUS_HINT: Record<string, string> = {
  not_found:  'bulunamadı',
  no_website: 'web sitesi yok',
  pending:    'aranıyor…',
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

function CellValue({ col, row }: { col: string; row: BusinessResult }) {
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

  const filtered = search
    ? results.filter(r =>
        r.name?.toLowerCase().includes(search.toLowerCase()) ||
        r.city?.toLowerCase().includes(search.toLowerCase()) ||
        r.category?.toLowerCase().includes(search.toLowerCase())
      )
    : results

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const safePage   = Math.min(page, totalPages)
  const paged      = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE)

  function handleSearch(val: string) {
    setSearch(val)
    setPage(1)
  }

  return (
    <div>
      {/* Toolbar */}
      <div className="flex items-center justify-between mb-3 gap-3">
        <span className="text-sm text-textMuted">
          {total.toLocaleString('tr-TR')} sonuç
          {search && ` · ${filtered.length} eşleşme`}
        </span>
        <input
          placeholder="İsim, şehir veya kategori ara..."
          value={search}
          onChange={e => handleSearch(e.target.value)}
          className="px-3 py-[7px] border border-border rounded-md text-sm outline-none w-64"
        />
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
                  {search ? 'Arama sonucu bulunamadı.' : 'Henüz sonuç yok — scraping başlatıldığında burada görünecek.'}
                </td>
              </tr>
            ) : paged.map(row => (
              <tr key={row.id} className="border-b border-border">
                {COLUMNS.map(col => (
                  <td key={col.key} className={`px-3 py-2.5 align-middle ${col.maxWidthClass}`}>
                    <CellValue col={col.key} row={row} />
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
    </div>
  )
}
