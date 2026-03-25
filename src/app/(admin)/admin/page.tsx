'use client'

import { useEffect, useState } from 'react'
import dynamic from 'next/dynamic'
import { adminApi, walletApi } from '@/lib/api'
import { useAuthStore } from '@/lib/store'

const Chart = dynamic(() => import('react-apexcharts'), { ssr: false })

function fmtPts(n: number) {
  // Indian number format: 1,00,000
  return n.toLocaleString('en-IN')
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
  const available     = balance?.available   ?? 0
  const settlementPts = 0
  const upperPts      = 0
  const downPts       = 0

  // ── Stats bar chart (horizontal) ──────────────────────────────────────────
  const barOptions: ApexCharts.ApexOptions = {
    chart: { type: 'bar', background: '#fff', toolbar: { show: false }, fontFamily: 'inherit' },
    plotOptions: { bar: { horizontal: true, barHeight: '55%', borderRadius: 2 } },
    colors: ['#5b6be8', '#f5a623', '#50a5f1', '#34c38f', '#343a40'],
    dataLabels: { enabled: false },
    xaxis: {
      categories: ['Credit pts', 'All pts', 'Settlement pts', 'Upper pts', 'Down pts'],
      labels: { style: { colors: '#555', fontSize: '11px' } },
      min: 0, max: Math.max(allPts * 1.1, 100000),
    },
    yaxis: { labels: { style: { colors: '#555', fontSize: '12px' } } },
    grid: { borderColor: '#f0f0f0' },
    legend: { show: false },
    tooltip: { y: { formatter: (v: number) => fmtPts(v) } },
  }

  const barSeries = [{
    name: 'Points',
    data: [creditPts, allPts, settlementPts, upperPts, downPts],
  }]

  // ── P/L horizontal bar chart ───────────────────────────────────────────────
  const plOptions: ApexCharts.ApexOptions = {
    chart: { type: 'bar', background: '#fff', toolbar: { show: false }, fontFamily: 'inherit' },
    plotOptions: { bar: { horizontal: true, barHeight: '55%', borderRadius: 2 } },
    colors: ['#5b6be8', '#f5a623', '#34c38f'],
    dataLabels: { enabled: false },
    xaxis: {
      categories: ['Sports P/L', 'Casino P/L', 'Total P/L'],
      labels: { style: { colors: '#555', fontSize: '11px' } },
    },
    yaxis: { labels: { style: { colors: '#555', fontSize: '12px' } } },
    grid: { borderColor: '#f0f0f0' },
    legend: { show: false },
    tooltip: { y: { formatter: (v: number) => fmtPts(v) } },
  }

  const plSeries = [{ name: 'P/L', data: [0, 0, 0] }]

  return (
    <div style={{ maxWidth: '100%' }}>

      {/* ── Row 1: 4 stat cards ───────────────────────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 1, marginBottom: 1 }}>
        <StatCard label="Balance"    value={fmtPts(balance?.main ?? 0)} />
        <StatCard label="Exposure"   value={fmtPts(exposure)} />
        <StatCard label="Credit pts" value={fmtPts(creditPts)} />
        <StatCard label="All pts"    value={fmtPts(allPts)} />
      </div>

      {/* ── Row 2: 3 stat cards ───────────────────────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 1, marginBottom: 16 }}>
        <StatCard label="Settlement pts" value={fmtPts(settlementPts)} />
        <StatCard label="Upper pts"      value={fmtPts(upperPts)} />
        <StatCard label="Down pts"       value={fmtPts(downPts)} />
      </div>

      {/* ── Points bar chart ──────────────────────────────────────────────── */}
      <div style={{ background: '#fff', border: '1px solid #e8e8e8', borderRadius: 4, marginBottom: 16, overflow: 'hidden' }}>
        {/* Chart menu icon */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', padding: '8px 12px 0' }}>
          <span style={{ color: '#aaa', fontSize: 16, cursor: 'pointer' }}>≡</span>
        </div>

        <div style={{ padding: '0 16px 8px' }}>
          <Chart options={barOptions} series={barSeries} type="bar" height={220} />
        </div>

        {/* Legend row */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: 24, padding: '4px 16px 8px', flexWrap: 'wrap' }}>
          {[
            { color: '#5b6be8', label: 'Credit pts' },
            { color: '#f5a623', label: 'All pts' },
            { color: '#50a5f1', label: 'Settlement pts' },
            { color: '#34c38f', label: 'Upper pts' },
            { color: '#343a40', label: 'Down pts' },
          ].map(l => (
            <span key={l.label} style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, color: '#555' }}>
              <span style={{ width: 10, height: 10, borderRadius: '50%', background: l.color, display: 'inline-block' }} />
              {l.label}
            </span>
          ))}
        </div>

        {/* Summary numbers below chart */}
        <div style={{ display: 'flex', flexWrap: 'wrap', borderTop: '1px solid #f0f0f0' }}>
          {[
            { color: '#5b6be8', label: 'Credit pts',     value: creditPts },
            { color: '#f5a623', label: 'All pts',         value: allPts },
            { color: '#50a5f1', label: 'Settlement pts',  value: settlementPts },
            { color: '#34c38f', label: 'Upper pts',       value: upperPts },
            { color: '#343a40', label: 'Down pts',        value: downPts },
          ].map(s => (
            <div key={s.label} style={{ flex: '1 1 18%', padding: '12px 16px', textAlign: 'center', borderRight: '1px solid #f0f0f0', minWidth: 100 }}>
              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 5, marginBottom: 4 }}>
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: s.color, display: 'inline-block' }} />
                <span style={{ fontSize: 11, color: '#888' }}>{s.label}</span>
              </div>
              <div style={{ fontSize: 16, fontWeight: 700, color: '#212529' }}>{fmtPts(s.value)}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── P/L bar chart ─────────────────────────────────────────────────── */}
      <div style={{ background: '#fff', border: '1px solid #e8e8e8', borderRadius: 4, overflow: 'hidden' }}>
        <div style={{ display: 'flex', justifyContent: 'flex-end', padding: '8px 12px 0' }}>
          <span style={{ color: '#aaa', fontSize: 16, cursor: 'pointer' }}>≡</span>
        </div>
        <div style={{ padding: '0 16px 16px' }}>
          <Chart options={plOptions} series={plSeries} type="bar" height={160} />
        </div>
      </div>

    </div>
  )
}

// ─── Stat Card ────────────────────────────────────────────────────────────────
function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div style={{
      background: '#fff',
      padding: '18px 20px',
      borderRadius: 0,
      border: '1px solid #e8e8e8',
    }}>
      <div style={{ fontSize: 13, color: '#888', marginBottom: 6 }}>{label}</div>
      <div style={{ fontSize: 22, fontWeight: 700, color: '#212529' }}>{value}</div>
    </div>
  )
}
