'use client'

import { useEffect, useState } from 'react'
import dynamic from 'next/dynamic'
import { Users, TrendingUp, Wallet, Gamepad2, Activity, ArrowUpRight } from 'lucide-react'
import { adminApi, walletApi, betApi } from '@/lib/api'
import { formatCurrency } from '@/lib/utils'
import StatCard from '@/components/ui/StatCard'
import PageHeader from '@/components/ui/PageHeader'
import { useAuthStore } from '@/lib/store'

// Dynamic import to avoid SSR issues with ApexCharts
const Chart = dynamic(() => import('react-apexcharts'), { ssr: false })

export default function AdminDashboard() {
  const { user } = useAuthStore()
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeMarkets: 0,
    todayBets: 0,
    todayPnl: 0,
  })

  // Placeholder chart data — in production connect to real report APIs
  const chartOptions = {
    chart: { type: 'area' as const, background: 'transparent', toolbar: { show: false } },
    theme: { mode: 'dark' as const },
    colors: ['#03b37f'],
    stroke: { curve: 'smooth' as const, width: 2 },
    fill: { type: 'gradient', gradient: { shadeIntensity: 1, opacityFrom: 0.3, opacityTo: 0 } },
    xaxis: { categories: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'], labels: { style: { colors: '#6b7a87' } } },
    yaxis: { labels: { style: { colors: '#6b7a87' }, formatter: (v: number) => `₹${(v / 1000).toFixed(0)}k` } },
    grid: { borderColor: '#3a444c', strokeDashArray: 4 },
    tooltip: { theme: 'dark', y: { formatter: (v: number) => `₹${formatCurrency(v)}` } },
  }

  const chartSeries = [{ name: 'Volume', data: [4200, 8100, 5300, 11200, 7800, 15400, 9300] }]

  return (
    <div>
      <PageHeader title="Dashboard" subtitle={`Welcome back, ${user?.username}`} />

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
        <StatCard label="Total Accounts" value="—" icon={<Users size={16} />} />
        <StatCard label="Open Markets"   value="—" icon={<Activity size={16} />} />
        <StatCard label="Today's Bets"   value="—" icon={<TrendingUp size={16} />} />
        <StatCard label="Today's P&L"    value="—" icon={<Wallet size={16} />} valueClassName="text-win" />
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 mb-4">
        <div className="card lg:col-span-2">
          <div className="card-header">Betting Volume (7 days)</div>
          <div className="p-2">
            <Chart options={chartOptions} series={chartSeries} type="area" height={200} />
          </div>
        </div>

        <div className="card">
          <div className="card-header">Quick Actions</div>
          <div className="p-3 flex flex-col gap-2">
            <a href="/admin/accounts/create" className="btn-primary flex items-center gap-2 justify-center">
              <Users size={13} /> Create Account
            </a>
            <a href="/admin/markets" className="btn-outline flex items-center gap-2 justify-center">
              <Activity size={13} /> Manage Markets
            </a>
            <a href="/admin/reports/pnl" className="btn-outline flex items-center gap-2 justify-center">
              <ArrowUpRight size={13} /> View P&L Report
            </a>
          </div>
        </div>
      </div>

      {/* Recent activity placeholder */}
      <div className="card">
        <div className="card-header">Recent Bets</div>
        <div className="p-6 text-center text-tx-muted text-xs">
          Connect to /api/bets for real-time data
        </div>
      </div>
    </div>
  )
}
