'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { adminApi, walletApi } from '@/lib/api'
import { UserAccount, Balance } from '@/types'
import { formatCurrency, formatDate } from '@/lib/utils'
import PageHeader from '@/components/ui/PageHeader'
import { cn } from '@/lib/utils'
import toast from 'react-hot-toast'
import Link from 'next/link'
import { ArrowLeft, Edit2, Ban, Unlock } from 'lucide-react'
import Modal from '@/components/ui/Modal'

export default function AccountDetailPage() {
  const { id } = useParams<{ id: string }>()

  const [user, setUser]           = useState<UserAccount | null>(null)
  const [walletBal, setWalletBal] = useState<Balance | null>(null)
  const [loading, setLoading]     = useState(true)
  const [statusModal, setStatusModal] = useState(false)
  const [lockTxnCode, setLockTxnCode] = useState('')
  const [creditModal, setCreditModal] = useState<'deposit' | 'withdraw' | null>(null)

  useEffect(() => { load() }, [id])

  async function load() {
    setLoading(true)
    try {
      const [account, bal] = await Promise.all([
        adminApi.getUser(id),
        walletApi.adminBalance(id).catch(() => null),
      ])
      setUser(account)
      setWalletBal(bal)
    } catch { toast.error('Failed to load account') }
    finally { setLoading(false) }
  }

  async function toggleStatus() {
    if (!user) return
    if (!/^\d{6}$/.test(lockTxnCode)) { toast.error('Transaction code must be exactly 6 digits'); return }
    const locking = user.status === 'ACTIVE'
    try {
      await adminApi.setLocks(
        user.id,
        locking,                          // userLock
        locking || (user.betLock ?? false), // keep betLock when unlocking
        lockTxnCode
      )
      toast.success(`Account ${locking ? 'locked' : 'unlocked'}`)
      setStatusModal(false)
      setLockTxnCode('')
      load()
    } catch (e: any) {
      const msg: string = e?.response?.data?.error || 'Failed'
      if (msg.includes('logged out for security')) {
        toast.error(msg)
        setTimeout(() => { window.location.href = '/admin/login' }, 1500)
        return
      }
      toast.error(msg)
    }
  }

  if (loading) return <div className="p-6 text-xs text-tx-muted">Loading...</div>
  if (!user)   return <div className="p-6 text-xs text-loss">Account not found</div>

  const statusColor = user.status === 'ACTIVE' ? 'badge-green'
    : user.status === 'SUSPENDED' ? 'badge-yellow' : 'badge-red'

  return (
    <div>
      <PageHeader title={user.username} subtitle={`${user.role} · ${user.tenantId ?? ''}`}>
        <div className="flex items-center gap-2">
          <Link href="/admin/accounts" className="btn-outline btn-sm flex items-center gap-1">
            <ArrowLeft size={12} /> Back
          </Link>
          <Link href={`/admin/accounts/${id}/edit`} className="btn-outline btn-sm flex items-center gap-1">
            <Edit2 size={12} /> Edit
          </Link>
          <button
            onClick={() => setCreditModal('deposit')}
            className="btn-primary btn-sm"
          >
            Deposit
          </button>
          <button
            onClick={() => setCreditModal('withdraw')}
            className="btn-sm btn-danger"
          >
            Withdraw
          </button>
          <button
            onClick={() => setStatusModal(true)}
            className={cn('btn-sm', user.status === 'ACTIVE' ? 'btn-danger' : 'btn-primary')}
          >
            {user.status === 'ACTIVE' ? <><Ban size={12} className="inline mr-1" />Lock</> : <><Unlock size={12} className="inline mr-1" />Unlock</>}
          </button>
        </div>
      </PageHeader>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

        {/* Profile */}
        <div className="card">
          <div className="card-header">Profile</div>
          <div className="p-4 space-y-3">
            <Row label="Username"   value={user.username} />
            <Row label="Role"       value={<span className="badge badge-blue text-[10px]">{user.role}</span>} />
            <Row label="Status"     value={<span className={cn('badge', statusColor)}>{user.status}</span>} />
            {user.fullName    && <Row label="Full Name" value={user.fullName} />}
            {user.mobile      && <Row label="Mobile"    value={user.mobile} />}
            {user.email       && <Row label="Email"     value={user.email} />}
            <Row label="Joined"     value={formatDate(user.createdAt)} />
            {user.lastLoginAt && <Row label="Last Login" value={formatDate(user.lastLoginAt)} />}
          </div>
        </div>

        {/* Financials — authoritative figures from wallet-service */}
        <div className="card">
          <div className="card-header">Financials</div>
          <div className="p-4 space-y-3">
            <Row label="Balance"        value={<span className="font-semibold text-tx-primary">₹{formatCurrency(walletBal?.main ?? 0)}</span>} />
            <Row label="Casino Balance" value={`₹${formatCurrency(walletBal?.casino ?? 0)}`} />
            <Row label="Exposure"       value={
              <span className="text-loss">
                {(walletBal?.exposure ?? 0) > 0 ? `(₹${formatCurrency(walletBal!.exposure)})` : '—'}
              </span>
            } />
            <Row label="Available"      value={`₹${formatCurrency(walletBal?.available ?? 0)}`} />
            <Row label="Credit Limit"   value={`₹${formatCurrency(user.creditLimit)}`} />
          </div>
        </div>

        {/* Commission */}
        <div className="card">
          <div className="card-header">Commission &amp; Partnership</div>
          <div className="p-4 space-y-3">
            <Row label="Sports Commission" value={`${user.commission?.sportsCommissionPct ?? user.commissionRate ?? 0}%`} />
            <Row label="Casino Commission" value={`${user.commission?.casinoCommissionPct ?? 0}%`} />
            <Row label="Partnership"       value={`${user.commission?.partnershipPct ?? 0}%`} />
          </div>
        </div>

        {/* Bet Limits */}
        <div className="card">
          <div className="card-header">Bet Limits</div>
          <div className="p-4 space-y-3">
            <Row label="Min Bet"            value={`₹${formatCurrency(user.minBet)}`} />
            <Row label="Max Bet"            value={`₹${formatCurrency(user.maxBet)}`} />
            <Row label="Max Market Exposure" value={`₹${formatCurrency(user.maxMarketExposure)}`} />
            <Row label="Bet Delay"          value={`${user.betDelay}s`} />
          </div>
        </div>

      </div>

      {/* Lock / Unlock confirm */}
      {statusModal && (
        <Modal
          open
          title={`${user.status === 'ACTIVE' ? 'Lock' : 'Unlock'} Account`}
          onClose={() => setStatusModal(false)}
          size="sm"
        >
          <p className="text-sm text-tx-primary mb-4">
            Are you sure you want to {user.status === 'ACTIVE' ? 'lock' : 'unlock'}{' '}
            <strong>{user.username}</strong>?
            {user.status === 'ACTIVE' && (
              <span className="block text-xs text-loss mt-1">
                This will immediately terminate their active session.
              </span>
            )}
          </p>
          <div className="mb-4">
            <label className="block text-xs text-tx-secondary mb-1">
              Your Transaction Code <span className="text-loss">*</span>
            </label>
            <input
              type="password"
              value={lockTxnCode}
              onChange={e => setLockTxnCode(e.target.value)}
              placeholder="6-digit transaction code"
              maxLength={6}
              className="input w-full"
              style={{ background: lockTxnCode ? undefined : '#ffffcc', color: '#212529' }}
            />
          </div>
          <div className="flex gap-2">
            <button
              onClick={toggleStatus}
              className={user.status === 'ACTIVE' ? 'btn-danger flex-1' : 'btn-primary flex-1'}
            >
              Confirm
            </button>
            <button onClick={() => { setStatusModal(false); setLockTxnCode('') }} className="btn-outline flex-1">Cancel</button>
          </div>
        </Modal>
      )}

      {/* Deposit / Withdraw */}
      {creditModal && (
        <CreditModal
          user={user}
          walletBal={walletBal}
          type={creditModal}
          onClose={() => setCreditModal(null)}
          onDone={() => { setCreditModal(null); load() }}
        />
      )}
    </div>
  )
}

