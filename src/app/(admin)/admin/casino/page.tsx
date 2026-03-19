'use client'

import { useEffect, useState } from 'react'
import { adminApi } from '@/lib/api'
import { formatCurrency, formatDate } from '@/lib/utils'
import DataTable, { Pagination } from '@/components/ui/DataTable'
import PageHeader from '@/components/ui/PageHeader'
import { cn } from '@/lib/utils'

interface CasinoTx {
  id: string
  userId: string
  username: string
  gameId: string
  betAmount: number
  winAmount: number
  result: string
  createdAt: string
}

export default function AdminCasinoPage() {
  const [txns, setTxns]       = useState<CasinoTx[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage]       = useState(0)

  // Aggregates
  const totalBet  = txns.reduce((s, t) => s + (t.betAmount || 0), 0)
  const totalWon  = txns.reduce((s, t) => s + (t.winAmount  || 0), 0)
  const ggr       = totalBet - totalWon   // Gross Gaming Revenue

  useEffect(() => { load() }, [page])

  async function load() {
    setLoading(true)
    try { setTxns(await adminApi.casinoTransactions({ page, size: 50 }) as CasinoTx[]) }
    catch { /* */ } finally { setLoading(false) }
  }

  return (
    <div>
      <PageHeader title="Casino" subtitle="Casino transaction overview" />

      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        {[
          { label: 'Total Bet',  value: `₹${formatCurrency(totalBet)}`,  cls: '' },
          { label: 'Total Won',  value: `₹${formatCurrency(totalWon)}`,  cls: 'text-win' },
          { label: 'GGR',        value: `₹${formatCurrency(ggr)}`,       cls: ggr >= 0 ? 'text-primary' : 'text-loss' },
        ].map(c => (
          <div key={c.label} className="card p-3">
            <div className="text-[10px] text-tx-muted uppercase mb-1">{c.label}</div>
            <div className={cn('text-sm font-bold', c.cls)}>{c.value}</div>
          </div>
        ))}
      </div>

      <div className="card">
        <DataTable
          columns={[
            { key: 'username',   label: 'User',    render: r => <span className="font-medium text-primary">{r.username || r.userId.slice(0,8)}</span> },
            { key: 'gameId',     label: 'Game',    render: r => <span className="text-tx-secondary">{r.gameId}</span> },
            { key: 'betAmount',  label: 'Bet',     render: r => `₹${formatCurrency(r.betAmount)}` },
            { key: 'winAmount',  label: 'Won',     render: r => (
              <span className={r.winAmount > 0 ? 'text-win' : 'text-tx-muted'}>
                {r.winAmount > 0 ? `₹${formatCurrency(r.winAmount)}` : '-'}
              </span>
            )},
            { key: 'result',     label: 'Result',  render: r => (
              <span className={cn(
                'font-medium',
                r.result === 'WIN'  ? 'text-win' :
                r.result === 'LOSS' ? 'text-loss' : 'text-tx-muted'
              )}>{r.result}</span>
            )},
            { key: 'createdAt',  label: 'Time',    render: r => (
              <span className="text-tx-muted">{formatDate(r.createdAt)}</span>
            )},
          ]}
          data={txns}
          loading={loading}
          emptyMessage="No casino transactions"
          rowKey={r => r.id}
        />
        <div className="p-3">
          <Pagination
            page={page}
            total={txns.length < 50 ? page * 50 + txns.length : (page + 2) * 50}
            size={50}
            onChange={setPage}
          />
        </div>
      </div>
    </div>
  )
}
