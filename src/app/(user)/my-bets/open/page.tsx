'use client'

import { useEffect, useState } from 'react'
import { betApi } from '@/lib/api'
import { Bet } from '@/types'
import { formatCurrency, formatDate } from '@/lib/utils'
import DataTable from '@/components/ui/DataTable'
import PageHeader from '@/components/ui/PageHeader'
import StatCard from '@/components/ui/StatCard'

export default function OpenBetsPage() {
  const [bets, setBets]     = useState<Bet[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    betApi.open().then(setBets).catch(() => {}).finally(() => setLoading(false))
    const interval = setInterval(() => betApi.open().then(setBets).catch(() => {}), 30_000)
    return () => clearInterval(interval)
  }, [])

  const totalStake    = bets.reduce((s, b) => s + b.stake, 0)
  const totalExposure = bets.reduce((s, b) => s + (b.potentialLiability || b.stake), 0)

  return (
    <div className="p-3">
      <PageHeader title="Open Bets" subtitle="Your currently active bets" />

      <div className="grid grid-cols-2 gap-3 mb-4">
        <StatCard label="Open Bets" value={bets.length} />
        <StatCard label="Total Exposure" value={`₹${formatCurrency(totalExposure)}`} valueClassName="text-loss" />
      </div>

      <div className="card">
        <DataTable
          columns={[
            { key: 'createdAt',  label: 'Placed',    render: r => <span className="text-tx-muted">{formatDate(r.createdAt)}</span> },
            { key: 'eventName',  label: 'Event',     render: r => <span className="font-medium">{r.eventName}</span> },
            { key: 'marketName', label: 'Market' },
            { key: 'runnerName', label: 'Runner' },
            { key: 'betType',    label: 'Type', render: r => (
              <span className={r.betType === 'BACK' ? 'text-back font-bold' : 'text-lay font-bold'}>{r.betType}</span>
            )},
            { key: 'odds',  label: 'Odds',  render: r => r.odds.toFixed(2) },
            { key: 'stake', label: 'Stake', render: r => `₹${formatCurrency(r.stake)}` },
            { key: 'potentialPayout', label: 'If Win', render: r => (
              <span className="text-win">₹{formatCurrency(r.potentialPayout)}</span>
            )},
            { key: 'status', label: 'Status', render: r => (
              <span className="badge-blue">{r.status}</span>
            )},
          ]}
          data={bets}
          loading={loading}
          emptyMessage="No open bets"
          rowKey={r => r.id}
        />
      </div>
    </div>
  )
}
