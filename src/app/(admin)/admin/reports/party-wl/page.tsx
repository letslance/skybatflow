'use client'

import { useState } from 'react'
import PageHeader from '@/components/ui/PageHeader'
import DataTable from '@/components/ui/DataTable'
import { formatCurrency, cn } from '@/lib/utils'
import { adminApi } from '@/lib/api'
import toast from 'react-hot-toast'

type FilterType = 'ALL' | 'PLAYER' | 'MASTER' | 'MANAGER' | 'SUBADMIN' | 'ADMIN'

interface PartyWlRow {
  userId: string
  username: string
  role: string
  sportPnl: number
  casinoPnl: number
  totalPnl: number
  totalBets: number
  turnover: number
}

const FILTER_TYPES: Array<{ label: string; value: FilterType }> = [
  { label: 'All',      value: 'ALL' },
  { label: 'Player',   value: 'PLAYER' },
  { label: 'Master',   value: 'MASTER' },
  { label: 'Manager',  value: 'MANAGER' },
  { label: 'SubAdmin', value: 'SUBADMIN' },
  { label: 'Admin',    value: 'ADMIN' },
]

function todayStr()     { return new Date().toISOString().slice(0, 10) }
function monthStartStr(){ const d = new Date(); d.setDate(1); return d.toISOString().slice(0, 10) }

function pnlClass(v: number) { return v >= 0 ? 'text-win font-semibold' : 'text-loss font-semibold' }
function pnlStr(v: number)   { return `${v >= 0 ? '+' : ''}₹${formatCurrency(Math.abs(v))}` }

export default function PartyWinLossPage() {
  const [filterType, setFilterType] = useState<FilterType>('ALL')
  const [from,       setFrom]       = useState(monthStartStr())
  const [to,         setTo]         = useState(todayStr())
  const [rows,       setRows]       = useState<PartyWlRow[]>([])
  const [loading,    setLoading]    = useState(false)
  const [loaded,     setLoaded]     = useState(false)

  async function load() {
    setLoading(true)
    try {
      const data = await adminApi.reportPartyWl({
        role: filterType !== 'ALL' ? filterType : undefined,
        from, to,
      })
      setRows(data as PartyWlRow[])
      setLoaded(true)
    } catch {
      toast.error('Failed to load party W/L report')
    } finally {
      setLoading(false)
    }
  }

  function reset() {
    setFilterType('ALL'); setFrom(monthStartStr()); setTo(todayStr())
    setRows([]); setLoaded(false)
  }

  const totals = rows.reduce(
    (acc, r) => ({
      sportPnl:  acc.sportPnl  + r.sportPnl,
      casinoPnl: acc.casinoPnl + r.casinoPnl,
      totalPnl:  acc.totalPnl  + r.totalPnl,
      turnover:  acc.turnover  + r.turnover,
      bets:      acc.bets      + r.totalBets,
    }),
    { sportPnl: 0, casinoPnl: 0, totalPnl: 0, turnover: 0, bets: 0 }
  )

  return (
    <div>
      <PageHeader title="Party Win / Loss" subtitle="P&L breakdown by downline member" />

      {/* Filters */}
      <div className="card mb-4">
        <div className="p-4 grid grid-cols-2 md:grid-cols-4 gap-3">
          <div>
            <label className="block text-xs text-tx-secondary mb-1">Role Filter</label>
            <select value={filterType} onChange={e => setFilterType(e.target.value as FilterType)} className="select text-xs">
              {FILTER_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
            </select>
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

      {/* Summary */}
      {loaded && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-4">
          {[
            { label: 'Members',      value: rows.length.toString(),         cls: 'text-tx-primary' },
            { label: 'Total Bets',   value: totals.bets.toLocaleString(),   cls: 'text-tx-primary' },
            { label: 'Turnover',     value: `₹${formatCurrency(totals.turnover)}`, cls: 'text-tx-primary' },
            { label: 'Sports P&L',   value: pnlStr(totals.sportPnl),        cls: pnlClass(totals.sportPnl) },
            { label: 'Total P&L',    value: pnlStr(totals.totalPnl),        cls: pnlClass(totals.totalPnl) },
          ].map(c => (
            <div key={c.label} className="card p-3 text-center">
              <div className="text-[11px] text-tx-muted mb-1">{c.label}</div>
              <div className={cn('text-sm font-bold', c.cls)}>{c.value}</div>
            </div>
          ))}
        </div>
      )}

      <div className="card">
        <DataTable
          columns={[
            { key: 'username',  label: 'Username',   render: r => <span className="font-semibold text-primary">{r.username}</span> },
            { key: 'role',      label: 'Role',        render: r => <span className="badge badge-blue text-[10px]">{r.role}</span> },
            { key: 'totalBets', label: 'Bets',        render: r => <span>{r.totalBets.toLocaleString()}</span> },
            { key: 'turnover',  label: 'Turnover',    render: r => <span>₹{formatCurrency(r.turnover)}</span> },
            { key: 'sportPnl',  label: 'Sports P&L',  render: r => <span className={pnlClass(r.sportPnl)}>{pnlStr(r.sportPnl)}</span> },
            { key: 'casinoPnl', label: 'Casino P&L',  render: r => <span className={pnlClass(r.casinoPnl)}>{pnlStr(r.casinoPnl)}</span> },
            { key: 'totalPnl',  label: 'Total P&L',   render: r => <span className={pnlClass(r.totalPnl)}>{pnlStr(r.totalPnl)}</span> },
          ]}
          data={rows}
          loading={loading}
          emptyMessage={loaded ? 'No data found' : 'Apply filters and click Load'}
          rowKey={r => r.userId}
        />
      </div>
    </div>
  )
}
