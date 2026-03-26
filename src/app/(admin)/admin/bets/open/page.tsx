'use client'

import { useEffect, useState, useCallback } from 'react'
import { betApi } from '@/lib/api'
import { Bet } from '@/types'
import { formatCurrency, formatDate } from '@/lib/utils'
import DataTable, { Pagination } from '@/components/ui/DataTable'
import PageHeader from '@/components/ui/PageHeader'
import { RefreshCw } from 'lucide-react'

export default function OpenBetsPage() {
  const [bets, setBets]       = useState<Bet[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage]       = useState(0)
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date())

  const load = useCallback(async (p: number) => {
    setLoading(true)
    try {
      // Open bets = PENDING or MATCHED status
      const [pending, matched] = await Promise.all([
        betApi.list({ status: 'PENDING', page: p, size: 25 }),
        betApi.list({ status: 'MATCHED', page: p, size: 25 }),
      ])
      // Merge and sort by newest first
      const merged = [...pending, ...matched].sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      )
      setBets(merged)
      setPage(p)
      setLastRefresh(new Date())
    } catch { /* */ } finally { setLoading(false) }
  }, [])

  useEffect(() => {
    load(0)
    // Auto-refresh every 15 s so open bets stay current
    const interval = setInterval(() => load(0), 15_000)
    return () => clearInterval(interval)
  }, [load])

  const totalStake    = bets.reduce((s, b) => s + b.stake, 0)
  const totalLiability = bets
    .filter(b => b.betType === 'LAY')
    .reduce((s, b) => s + (b.potentialPayout - b.stake), 0)

  return (
    <div>
      <PageHeader title="Open Bets">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-xs text-tx-muted">
            <span>Total Stake: <strong className="text-tx-primary">₹{formatCurrency(totalStake)}</strong></span>
            <span>·</span>
            <span>Lay Liability: <strong className="text-loss">₹{formatCurrency(totalLiability)}</strong></span>
            <span>·</span>
            <span className="text-tx-muted">{bets.length} bets</span>
          </div>
          <button
            onClick={() => load(page)}
            className="btn-outline btn-sm flex items-center gap-1"
            disabled={loading}
          >
            <RefreshCw size={12} className={loading ? 'animate-spin' : ''} />
            Refresh
          </button>
        </div>
      </PageHeader>

      <p className="text-[11px] text-tx-muted mb-3">
        Auto-refreshes every 15 s · Last updated: {lastRefresh.toLocaleTimeString()}
      </p>

      <div className="card">
        <DataTable
          columns={[
            { key: 'createdAt',  label: 'Placed',  render: r => <span className="text-tx-muted text-[11px]">{formatDate(r.createdAt)}</span> },
            { key: 'username',   label: 'User',    render: r => <span className="font-mono text-xs">{r.username ?? '-'}</span> },
            { key: 'eventName',  label: 'Event',   render: r => <span className="font-medium truncate max-w-[140px] block">{r.eventName}</span> },
            { key: 'marketName', label: 'Market' },
            { key: 'runnerName', label: 'Runner' },
            { key: 'betType',    label: 'Type', render: r => (
              <span className={r.betType === 'BACK' ? 'text-back font-bold text-xs' : 'text-lay font-bold text-xs'}>
                {r.betType}
              </span>
            )},
            { key: 'odds',  label: 'Odds',  render: r => r.odds.toFixed(2) },
            { key: 'stake', label: 'Stake', render: r => `₹${formatCurrency(r.stake)}` },
            { key: 'potentialPayout', label: 'Potential', render: r => (
              <span className="text-win">₹{formatCurrency(r.potentialPayout)}</span>
            )},
            { key: 'status', label: 'Status', render: r => (
              <span className={r.status === 'MATCHED' ? 'badge badge-success' : 'badge badge-warning'}>
                {r.status}
              </span>
            )},
          ]}
          data={bets}
          loading={loading}
          emptyMessage="No open bets"
          rowKey={r => r.id}
        />
        <div className="p-3">
          <Pagination page={page} totalPages={bets.length < 50 ? page + 1 : page + 2} onChange={load} />
        </div>
      </div>
    </div>
  )
}
