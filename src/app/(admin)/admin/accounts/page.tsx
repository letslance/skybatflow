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
  const [users, setUsers]          = useState<UserAccount[]>([])
  const [loading, setLoading]      = useState(true)
  const [search, setSearch]        = useState('')
  const [page, setPage]            = useState(0)
  const [depositModal, setDeposit] = useState<UserAccount | null>(null)
  const [withdrawModal, setWithdraw] = useState<UserAccount | null>(null)
  const [moreUser, setMore]        = useState<UserAccount | null>(null)

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
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <h4 style={{ margin: 0, fontWeight: 'bold', fontSize: 16, textTransform: 'uppercase' }}>Account List</h4>
        <nav style={{ fontSize: 13, color: '#666' }}>
          <a href="/admin" style={{ color: '#495057' }}>Home</a> / <span>Account List</span>
        </nav>
      </div>

      <div style={{ margin: '0 12px', background: '#fff', border: '1px solid #e8e8e8', borderRadius: 4, boxShadow: '0 .75rem 1.5rem rgba(18,38,63,.03)' }}>
        <div style={{ padding: '1.25rem' }}>

          {/* Toolbar */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 8, marginBottom: 12 }}>
            <form onSubmit={e => { e.preventDefault(); setPage(0) }} style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
              <input type="text" placeholder="Search User" value={search} onChange={e => setSearch(e.target.value)}
                style={{ padding: '6px 10px', fontSize: 13, border: '1px solid #ccc', borderRadius: 4, height: 36, minWidth: 180 }} />
              <Btn bg="#23292e" onClick={() => setPage(0)}>Load</Btn>
              <Btn bg="#f8f9fa" color="#212529" border="1px solid #dee2e6" onClick={() => { setSearch(''); setPage(0) }}>Reset</Btn>
            </form>
            <div style={{ display: 'flex', gap: 8 }}>
              <Btn bg="#34c38f" onClick={() => toast('Export Excel — coming soon')}>Excel</Btn>
              <Btn bg="#f46a6a" onClick={() => toast('Export PDF — coming soon')}>PDF</Btn>
              <Link href="/admin/accounts/create"
                style={{ background: '#34c38f', color: '#fff', textDecoration: 'none', padding: '0 14px', height: 36, borderRadius: 4, display: 'inline-flex', alignItems: 'center', fontSize: 13, fontWeight: 500 }}>
                + CREATE ACCOUNT
              </Link>
            </div>
          </div>

          {/* Table */}
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13, background: '#fff', color: '#212529' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #dee2e6', background: '#fff' }}>
                  {['User Name','CR','B st','U st','PName','Account Type','Action'].map(h => (
                    <th key={h} style={{ padding: '8px 10px', textAlign: 'left', fontWeight: 600, whiteSpace: 'nowrap', color: '#495057' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loading && <tr style={{ background: '#fff' }}><td colSpan={7} style={{ padding: 24, textAlign: 'center', color: '#888', background: '#fff' }}>Loading...</td></tr>}
                {!loading && paginated.length === 0 && <tr style={{ background: '#fff' }}><td colSpan={7} style={{ padding: 24, textAlign: 'center', color: '#888', background: '#fff' }}>No accounts found</td></tr>}
                {paginated.map(acc => (
                  <tr key={acc.id} style={{ borderBottom: '1px solid #f0f0f0', background: '#fff' }}>
                    <td style={{ padding: '7px 10px', color: '#212529' }}>
                      {acc.role !== 'PLAYER'
                        ? <Link href={`/admin/accounts?parentId=${acc.id}`} style={{ color: '#50a5f1', textDecoration: 'underline' }}>{acc.username}</Link>
                        : <span>{acc.username}</span>}
                    </td>
                    <td style={{ padding: '7px 10px', color: '#ff9800' }}>{fmtNum(acc.creditLimit)}</td>
                    <td style={{ padding: '7px 10px' }}><Toggle value={false} disabled /></td>
                    <td style={{ padding: '7px 10px' }}><Toggle value={acc.status !== 'ACTIVE'} disabled /></td>
                    <td style={{ padding: '7px 10px', color: '#495057' }}>{acc.role === 'PLAYER' ? '100 PNR' : `${acc.commission?.partnershipPct ?? 0} PNR`}</td>
                    <td style={{ padding: '7px 10px', color: '#495057' }}>{ROLE_LABEL[acc.role] ?? acc.role}</td>
                    <td style={{ padding: '7px 10px' }}>
                      <div style={{ display: 'inline-flex' }}>
                        <button onClick={() => setDeposit(acc)}  style={actionBtn('#34c38f', '4px 0 0 4px')}>D</button>
                        <button onClick={() => setWithdraw(acc)} style={actionBtn('#f46a6a', '0')}>W</button>
                        <button onClick={() => setMore(acc)}     style={actionBtn('#50a5f1', '0 4px 4px 0')}>More</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div style={{ display: 'flex', gap: 4, justifyContent: 'flex-end', marginTop: 12 }}>
              <button onClick={() => setPage(0)}           disabled={page === 0}              style={pgBtn(page === 0)}>«</button>
              <button onClick={() => setPage(p => p-1)}   disabled={page === 0}              style={pgBtn(page === 0)}>‹</button>
              {Array.from({ length: totalPages }, (_, i) => <button key={i} onClick={() => setPage(i)} style={pgBtn(false, i === page)}>{i+1}</button>)}
              <button onClick={() => setPage(p => p+1)}   disabled={page===totalPages-1}     style={pgBtn(page===totalPages-1)}>›</button>
              <button onClick={() => setPage(totalPages-1)} disabled={page===totalPages-1}   style={pgBtn(page===totalPages-1)}>»</button>
            </div>
          )}
        </div>
      </div>

      {moreUser    && <UserMoreModal user={moreUser}    onClose={() => setMore(null)}     onRefresh={load} />}
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
    { key: 'lock',     label: 'User lock' },
    { key: 'history',  label: 'Account history' },
    { key: 'edit',     label: 'Edit Profile' },
  ]

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)', display: 'flex', justifyContent: 'center', alignItems: 'flex-start', zIndex: 9999, padding: '30px 16px', overflowY: 'auto' }}>
      <div style={{ background: '#fff', width: '100%', maxWidth: 920, borderRadius: 6, boxShadow: '0 8px 32px rgba(0,0,0,0.25)', overflow: 'hidden' }}>

        {/* Header */}
        <div style={{ background: '#2d3338', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 20px' }}>
          <span style={{ color: '#fff', fontWeight: 700, fontSize: 15, letterSpacing: 1, textTransform: 'uppercase' }}>{user.username}</span>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#ccc', fontSize: 22, cursor: 'pointer', lineHeight: 1, padding: 0 }}>&times;</button>
        </div>

        {/* Tabs */}
        <div style={{ background: '#fff', borderBottom: '1px solid #dee2e6', padding: '0 8px' }}>
          <div style={{ display: 'flex', flexWrap: 'wrap' }}>
            {tabs.map(t => (
              <button key={t.key} onClick={() => setTab(t.key)} style={{
                background: 'none', border: 'none', borderBottom: tab === t.key ? '2px solid #495057' : '2px solid transparent',
                padding: '12px 16px', fontSize: 13, fontWeight: tab === t.key ? 600 : 400,
                color: tab === t.key ? '#212529' : '#6c757d', cursor: 'pointer', marginBottom: -1, whiteSpace: 'nowrap',
              }}>
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* Tab body */}
        <div style={{ padding: 24, background: '#f8f9fa', minHeight: 320 }}>
          {tab === 'profile'  && <ProfileTab  user={user} balance={balance} />}
          {tab === 'password' && <ChangePasswordTab user={user} onDone={onClose} />}
          {tab === 'lock'     && <LockTab     user={user} onDone={() => { onClose(); onRefresh() }} />}
          {tab === 'history'  && <HistoryTab  user={user} />}
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
    <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>

      {/* Left */}
      <div style={{ flex: '1 1 260px', background: '#fff', border: '1px solid #dee2e6', borderRadius: 4, padding: 20 }}>
        <div style={{ textAlign: 'center', paddingBottom: 16, borderBottom: '1px solid #f0f0f0', marginBottom: 16 }}>
          <div style={{ width: 60, height: 60, borderRadius: '50%', background: '#c8d4de', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, fontWeight: 700, color: '#495057', marginBottom: 8 }}>
            {initials}
          </div>
          <div style={{ fontWeight: 700, fontSize: 14, letterSpacing: 0.5 }}>{user.username}</div>
          <div style={{ fontSize: 12, color: '#888', marginTop: 2 }}>{ROLE_LABEL[user.role] ?? user.role}</div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'center', gap: 32, marginBottom: 20 }}>
          <div style={{ textAlign: 'center', color: '#555' }}>
            <div style={{ fontSize: 22 }}>📞</div>
            <div style={{ fontSize: 11, color: '#888', marginTop: 2 }}>{user.mobile || '—'}</div>
          </div>
          <div style={{ textAlign: 'center', color: '#555' }}>
            <div style={{ fontSize: 22 }}>📅</div>
            <div style={{ fontSize: 11, color: '#888', marginTop: 2 }}>{user.createdAt ? new Date(user.createdAt).toLocaleDateString() : '—'}</div>
          </div>
        </div>

        <div style={{ borderTop: '1px solid #f0f0f0', paddingTop: 14 }}>
          <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 10 }}>Partnership Information</div>
          <table style={{ width: '100%', fontSize: 12, borderCollapse: 'collapse' }}>
            <tbody>
              <TR l="Partnership %"      v={`${user.commission?.partnershipPct ?? 0}%`} />
              <TR l="Sports Commission"  v={`${user.commission?.sportsCommissionPct ?? 0}%`} />
              <TR l="Casino Commission"  v={`${user.commission?.casinoCommissionPct ?? 0}%`} />
            </tbody>
          </table>
        </div>
      </div>

      {/* Right */}
      <div style={{ flex: '1 1 300px', background: '#fff', border: '1px solid #dee2e6', borderRadius: 4, padding: 20 }}>
        <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 14 }}>Additional Information</div>
        <table style={{ width: '100%', fontSize: 13, borderCollapse: 'collapse' }}>
          <tbody>
            <TR l="User Name"      v={user.username} />
            <TR l="Full Name"      v={user.fullName  || '—'} />
            <TR l="Mobile Number"  v={user.mobile    || '—'} />
            <TR l="City"           v={user.city      || '—'} />
            <TR l="Credit pts"     v={fmtNum(user.creditLimit)} />
            <TR l="pts"            v={fmtNum(balance?.main)} />
            <TR l="Available pts"  v={fmtNum(balance?.available)} />
            <TR l="Client P/L"     v="0" />
            <TR l="Exposure"       v={fmtNum(balance?.exposure)} />
            <TR l="Casino pts"     v={fmtNum(balance?.casino)} />
            <TR l="Sports pts"     v="0" />
            <TR l="Third Party pts" v="0" />
            <TR l="Created Date"   v={user.createdAt ? new Date(user.createdAt).toLocaleString() : '—'} />
          </tbody>
        </table>
      </div>
    </div>
  )
}

