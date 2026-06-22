'use client'

import { useState } from 'react'
import { COLORS, FONT_SIZE, RADIUS } from '@/lib/constants'
import type { BusinessResult } from '@googlebusinessdata/shared-types'

const COLUMNS = [
  { key: 'name',         label: 'İşletme Adı',  width: '200px' },
  { key: 'category',     label: 'Kategori',      width: '130px' },
  { key: 'phone',        label: 'Telefon',       width: '130px' },
  { key: 'email',        label: 'E-posta',       width: '180px' },
  { key: 'website',      label: 'Web Site',      width: '160px' },
  { key: 'address_full', label: 'Adres',         width: '200px' },
  { key: 'city',         label: 'Şehir',         width: '100px' },
  { key: 'rating',       label: 'Puan',          width: '70px' },
  { key: 'review_count', label: 'Yorum',         width: '70px' },
]

function CellValue({ col, row }: { col: string; row: BusinessResult }) {
  const val = (row as unknown as Record<string, unknown>)[col]
  if (val == null || val === '') return <span style={{ color: COLORS.textLight }}>—</span>

  if (col === 'website' || col === 'maps_url') {
    return (
      <a href={String(val)} target="_blank" rel="noopener noreferrer"
        style={{ color: COLORS.primary, fontSize: FONT_SIZE.xs, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', display: 'block', maxWidth: '150px' }}
        onClick={e => e.stopPropagation()}
      >
        {String(val).replace(/^https?:\/\//, '')}
      </a>
    )
  }
  if (col === 'rating') {
    return <span style={{ fontWeight: '600', color: '#D97706' }}>⭐ {String(val)}</span>
  }
  return (
    <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', display: 'block', maxWidth: '200px' }}>
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
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        marginBottom: '12px', gap: '12px',
      }}>
        <span style={{ fontSize: FONT_SIZE.sm, color: COLORS.textMuted }}>
          {total.toLocaleString('tr-TR')} sonuç
          {search && ` · ${filtered.length} eşleşme`}
        </span>
        <input
          placeholder="İsim, şehir veya kategori ara..."
          value={search}
          onChange={e => handleSearch(e.target.value)}
          style={{
            padding: '7px 12px',
            border: `1px solid ${COLORS.border}`,
            borderRadius: RADIUS.md,
            fontSize: FONT_SIZE.sm,
            outline: 'none',
            width: '260px',
          }}
        />
      </div>

      {/* Table */}
      <div style={{ overflowX: 'auto', border: `1px solid ${COLORS.border}`, borderRadius: RADIUS.md }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: FONT_SIZE.sm }}>
          <thead>
            <tr style={{ backgroundColor: COLORS.bg }}>
              {COLUMNS.map(col => (
                <th key={col.key} style={{
                  padding: '10px 12px',
                  textAlign: 'left',
                  fontWeight: '600',
                  color: COLORS.textMuted,
                  borderBottom: `2px solid ${COLORS.border}`,
                  whiteSpace: 'nowrap',
                  width: col.width,
                }}>
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {paged.length === 0 ? (
              <tr>
                <td colSpan={COLUMNS.length} style={{ padding: '40px', textAlign: 'center', color: COLORS.textMuted }}>
                  {search ? 'Arama sonucu bulunamadı.' : 'Henüz sonuç yok — scraping başlatıldığında burada görünecek.'}
                </td>
              </tr>
            ) : paged.map(row => (
              <tr key={row.id} style={{ borderBottom: `1px solid ${COLORS.border}` }}>
                {COLUMNS.map(col => (
                  <td key={col.key} style={{ padding: '10px 12px', verticalAlign: 'middle', maxWidth: col.width }}>
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
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginTop: '16px' }}>
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={safePage === 1}
            style={{
              padding: '6px 12px', borderRadius: RADIUS.md, border: `1px solid ${COLORS.border}`,
              cursor: safePage === 1 ? 'default' : 'pointer',
              backgroundColor: safePage === 1 ? COLORS.bg : '#fff',
              color: safePage === 1 ? COLORS.textMuted : COLORS.text,
              fontSize: FONT_SIZE.sm,
            }}
          >
            ← Önceki
          </button>
          <span style={{ fontSize: FONT_SIZE.sm, color: COLORS.textMuted }}>
            {safePage} / {totalPages}
          </span>
          <button
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={safePage === totalPages}
            style={{
              padding: '6px 12px', borderRadius: RADIUS.md, border: `1px solid ${COLORS.border}`,
              cursor: safePage === totalPages ? 'default' : 'pointer',
              backgroundColor: safePage === totalPages ? COLORS.bg : '#fff',
              color: safePage === totalPages ? COLORS.textMuted : COLORS.text,
              fontSize: FONT_SIZE.sm,
            }}
          >
            Sonraki →
          </button>
        </div>
      )}
    </div>
  )
}
