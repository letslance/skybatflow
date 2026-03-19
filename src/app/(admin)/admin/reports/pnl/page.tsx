'use client'

import { useState } from 'react'
import dynamic from 'next/dynamic'
import PageHeader from '@/components/ui/PageHeader'
import StatCard from '@/components/ui/StatCard'
import { formatCurrency } from '@/lib/utils'
import { TrendingUp, TrendingDown, Activity } from 'lucide-react'

const Chart = dynamic(() => import('react-apexcharts'), { ssr: false })

// In production these would come from report API endpoints
const MOCK_DAILY = {
  labels: Array.from({ length: 30 }, (_, i) => {
    const d = new Date()
    d.setDate(d.getDate() - 29 + i)
    return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })
  }),
  gross:   Array.from({ length: 30 }, () => Math.floor(Math.random() * 50000 + 10000)),
  payout:  Array.from({ length: 30 }, () => Math.floor(Math.random() * 40000 + 8000)),
  commission: Array.from({ length: 30 }, () => Math.floor(Math.random() * 3000 + 500)),
}

export default function PnlReportPage() {
  const [period, setPeriod] = useState<'7d' | '30d' | 'custom'>('30d')
  const [from, setFrom] = useState('')
  const [to, setTo]     = useState('')

  const totalGross  = MOCK_DAILY.gross.reduce((a, b) => a + b, 0)
  const totalPayout = MOCK_DAILY.payout.reduce((a, b) => a + b, 0)
  const totalComm   = MOCK_DAILY.commission.reduce((a, b) => a + b, 0)
  const netPnl      = totalGross - totalPayout

  const areaOptions = {
    chart: { type: 'bar' as const, background: 'transparent', toolbar: { show: false }, stacked: false },
    theme: { mode: 'dark' as const },
    colors: ['#03b37f', '#e04b4b', '#f0a500'],
    xaxis: {
      categories: MOCK_DAILY.labels,
      labels: { style: { colors: '#6b7a87', fontSize: '10px' }, rotate: -45 },
    },
    yaxis: { labels: { style: { colors: '#6b7a87' }, formatter: (v: number) => `₹${(v / 1000).toFixed(0)}k` } },
    grid: { borderColor: '#3a444c', strokeDashArray: 4 },
    tooltip: { theme: 'dark', y: { formatter: (v: number) => `₹${formatCurrency(v)}` } },
    legend: { labels: { colors: '#9aa5b1' } },
    dataLabels: { enabled: false },
  }

  const series = [
    { name: 'Gross',      data: MOCK_DAILY.gross },
    { name: 'Payout',     data: MOCK_DAILY.payout },
    { name: 'Commission', data: MOCK_DAILY.commission },
  ]

  return (
    <div>
      <PageHeader title="P&L Report" subtitle="Profit & Loss summary">
        <div className="flex gap-1">
          {(['7d', '30d', 'custom'] as const).map(p => (
            <button key={p} onClick={() => setPeriod(p)} className={period === p ? 'btn-primary btn-sm' : 'btn-outline btn-sm'}>
              {p}
            </button>
          ))}
        </div>
      </PageHeader>

      {period === 'custom' && (
        <div className="flex gap-2 mb-4">
          <div>
            <label className="block text-[11px] text-tx-muted mb-1">From</label>
            <input type="date" value={from} onChange={e => setFrom(e.target.value)} className="input h-7 text-xs" />
          </div>
          <div>
            <label className="block text-[11px] text-tx-muted mb-1">To</label>
            <input type="date" value={to} onChange={e => setTo(e.target.value)} className="input h-7 text-xs" />
          </div>
          <div className="self-end">
            <button className="btn-primary btn-sm">Apply</button>
          </div>
        </div>
      )}

      {/* Summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
        <StatCard
          label="Gross Betting"
          value={`₹${formatCurrency(totalGross)}`}
          icon={<Activity size={16} />}
        />
        <StatCard
          label="Total Payout"
          value={`₹${formatCurrency(totalPayout)}`}
          valueClassName="text-loss"
          icon={<TrendingDown size={16} />}
        />
        <StatCard
          label="Net P&L"
          value={`₹${formatCurrency(netPnl)}`}
          valueClassName={netPnl >= 0 ? 'text-win' : 'text-loss'}
          icon={<TrendingUp size={16} />}
          trend={netPnl >= 0 ? 'up' : 'down'}
          subvalue={`${((netPnl / totalGross) * 100).toFixed(1)}% margin`}
        />
        <StatCard
          label="Commission"
          value={`₹${formatCurrency(totalComm)}`}
          valueClassName="text-void"
        />
      </div>

      {/* Chart */}
      <div className="card mb-4">
        <div className="card-header">Daily Breakdown</div>
        <div className="p-2">
          <Chart options={areaOptions} series={series} type="bar" height={260} />
        </div>
      </div>

      {/* Sport breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        <div className="card">
          <div className="card-header">By Sport</div>
          <table className="data-table">
            <thead>
              <tr>
                <th>Sport</th>
                <th>Bets</th>
                <th>Turnover</th>
                <th>P&L</th>
              </tr>
            </thead>
            <tbody>
              {[
                { sport: '🏏 Cricket',  bets: 1240, turnover: 524000, pnl: 42300 },
                { sport: '⚽ Football', bets: 430,  turnover: 189000, pnl: 15200 },
                { sport: '🎾 Tennis',   bets: 210,  turnover:  87000, pnl:  7100 },
                { sport: '🎰 Casino',   bets: 890,  turnover: 342000, pnl: 28400 },
              ].map(row => (
                <tr key={row.sport}>
                  <td>{row.sport}</td>
                  <td>{row.bets.toLocaleString()}</td>
                  <td>₹{formatCurrency(row.turnover)}</td>
                  <td className={row.pnl >= 0 ? 'text-win font-semibold' : 'text-loss font-semibold'}>
                    {row.pnl >= 0 ? '+' : ''}₹{formatCurrency(Math.abs(row.pnl))}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="card">
          <div className="card-header">Top Users by Volume</div>
          <table className="data-table">
            <thead>
              <tr>
                <th>Username</th>
                <th>Bets</th>
                <th>Volume</th>
                <th>P&L</th>
              </tr>
            </thead>
            <tbody>
              {[
                { user: 'agent001', bets: 340, volume: 128000, pnl: 9200 },
                { user: 'user_vip', bets: 290, volume:  98000, pnl: -3100 },
                { user: 'master1',  bets: 210, volume:  87000, pnl: 7400 },
                { user: 'player99', bets: 180, volume:  72000, pnl: 5100 },
              ].map(row => (
                <tr key={row.user}>
                  <td className="font-medium text-primary">{row.user}</td>
                  <td>{row.bets}</td>
                  <td>₹{formatCurrency(row.volume)}</td>
                  <td className={row.pnl >= 0 ? 'text-win' : 'text-loss'}>
                    {row.pnl >= 0 ? '+' : ''}₹{formatCurrency(Math.abs(row.pnl))}
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
