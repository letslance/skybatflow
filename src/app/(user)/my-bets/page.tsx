'use client'

import { useEffect, useState } from 'react'
import { betApi } from '@/lib/api'
import { Bet } from '@/types'
import { formatCurrency, formatDate, betStatusColor } from '@/lib/utils'
import DataTable from '@/components/ui/DataTable'
import PageHeader from '@/components/ui/PageHeader'

export default function MyBetsPage() {
  const [bets, setBets]     = useState<Bet[]>([])
  const [loading, setLoading] = useState(true)
  const [status, setStatus] = useState('')
  const [tab, setTab]       = useState<'all' | 'open'>('all')

  useEffect(() => {
    load()
  }, [tab, status])

  async function load() {
    setLoading(true)
    try {
      const data = tab === 'open'
        ? await betApi.open()
        : await betApi.list(status ? { status } : undefined)
      setBets(data)
    } catch { /* */ } finally { setLoading(false) }
  }

  return (
    <div className="p-3">
      <PageHeader title="My Bets" />

      {/* Tabs */}
      <div className="flex gap-1 mb-3">
        <button onClick={() => setTab('all')}  className={tab === 'all'  ? 'btn-primary btn-sm' : 'btn-outline btn-sm'}>All Bets</button>
        <button onClick={() => setTab('open')} className={tab === 'open' ? 'btn-primary btn-sm' : 'btn-outline btn-sm'}>Open Bets</button>
      </div>

      {/* Filter */}
      {tab === 'all' && (
        <div className="flex gap-2 mb-3">
          <select value={status} onChange={e => setStatus(e.target.value)} className="select w-40">
            <option value="">All Status</option>
            <option value="MATCHED">Matched</option>
            <option value="WON">Won</option>
            <option value="LOST">Lost</option>
            <option value="VOID">Void</option>
            <option value="CANCELLED">Cancelled</option>
          </select>
        </div>
      )}

      <div className="card">
        <DataTable
          columns={[
            { key: 'createdAt',  label: 'Date',    render: r => <span className="text-tx-muted">{formatDate(r.createdAt)}</span> },
            { key: 'eventName',  label: 'Event',   render: r => <span className="font-medium">{r.eventName}</span> },
            { key: 'marketName', label: 'Market' },
            { key: 'runnerName', label: 'Runner' },
            { key: 'betType',    label: 'Type', render: r => (
              <span className={r.betType === 'BACK' ? 'text-back font-bold' : 'text-lay font-bold'}>{r.betType}</span>
            )},
            { key: 'odds',  label: 'Odds',  render: r => r.odds.toFixed(2) },
            { key: 'stake', label: 'Stake', render: r => `₹${formatCurrency(r.stake)}` },
            { key: 'potentialPayout', label: 'P&L', render: r => {
              if (r.status === 'WON' || r.status === 'LOST') {
                const pnl = r.profit ?? (r.status === 'WON' ? r.potentialPayout - r.stake : -r.stake)
                return <span className={pnl >= 0 ? 'text-win' : 'text-loss'}>{pnl >= 0 ? '+' : ''}₹{formatCurrency(Math.abs(pnl))}</span>
              }
              return <span className="text-tx-muted">₹{formatCurrency(r.potentialPayout)}</span>
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
      </div>
    </div>
  )
}
