'use client'

import { useState } from 'react'
import PageHeader from '@/components/ui/PageHeader'
import DataTable from '@/components/ui/DataTable'
import { formatCurrency, cn } from '@/lib/utils'
import { adminApi } from '@/lib/api'
import toast from 'react-hot-toast'

type ReportType = 'SPORTS' | 'CASINO'

interface TurnoverRow {
  label: string
  lossTurnOver: number
  loss: number
  winTurnOver: number
  win: number
  totalTurnOver: number
  totalPnl: number
}

function todayStr()     { return new Date().toISOString().slice(0, 10) }
function weekAgoStr()   { const d = new Date(); d.setDate(d.getDate() - 7); return d.toISOString().slice(0, 10) }
function pnlClass(v: number) { return v >= 0 ? 'text-win font-semibold' : 'text-loss font-semibold' }

export default function TurnoverReportPage() {
  const [reportType, setReportType] = useState<ReportType>('SPORTS')
  const [from,       setFrom]       = useState(weekAgoStr())
  const [to,         setTo]         = useState(todayStr())
  const [rows,       setRows]       = useState<TurnoverRow[]>([])
  const [loading,    setLoading]    = useState(false)
  const [loaded,     setLoaded]     = useState(false)

  async function load() {
    setLoading(true)
    try {
      const data = await adminApi.reportTurnover({ type: reportType, from, to })
      setRows(data as TurnoverRow[])
      setLoaded(true)
    } catch {
      toast.error('Failed to load turnover report')
    } finally {
      setLoading(false)
    }
  }

  function reset() {
    setReportType('SPORTS'); setFrom(weekAgoStr()); setTo(todayStr())
    setRows([]); setLoaded(false)
  }

  const totals = rows.reduce(
    (acc, r) => ({
      lossTurnOver:  acc.lossTurnOver  + r.lossTurnOver,
      loss:          acc.loss          + r.loss,
      winTurnOver:   acc.winTurnOver   + r.winTurnOver,
      win:           acc.win           + r.win,
      totalTurnOver: acc.totalTurnOver + r.totalTurnOver,
      totalPnl:      acc.totalPnl      + r.totalPnl,
    }),
    { lossTurnOver: 0, loss: 0, winTurnOver: 0, win: 0, totalTurnOver: 0, totalPnl: 0 }
  )

  return (
    <div>
      <PageHeader title="Turnover Report" subtitle="Win / Loss turnover breakdown (last 7 days max)" />

      <div className="card mb-4">
        <div className="p-4 grid grid-cols-2 md:grid-cols-4 gap-3">
          <div>
            <label className="block text-xs text-tx-secondary mb-1">Report Type</label>
            <select value={reportType} onChange={e => setReportType(e.target.value as ReportType)} className="select text-xs">
              <option value="SPORTS">Sports</option>
              <option value="CASINO">Casino</option>
            </select>
          </div>
          <div>
            <label className="block text-xs text-tx-secondary mb-1">From</label>
            <input type="date" value={from} onChange={e => setFrom(e.target.value)} className="input text-xs" />
          </div>
          <div>
            <label className="block text-xs text-tx-secondary mb-1">To</label>
            <input type="date" value={to} onChange={e => setTo(e.target.value)} className="input text-xs" />
          </div>
          <div className="flex items-end gap-2">
            <button onClick={load} disabled={loading} className="btn-primary btn-sm flex-1">
              {loading ? 'Loading...' : 'Load'}
            </button>
            <button onClick={reset} className="btn-outline btn-sm">Reset</button>
          </div>
        </div>
        <div className="px-4 pb-2">
          <p className="text-[11px] text-tx-muted">Data is available for the last 7 days only.</p>
        </div>
      </div>

      <div className="card">
        <DataTable
          columns={[
            { key: 'label',        label: 'Category',        render: r => <span className="font-medium">{r.label}</span> },
            { key: 'lossTurnOver', label: 'Loss Turn Over',   render: r => <span>₹{formatCurrency(r.lossTurnOver)}</span> },
            { key: 'loss',         label: 'Loss',             render: r => <span className="text-loss">₹{formatCurrency(r.loss)}</span> },
            { key: 'winTurnOver',  label: 'Win Turn Over',    render: r => <span>₹{formatCurrency(r.winTurnOver)}</span> },
            { key: 'win',          label: 'Win',              render: r => <span className="text-win">₹{formatCurrency(r.win)}</span> },
            { key: 'totalTurnOver',label: 'Total Turn Over',  render: r => <span className="font-semibold">₹{formatCurrency(r.totalTurnOver)}</span> },
            { key: 'totalPnl',     label: 'Total P&L',        render: r => <span className={pnlClass(r.totalPnl)}>{r.totalPnl >= 0 ? '+' : ''}₹{formatCurrency(Math.abs(r.totalPnl))}</span> },
          ]}
          data={rows}
          loading={loading}
          emptyMessage={loaded ? 'No data found' : 'Apply filters and click Load'}
          rowKey={r => r.label}
        />

        {loaded && rows.length > 0 && (
          <div className="border-t border-[#3a444c] p-3 grid grid-cols-7 gap-2 text-xs font-semibold text-tx-primary">
            <span>TOTAL</span>
            <span>₹{formatCurrency(totals.lossTurnOver)}</span>
            <span className="text-loss">₹{formatCurrency(totals.loss)}</span>
            <span>₹{formatCurrency(totals.winTurnOver)}</span>
            <span className="text-win">₹{formatCurrency(totals.win)}</span>
            <span>₹{formatCurrency(totals.totalTurnOver)}</span>
            <span className={pnlClass(totals.totalPnl)}>
              {totals.totalPnl >= 0 ? '+' : ''}₹{formatCurrency(Math.abs(totals.totalPnl))}
            </span>
          </div>
        )}
      </div>
    </div>
  )
}
