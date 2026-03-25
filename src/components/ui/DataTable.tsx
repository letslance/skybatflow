'use client'

import { useState, useMemo } from 'react'
import { cn } from '@/lib/utils'

// ─── Types ────────────────────────────────────────────────────────────────────
export interface Column<T> {
  key:        string
  label:      string
  sortable?:  boolean
  render?:    (row: T, index: number) => React.ReactNode
  width?:     string | number
  align?:     'left' | 'center' | 'right'
  className?: string   // extra td classes
}

interface DataTableProps<T> {
  columns:          Column<T>[]
  data:             T[]
  loading?:         boolean
  emptyMessage?:    string
  rowKey?:          (row: T) => string
  pageSizeOptions?: number[]
  defaultPageSize?: number
  /** Optional toolbar content rendered to the left of the search box */
  toolbar?:         React.ReactNode
  className?:       string
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function DataTable<T extends Record<string, any>>({
  columns,
  data,
  loading         = false,
  emptyMessage    = 'There are no records to show',
  rowKey,
  pageSizeOptions = [10, 25, 50, 100],
  defaultPageSize = 25,
  toolbar,
  className,
}: DataTableProps<T>) {
  const [pageSize, setPageSize] = useState(defaultPageSize)
  const [page,     setPage]     = useState(0)
  const [search,   setSearch]   = useState('')
  const [sortKey,  setSortKey]  = useState<string | null>(null)
  const [sortDir,  setSortDir]  = useState<'asc' | 'desc'>('asc')

  const filtered = useMemo(() => {
    if (!search.trim()) return data
    const q = search.toLowerCase()
    return data.filter(row =>
      Object.values(row).some(v => String(v ?? '').toLowerCase().includes(q))
    )
  }, [data, search])

  const sorted = useMemo(() => {
    if (!sortKey) return filtered
    return [...filtered].sort((a, b) => {
      const cmp = String(a[sortKey] ?? '').localeCompare(String(b[sortKey] ?? ''), undefined, { numeric: true })
      return sortDir === 'asc' ? cmp : -cmp
    })
  }, [filtered, sortKey, sortDir])

  const totalPages = Math.max(1, Math.ceil(sorted.length / pageSize))
  const safePage   = Math.min(page, totalPages - 1)
  const paginated  = sorted.slice(safePage * pageSize, (safePage + 1) * pageSize)

  function toggleSort(key: string) {
    if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    else { setSortKey(key); setSortDir('asc') }
    setPage(0)
  }

  return (
    <div className={cn('flex flex-col gap-3', className)}>

      {/* ── Top bar ─────────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2 flex-wrap">
          {/* Show N entries */}
          <div className="flex items-center gap-1.5 text-sm text-tx-secondary">
            <span>Show</span>
            <select
              value={pageSize}
              onChange={e => { setPageSize(Number(e.target.value)); setPage(0) }}
              className="select !w-auto px-2 py-1"
            >
              {pageSizeOptions.map(n => <option key={n} value={n}>{n}</option>)}
            </select>
            <span>entries</span>
          </div>
          {/* Extra toolbar slot */}
          {toolbar}
        </div>

        {/* Search */}
        <input
          type="text"
          placeholder="Search..."
          value={search}
          onChange={e => { setSearch(e.target.value); setPage(0) }}
          className="input !w-44"
        />
      </div>

      {/* ── Table ───────────────────────────────────────────────────────────── */}
      <div className="table-wrap">
        <table className="data-table">
          <thead>
            <tr>
              {columns.map(col => (
                <th
                  key={col.key}
                  onClick={() => col.sortable !== false && toggleSort(col.key)}
                  className={cn(
                    col.sortable !== false && 'cursor-pointer select-none hover:brightness-110',
                    col.align === 'center' && 'text-center',
                    col.align === 'right'  && 'text-right',
                  )}
                  style={{ width: col.width }}
                >
                  <span className="inline-flex items-center gap-1">
                    {col.label}
                    {col.sortable !== false && (
                      <SortIcon active={sortKey === col.key} dir={sortDir} />
                    )}
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={columns.length} className="py-8 text-center text-tx-muted text-sm italic">
                  Loading...
                </td>
              </tr>
            ) : paginated.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="py-8 text-center text-tx-muted text-sm italic">
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              paginated.map((row, i) => (
                <tr key={rowKey ? rowKey(row) : i}>
                  {columns.map(col => (
                    <td
                      key={col.key}
                      className={cn(
                        col.align === 'center' && 'text-center',
                        col.align === 'right'  && 'text-right',
                        col.className,
                      )}
                    >
                      {col.render ? col.render(row, i) : (row[col.key] ?? '—')}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* ── Footer: count + pagination ───────────────────────────────────────── */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <span className="text-sm text-tx-muted">
          {sorted.length === 0
            ? 'No entries'
            : `Showing ${safePage * pageSize + 1}–${Math.min((safePage + 1) * pageSize, sorted.length)} of ${sorted.length}`}
        </span>
        <Pagination
          page={safePage}
          totalPages={totalPages}
          onChange={setPage}
        />
      </div>
    </div>
  )
}

// ─── Sort icon ────────────────────────────────────────────────────────────────
function SortIcon({ active, dir }: { active: boolean; dir: 'asc' | 'desc' }) {
  return (
    <span className="inline-flex flex-col leading-none ml-0.5">
      <span className={cn('text-[8px] leading-none', active && dir === 'asc'  ? 'text-white' : 'text-tx-muted/50')}>▲</span>
      <span className={cn('text-[8px] leading-none', active && dir === 'desc' ? 'text-white' : 'text-tx-muted/50')}>▼</span>
    </span>
  )
}

// ─── Pagination (also exported standalone) ────────────────────────────────────
export function Pagination({
  page, totalPages, onChange,
}: {
  page: number
  totalPages: number
  onChange: (p: number) => void
}) {
  if (totalPages <= 1) return null

  // Show at most 5 page buttons around current
  const pages: (number | '…')[] = []
  for (let i = 0; i < totalPages; i++) {
    if (i === 0 || i === totalPages - 1 || Math.abs(i - page) <= 1) {
      pages.push(i)
    } else if (pages[pages.length - 1] !== '…') {
      pages.push('…')
    }
  }

  return (
    <div className="flex items-center gap-1">
      <PgBtn onClick={() => onChange(page - 1)} disabled={page === 0} label="‹" />
      {pages.map((p, i) =>
        p === '…' ? (
          <span key={`e${i}`} className="px-1 text-sm text-tx-muted">…</span>
        ) : (
          <PgBtn
            key={p}
            onClick={() => onChange(p as number)}
            active={p === page}
            label={String((p as number) + 1)}
          />
        )
      )}
      <PgBtn onClick={() => onChange(page + 1)} disabled={page >= totalPages - 1} label="›" />
    </div>
  )
}

function PgBtn({ onClick, disabled, active, label }: {
  onClick: () => void; disabled?: boolean; active?: boolean; label: string
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={cn(
        'w-7 h-7 rounded text-sm font-medium transition-colors',
        active   && 'bg-primary text-white',
        !active  && !disabled && 'text-tx-secondary hover:bg-bg-hover hover:text-tx-primary',
        disabled && 'text-tx-muted/40 cursor-default',
      )}
    >
      {label}
    </button>
  )
}
