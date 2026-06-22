import { COLORS, FONT_SIZE } from '@/lib/constants'
import type { ReactNode } from 'react'

interface Column<T> {
  key: string
  header: string
  width?: string
  render?: (row: T) => ReactNode
}

interface TableProps<T> {
  columns: Column<T>[]
  data: T[]
  keyField: keyof T
  emptyMessage?: string
  loading?: boolean
}

export function Table<T>({ columns, data, keyField, emptyMessage = 'Veri yok.', loading }: TableProps<T>) {
  return (
    <div style={{ overflowX: 'auto', width: '100%' }}>
      <table style={{
        width: '100%',
        borderCollapse: 'collapse',
        fontSize: FONT_SIZE.sm,
      }}>
        <thead>
          <tr style={{ backgroundColor: COLORS.bg }}>
            {columns.map(col => (
              <th key={col.key} style={{
                padding: '10px 12px',
                textAlign: 'left',
                fontWeight: '600',
                color: COLORS.textMuted,
                borderBottom: `2px solid ${COLORS.border}`,
                whiteSpace: 'nowrap',
                width: col.width,
              }}>
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr>
              <td colSpan={columns.length} style={{ padding: '32px', textAlign: 'center', color: COLORS.textMuted }}>
                Yükleniyor...
              </td>
            </tr>
          ) : data.length === 0 ? (
            <tr>
              <td colSpan={columns.length} style={{ padding: '32px', textAlign: 'center', color: COLORS.textMuted }}>
                {emptyMessage}
              </td>
            </tr>
          ) : data.map(row => (
            <tr
              key={String(row[keyField])}
              style={{ borderBottom: `1px solid ${COLORS.border}` }}
            >
              {columns.map(col => (
                <td key={col.key} style={{ padding: '12px', color: COLORS.text, verticalAlign: 'middle' }}>
                  {col.render ? col.render(row) : String((row as Record<string, unknown>)[col.key] ?? '-')}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
