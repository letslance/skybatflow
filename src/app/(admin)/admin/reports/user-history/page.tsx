'use client'

import { useState } from 'react'
import PageHeader from '@/components/ui/PageHeader'
import DataTable, { Pagination } from '@/components/ui/DataTable'
import { formatCurrency, formatDate, cn } from '@/lib/utils'
import { adminApi } from '@/lib/api'
import toast from 'react-hot-toast'
import { Search } from 'lucide-react'

interface UserHistoryRow {
  id: string
  action: string
  detail: string
  ip: string
  device: string
  createdAt: string
}

const PAGE_SIZE = 25

function todayStr()     { return new Date().toISOString().slice(0, 10) }
function weekAgoStr()   { const d = new Date(); d.setDate(d.getDate() - 7); return d.toISOString().slice(0, 10) }

const ACTION_BADGE: Record<string, string> = {
  LOGIN_SUCCESS:        'badge-green',
  LOGIN_FAILURE:        'badge-red',
  ACCOUNT_LOCKED:       'badge-red',
  LOGOUT:               'badge-blue',
  PASSWORD_CHANGE:      'badge-yellow',
  USER_STATUS_CHANGED:  'badge-yellow',
  BET_PLACED:           'badge-blue',
  BET_SETTLED:          'badge-green',
}

export default function UserHistoryPage() {
  const [username, setUsername] = useState('')
  const [from,     setFrom]     = useState(weekAgoStr())
  const [to,       setTo]       = useState(todayStr())
  const [rows,     setRows]     = useState<UserHistoryRow[]>([])
  const [loading,  setLoading]  = useState(false)
  const [loaded,   setLoaded]   = useState(false)
  const [page,     setPage]     = useState(0)

  async function load() {
    if (!username.trim()) { toast.error('Enter a username to search'); return }
    setLoading(true); setPage(0)
    try {
      const data = await adminApi.reportUserHistory({ username: username.trim(), from, to })
      setRows(data as UserHistoryRow[])
      setLoaded(true)
    } catch {
      toast.error('Failed to load user history')
    } finally {
      setLoading(false)
    }
  }

  function reset() {
    setUsername(''); setFrom(weekAgoStr()); setTo(todayStr())
    setRows([]); setLoaded(false)
  }

  const paginated = rows.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE)

  return (
    <div>
      <PageHeader title="User History" subtitle="Audit log — logins, bets, status changes" />

      <div className="card mb-4">
        <div className="p-4 grid grid-cols-2 md:grid-cols-4 gap-3">
          <div>
            <label className="block text-xs text-tx-secondary mb-1">Username *</label>
            <div className="relative">
              <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-tx-muted" />
              <input
                value={username}
                onChange={e => setUsername(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && load()}
                placeholder="Enter username..."
                className="input pl-7 text-xs"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs text-tx-secondary mb-1">From</label>
            <input type="date" value={from} onChange={e => setFrom(e.target.value)} className="input text-xs" />
          </div>
          <div>
            <label className="block text-xs text-tx-secondary mb-1">To</label>
            <input type="date" value={to} onChange={e => setTo(e.target.value)} className="input text-xs" />
          </div>
          <div className="flex items-end gap-2">
            <button onClick={load} disabled={loading} className="btn-primary btn-sm flex-1">
              {loading ? 'Loading...' : 'Load'}
            </button>
            <button onClick={reset} className="btn-outline btn-sm">Reset</button>
          </div>
        </div>
      </div>

      <div className="card">
        <DataTable
          columns={[
            { key: 'createdAt', label: 'Time',   render: r => <span className="text-tx-muted text-[11px]">{formatDate(r.createdAt)}</span> },
            { key: 'action',    label: 'Action',  render: r => (
              <span className={cn('badge text-[10px]', ACTION_BADGE[r.action] ?? 'badge-blue')}>
                {r.action.replace(/_/g, ' ')}
              </span>
            )},
            { key: 'detail',    label: 'Detail',  render: r => <span className="text-xs text-tx-secondary">{r.detail || '—'}</span> },
            { key: 'ip',        label: 'IP',      render: r => <span className="font-mono text-[11px] text-tx-muted">{r.ip || '—'}</span> },
            { key: 'device',    label: 'Device',  render: r => <span className="text-[11px] text-tx-muted">{r.device || '—'}</span> },
          ]}
          data={paginated}
          loading={loading}
          emptyMessage={loaded ? 'No history found for this user' : 'Enter a username and click Load'}
          rowKey={r => r.id}
        />
        <div className="p-3">
          <Pagination page={page} total={rows.length} size={PAGE_SIZE} onChange={setPage} />
        </div>
      </div>
    </div>
  )
}
