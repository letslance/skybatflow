'use client'

import { useEffect, useState } from 'react'
import dynamic from 'next/dynamic'
import { adminApi } from '@/lib/api'
import { useAuthStore } from '@/lib/store'

const Chart = dynamic(() => import('react-apexcharts'), { ssr: false })

function fmtPts(n: number) { return n.toLocaleString('en-IN') }

function StatCard({ label, value, accent }: { label: string; value: string; accent?: string }) {
  return (
    <div className="card p-4">
      <div className="text-tx-muted text-xs mb-1.5 uppercase tracking-wide">{label}</div>
      <div className={`text-xl font-bold ${accent ?? 'text-tx-primary'}`}>{value}</div>
    </div>
  )
}

export default function AdminDashboard() {
  const { user } = useAuthStore()
  const [balance, setBalance] = useState<any>(null)

  useEffect(() => {
    if (user?.id) {
      adminApi.getAdminBalance(user.id).then(setBalance).catch(() => {})
    }
  }, [user?.id])

  const creditPts     = balance?.main        ?? 0
  const allPts        = (balance?.main ?? 0) + (balance?.casino ?? 0)
  const exposure      = balance?.exposure    ?? 0
  const settlementPts = 0
  const upperPts      = 0
  const downPts       = 0

  const COLORS = ['#5b6be8', '#f5a623', '#50a5f1', '#34c38f', '#6c757d']

  // Dark-theme chart base
  const chartBase: ApexCharts.ApexOptions = {
    chart: { background: 'transparent', toolbar: { show: false }, fontFamily: 'inherit' },
    dataLabels: { enabled: false },
    grid: { borderColor: '#2a3340' },
    legend: { show: false },
    tooltip: { theme: 'dark', y: { formatter: (v: number) => fmtPts(v) } },
  }

  const barOptions: ApexCharts.ApexOptions = {
    ...chartBase,
    chart: { ...chartBase.chart, type: 'bar' },
    plotOptions: { bar: { horizontal: true, barHeight: '55%', borderRadius: 2 } },
    colors: COLORS,
    xaxis: {
      categories: ['Credit pts', 'All pts', 'Settlement pts', 'Upper pts', 'Down pts'],
      labels: { style: { colors: '#9aa5b1', fontSize: '11px' } },
      min: 0, max: Math.max(allPts * 1.1, 100000),
    },
    yaxis: { labels: { style: { colors: '#9aa5b1', fontSize: '12px' } } },
  }
  const barSeries = [{ name: 'Points', data: [creditPts, allPts, settlementPts, upperPts, downPts] }]

  const plOptions: ApexCharts.ApexOptions = {
    ...chartBase,
    chart: { ...chartBase.chart, type: 'bar' },
    plotOptions: { bar: { horizontal: true, barHeight: '55%', borderRadius: 2 } },
    colors: ['#5b6be8', '#f5a623', '#34c38f'],
    xaxis: {
      categories: ['Sports P/L', 'Casino P/L', 'Total P/L'],
      labels: { style: { colors: '#9aa5b1', fontSize: '11px' } },
    },
    yaxis: { labels: { style: { colors: '#9aa5b1', fontSize: '12px' } } },
  }
  const plSeries = [{ name: 'P/L', data: [0, 0, 0] }]

  const summaryItems = [
    { color: COLORS[0], label: 'Credit pts',    value: creditPts },
    { color: COLORS[1], label: 'All pts',        value: allPts },
    { color: COLORS[2], label: 'Settlement pts', value: settlementPts },
    { color: COLORS[3], label: 'Upper pts',      value: upperPts },
    { color: COLORS[4], label: 'Down pts',       value: downPts },
  ]

  return (
    <div className="space-y-3">

      {/* ── Row 1: 4 stat cards ───────────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard label="Balance"    value={fmtPts(balance?.main ?? 0)} accent="text-primary" />
        <StatCard label="Exposure"   value={fmtPts(exposure)}           accent="text-loss" />
        <StatCard label="Credit pts" value={fmtPts(creditPts)} />
        <StatCard label="All pts"    value={fmtPts(allPts)}             accent="text-void" />
      </div>

      {/* ── Row 2: 3 stat cards ───────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <StatCard label="Settlement pts" value={fmtPts(settlementPts)} />
        <StatCard label="Upper pts"      value={fmtPts(upperPts)} />
        <StatCard label="Down pts"       value={fmtPts(downPts)} />
      </div>

      {/* ── Points bar chart ──────────────────────────────────────────────── */}
      <div className="card overflow-hidden">
        <div className="card-header">Points Overview</div>
        <div className="p-4">
          <Chart options={barOptions} series={barSeries} type="bar" height={220} />
        </div>

        {/* Legend */}
        <div className="flex flex-wrap justify-center gap-4 px-4 pb-3">
          {summaryItems.map(l => (
            <span key={l.label} className="flex items-center gap-1.5 text-[11px] text-tx-secondary">
              <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: l.color }} />
              {l.label}
            </span>
          ))}
        </div>

        {/* Summary numbers */}
        <div className="flex flex-wrap border-t border-[#2a3340]">
          {summaryItems.map(s => (
            <div key={s.label} className="flex-1 basis-[18%] min-w-[100px] px-4 py-3 text-center border-r border-[#2a3340] last:border-r-0">
              <div className="flex justify-center items-center gap-1 mb-1">
                <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: s.color }} />
                <span className="text-[11px] text-tx-muted">{s.label}</span>
              </div>
              <div className="text-base font-bold text-tx-primary">{fmtPts(s.value)}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── P/L bar chart ─────────────────────────────────────────────────── */}
      <div className="card overflow-hidden">
        <div className="card-header">Profit / Loss Overview</div>
        <div className="p-4">
          <Chart options={plOptions} series={plSeries} type="bar" height={160} />
        </div>
      </div>

    </div>
  )
}
