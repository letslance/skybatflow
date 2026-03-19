'use client'

import { useState } from 'react'
import PageHeader from '@/components/ui/PageHeader'
import { formatCurrency, cn } from '@/lib/utils'
import { adminApi } from '@/lib/api'
import toast from 'react-hot-toast'

interface GgrRow {
  sport: string
  stake: number
  loss: number
  profit: number
  ggr100: number
  customerGgrPct: number
}

function todayStr()     { return new Date().toISOString().slice(0, 10) }
function monthStartStr(){ const d = new Date(); d.setDate(1); return d.toISOString().slice(0, 10) }

export default function GgrReportPage() {
  const [from,    setFrom]    = useState(monthStartStr())
  const [to,      setTo]      = useState(todayStr())
  const [rows,    setRows]    = useState<GgrRow[]>([])
  const [loading, setLoading] = useState(false)
  const [loaded,  setLoaded]  = useState(false)
  const [saving,  setSaving]  = useState<Record<string, boolean>>({})
  const [edits,   setEdits]   = useState<Record<string, string>>({})

  async function load() {
    setLoading(true)
    try {
      const data = await adminApi.reportGgr({ from, to })
      const rows = data as GgrRow[]
      setRows(rows)
      setEdits(Object.fromEntries(rows.map(r => [r.sport, String(r.customerGgrPct)])))
      setLoaded(true)
    } catch {
      toast.error('Failed to load GGR report')
    } finally {
      setLoading(false)
    }
  }

  async function saveGgr(sport: string) {
    setSaving(s => ({ ...s, [sport]: true }))
    try {
      await adminApi.updateGgr(sport, parseFloat(edits[sport] || '0'))
      toast.success(`GGR updated for ${sport}`)
    } catch {
      toast.error('Failed to update GGR')
    } finally {
      setSaving(s => ({ ...s, [sport]: false }))
    }
  }

  function reset() {
    setFrom(monthStartStr()); setTo(todayStr())
    setRows([]); setLoaded(false); setEdits({})
  }

  const totals = rows.reduce(
    (acc, r) => ({ stake: acc.stake + r.stake, loss: acc.loss + r.loss, profit: acc.profit + r.profit, ggr100: acc.ggr100 + r.ggr100 }),
    { stake: 0, loss: 0, profit: 0, ggr100: 0 }
  )

  function numClass(v: number) { return v >= 0 ? 'text-win' : 'text-loss' }

  return (
    <div>
      <PageHeader title="GGR Report" subtitle="Gross Gaming Revenue by sport/category" />

      <div className="card mb-4">
        <div className="p-4 grid grid-cols-2 md:grid-cols-4 gap-3">
          <div>
            <label className="block text-xs text-tx-secondary mb-1">From</label>
            <input type="date" value={from} onChange={e => setFrom(e.target.value)} className="input text-xs" />
          </div>
          <div>
            <label className="block text-xs text-tx-secondary mb-1">To</label>
            <input type="date" value={to} onChange={e => setTo(e.target.value)} className="input text-xs" />
          </div>
          <div className="flex items-end gap-2 md:col-span-2">
            <button onClick={load} disabled={loading} className="btn-primary btn-sm">
              {loading ? 'Loading...' : 'Load'}
            </button>
            <button onClick={reset} className="btn-outline btn-sm">Reset</button>
          </div>
        </div>
      </div>

      <div className="card overflow-x-auto">
        <table className="data-table">
          <thead>
            <tr>
              <th>Sport / Category</th>
              <th>Stake</th>
              <th>Loss</th>
              <th>Profit</th>
              <th>GGR (100)</th>
              <th>Customer GGR %</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr><td colSpan={7} className="text-center py-6 text-tx-muted text-xs">Loading...</td></tr>
            )}
            {!loading && !loaded && (
              <tr><td colSpan={7} className="text-center py-6 text-tx-muted text-xs">Apply filters and click Load</td></tr>
            )}
            {!loading && loaded && rows.length === 0 && (
              <tr><td colSpan={7} className="text-center py-6 text-tx-muted text-xs">No data found</td></tr>
            )}
            {rows.map(row => (
              <tr key={row.sport}>
                <td className="font-medium">{row.sport}</td>
                <td>₹{formatCurrency(row.stake)}</td>
                <td className="text-loss">₹{formatCurrency(row.loss)}</td>
                <td className={numClass(row.profit)}>
                  {row.profit >= 0 ? '+' : ''}₹{formatCurrency(Math.abs(row.profit))}
                </td>
                <td className={numClass(row.ggr100)}>
                  {row.ggr100 >= 0 ? '+' : ''}₹{formatCurrency(Math.abs(row.ggr100))}
                </td>
                <td>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    max="100"
                    value={edits[row.sport] ?? ''}
                    onChange={e => setEdits(prev => ({ ...prev, [row.sport]: e.target.value }))}
                    className="input w-20 h-6 text-xs text-center"
                  />
                  <span className="ml-1 text-tx-muted text-xs">%</span>
                </td>
                <td>
                  <button
                    onClick={() => saveGgr(row.sport)}
                    disabled={saving[row.sport]}
                    className="btn-primary btn-sm text-[10px] px-2 py-0.5"
                  >
                    {saving[row.sport] ? '...' : 'Submit'}
                  </button>
                </td>
              </tr>
            ))}
            {loaded && rows.length > 0 && (
              <tr className="font-semibold text-tx-primary border-t-2 border-[#3a444c]">
                <td>TOTAL</td>
                <td>₹{formatCurrency(totals.stake)}</td>
                <td className="text-loss">₹{formatCurrency(totals.loss)}</td>
                <td className={numClass(totals.profit)}>
                  {totals.profit >= 0 ? '+' : ''}₹{formatCurrency(Math.abs(totals.profit))}
                </td>
                <td className={numClass(totals.ggr100)}>
                  {totals.ggr100 >= 0 ? '+' : ''}₹{formatCurrency(Math.abs(totals.ggr100))}
                </td>
                <td colSpan={2} />
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
