'use client'

import { useEffect, useState } from 'react'
import { betApi } from '@/lib/api'
import { Bet } from '@/types'
import { formatCurrency, formatDate, betStatusColor } from '@/lib/utils'
import DataTable, { Pagination } from '@/components/ui/DataTable'
import PageHeader from '@/components/ui/PageHeader'

const SETTLED_STATUSES = ['WON', 'LOST', 'VOID', 'CANCELLED']

export default function BetHistoryPage() {
  const [bets, setBets]         = useState<Bet[]>([])
  const [loading, setLoading]   = useState(true)
  const [page, setPage]         = useState(0)
  const [status, setStatus]     = useState('')
  const [betType, setBetType]   = useState('')
  const [search, setSearch]     = useState('')
  const [searchInput, setSearchInput] = useState('')

  useEffect(() => { load(0) }, [status, betType, search])

  async function load(p: number) {
    setLoading(true)
    try {
      const params: Record<string, unknown> = { page: p, size: 50 }
      if (status)  params.status  = status
      if (betType) params.betType = betType
      if (search)  params.username = search
      const data = await betApi.list(params)
      setBets(data)
      setPage(p)
    } catch { /* */ } finally { setLoading(false) }
  }

  // Summary for filtered set
  const won   = bets.filter(b => b.status === 'WON')
  const lost  = bets.filter(b => b.status === 'LOST')
  const totalStake  = bets.reduce((s, b) => s + b.stake, 0)
  const totalProfit = bets.reduce((s, b) => s + (b.profit ?? 0), 0)
  const ggr = lost.reduce((s, b) => s + b.stake, 0)
           - won.reduce((s, b) => s + (b.potentialPayout - b.stake), 0)

  return (
    <div>
      <PageHeader title="Bet History">
        <div className="flex items-center gap-3 text-xs text-tx-muted flex-wrap">
          <span>Stake: <strong className="text-tx-primary">₹{formatCurrency(totalStake)}</strong></span>
          <span>·</span>
          <span>P&amp;L: <strong className={totalProfit >= 0 ? 'text-win' : 'text-loss'}>
            {totalProfit >= 0 ? '+' : ''}₹{formatCurrency(Math.abs(totalProfit))}
          </strong></span>
          <span>·</span>
          <span>GGR: <strong className="text-win">₹{formatCurrency(ggr)}</strong></span>
        </div>
      </PageHeader>

      {/* Filters */}
      <div className="flex flex-wrap gap-2 mb-3 items-center">
        <div className="flex gap-1">
          {[['', 'All'], ...SETTLED_STATUSES.map(s => [s, s])].map(([val, label]) => (
            <button
              key={val}
              onClick={() => setStatus(val)}
              className={status === val ? 'btn-primary btn-sm' : 'btn-outline btn-sm'}
            >
              {label}
            </button>
          ))}
        </div>
        <div className="flex gap-1">
          {[['', 'Both'], ['BACK', 'Back'], ['LAY', 'Lay']].map(([val, label]) => (
            <button
              key={val}
              onClick={() => setBetType(val)}
              className={betType === val ? 'btn-primary btn-sm' : 'btn-outline btn-sm'}
            >
              {label}
            </button>
          ))}
        </div>
        <form
          className="flex gap-1"
          onSubmit={e => { e.preventDefault(); setSearch(searchInput.trim()) }}
        >
          <input
            value={searchInput}
            onChange={e => setSearchInput(e.target.value)}
            placeholder="Search username…"
            className="input input-sm w-40"
          />
          <button type="submit" className="btn-outline btn-sm">Go</button>
          {search && (
            <button type="button" onClick={() => { setSearch(''); setSearchInput('') }} className="btn-outline btn-sm">✕</button>
          )}
        </form>
      </div>

      <div className="card">
        <DataTable
          columns={[
            { key: 'createdAt',  label: 'Date',    render: r => <span className="text-tx-muted text-[11px]">{formatDate(r.createdAt)}</span> },
            { key: 'settledAt',  label: 'Settled', render: r => <span className="text-tx-muted text-[11px]">{r.settledAt ? formatDate(r.settledAt) : '-'}</span> },
            { key: 'username',   label: 'User',    render: r => <span className="font-mono text-xs">{r.username ?? '-'}</span> },
            { key: 'eventName',  label: 'Event',   render: r => <span className="font-medium truncate max-w-[120px] block">{r.eventName}</span> },
            { key: 'marketName', label: 'Market',  render: r => <span className="text-xs">{r.marketName}</span> },
            { key: 'runnerName', label: 'Runner',  render: r => <span className="text-xs">{r.runnerName}</span> },
            { key: 'betType',    label: 'Type',    render: r => (
              <span className={r.betType === 'BACK' ? 'text-back font-bold text-xs' : 'text-lay font-bold text-xs'}>{r.betType}</span>
            )},
            { key: 'odds',       label: 'Odds',    render: r => r.odds.toFixed(2) },
            { key: 'stake',      label: 'Stake',   render: r => `₹${formatCurrency(r.stake)}` },
            { key: 'profit',     label: 'P&L',     render: r => {
              if (r.profit == null) return '-'
              return (
                <span className={r.profit >= 0 ? 'text-win font-medium' : 'text-loss font-medium'}>
                  {r.profit >= 0 ? '+' : ''}₹{formatCurrency(Math.abs(r.profit))}
                </span>
              )
            }},
            { key: 'status',     label: 'Status',  render: r => (
              <span className={betStatusColor(r.status)}>{r.status}</span>
            )},
          ]}
          data={bets}
          loading={loading}
          emptyMessage="No settled bets"
          rowKey={r => r.id}
        />
        <div className="p-3">
          <Pagination page={page} total={bets.length < 50 ? page * 50 + bets.length : (page + 2) * 50} size={50} onChange={load} />
        </div>
      </div>
    </div>
  )
}
