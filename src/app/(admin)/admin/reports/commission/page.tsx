'use client'

import PageHeader from '@/components/ui/PageHeader'
import StatCard from '@/components/ui/StatCard'
import { formatCurrency, formatDate } from '@/lib/utils'

// In production these would come from /api/reports/commission
const MOCK_ROWS = [
  { id: '1', username: 'agent001', role: 'AGENT', betsSettled: 340, totalStake: 128000, commissionEarned: 6400, createdAt: '2026-03-10T08:00:00Z' },
  { id: '2', username: 'master1',  role: 'MASTER', betsSettled: 890, totalStake: 342000, commissionEarned: 10260, createdAt: '2026-03-10T08:00:00Z' },
  { id: '3', username: 'agent002', role: 'AGENT', betsSettled: 180, totalStake: 72000,  commissionEarned: 3600, createdAt: '2026-03-10T08:00:00Z' },
  { id: '4', username: 'smstr1',   role: 'SUPER_MASTER', betsSettled: 1240, totalStake: 524000, commissionEarned: 15720, createdAt: '2026-03-10T08:00:00Z' },
]

export default function CommissionReportPage() {
  const totalComm = MOCK_ROWS.reduce((s, r) => s + r.commissionEarned, 0)

  return (
    <div>
      <PageHeader title="Commission Report" />

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 mb-4">
        <StatCard label="Total Commission" value={`₹${formatCurrency(totalComm)}`} valueClassName="text-void" />
        <StatCard label="Members" value={MOCK_ROWS.length} />
        <StatCard label="Total Stake" value={`₹${formatCurrency(MOCK_ROWS.reduce((s, r) => s + r.totalStake, 0))}`} />
      </div>

      <div className="card">
        <div className="card-header">Commission Breakdown</div>
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>Username</th>
                <th>Role</th>
                <th>Bets Settled</th>
                <th>Total Stake</th>
                <th>Commission Earned</th>
                <th>Rate</th>
              </tr>
            </thead>
            <tbody>
              {MOCK_ROWS.map(row => (
                <tr key={row.id}>
                  <td className="font-medium text-primary">{row.username}</td>
                  <td><span className="badge badge-blue">{row.role}</span></td>
                  <td>{row.betsSettled.toLocaleString()}</td>
                  <td>₹{formatCurrency(row.totalStake)}</td>
                  <td className="text-void font-semibold">₹{formatCurrency(row.commissionEarned)}</td>
                  <td className="text-tx-muted">
                    {((row.commissionEarned / row.totalStake) * 100).toFixed(2)}%
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