// ── Sub-components ────────────────────────────────────────────────────────────

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex justify-between items-center text-xs">
      <span className="text-tx-muted">{label}</span>
      <span className="text-tx-primary text-right">{value}</span>
    </div>
  )
}

function CreditModal({
  user, walletBal, type, onClose, onDone,
}: {
  user: UserAccount
  walletBal: Balance | null
  type: 'deposit' | 'withdraw'
  onClose: () => void
  onDone:  () => void
}) {
  const [amount, setAmount] = useState('')
  const [remark, setRemark] = useState('')
  const [saving, setSaving] = useState(false)

  async function submit() {
    const amt = parseFloat(amount)
    if (!amt || amt <= 0) { toast.error('Enter a valid amount'); return }
    setSaving(true)
    try {
      if (type === 'deposit') {
        await adminApi.creditDeposit(user.id, amt, remark)
        toast.success(`₹${formatCurrency(amt)} deposited to ${user.username}`)
      } else {
        await adminApi.creditWithdraw(user.id, amt, remark)
        toast.success(`₹${formatCurrency(amt)} withdrawn from ${user.username}`)
      }
      onDone()
    } catch (e: any) {
      toast.error(e?.response?.data?.error || 'Transaction failed')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Modal
      open
      title={type === 'deposit' ? `Deposit — ${user.username}` : `Withdraw — ${user.username}`}
      onClose={onClose}
      size="sm"
    >
      <div className="space-y-3">
        <div className="flex justify-between text-xs text-tx-muted mb-1">
          <span>Current Balance</span>
          <span className="font-semibold text-tx-primary">₹{formatCurrency(walletBal?.main ?? 0)}</span>
        </div>
        <div>
          <label className="block text-xs text-tx-secondary mb-1">Amount (₹) *</label>
          <input
            type="number"
            min="1"
            value={amount}
            onChange={e => setAmount(e.target.value)}
            className="input w-full"
            placeholder="Enter amount"
          />
        </div>
        <div>
          <label className="block text-xs text-tx-secondary mb-1">Remark</label>
          <input
            value={remark}
            onChange={e => setRemark(e.target.value)}
            className="input w-full"
            placeholder="Optional note"
          />
        </div>
        <div className="flex gap-2 pt-1">
          <button
            onClick={submit}
            disabled={saving}
            className={type === 'deposit' ? 'btn-primary flex-1' : 'btn-danger flex-1'}
          >
            {saving ? 'Processing...' : type === 'deposit' ? 'Deposit' : 'Withdraw'}
          </button>
          <button onClick={onClose} className="btn-outline flex-1">Cancel</button>
        </div>
      </div>
    </Modal>
  )
}
