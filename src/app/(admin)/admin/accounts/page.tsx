'use client'

import { useEffect, useState } from 'react'
import { adminApi } from '@/lib/api'
import { UserAccount } from '@/types'
import Link from 'next/link'
import toast from 'react-hot-toast'

const PAGE_SIZE = 25

const ROLE_LABEL: Record<string, string> = {
  SUPERADMIN: 'Super Admin', ADMIN: 'Admin', SUBADMIN: 'Super Master',
  MASTER: 'Master', MANAGER: 'Agent', PLAYER: 'User',
}

function fmtNum(n: number | undefined | null) { return Number(n || 0).toLocaleString() }
function fmt2(v: number) { return v.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) }

export default function AccountsPage() {
  const [users, setUsers]            = useState<UserAccount[]>([])
  const [loading, setLoading]        = useState(true)
  const [search, setSearch]          = useState('')
  const [page, setPage]              = useState(0)
  const [depositModal, setDeposit]   = useState<UserAccount | null>(null)
  const [withdrawModal, setWithdraw] = useState<UserAccount | null>(null)
  const [moreUser, setMore]          = useState<UserAccount | null>(null)

  useEffect(() => { load() }, [])

  async function load() {
    setLoading(true)
    try { setUsers(await adminApi.users()) }
    catch { toast.error('Failed to load accounts') }
    finally { setLoading(false) }
  }

  const filtered   = users.filter(u => !search || u.username.toLowerCase().includes(search.toLowerCase()))
  const paginated  = filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE)
  const totalPages = Math.ceil(filtered.length / PAGE_SIZE)

  return (
    <div>
      {/* Page header */}
      <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
        <h4 className="text-base font-bold uppercase text-tx-primary">Account List</h4>
        <nav className="text-xs text-tx-muted">
          <Link href="/admin" className="text-tx-secondary hover:text-primary">Home</Link>
          {' / '}Account List
        </nav>
      </div>

      <div className="card">
        <div className="p-4">

          {/* Toolbar */}
          <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
            <form onSubmit={e => { e.preventDefault(); setPage(0) }} className="flex flex-wrap items-center gap-2">
              <input
                type="text" placeholder="Search User" value={search}
                onChange={e => setSearch(e.target.value)}
                className="input w-44"
              />
              <button type="submit" className="btn-primary btn-sm">Load</button>
              <button type="button" className="btn-outline btn-sm" onClick={() => { setSearch(''); setPage(0) }}>Reset</button>
            </form>
            <div className="flex flex-wrap items-center gap-2">
              <button type="button" className="btn-outline btn-sm" onClick={() => toast('Export Excel — coming soon')}>Excel</button>
              <button type="button" className="btn-outline btn-sm" onClick={() => toast('Export PDF — coming soon')}>PDF</button>
              <Link href="/admin/accounts/create" className="btn-primary btn-sm">+ Create Account</Link>
            </div>
          </div>

          {/* Table */}
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  {['User Name', 'CR', 'Bet St', 'User St', 'P-Name', 'Account Type', 'Action'].map(h => (
                    <th key={h}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loading && (
                  <tr><td colSpan={7} className="text-center py-6 text-tx-muted">Loading...</td></tr>
                )}
                {!loading && paginated.length === 0 && (
                  <tr><td colSpan={7} className="text-center py-6 text-tx-muted">No accounts found</td></tr>
                )}
                {paginated.map(acc => (
                  <tr key={acc.id}>
                    <td>
                      {acc.role !== 'PLAYER'
                        ? <Link href={`/admin/accounts?parentId=${acc.id}`} className="text-lay-dark underline">{acc.username}</Link>
                        : <span className="text-tx-primary">{acc.username}</span>}
                    </td>
                    <td className="text-void font-medium">{fmtNum(acc.creditLimit)}</td>
                    <td><Toggle value={false} disabled /></td>
                    <td><Toggle value={acc.status !== 'ACTIVE'} disabled /></td>
                    <td className="text-tx-secondary">{acc.role === 'PLAYER' ? '100 PNR' : `${acc.commission?.partnershipPct ?? 0} PNR`}</td>
                    <td className="text-tx-secondary">{ROLE_LABEL[acc.role] ?? acc.role}</td>
                    <td>
                      <div className="inline-flex rounded overflow-hidden">
                        <button onClick={() => setDeposit(acc)}  className="bg-primary   text-white text-xs px-2.5 py-1 hover:brightness-110 transition-all">D</button>
                        <button onClick={() => setWithdraw(acc)} className="bg-loss      text-white text-xs px-2.5 py-1 hover:brightness-110 transition-all">W</button>
                        <button onClick={() => setMore(acc)}     className="bg-lay-dark  text-white text-xs px-2.5 py-1 hover:brightness-110 transition-all">More</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex flex-wrap gap-1 justify-end mt-3">
              {[
                { label: '«', go: () => setPage(0),            dis: page === 0 },
                { label: '‹', go: () => setPage(p => p - 1),  dis: page === 0 },
              ].map(b => (
                <button key={b.label} onClick={b.go} disabled={b.dis} className="btn-outline btn-sm disabled:opacity-40">{b.label}</button>
              ))}
              {Array.from({ length: totalPages }, (_, i) => (
                <button key={i} onClick={() => setPage(i)}
                  className={`btn-sm rounded border ${i === page ? 'bg-primary text-white border-primary' : 'btn-outline'}`}>
                  {i + 1}
                </button>
              ))}
              {[
                { label: '›', go: () => setPage(p => p + 1),      dis: page === totalPages - 1 },
                { label: '»', go: () => setPage(totalPages - 1),   dis: page === totalPages - 1 },
              ].map(b => (
                <button key={b.label} onClick={b.go} disabled={b.dis} className="btn-outline btn-sm disabled:opacity-40">{b.label}</button>
              ))}
            </div>
          )}

        </div>
      </div>

      {moreUser      && <UserMoreModal user={moreUser}      onClose={() => setMore(null)}     onRefresh={load} />}
      {depositModal  && <TransferModal user={depositModal}  type="deposit"  onClose={() => setDeposit(null)}  onDone={() => { setDeposit(null);  load() }} />}
      {withdrawModal && <TransferModal user={withdrawModal} type="withdraw" onClose={() => setWithdraw(null)} onDone={() => { setWithdraw(null); load() }} />}
    </div>
  )
}

// ─── More Modal ───────────────────────────────────────────────────────────────
type Tab = 'profile' | 'password' | 'lock' | 'history' | 'edit'

function UserMoreModal({ user, onClose, onRefresh }: { user: UserAccount; onClose: () => void; onRefresh: () => void }) {
  const [tab, setTab] = useState<Tab>('profile')
  const [balance, setBalance] = useState<any>(null)

  useEffect(() => { adminApi.getAdminBalance(user.id).then(setBalance).catch(() => {}) }, [user.id])

  const tabs: { key: Tab; label: string }[] = [
    { key: 'profile',  label: 'Profile' },
    { key: 'password', label: 'Change Password' },
    { key: 'lock',     label: 'User Lock' },
    { key: 'history',  label: 'Account History' },
    { key: 'edit',     label: 'Edit Profile' },
  ]

  return (
    <div className="fixed inset-0 bg-black/60 flex items-start justify-center z-[9999] p-4 sm:p-8 overflow-y-auto">
      <div className="bg-bg-card w-full max-w-3xl rounded-lg shadow-2xl overflow-hidden my-auto">

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3 bg-bg-body border-b border-[#3a444c]">
          <span className="text-white font-bold text-sm uppercase tracking-wide">{user.username}</span>
          <button onClick={onClose} className="text-tx-muted hover:text-white text-2xl leading-none bg-transparent border-none cursor-pointer">&times;</button>
        </div>

        {/* Tabs */}
        <div className="flex flex-wrap border-b border-[#3a444c] bg-bg-surface px-2">
          {tabs.map(t => (
            <button key={t.key} onClick={() => setTab(t.key)}
              className={`px-4 py-2.5 text-xs font-medium whitespace-nowrap border-b-2 transition-colors bg-transparent border-none cursor-pointer -mb-px
                ${tab === t.key ? 'border-primary text-primary' : 'border-transparent text-tx-secondary hover:text-tx-primary'}`}>
              {t.label}
            </button>
          ))}
        </div>

        {/* Tab body */}
        <div className="p-5 bg-bg-surface min-h-[280px]">
          {tab === 'profile'  && <ProfileTab  user={user} balance={balance} />}
          {tab === 'password' && <ChangePasswordTab user={user} onDone={onClose} />}
          {tab === 'lock'     && <LockTab user={user} onDone={() => { onClose(); onRefresh() }} />}
          {tab === 'history'  && <HistoryTab user={user} />}
          {tab === 'edit'     && <EditProfileTab user={user} onDone={() => { onClose(); onRefresh() }} />}
        </div>

      </div>
    </div>
  )
}

// ─── Profile Tab ──────────────────────────────────────────────────────────────
function ProfileTab({ user, balance }: { user: UserAccount; balance: any }) {
  const initials = (user.username || '?')[0].toUpperCase()

  return (
    <div className="flex flex-col sm:flex-row gap-4">

      {/* Left: avatar + partnership */}
      <div className="card p-4 sm:w-64 flex-shrink-0">
        <div className="text-center pb-4 mb-4 border-b border-[#3a444c]">
          <div className="w-14 h-14 rounded-full bg-bg-hover inline-flex items-center justify-center text-2xl font-bold text-tx-primary mb-2">
            {initials}
          </div>
          <div className="font-bold text-sm text-tx-primary">{user.username}</div>
          <div className="text-xs text-tx-muted mt-0.5">{ROLE_LABEL[user.role] ?? user.role}</div>
        </div>

        <div className="flex justify-center gap-6 mb-4">
          <div className="text-center">
            <div className="text-lg">📞</div>
            <div className="text-[11px] text-tx-muted mt-0.5">{user.mobile || '—'}</div>
          </div>
          <div className="text-center">
            <div className="text-lg">📅</div>
            <div className="text-[11px] text-tx-muted mt-0.5">{user.createdAt ? new Date(user.createdAt).toLocaleDateString() : '—'}</div>
          </div>
        </div>

        <div className="border-t border-[#3a444c] pt-3">
          <div className="text-xs font-semibold text-tx-secondary mb-2 uppercase tracking-wide">Partnership</div>
          <table className="w-full text-xs">
            <tbody>
              <TR l="Partnership %"     v={`${user.commission?.partnershipPct ?? 0}%`} />
              <TR l="Sports Comm."      v={`${user.commission?.sportsCommissionPct ?? 0}%`} />
              <TR l="Casino Comm."      v={`${user.commission?.casinoCommissionPct ?? 0}%`} />
            </tbody>
          </table>
        </div>
      </div>

      {/* Right: additional info */}
      <div className="card p-4 flex-1">
        <div className="text-xs font-semibold text-tx-secondary mb-3 uppercase tracking-wide">Additional Information</div>
        <table className="w-full text-xs">
          <tbody>
            <TR l="User Name"       v={user.username} />
            <TR l="Full Name"       v={user.fullName   || '—'} />
            <TR l="Mobile"          v={user.mobile     || '—'} />
            <TR l="City"            v={user.city       || '—'} />
            <TR l="Credit pts"      v={fmtNum(user.creditLimit)} />
            <TR l="pts"             v={fmtNum(balance?.main)} />
            <TR l="Available pts"   v={fmtNum(balance?.available)} />
            <TR l="Exposure"        v={fmtNum(balance?.exposure)} />
            <TR l="Casino pts"      v={fmtNum(balance?.casino)} />
            <TR l="Created"         v={user.createdAt ? new Date(user.createdAt).toLocaleString() : '—'} />
          </tbody>
        </table>
      </div>

    </div>
  )
}

function TR({ l, v }: { l: string; v: string | number }) {
  return (
    <tr className="border-b border-[#2a3340]">
      <td className="py-1.5 pr-3 font-semibold text-tx-secondary w-[44%]">{l}:</td>
      <td className="py-1.5 text-tx-primary">{v}</td>
    </tr>
  )
}

// ─── Change Password Tab ──────────────────────────────────────────────────────
function ChangePasswordTab({ user, onDone }: { user: UserAccount; onDone: () => void }) {
  const [password, setPassword] = useState('')
  const [confirm, setConfirm]   = useState('')
  const [txnCode, setTxnCode]   = useState('')
  const [saving, setSaving]     = useState(false)

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    if (password !== confirm)         { toast.error('Passwords do not match'); return }
    if (password.length < 6)          { toast.error('Minimum 6 characters'); return }
    if (!/^\d{6}$/.test(txnCode))     { toast.error('Transaction code must be 6 digits'); return }
    setSaving(true)
    try {
      await adminApi.resetClientPassword(user.id, password, txnCode)
      toast.success('Password reset. User must re-login.')
      onDone()
    } catch (e: any) {
      toast.error(e?.response?.data?.message || 'Failed to reset password')
    } finally { setSaving(false) }
  }

  return (
    <div className="card p-4 max-w-lg">
      <form onSubmit={submit} className="space-y-3">
        <TabRow label="New Password">
          <input type="password" value={password} onChange={e => setPassword(e.target.value)}
            className="input" required autoFocus />
        </TabRow>
        <TabRow label="Confirm Password">
          <input type="password" value={confirm} onChange={e => setConfirm(e.target.value)}
            className="input" placeholder="Confirm Password" required />
        </TabRow>
        <TabRow label="Transaction Code">
          <input type="password" value={txnCode} onChange={e => setTxnCode(e.target.value)}
            className="input" placeholder="6-digit transaction code" maxLength={6} required />
        </TabRow>
        <div className="text-xs text-tx-muted bg-bg-hover rounded px-3 py-2 border border-[#3a444c]">
          Enter <strong className="text-tx-secondary">your own</strong> transaction code to authorise this reset.
        </div>
        <div className="flex justify-end">
          <SubmitBtn loading={saving} />
        </div>
      </form>
    </div>
  )
}

// ─── User Lock Tab ────────────────────────────────────────────────────────────
function LockTab({ user, onDone }: { user: UserAccount; onDone: () => void }) {
  const [userLock, setUserLock] = useState(user.status === 'SUSPENDED')
  const [betLock,  setBetLock]  = useState(user.betLock ?? false)
  const [txnCode,  setTxnCode]  = useState('')
  const [saving,   setSaving]   = useState(false)

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    if (!/^\d{6}$/.test(txnCode)) { toast.error('Transaction code must be 6 digits'); return }
    setSaving(true)
    try {
      await adminApi.setLocks(user.id, userLock, betLock, txnCode)
      toast.success('Lock settings updated')
      onDone()
    } catch (e: any) {
      const msg: string = e?.response?.data?.error || 'Failed to update'
      if (msg.includes('logged out for security')) {
        toast.error(msg)
        setTimeout(() => { window.location.href = '/admin/login' }, 1500)
        return
      }
      toast.error(msg)
    } finally { setSaving(false) }
  }

  return (
    <div className="card p-4 max-w-lg">
      <form onSubmit={submit} className="space-y-3">
        <TabRow label="Bet Lock"><Toggle value={betLock} onChange={setBetLock} /></TabRow>
        <TabRow label="User Lock">
          <Toggle value={userLock} onChange={val => { setUserLock(val); if (val) setBetLock(true) }} />
        </TabRow>
        <TabRow label="Transaction Code">
          <input type="password" value={txnCode} onChange={e => setTxnCode(e.target.value)}
            className="input" placeholder="6-digit transaction code" maxLength={6} required />
        </TabRow>
        <div className="text-xs text-tx-muted bg-bg-hover rounded px-3 py-2 border border-[#3a444c]">
          Enter <strong className="text-tx-secondary">your own</strong> transaction code to authorise.
          {userLock && <span className="block mt-1 text-loss">⚠ User lock immediately terminates the user&apos;s session.</span>}
        </div>
        <div className="flex justify-end">
          <SubmitBtn loading={saving} />
        </div>
      </form>
    </div>
  )
}

// ─── Account History Tab ──────────────────────────────────────────────────────
function HistoryTab({ user }: { user: UserAccount }) {
  const [history, setHistory] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    adminApi.reportStatement({ userId: user.id, page: 0, size: 50 })
      .then((data: any) => setHistory(Array.isArray(data) ? data : []))
      .catch(() => setHistory([]))
      .finally(() => setLoading(false))
  }, [user.id])

  return (
    <div className="table-wrap">
      <table className="data-table">
        <thead>
          <tr>
            {['Super User', 'User', 'Transfer From', 'Amount', 'Date'].map(h => <th key={h}>{h}</th>)}
          </tr>
        </thead>
        <tbody>
          {loading && <tr><td colSpan={5} className="text-center py-6 text-tx-muted">Loading...</td></tr>}
          {!loading && history.length === 0 && <tr><td colSpan={5} className="text-center py-6 text-tx-muted">No history available</td></tr>}
          {history.map((h: any, i: number) => (
            <tr key={i}>
              <td>{h.superUser || h.parentUsername || '—'}</td>
              <td>{h.username || user.username}</td>
              <td>{h.transferFrom || h.description || '—'}</td>
              <td>{fmtNum(h.amount)}</td>
              <td className="whitespace-nowrap">{h.createdAt ? new Date(h.createdAt).toLocaleString() : '—'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

// ─── Edit Profile Tab ─────────────────────────────────────────────────────────
function EditProfileTab({ user, onDone }: { user: UserAccount; onDone: () => void }) {
  const [fullName,      setFullName]      = useState(user.fullName || '')
  const [changePwdLock, setChangePwdLock] = useState(user.changePwdLock ?? false)
  const [txnCode,       setTxnCode]       = useState('')
  const [saving,        setSaving]        = useState(false)

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    if (!/^\d{6}$/.test(txnCode)) { toast.error('Transaction code must be 6 digits'); return }
    setSaving(true)
    try {
      await adminApi.updateUser(user.id, { fullName, changePwdLock }, txnCode)
      toast.success('Profile updated')
      onDone()
    } catch (e: any) {
      const msg: string = e?.response?.data?.error || e?.response?.data?.message || 'Failed to update'
      if (msg.includes('logged out for security')) {
        toast.error(msg)
        setTimeout(() => { window.location.href = '/admin/login' }, 1500)
        return
      }
      toast.error(msg)
    } finally { setSaving(false) }
  }

  return (
    <div className="card p-4 max-w-lg">
      <form onSubmit={submit} className="space-y-3">
        <TabRow label="Full Name">
          <input type="text" value={fullName} onChange={e => setFullName(e.target.value)}
            className="input" placeholder="Full Name" />
        </TabRow>
        <TabRow label="Pwd Change Lock">
          <Toggle value={changePwdLock} onChange={setChangePwdLock} />
        </TabRow>
        <TabRow label="Transaction Code">
          <input type="password" value={txnCode} onChange={e => setTxnCode(e.target.value)}
            className="input" placeholder="6-digit transaction code" maxLength={6} required />
        </TabRow>
        <div className="text-xs text-tx-muted bg-bg-hover rounded px-3 py-2 border border-[#3a444c]">
          Enter <strong className="text-tx-secondary">your own</strong> transaction code to authorise.
        </div>
        <div className="flex justify-end">
          <SubmitBtn loading={saving} />
        </div>
      </form>
    </div>
  )
}

// ─── Transfer Modal ───────────────────────────────────────────────────────────
function TransferModal({ user, type, onClose, onDone }: { user: UserAccount; type: 'deposit' | 'withdraw'; onClose: () => void; onDone: () => void }) {
  const isDeposit = type === 'deposit'
  const [parentBal,       setParentBal]       = useState(0)
  const [remainParentBal, setRemainParentBal] = useState(0)
  const [userBal,         setUserBal]         = useState(0)
  const [remainUserBal,   setRemainUserBal]   = useState(0)
  const [parentName,      setParentName]      = useState('Parent')
  const [amount,          setAmount]          = useState('')
  const [remark,          setRemark]          = useState('')
  const [txnCode,         setTxnCode]         = useState('')
  const [saving,          setSaving]          = useState(false)

  useEffect(() => {
    if (user.parentId) {
      adminApi.getUser(user.parentId).then(p => setParentName(p.username)).catch(() => {})
      adminApi.getAdminBalance(user.parentId).then(b => { setParentBal(b.main); setRemainParentBal(b.main) }).catch(() => {})
    }
    adminApi.getAdminBalance(user.id).then(b => { setUserBal(b.main); setRemainUserBal(b.main) }).catch(() => {})
  }, [user.id, user.parentId])

  function handleAmount(val: string) {
    setAmount(val)
    const n = parseFloat(val) || 0
    if (isDeposit) { setRemainParentBal(parentBal - n); setRemainUserBal(userBal + n) }
    else           { setRemainParentBal(parentBal + n); setRemainUserBal(userBal - n) }
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    const amt = parseFloat(amount)
    if (!amt || amt <= 0)              { toast.error('Enter a valid amount'); return }
    if (!/^\d{6}$/.test(txnCode))     { toast.error('Enter your 6-digit transaction code'); return }
    setSaving(true)
    try {
      if (isDeposit) await adminApi.creditDeposit(user.id, amt, txnCode, remark)
      else           await adminApi.creditWithdraw(user.id, amt, txnCode, remark)
      toast.success(`${isDeposit ? 'Deposit' : 'Withdraw'} successful!`)
      onDone()
    } catch (e: any) {
      toast.error(e?.response?.data?.message || e?.response?.data?.error || 'Transaction failed')
    } finally { setSaving(false) }
  }

  const accentCls = isDeposit ? 'bg-primary' : 'bg-loss'

  return (
    <div className="fixed inset-0 bg-black/60 flex items-start justify-center z-[9999] p-4 pt-16 overflow-y-auto">
      <div className="bg-bg-card w-full max-w-lg rounded-lg shadow-2xl overflow-hidden">

        {/* Header */}
        <div className={`${accentCls} flex items-center justify-between px-4 py-2.5`}>
          <h5 className="m-0 text-white font-bold uppercase text-base">{isDeposit ? 'Deposit' : 'Withdraw'}</h5>
          <button onClick={onClose} className="bg-transparent border-none text-white text-2xl cursor-pointer leading-none">&times;</button>
        </div>

        {/* Tab label */}
        <div className="border-b border-[#3a444c] px-4">
          <span className={`inline-block py-2.5 text-sm font-semibold border-b-2 -mb-px text-tx-primary ${isDeposit ? 'border-primary' : 'border-loss'}`}>
            {isDeposit ? 'Deposit' : 'Withdraw'}
          </span>
        </div>

        {/* Form */}
        <div className="p-4">
          <form onSubmit={submit} className="space-y-3">
            {[[parentName, parentBal, remainParentBal], [user.username, userBal, remainUserBal]].map(([lbl, cur, rem]) => (
              <div key={String(lbl)} className="flex flex-wrap items-center gap-2">
                <label className="text-sm font-medium text-tx-secondary w-28 flex-shrink-0">{lbl}</label>
                <div className="flex flex-1 gap-2 min-w-0">
                  <input readOnly value={fmt2(Number(cur))} className="input text-right opacity-60 flex-1 min-w-0" />
                  <input readOnly value={fmt2(Number(rem))} className="input text-right opacity-60 flex-1 min-w-0" />
                </div>
              </div>
            ))}

            <div className="flex flex-wrap items-center gap-2">
              <label className="text-sm font-medium text-tx-secondary w-28 flex-shrink-0">Profit/Loss</label>
              <div className="flex flex-1 gap-2 min-w-0">
                <input readOnly value="0.00" className="input text-right opacity-60 flex-1 min-w-0" />
                <input readOnly value="0.00" className="input text-right opacity-60 flex-1 min-w-0" />
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <label className="text-sm font-medium text-tx-secondary w-28 flex-shrink-0">Amount</label>
              <input type="number" placeholder="Amount" value={amount} onChange={e => handleAmount(e.target.value)}
                className="input text-right flex-1 min-w-0" />
            </div>

            <div className="flex flex-wrap items-start gap-2">
              <label className="text-sm font-medium text-tx-secondary w-28 flex-shrink-0 pt-1.5">Remark</label>
              <textarea placeholder="Remark" value={remark} onChange={e => setRemark(e.target.value)}
                className="input resize-y flex-1 min-w-0" rows={2} />
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <label className="text-sm font-medium text-tx-secondary w-28 flex-shrink-0">Txn Code</label>
              <input type="password" placeholder="6-digit code" value={txnCode} onChange={e => setTxnCode(e.target.value)}
                className="input flex-1 min-w-0" maxLength={6} />
            </div>

            <div className="flex justify-end pt-1">
              <button type="submit" disabled={saving}
                className={`${accentCls} text-white text-sm font-semibold px-5 py-1.5 rounded transition-all hover:brightness-110 disabled:opacity-60`}>
                {saving ? 'Processing...' : 'Submit →'}
              </button>
            </div>
          </form>
        </div>

      </div>
    </div>
  )
}

// ─── Shared UI primitives ─────────────────────────────────────────────────────

function TabRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <div className="text-sm text-tx-secondary w-40 flex-shrink-0">{label}</div>
      <div className="flex-1 min-w-[180px]">{children}</div>
    </div>
  )
}

function SubmitBtn({ loading }: { loading: boolean }) {
  return (
    <button type="submit" disabled={loading}
      className="bg-bg-body text-white text-sm font-semibold px-5 py-1.5 rounded flex items-center gap-1.5 hover:brightness-110 disabled:opacity-60 border border-[#3a444c] transition-all">
      {loading ? 'Saving...' : <><span>Submit</span><span className="text-base">➔</span></>}
    </button>
  )
}

function Toggle({ value, onChange, disabled }: { value: boolean; onChange?: (v: boolean) => void; disabled?: boolean }) {
  return (
    <label className="relative inline-flex cursor-pointer">
      <input type="checkbox" checked={value} onChange={e => !disabled && onChange?.(e.target.checked)}
        disabled={disabled} className="sr-only peer" />
      <div className="w-9 h-5 rounded-full peer transition-colors
        bg-bg-hover peer-checked:bg-primary peer-disabled:opacity-60
        after:content-[''] after:absolute after:top-0.5 after:left-0.5
        after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all
        peer-checked:after:translate-x-4" />
    </label>
  )
}
