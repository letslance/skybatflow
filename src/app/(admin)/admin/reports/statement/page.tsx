'use client'

import { useState } from 'react'
import PageHeader from '@/components/ui/PageHeader'
import DataTable, { Pagination } from '@/components/ui/DataTable'
import { formatCurrency, formatDate, cn } from '@/lib/utils'
import { adminApi } from '@/lib/api'
import toast from 'react-hot-toast'
import { Search, Download } from 'lucide-react'

type TxType = 'ALL' | 'DEPOSIT' | 'WITHDRAWAL' | 'BET_DEBIT' | 'BET_WIN' | 'CASINO_DEBIT' | 'CASINO_WIN' | 'COMMISSION'

interface StatementRow {
  id: string
  date: string
  credit: number
  debit: number
  balance: number
  type: string
  remark: string
  username: string
  fromTo: string
}

const TX_TYPES: Array<{ label: string; value: TxType }> = [
  { label: 'All',          value: 'ALL' },
  { label: 'Deposit',      value: 'DEPOSIT' },
  { label: 'Withdrawal',   value: 'WITHDRAWAL' },
  { label: 'Bet Debit',    value: 'BET_DEBIT' },
  { label: 'Bet Win',      value: 'BET_WIN' },
  { label: 'Casino Debit', value: 'CASINO_DEBIT' },
  { label: 'Casino Win',   value: 'CASINO_WIN' },
  { label: 'Commission',   value: 'COMMISSION' },
]

const PAGE_SIZE = 20

function todayStr()     { return new Date().toISOString().slice(0, 10) }
function monthStartStr(){ const d = new Date(); d.setDate(1); return d.toISOString().slice(0, 10) }

export default function AccountStatementPage() {
  const [username, setUsername] = useState('')
  const [txType,   setTxType]   = useState<TxType>('ALL')
  const [from,     setFrom]     = useState(monthStartStr())
  const [to,       setTo]       = useState(todayStr())
  const [rows,     setRows]     = useState<StatementRow[]>([])
  const [loading,  setLoading]  = useState(false)
  const [loaded,   setLoaded]   = useState(false)
  const [page,     setPage]     = useState(0)

  async function load() {
    if (!username.trim()) { toast.error('Enter a username'); return }
    setLoading(true)
    setPage(0)
    try {
      // Resolve username → userId first
      const user = await adminApi.resolveUser(username.trim())
      if (!user) { toast.error('User not found'); setLoading(false); return }

      const data = await adminApi.reportStatement({
        userId: user.id,
        type:   txType !== 'ALL' ? txType : undefined,
        from, to,
      })
      setRows(data as StatementRow[])
      setLoaded(true)
    } catch {
      toast.error('Failed to load statement')
    } finally {
      setLoading(false)
    }
  }

  function reset() {
    setUsername(''); setTxType('ALL')
    setFrom(monthStartStr()); setTo(todayStr())
    setRows([]); setLoaded(false)
  }

  const paginated = rows.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE)

  const totalCredit = rows.reduce((s, r) => s + r.credit, 0)
  const totalDebit  = rows.reduce((s, r) => s + r.debit,  0)

  return (
    <div>
      <PageHeader title="Account Statement" subtitle="Transaction history for any downline account" />

      {/* Filters */}
      <div className="card mb-4">
        <div className="p-4 grid grid-cols-2 md:grid-cols-4 gap-3">
          <div>
            <label className="block text-xs text-tx-secondary mb-1">Username</label>
            <div className="relative">
              <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-tx-muted" />
              <input
                value={username}
                onChange={e => setUsername(e.target.value)}
                placeholder="Search username..."
                className="input pl-7 text-xs"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs text-tx-secondary mb-1">Transaction Type</label>
            <select value={txType} onChange={e => setTxType(e.target.value as TxType)} className="select text-xs">
              {TX_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
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
        </div>
        <div className="px-4 pb-4 flex gap-2">
          <button onClick={load} disabled={loading} className="btn-primary btn-sm">
            {loading ? 'Loading...' : 'Load'}
          </button>
          <button onClick={reset} className="btn-outline btn-sm">Reset</button>
        </div>
      </div>

      {/* Totals */}
      {loaded && (
        <div className="grid grid-cols-3 gap-3 mb-4">
          <div className="card p-3 text-center">
            <div className="text-[11px] text-tx-muted mb-1">Total Transactions</div>
            <div className="text-sm font-bold text-tx-primary">{rows.length}</div>
          </div>
          <div className="card p-3 text-center">
            <div className="text-[11px] text-tx-muted mb-1">Total Credit</div>
            <div className="text-sm font-bold text-win">₹{formatCurrency(totalCredit)}</div>
          </div>
          <div className="card p-3 text-center">
            <div className="text-[11px] text-tx-muted mb-1">Total Debit</div>
            <div className="text-sm font-bold text-loss">₹{formatCurrency(totalDebit)}</div>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="card">
        <DataTable
          columns={[
            { key: 'date',    label: 'Date',    render: r => <span className="text-tx-muted text-[11px]">{formatDate(r.date)}</span> },
            { key: 'username',label: 'Account', render: r => <span className="font-medium text-primary">{r.username}</span> },
            { key: 'type',    label: 'Type',    render: r => <span className="badge badge-blue text-[10px]">{r.type.replace(/_/g, ' ')}</span> },
            { key: 'credit',  label: 'Credit',  render: r => r.credit > 0
              ? <span className="text-win font-semibold">+₹{formatCurrency(r.credit)}</span>
              : <span className="text-tx-muted">—</span> },
            { key: 'debit',   label: 'Debit',   render: r => r.debit > 0
              ? <span className="text-loss font-semibold">-₹{formatCurrency(r.debit)}</span>
              : <span className="text-tx-muted">—</span> },
            { key: 'balance', label: 'Balance', render: r => <span>₹{formatCurrency(r.balance)}</span> },
            { key: 'fromTo',  label: 'From → To', render: r => <span className="text-[11px] text-tx-muted">{r.fromTo}</span> },
            { key: 'remark',  label: 'Remark',  render: r => <span className="text-[11px] text-tx-muted">{r.remark || '—'}</span> },
          ]}
          data={paginated}
          loading={loading}
          emptyMessage={loaded ? 'No transactions found' : 'Apply filters and click Load'}
          rowKey={r => r.id}
        />
        <div className="p-3">
          <Pagination page={page} total={rows.length} size={PAGE_SIZE} onChange={setPage} />
        </div>
      </div>
    </div>
  )
}