function TR({ l, v }: { l: string; v: string | number }) {
  return (
    <tr style={{ borderBottom: '1px solid #f5f5f5' }}>
      <td style={{ padding: '7px 6px', fontWeight: 600, color: '#555', width: '44%', fontSize: 13 }}>{l}:</td>
      <td style={{ padding: '7px 6px', color: '#212529', fontSize: 13 }}>{v}</td>
    </tr>
  )
}

// ─── Change Password Tab ──────────────────────────────────────────────────────
// Screenshot: Password (yellow bg) | Confirm Password | Transaction Code | submit button
function ChangePasswordTab({ user, onDone }: { user: UserAccount; onDone: () => void }) {
  const [password, setPassword]   = useState('')
  const [confirm, setConfirm]     = useState('')
  const [txnCode, setTxnCode]     = useState('')
  const [saving, setSaving]       = useState(false)

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    if (password !== confirm) { toast.error('Passwords do not match'); return }
    if (password.length < 6)  { toast.error('Password must be at least 6 characters'); return }
    if (!txnCode)              { toast.error('Transaction code is required'); return }
    setSaving(true)
    try {
      await adminApi.updateUser(user.id, { password } as any)
      toast.success('Password changed successfully')
      onDone()
    } catch (e: any) {
      toast.error(e?.response?.data?.error || 'Failed to change password')
    } finally { setSaving(false) }
  }

  return (
    <div style={{ background: '#fff', border: '1px solid #dee2e6', borderRadius: 4, padding: 20 }}>
      <form onSubmit={submit}>
        <TabRow label="Password">
          <input type="password" value={password} onChange={e => setPassword(e.target.value)}
            style={{ ...inp, background: password ? '#fff' : '#ffffcc' }} required autoFocus />
        </TabRow>
        <TabRow label="Confirm Password">
          <input type="password" value={confirm} onChange={e => setConfirm(e.target.value)}
            placeholder="Confirm Password" style={inp} required />
        </TabRow>
        <TabRow label="Transaction Code">
          <input type="password" value={txnCode} onChange={e => setTxnCode(e.target.value)}
            placeholder="Transaction Code" style={inp} required />
        </TabRow>
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 8 }}>
          <SubmitBtn loading={saving} />
        </div>
      </form>
    </div>
  )
}

