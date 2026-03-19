'use client'

import { useEffect, useState } from 'react'
import { walletApi } from '@/lib/api'
import { Transaction } from '@/types'
import { formatCurrency, formatDate, txTypeColor } from '@/lib/utils'
import DataTable, { Pagination } from '@/components/ui/DataTable'
import PageHeader from '@/components/ui/PageHeader'
import { FileText } from 'lucide-react'

export default function StatementPage() {
  const [txns, setTxns]     = useState<Transaction[]>([])
  const [page, setPage]     = useState(0)
  const [loading, setLoading] = useState(true)
  const [type, setType]     = useState('')

  useEffect(() => { load(0) }, [type])

  async function load(p: number) {
    setLoading(true)
    try {
      setTxns(await walletApi.statement(p, 20))
      setPage(p)
    } catch { /* */ } finally { setLoading(false) }
  }

  const TYPES = ['', 'DEPOSIT', 'WITHDRAW', 'BET', 'WIN', 'COMMISSION', 'TRANSFER']

  return (
    <div className="p-3">
      <PageHeader title="Account Statement">
        <FileText size={16} className="text-tx-muted" />
      </PageHeader>

      <div className="flex gap-1 flex-wrap mb-3">
        {TYPES.map(t => (
          <button key={t} onClick={() => setType(t)}
            className={type === t ? 'btn-primary btn-sm' : 'btn-outline btn-sm'}>
            {t || 'All'}
          </button>
        ))}
      </div>

      <div className="card">
        <DataTable
          columns={[
            { key: 'createdAt', label: 'Date',    render: r => <span className="text-tx-muted">{formatDate(r.createdAt)}</span> },
            { key: 'type',      label: 'Type',    render: r => <span className="font-medium">{r.type}</span> },
            { key: 'amount',    label: 'Amount',  render: r => (
              <span className={txTypeColor(r.type) + ' font-semibold'}>
                {txTypeColor(r.type) === 'text-win' ? '+' : '-'}₹{formatCurrency(Math.abs(r.amount))}
              </span>
            )},
            { key: 'balanceBefore', label: 'Before', render: r => `₹${formatCurrency(r.balanceBefore)}` },
            { key: 'balanceAfter',  label: 'After',  render: r => `₹${formatCurrency(r.balanceAfter)}` },
            { key: 'description',   label: 'Details', render: r => (
              <span className="text-tx-muted text-[11px]">{r.description}</span>
            )},
            { key: 'status', label: 'Status', render: r => (
              <span className={r.status === 'COMPLETED' ? 'badge-green' : r.status === 'PENDING' ? 'badge-yellow' : 'badge-red'}>
                {r.status}
              </span>
            )},
          ]}
          data={txns}
          loading={loading}
          emptyMessage="No transactions"
        />
        <div className="p-3">
          <Pagination page={page} total={txns.length < 20 ? page * 20 + txns.length : (page + 2) * 20} size={20} onChange={load} />
        </div>
      </div>
    </div>
  )
}
