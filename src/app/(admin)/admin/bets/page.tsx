'use client'

import { useEffect, useState } from 'react'
import { betApi } from '@/lib/api'
import { Bet } from '@/types'
import { formatCurrency, formatDate, betStatusColor } from '@/lib/utils'
import DataTable, { Pagination } from '@/components/ui/DataTable'
import PageHeader from '@/components/ui/PageHeader'

export default function AdminBetsPage() {
  const [bets, setBets]     = useState<Bet[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage]     = useState(0)
  const [status, setStatus] = useState('')

  useEffect(() => { load(0) }, [status])

  async function load(p: number) {
    setLoading(true)
    try {
      const data = await betApi.list(status ? { status, page: p, size: 50 } : { page: p, size: 50 })
      setBets(data)
      setPage(p)
    } catch { /* */ } finally { setLoading(false) }
  }

  const totalStake  = bets.reduce((s, b) => s + b.stake, 0)
  const totalPayout = bets.filter(b => b.status === 'WON').reduce((s, b) => s + b.potentialPayout, 0)

  return (
    <div>
      <PageHeader title="All Bets">
        <div className="flex items-center gap-2 text-xs text-tx-muted">
          <span>Stake: <strong className="text-tx-primary">₹{formatCurrency(totalStake)}</strong></span>
          <span>·</span>
          <span>Wins: <strong className="text-win">₹{formatCurrency(totalPayout)}</strong></span>
        </div>
      </PageHeader>

      <div className="flex gap-2 mb-3">
        {['', 'PENDING', 'MATCHED', 'WON', 'LOST', 'VOID', 'CANCELLED'].map(s => (
          <button
            key={s}
            onClick={() => setStatus(s)}
            className={status === s ? 'btn-primary btn-sm' : 'btn-outline btn-sm'}
          >
            {s || 'All'}
          </button>
        ))}
      </div>

      <div className="card">
        <DataTable
          columns={[
            { key: 'createdAt',  label: 'Date',    render: r => <span className="text-tx-muted">{formatDate(r.createdAt)}</span> },
            { key: 'eventName',  label: 'Event',   render: r => <span className="font-medium truncate max-w-[140px] block">{r.eventName}</span> },
            { key: 'marketName', label: 'Market' },
            { key: 'runnerName', label: 'Runner' },
            { key: 'betType',    label: 'Type', render: r => (
              <span className={r.betType === 'BACK' ? 'text-back font-bold' : 'text-lay font-bold'}>{r.betType}</span>
            )},
            { key: 'odds',  label: 'Odds',  render: r => r.odds.toFixed(2) },
            { key: 'stake', label: 'Stake', render: r => `₹${formatCurrency(r.stake)}` },
            { key: 'potentialPayout', label: 'Payout', render: r => `₹${formatCurrency(r.potentialPayout)}` },
            { key: 'profit', label: 'P&L', render: r => {
              if (r.profit == null) return '-'
              return <span className={r.profit >= 0 ? 'text-win' : 'text-loss'}>{r.profit >= 0 ? '+' : ''}₹{formatCurrency(Math.abs(r.profit))}</span>
            }},
            { key: 'status', label: 'Status', render: r => (
              <span className={betStatusColor(r.status)}>{r.status}</span>
            )},
          ]}
          data={bets}
          loading={loading}
          emptyMessage="No bets found"
          rowKey={r => r.id}
        />
        <div className="p-3">
          <Pagination page={page} totalPages={bets.length < 50 ? page + 1 : page + 2} onChange={load} />
        </div>
      </div>
    </div>
  )
}