// ─── User Lock Tab ────────────────────────────────────────────────────────────
// Screenshot: Bet lock toggle | User lock toggle | Transaction Code (yellow) | submit
function LockTab({ user, onDone }: { user: UserAccount; onDone: () => void }) {
  const [betLock, setBetLock]   = useState(false)
  const [userLock, setUserLock] = useState(user.status === 'SUSPENDED')
  const [txnCode, setTxnCode]   = useState('')
  const [saving, setSaving]     = useState(false)

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    if (!txnCode) { toast.error('Transaction code is required'); return }
    setSaving(true)
    try {
      await adminApi.setStatus(user.id, userLock ? 'SUSPENDED' : 'ACTIVE')
      toast.success('Lock settings updated')
      onDone()
    } catch (e: any) {
      toast.error(e?.response?.data?.error || 'Failed to update')
    } finally { setSaving(false) }
  }

  return (
    <div style={{ background: '#fff', border: '1px solid #dee2e6', borderRadius: 4, padding: 20 }}>
      <form onSubmit={submit}>
        <TabRow label="Bet lock">
          <Toggle value={betLock} onChange={setBetLock} />
        </TabRow>
        <TabRow label="User lock">
          <Toggle value={userLock} onChange={setUserLock} />
        </TabRow>
        <TabRow label="Transaction Code">
          <input type="password" value={txnCode} onChange={e => setTxnCode(e.target.value)}
            style={{ ...inp, background: txnCode ? '#fff' : '#ffffcc' }} required />
        </TabRow>
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 8 }}>
          <SubmitBtn loading={saving} />
        </div>
      </form>
    </div>
  )
}

