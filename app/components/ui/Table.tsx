import type { ReactNode } from 'react'

interface Column<T> {
  key: string
  header: string
  widthClass?: string
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
    <div className="overflow-x-auto w-full">
      <table className="w-full border-collapse text-sm">
        <thead>
          <tr className="bg-bg">
            {columns.map(col => (
              <th key={col.key} className={`px-3 py-2.5 text-left font-semibold text-textMuted border-b-2 border-border whitespace-nowrap ${col.widthClass ?? ''}`}>
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr>
              <td colSpan={columns.length} className="p-8 text-center text-textMuted">
                Yükleniyor...
              </td>
            </tr>
          ) : data.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="p-8 text-center text-textMuted">
                {emptyMessage}
              </td>
            </tr>
          ) : data.map(row => (
            <tr
              key={String(row[keyField])}
              className="border-b border-border"
            >
              {columns.map(col => (
                <td key={col.key} className="px-3 py-3 text-text align-middle">
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
