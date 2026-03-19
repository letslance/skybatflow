import { cn } from '@/lib/utils'

interface Column<T> {
  key: keyof T | string
  label: string
  render?: (row: T) => React.ReactNode
  className?: string
  headerClassName?: string
}

interface DataTableProps<T> {
  columns: Column<T>[]
  data: T[]
  loading?: boolean
  emptyMessage?: string
  className?: string
  rowKey?: (row: T) => string
}

export default function DataTable<T extends Record<string, any>>({
  columns, data, loading, emptyMessage = 'No records found',
  className, rowKey,
}: DataTableProps<T>) {
  return (
    <div className={cn('table-wrap', className)}>
      <table className="data-table">
        <thead>
          <tr>
            {columns.map(col => (
              <th key={String(col.key)} className={col.headerClassName}>
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr>
              <td colSpan={columns.length} className="text-center py-8 text-tx-muted">
                Loading...
              </td>
            </tr>
          ) : data.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="text-center py-8 text-tx-muted">
                {emptyMessage}
              </td>
            </tr>
          ) : (
            data.map((row, i) => (
              <tr key={rowKey ? rowKey(row) : i}>
                {columns.map(col => (
                  <td key={String(col.key)} className={col.className}>
                    {col.render
                      ? col.render(row)
                      : (row[col.key as keyof T] as React.ReactNode)}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  )
}

// Pagination component
interface PaginationProps {
  page: number
  total: number
  size: number
  onChange: (page: number) => void
}

export function Pagination({ page, total, size, onChange }: PaginationProps) {
  const totalPages = Math.ceil(total / size)
  if (totalPages <= 1) return null

  const pages: (number | '...')[] = []
  for (let i = 0; i < totalPages; i++) {
    if (i === 0 || i === totalPages - 1 || (i >= page - 1 && i <= page + 1)) {
      pages.push(i)
    } else if (pages[pages.length - 1] !== '...') {
      pages.push('...')
    }
  }

  return (
    <div className="flex items-center justify-between mt-3">
      <div className="text-xs text-tx-muted">
        Showing {page * size + 1}–{Math.min((page + 1) * size, total)} of {total}
      </div>
      <div className="flex items-center gap-1">
        <button
          disabled={page === 0}
          onClick={() => onChange(page - 1)}
          className="btn-outline btn-sm disabled:opacity-40"
        >
          Prev
        </button>
        {pages.map((p, i) =>
          p === '...' ? (
            <span key={`ellipsis-${i}`} className="px-2 text-tx-muted text-xs">…</span>
          ) : (
            <button
              key={p}
              onClick={() => onChange(p as number)}
              className={cn('btn-sm rounded px-2.5 py-1 text-xs', p === page ? 'btn-primary' : 'btn-outline')}
            >
              {(p as number) + 1}
            </button>
          )
        )}
        <button
          disabled={page >= totalPages - 1}
          onClick={() => onChange(page + 1)}
          className="btn-outline btn-sm disabled:opacity-40"
        >
          Next
        </button>
      </div>
    </div>
  )
}