// ─── Account History Tab ──────────────────────────────────────────────────────
// Screenshot: Table — Super User | User | Transfer From | Amount | Date
function HistoryTab({ user }: { user: UserAccount }) {
  const [history, setHistory] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Fetch wallet statement for this user
    adminApi.reportStatement({ userId: user.id, page: 0, size: 50 })
      .then((data: any) => setHistory(Array.isArray(data) ? data : []))
      .catch(() => setHistory([]))
      .finally(() => setLoading(false))
  }, [user.id])

  return (
    <div style={{ background: '#fff', border: '1px solid #dee2e6', borderRadius: 4, overflow: 'hidden' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
        <thead>
          <tr style={{ borderBottom: '2px solid #dee2e6' }}>
            {['Super User', 'User', 'Transfer From', 'Amount', 'Date'].map(h => (
              <th key={h} style={{ padding: '10px 14px', textAlign: 'left', fontWeight: 700, whiteSpace: 'nowrap' }}>{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {loading && (
            <tr><td colSpan={5} style={{ padding: 24, textAlign: 'center', color: '#aaa' }}>Loading...</td></tr>
          )}
          {!loading && history.length === 0 && (
            <tr><td colSpan={5} style={{ padding: 24, textAlign: 'center', color: '#aaa' }}>No history available</td></tr>
          )}
          {history.map((h: any, i: number) => (
            <tr key={i} style={{ borderBottom: '1px solid #f0f0f0' }}>
              <td style={{ padding: '8px 14px' }}>{h.superUser || h.parentUsername || '—'}</td>
              <td style={{ padding: '8px 14px' }}>{h.username || user.username}</td>
              <td style={{ padding: '8px 14px' }}>{h.transferFrom || h.description || '—'}</td>
              <td style={{ padding: '8px 14px' }}>{fmtNum(h.amount)}</td>
              <td style={{ padding: '8px 14px', whiteSpace: 'nowrap' }}>
                {h.createdAt ? new Date(h.createdAt).toLocaleString() : '—'}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

// ─── Edit Profile Tab ─────────────────────────────────────────────────────────
// Screenshot: Full Name input | Change Password Lock toggle | Favorite Master toggle | Transaction Code | submit
function EditProfileTab({ user, onDone }: { user: UserAccount; onDone: () => void }) {
  const [fullName, setFullName]           = useState(user.fullName || '')
  const [changePwdLock, setChangePwdLock] = useState(false)
  const [favMaster, setFavMaster]         = useState(false)
  const [txnCode, setTxnCode]             = useState('')
  const [saving, setSaving]               = useState(false)

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    if (!txnCode) { toast.error('Transaction code is required'); return }
    setSaving(true)
    try {
      await adminApi.updateUser(user.id, { fullName } as any)
      toast.success('Profile updated successfully')
      onDone()
    } catch (e: any) {
      toast.error(e?.response?.data?.error || 'Failed to update profile')
    } finally { setSaving(false) }
  }

  return (
    <div style={{ background: '#fff', border: '1px solid #dee2e6', borderRadius: 4, padding: 20 }}>
      <form onSubmit={submit}>
        <TabRow label="Full Name">
          <input type="text" value={fullName} onChange={e => setFullName(e.target.value)}
            placeholder="Full Name" style={inp} />
        </TabRow>
        <TabRow label="Change Password Lock">
          <Toggle value={changePwdLock} onChange={setChangePwdLock} />
        </TabRow>
        <TabRow label="Favorite Master">
          <Toggle value={favMaster} onChange={setFavMaster} />
        </TabRow>
        <TabRow label="Transaction Code">
          <input type="password" value={txnCode} onChange={e => setTxnCode(e.target.value)}
            placeholder="Transaction Code" style={inp} required />
        </TabRow>
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 8 }}>
          <SubmitBtn loading={saving} />
        </div>
      </form>
    </div>
  )
}

// ─── Transfer Modal ───────────────────────────────────────────────────────────
function TransferModal({ user, type, onClose, onDone }: { user: UserAccount; type: 'deposit' | 'withdraw'; onClose: () => void; onDone: () => void }) {
  const isDeposit = type === 'deposit'
  const [parentBal, setParentBal]             = useState(0)
  const [remainParentBal, setRemainParentBal] = useState(0)
  const [userBal, setUserBal]                 = useState(0)
  const [remainUserBal, setRemainUserBal]     = useState(0)
  const [parentName, setParentName]           = useState('Parent')
  const [amount, setAmount]                   = useState('')
  const [remark, setRemark]                   = useState('')
  const [txnCode, setTxnCode]                 = useState('')
  const [saving, setSaving]                   = useState(false)

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
    if (!amt || amt <= 0) { toast.error('Enter a valid amount'); return }
    if (!txnCode)         { toast.error('Transaction code is required'); return }
    setSaving(true)
    try {
      if (isDeposit) await adminApi.creditDeposit(user.id, amt, remark)
      else           await adminApi.creditWithdraw(user.id, amt, remark)
      toast.success(`${isDeposit ? 'Deposit' : 'Withdraw'} successful!`)
      onDone()
    } catch (e: any) {
      toast.error(e?.response?.data?.error || 'Transaction failed')
    } finally { setSaving(false) }
  }

  const hBg = isDeposit ? '#34c38f' : '#f46a6a'
  const rSt: React.CSSProperties = { ...inp, background: '#eee', textAlign: 'right', cursor: 'not-allowed' }

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', justifyContent: 'center', alignItems: 'flex-start', zIndex: 9999, paddingTop: 60 }}>
      <div style={{ background: '#fff', width: '90%', maxWidth: 600, borderRadius: 8, overflow: 'hidden', boxShadow: '0 4px 16px rgba(0,0,0,0.2)' }}>
        <div style={{ background: hBg, display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 16px' }}>
          <h5 style={{ margin: 0, color: '#fff', fontWeight: 700, textTransform: 'uppercase', fontSize: 17 }}>{isDeposit ? 'Deposit' : 'Withdraw'}</h5>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#fff', fontSize: 24, cursor: 'pointer' }}>&times;</button>
        </div>
        <div style={{ padding: 16 }}>
          <div style={{ borderBottom: '1px solid #dee2e6', marginBottom: 12 }}>
            <span style={{ display: 'inline-block', padding: '.5rem 1rem', fontSize: 13, fontWeight: 500, borderBottom: `2px solid ${hBg}`, marginBottom: -1 }}>
              {isDeposit ? 'Deposit' : 'Withdraw'}
            </span>
          </div>
          <form onSubmit={submit} style={{ border: '1px solid #ced4da', padding: 8 }}>
            {[[parentName, parentBal, remainParentBal], [user.username, userBal, remainUserBal]].map(([lbl, cur, rem]) => (
              <div key={String(lbl)} style={{ display: 'flex', gap: 10, marginBottom: 12, alignItems: 'center', flexWrap: 'wrap' }}>
                <label style={{ width: '32%', fontSize: 13, fontWeight: 500, minWidth: 80 }}>{lbl}</label>
                <div style={{ flex: 1, display: 'flex', gap: 8 }}>
                  <input readOnly value={fmt2(Number(cur))} style={rSt} />
                  <input readOnly value={fmt2(Number(rem))} style={rSt} />
                </div>
              </div>
            ))}
            <div style={{ display: 'flex', gap: 10, marginBottom: 12, alignItems: 'center' }}>
              <label style={{ width: '32%', fontSize: 13, fontWeight: 500 }}>Profit/Loss</label>
              <div style={{ flex: 1, display: 'flex', gap: 8 }}><input readOnly value="0.00" style={rSt} /><input readOnly value="0.00" style={rSt} /></div>
            </div>
            <div style={{ display: 'flex', gap: 10, marginBottom: 12, alignItems: 'center' }}>
              <label style={{ width: '32%', fontSize: 13, fontWeight: 500 }}>Amount</label>
              <div style={{ flex: 1 }}><input type="number" placeholder="Amount" value={amount} onChange={e => handleAmount(e.target.value)} style={{ ...inp, textAlign: 'right' }} /></div>
            </div>
            <div style={{ display: 'flex', gap: 10, marginBottom: 12, alignItems: 'flex-start' }}>
              <label style={{ width: '32%', fontSize: 13, fontWeight: 500, paddingTop: 6 }}>Remark</label>
              <div style={{ flex: 1 }}><textarea placeholder="Remark" value={remark} onChange={e => setRemark(e.target.value)} style={{ ...inp, height: 'auto', resize: 'vertical' }} rows={3} /></div>
            </div>
            <div style={{ display: 'flex', gap: 10, marginBottom: 12, alignItems: 'center' }}>
              <label style={{ width: '32%', fontSize: 13, fontWeight: 500 }}>Transaction Code</label>
              <div style={{ flex: 1 }}><input type="password" placeholder="Transaction Code" value={txnCode} onChange={e => setTxnCode(e.target.value)} style={inp} /></div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <button type="submit" disabled={saving} style={{ background: hBg, color: '#fff', border: 'none', padding: '6px 20px', borderRadius: 4, cursor: 'pointer', fontSize: 13, fontWeight: 500 }}>
                {saving ? 'Processing...' : 'submit →'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

// ─── Shared UI primitives ─────────────────────────────────────────────────────

/** Two-column form row: label left (~30%), content right (~70%) */
function TabRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', marginBottom: 16, gap: 16, flexWrap: 'wrap' }}>
      <div style={{ width: 220, minWidth: 140, fontSize: 13, color: '#495057' }}>{label}</div>
      <div style={{ flex: 1, minWidth: 200 }}>{children}</div>
    </div>
  )
}

/** Submit button matching screenshot: dark bg, white text, arrow icon */
function SubmitBtn({ loading }: { loading: boolean }) {
  return (
    <button type="submit" disabled={loading} style={{
      background: '#343a40', color: '#fff', border: 'none',
      padding: '8px 22px', borderRadius: 4, cursor: loading ? 'not-allowed' : 'pointer',
      fontSize: 13, fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: 6, opacity: loading ? 0.75 : 1,
    }}>
      {loading ? 'Saving...' : <><span>submit</span><span style={{ fontSize: 16 }}>➔</span></>}
    </button>
  )
}

/** iOS-style toggle switch */
function Toggle({ value, onChange, disabled }: { value: boolean; onChange?: (v: boolean) => void; disabled?: boolean }) {
  return (
    <div
      onClick={() => !disabled && onChange?.(!value)}
      style={{
        width: 42, height: 22, borderRadius: 11, position: 'relative', cursor: disabled ? 'default' : 'pointer',
        background: value ? '#34c38f' : '#c8c8c8', transition: 'background .2s',
        opacity: disabled ? 0.6 : 1, flexShrink: 0,
      }}
    >
      <div style={{
        width: 18, height: 18, borderRadius: '50%', background: '#fff',
        position: 'absolute', top: 2, left: value ? 22 : 2, transition: 'left .2s',
        boxShadow: '0 1px 3px rgba(0,0,0,0.3)',
      }} />
    </div>
  )
}

function Btn({ bg, color = '#fff', border = 'none', onClick, children }: { bg: string; color?: string; border?: string; onClick?: () => void; children: React.ReactNode }) {
  return (
    <button onClick={onClick} type="button" style={{ background: bg, color, border, padding: '0 14px', height: 36, borderRadius: 4, cursor: 'pointer', fontSize: 13, fontWeight: 500 }}>
      {children}
    </button>
  )
}

const inp: React.CSSProperties = {
  display: 'block', width: '100%', padding: '7px 10px', fontSize: 13,
  border: '1px solid #ced4da', borderRadius: 4, background: '#fff', boxSizing: 'border-box', outline: 'none',
}

function actionBtn(bg: string, radius: string): React.CSSProperties {
  return { background: bg, color: '#fff', border: 'none', padding: '3px 10px', cursor: 'pointer', fontSize: 12, borderRadius: radius }
}

function pgBtn(disabled: boolean, active = false): React.CSSProperties {
  return {
    padding: '4px 10px', fontSize: 12, borderRadius: 4, border: '1px solid #dee2e6', cursor: disabled ? 'default' : 'pointer',
    background: active ? '#23292e' : disabled ? '#f8f9fa' : '#fff',
    color: active ? '#fff' : disabled ? '#aaa' : '#212529',
  }
}
