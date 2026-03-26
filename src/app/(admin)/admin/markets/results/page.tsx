'use client'

import { useEffect, useState } from 'react'
import { adminApi } from '@/lib/api'
import { formatDate } from '@/lib/utils'
import DataTable, { Pagination } from '@/components/ui/DataTable'
import PageHeader from '@/components/ui/PageHeader'
import { cn } from '@/lib/utils'

interface SettledMarket {
  id: string
  name: string
  marketType: string
  eventName: string
  status: string
  openDate: string
  runners: { id: string; name: string }[]
}

export default function MarketResultsPage() {
  const [markets, setMarkets] = useState<SettledMarket[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage]       = useState(0)

  useEffect(() => { load() }, [page])

  async function load() {
    setLoading(true)
    try {
      const all = await adminApi.markets({ page, size: 50, status: 'CLOSED' }) as SettledMarket[]
      setMarkets(all)
    } catch { /* */ } finally { setLoading(false) }
  }

  return (
    <div>
      <PageHeader title="Market Results" subtitle="Settled and closed markets" />

      <div className="card">
        <DataTable
          columns={[
            { key: 'eventName',  label: 'Event',  render: r => <span className="font-medium">{r.eventName}</span> },
            { key: 'name',       label: 'Market' },
            { key: 'marketType', label: 'Type',   render: r => (
              <span className="badge badge-gray">{r.marketType}</span>
            )},
            { key: 'status',     label: 'Status', render: r => (
              <span className={cn(r.status === 'CLOSED' ? 'badge-gray' : 'badge-green')}>{r.status}</span>
            )},
            { key: 'openDate',   label: 'Date',   render: r => (
              <span className="text-tx-muted">{formatDate(r.openDate)}</span>
            )},
          ]}
          data={markets}
          loading={loading}
          emptyMessage="No settled markets"
          rowKey={r => r.id}
        />
        <div className="p-3">
          <Pagination
            page={page}
            totalPages={markets.length < 50 ? page + 1 : page + 2}
            onChange={setPage}
          />
        </div>
      </div>
    </div>
  )
}
