'use client'

import { useEffect, useState } from 'react'
import { walletApi } from '@/lib/api'
import { Balance, Transaction } from '@/types'
import { formatCurrency, formatDate, txTypeColor } from '@/lib/utils'
import DataTable, { Pagination } from '@/components/ui/DataTable'
import PageHeader from '@/components/ui/PageHeader'
import Modal from '@/components/ui/Modal'
import StatCard from '@/components/ui/StatCard'
import { Wallet, ArrowDownLeft, ArrowUpRight } from 'lucide-react'
import toast from 'react-hot-toast'

export default function WalletPage() {
  const [balance, setBalance]       = useState<Balance | null>(null)
  const [txns, setTxns]             = useState<Transaction[]>([])
  const [page, setPage]             = useState(0)
  const [loading, setLoading]       = useState(true)
  const [depositOpen, setDepositOpen] = useState(false)
  const [withdrawOpen, setWithdrawOpen] = useState(false)

  useEffect(() => {
    walletApi.balance().then(setBalance).catch(() => {})
    fetchTxns(0)
  }, [])

  async function fetchTxns(p: number) {
    setLoading(true)
    try {
      const data = await walletApi.statement(p, 20)
      setTxns(data)
      setPage(p)
    } catch { /* */ } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-3">
      <PageHeader title="Wallet" subtitle="Manage your funds">
        <button onClick={() => setDepositOpen(true)} className="btn-primary btn-sm flex items-center gap-1.5">
          <ArrowDownLeft size={13} /> Deposit
        </button>
        <button onClick={() => setWithdrawOpen(true)} className="btn-outline btn-sm flex items-center gap-1.5">
          <ArrowUpRight size={13} /> Withdraw
        </button>
      </PageHeader>

      {/* Balance cards */}
      {balance && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
          <StatCard label="Main Balance" value={`₹${formatCurrency(balance.main)}`} icon={<Wallet size={16} />} />
          <StatCard label="Casino Balance" value={`₹${formatCurrency(balance.casino)}`} />
          <StatCard label="Available" value={`₹${formatCurrency(balance.available)}`} valueClassName="text-win" />
          <StatCard label="Exposure" value={`(₹${formatCurrency(balance.exposure)})`} valueClassName="text-loss" />
        </div>
      )}

      {/* Transaction history */}
      <div className="card">
        <div className="card-header">Transaction History</div>
        <div className="p-3">
          <DataTable
            columns={[
              { key: 'createdAt', label: 'Date', render: r => <span className="text-tx-muted">{formatDate(r.createdAt)}</span> },
              { key: 'type',    label: 'Type',    render: r => <span className="font-medium">{r.type}</span> },
              { key: 'amount',  label: 'Amount',  render: r => (
                <span className={txTypeColor(r.type)}>
                  {txTypeColor(r.type) === 'text-win' ? '+' : '-'}₹{formatCurrency(Math.abs(r.amount))}
                </span>
              )},
              { key: 'balanceAfter', label: 'Balance', render: r => `₹${formatCurrency(r.balanceAfter)}` },
              { key: 'description',  label: 'Description', render: r => (
                <span className="text-tx-muted truncate max-w-[200px] block">{r.description}</span>
              )},
              { key: 'status', label: 'Status', render: r => (
                <span className={r.status === 'COMPLETED' ? 'badge-green' : 'badge-yellow'}>{r.status}</span>
              )},
            ]}
            data={txns}
            loading={loading}
            emptyMessage="No transactions"
          />
          <Pagination page={page} total={txns.length < 20 ? page * 20 + txns.length : (page + 2) * 20} size={20} onChange={fetchTxns} />
        </div>
      </div>

      <DepositModal open={depositOpen} onClose={() => setDepositOpen(false)} onSuccess={() => walletApi.balance().then(setBalance)} />
      <WithdrawModal open={withdrawOpen} onClose={() => setWithdrawOpen(false)} onSuccess={() => walletApi.balance().then(setBalance)} />
    </div>
  )
}

function DepositModal({ open, onClose, onSuccess }: { open: boolean; onClose: () => void; onSuccess: () => void }) {
  const [amount, setAmount] = useState('')
  const [ref, setRef]       = useState('')
  const [loading, setLoading] = useState(false)

  async function submit() {
    if (!amount || parseFloat(amount) <= 0) { toast.error('Enter valid amount'); return }
    setLoading(true)
    try {
      await walletApi.deposit(parseFloat(amount), ref)
      toast.success('Deposit request submitted')
      onSuccess()
      onClose()
      setAmount(''); setRef('')
    } catch (e: any) {
      toast.error(e?.response?.data?.error || 'Failed')
    } finally { setLoading(false) }
  }

  return (
    <Modal open={open} onClose={onClose} title="Deposit Funds" size="sm">
      <div className="space-y-3">
        <div>
          <label className="block text-xs text-tx-secondary mb-1">Amount (₹)</label>
          <input value={amount} onChange={e => setAmount(e.target.value)} type="number" placeholder="1000" className="input" />
        </div>
        <div>
          <label className="block text-xs text-tx-secondary mb-1">Payment Reference</label>
          <input value={ref} onChange={e => setRef(e.target.value)} placeholder="UTR / Transaction ID" className="input" />
        </div>
        <button onClick={submit} disabled={loading} className="btn-primary w-full">
          {loading ? 'Submitting...' : 'Submit Deposit'}
        </button>
      </div>
    </Modal>
  )
}

function WithdrawModal({ open, onClose, onSuccess }: { open: boolean; onClose: () => void; onSuccess: () => void }) {
  const [amount, setAmount] = useState('')
  const [loading, setLoading] = useState(false)

  async function submit() {
    if (!amount || parseFloat(amount) <= 0) { toast.error('Enter valid amount'); return }
    setLoading(true)
    try {
      await walletApi.withdraw(parseFloat(amount))
      toast.success('Withdrawal request submitted')
      onSuccess()
      onClose()
      setAmount('')
    } catch (e: any) {
      toast.error(e?.response?.data?.error || 'Failed')
    } finally { setLoading(false) }
  }

  return (
    <Modal open={open} onClose={onClose} title="Withdraw Funds" size="sm">
      <div className="space-y-3">
        <div>
          <label className="block text-xs text-tx-secondary mb-1">Amount (₹)</label>
          <input value={amount} onChange={e => setAmount(e.target.value)} type="number" placeholder="500" className="input" />
        </div>
        <button onClick={submit} disabled={loading} className="btn-primary w-full">
          {loading ? 'Submitting...' : 'Request Withdrawal'}
        </button>
      </div>
    </Modal>
  )
}
