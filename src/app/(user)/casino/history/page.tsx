'use client'

import { useEffect, useState } from 'react'
import { casinoApi } from '@/lib/api'
import { CasinoTransaction } from '@/types'
import { formatCurrency, formatDate } from '@/lib/utils'
import DataTable, { Pagination } from '@/components/ui/DataTable'
import PageHeader from '@/components/ui/PageHeader'

export default function CasinoHistoryPage() {
  const [txns, setTxns]     = useState<CasinoTransaction[]>([])
  const [page, setPage]     = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => { load(0) }, [])

  async function load(p: number) {
    setLoading(true)
    try {
      setTxns(await casinoApi.history(p, 20))
      setPage(p)
    } catch { /* */ } finally { setLoading(false) }
  }

  return (
    <div className="p-3">
      <PageHeader title="Casino History" />

      <div className="card">
        <DataTable
          columns={[
            { key: 'createdAt', label: 'Date',     render: r => <span className="text-tx-muted">{formatDate(r.createdAt)}</span> },
            { key: 'gameName',  label: 'Game',     render: r => <span className="font-medium">{r.gameName}</span> },
            { key: 'provider',  label: 'Provider', render: r => <span className="badge badge-gray">{r.provider}</span> },
            { key: 'roundId',   label: 'Round',    render: r => <span className="font-mono text-[11px] text-tx-muted">{r.roundId}</span> },
            { key: 'debit',     label: 'Bet',      render: r => r.debit > 0 ? `₹${formatCurrency(r.debit)}` : '-' },
            { key: 'credit',    label: 'Win',      render: r => r.credit > 0
              ? <span className="text-win">₹{formatCurrency(r.credit)}</span>
              : '-'
            },
            { key: 'profit',    label: 'P&L',      render: r => (
              <span className={r.profit >= 0 ? 'text-win font-semibold' : 'text-loss font-semibold'}>
                {r.profit >= 0 ? '+' : ''}₹{formatCurrency(r.profit)}
              </span>
            )},
            { key: 'status',    label: 'Status',   render: r => (
              <span className={r.status === 'SETTLED' ? 'badge-green' : r.status === 'PENDING' ? 'badge-yellow' : 'badge-red'}>
                {r.status}
              </span>
            )},
          ]}
          data={txns}
          loading={loading}
          emptyMessage="No casino history"
          rowKey={r => r.id}
        />
        <div className="p-3">
          <Pagination page={page} totalPages={txns.length < 20 ? page + 1 : page + 2} onChange={load} />
        </div>
      </div>
    </div>
  )
}
