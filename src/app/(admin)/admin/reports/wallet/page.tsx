'use client'

import PageHeader from '@/components/ui/PageHeader'
import StatCard from '@/components/ui/StatCard'
import { formatCurrency, formatDate } from '@/lib/utils'
import { ArrowDownLeft, ArrowUpRight } from 'lucide-react'

const MOCK_TXNS = [
  { id: '1', username: 'user001', type: 'DEPOSIT',  amount: 5000,  status: 'COMPLETED', createdAt: '2026-03-14T10:00:00Z', reference: 'UTR123456' },
  { id: '2', username: 'user002', type: 'WITHDRAW', amount: 2000,  status: 'PENDING',   createdAt: '2026-03-14T09:30:00Z', reference: 'WD987654' },
  { id: '3', username: 'vip_usr', type: 'DEPOSIT',  amount: 20000, status: 'COMPLETED', createdAt: '2026-03-14T08:15:00Z', reference: 'UTR789012' },
  { id: '4', username: 'agent01', type: 'TRANSFER', amount: 10000, status: 'COMPLETED', createdAt: '2026-03-13T22:00:00Z', reference: 'TRF345678' },
  { id: '5', username: 'user003', type: 'WITHDRAW', amount: 1500,  status: 'REJECTED',  createdAt: '2026-03-13T18:45:00Z', reference: 'WD111222' },
]

const STATUS_COLORS: Record<string, string> = {
  COMPLETED: 'badge-green',
  PENDING:   'badge-yellow',
  REJECTED:  'badge-red',
}

const TYPE_ICONS: Record<string, React.ReactNode> = {
  DEPOSIT:  <ArrowDownLeft size={11} className="text-win" />,
  WITHDRAW: <ArrowUpRight size={11} className="text-loss" />,
  TRANSFER: <ArrowUpRight size={11} className="text-lay-dark" />,
}

export default function WalletReportPage() {
  const deposits   = MOCK_TXNS.filter(t => t.type === 'DEPOSIT' && t.status === 'COMPLETED').reduce((s, t) => s + t.amount, 0)
  const withdrawals = MOCK_TXNS.filter(t => t.type === 'WITHDRAW' && t.status === 'COMPLETED').reduce((s, t) => s + t.amount, 0)
  const pending    = MOCK_TXNS.filter(t => t.status === 'PENDING').length

  return (
    <div>
      <PageHeader title="Wallet Report" />

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 mb-4">
        <StatCard label="Total Deposits"    value={`₹${formatCurrency(deposits)}`}    valueClassName="text-win" />
        <StatCard label="Total Withdrawals" value={`₹${formatCurrency(withdrawals)}`} valueClassName="text-loss" />
        <StatCard label="Pending Requests"  value={pending} valueClassName={pending > 0 ? 'text-void' : undefined} />
      </div>

      <div className="card">
        <div className="card-header">Wallet Transactions</div>
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Username</th>
                <th>Type</th>
                <th>Amount</th>
                <th>Reference</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {MOCK_TXNS.map(txn => (
                <tr key={txn.id}>
                  <td className="text-tx-muted">{formatDate(txn.createdAt)}</td>
                  <td className="font-medium text-primary">{txn.username}</td>
                  <td>
                    <div className="flex items-center gap-1">
                      {TYPE_ICONS[txn.type]}
                      <span>{txn.type}</span>
                    </div>
                  </td>
                  <td className={txn.type === 'DEPOSIT' ? 'text-win font-semibold' : 'text-loss font-semibold'}>
                    {txn.type === 'DEPOSIT' ? '+' : '-'}₹{formatCurrency(txn.amount)}
                  </td>
                  <td className="text-tx-muted font-mono text-[11px]">{txn.reference}</td>
                  <td><span className={STATUS_COLORS[txn.status] ?? 'badge-gray'}>{txn.status}</span></td>
                  <td>
                    {txn.status === 'PENDING' && (
                      <div className="flex gap-1">
                        <button className="btn-sm btn-primary text-[11px] px-2 py-0.5">Approve</button>
                        <button className="btn-sm btn-danger text-[11px] px-2 py-0.5">Reject</button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
