'use client'

import { useEffect, useState } from 'react'
import { adminApi } from '@/lib/api'
import { UserAccount } from '@/types'
import Link from 'next/link'
import toast from 'react-hot-toast'

const PAGE_SIZE = 20

function formatNum(n: number | undefined | null) {
  return Number(n || 0).toLocaleString()
}

interface UserBalance {
  main: number
  casino: number
  exposure: number
  available: number
}

interface AccountRow extends UserAccount {
  balance?: UserBalance
}

export default function ActiveUsersPage() {
  const [users, setUsers]           = useState<AccountRow[]>([])
  const [loading, setLoading]       = useState(true)
  const [search, setSearch]         = useState('')
  const [page, setPage]             = useState(0)
  const [depositModal, setDeposit]  = useState<AccountRow | null>(null)
  const [withdrawModal, setWithdraw]= useState<AccountRow | null>(null)

  useEffect(() => { load() }, [])

  async function load() {
    setLoading(true)
    try {
      const all = await adminApi.users()
      // Filter active users — equivalent to old transctionpasswordstatus === 1 filter
      const active = all.filter(u => u.status === 'ACTIVE')

      // Fetch balances for each active user in parallel
      const rows: AccountRow[] = await Promise.all(
        active.map(async u => {
          try {
            const bal = await adminApi.getAdminBalance(u.id)
            return { ...u, balance: bal }
          } catch {
            return u
          }
        })
      )
      setUsers(rows)
    } catch {
      toast.error('Failed to load accounts')
    } finally {
      setLoading(false)
    }
  }

  const filtered  = users.filter(u =>
    !search || u.username.toLowerCase().includes(search.toLowerCase())
  )
  const paginated  = filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE)
  const totalPages = Math.ceil(filtered.length / PAGE_SIZE)

  return (
    <div>
      {/* Page title */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <h4 style={{ margin: 0, fontWeight: 'bold', fontSize: 16, textTransform: 'uppercase' }}>
          Account List For Active Users
        </h4>
        <nav style={{ fontSize: 13, color: '#666' }}>
          <a href="/admin" style={{ color: '#495057' }}>Home</a>
          {' / '}
          <span>Active Users</span>
        </nav>
      </div>

      <div className="card" style={{ boxShadow: '0 .75rem 1.5rem rgba(18,38,63,.03)' }}>
        <div style={{ padding: '1.25rem' }}>

          {/* ── Toolbar ──────────────────────────────────── */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 8, marginBottom: 12 }}>
            <form
              onSubmit={e => { e.preventDefault(); setPage(0) }}
              style={{ display: 'flex', gap: 4, alignItems: 'center' }}
            >
              <input
                type="text"
                placeholder="Search User"
                value={search}
                onChange={e => setSearch(e.target.value)}
                style={{ padding: '6px 10px', fontSize: 13, border: '1px solid #ccc', borderRadius: 4, height: 36, minWidth: 180 }}
              />
              <button
                type="submit"
                style={{ background: '#23292e', color: '#fff', border: 'none', padding: '0 14px', height: 36, borderRadius: 4, cursor: 'pointer', fontSize: 13 }}
              >
                Load
              </button>
              <button
                type="button"
                onClick={() => { setSearch(''); setPage(0) }}
                style={{ background: '#f8f9fa', color: '#212529', border: '1px solid #dee2e6', padding: '0 14px', height: 36, borderRadius: 4, cursor: 'pointer', fontSize: 13 }}
              >
                Reset
              </button>
            </form>

            <div style={{ display: 'flex', gap: 8 }}>
              <button
                onClick={() => toast('Export to Excel — coming soon')}
                style={{ background: '#34c38f', color: '#fff', border: 'none', padding: '0 12px', height: 36, borderRadius: 4, cursor: 'pointer', fontSize: 12 }}
              >
                Excel
              </button>
              <button
                onClick={() => toast('Export to PDF — coming soon')}
                style={{ background: '#f46a6a', color: '#fff', border: 'none', padding: '0 12px', height: 36, borderRadius: 4, cursor: 'pointer', fontSize: 12 }}
              >
                PDF
              </button>
              <Link
                href="/admin/accounts/create"
                style={{ background: '#34c38f', color: '#fff', textDecoration: 'none', padding: '0 12px', height: 36, borderRadius: 4, display: 'flex', alignItems: 'center', fontSize: 13, fontWeight: 500 }}
              >
                + CREATE ACCOUNT
              </Link>
            </div>
          </div>

          {/* ── Table ────────────────────────────────────── */}
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #dee2e6' }}>
                  {[
                    'User Name', 'CR', 'pts', 'Client (P/L)', 'Client (P/L) %',
                    'Exposure', 'Available pts', 'B st', 'U st', 'PName', 'Account Type', 'Action',
                  ].map(h => (
                    <th key={h} style={{ padding: '8px 10px', textAlign: 'left', fontWeight: 600, whiteSpace: 'nowrap' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loading && (
                  <tr>
                    <td colSpan={12} style={{ padding: 24, textAlign: 'center', color: '#999' }}>Loading...</td>
                  </tr>
                )}
                {!loading && paginated.length === 0 && (
                  <tr>
                    <td colSpan={12} style={{ padding: 24, textAlign: 'center', color: '#999' }}>No active accounts found</td>
                  </tr>
                )}
                {paginated.map(acc => {
                  const bal    = acc.balance
                  const pts    = bal?.main     ?? 0
                  const exp    = bal?.exposure  ?? 0
                  const avail  = bal?.available ?? 0
                  const cr     = acc.creditLimit ?? 0
                  const pl     = pts - cr          // P/L relative to credit reference

                  return (
                    <tr key={acc.id} style={{ borderBottom: '1px solid #f0f0f0' }}>

                      {/* User Name */}
                      <td style={{ padding: '7px 10px' }}>
                        <span>{acc.username}</span>
                      </td>

                      {/* CR */}
                      <td style={{ padding: '7px 10px', color: '#ff9800' }}>{formatNum(cr)}</td>

                      {/* pts */}
                      <td style={{ padding: '7px 10px', color: '#50a5f1' }}>{formatNum(pts)}</td>

                      {/* Client P/L */}
                      <td style={{ padding: '7px 10px', color: pl < 0 ? '#f46a6a' : '#34c38f' }}>
                        {formatNum(pl)}
                      </td>

                      {/* Client P/L % */}
                      <td style={{ padding: '7px 10px' }}>—</td>

                      {/* Exposure */}
                      <td style={{ padding: '7px 10px' }}>{formatNum(exp)}</td>

                      {/* Available pts */}
                      <td style={{ padding: '7px 10px' }}>{formatNum(avail)}</td>

                      {/* B st — disabled toggle */}
                      <td style={{ padding: '7px 10px' }}>
                        <input type="checkbox" disabled defaultChecked={false} />
                      </td>

                      {/* U st — disabled toggle */}
                      <td style={{ padding: '7px 10px' }}>
                        <input type="checkbox" disabled defaultChecked={acc.status !== 'ACTIVE'} />
                      </td>

                      {/* PName */}
                      <td style={{ padding: '7px 10px' }}>
                        {acc.role === 'PLAYER' ? '100 PNR' : `${acc.commission?.partnershipPct ?? 0} PNR`}
                      </td>

                      {/* Account Type */}
                      <td style={{ padding: '7px 10px' }}>{acc.role}</td>

                      {/* Action */}
                      <td style={{ padding: '7px 10px' }}>
                        <div style={{ display: 'inline-flex', gap: 0 }}>
                          <button
                            onClick={() => setDeposit(acc)}
                            style={{ background: '#34c38f', color: '#fff', border: 'none', padding: '3px 10px', cursor: 'pointer', fontSize: 12, borderRadius: '4px 0 0 4px' }}
                          >D</button>
                          <button
                            onClick={() => setWithdraw(acc)}
                            style={{ background: '#f46a6a', color: '#fff', border: 'none', padding: '3px 10px', cursor: 'pointer', fontSize: 12, borderRadius: 0 }}
                          >W</button>
                          <Link
                            href={`/admin/accounts/${acc.id}`}
                            style={{ background: '#50a5f1', color: '#fff', padding: '3px 10px', cursor: 'pointer', fontSize: 12, borderRadius: '0 4px 4px 0', textDecoration: 'none', display: 'inline-flex', alignItems: 'center' }}
                          >More</Link>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          {/* ── Pagination ───────────────────────────────── */}
          {totalPages > 1 && (
            <div style={{ display: 'flex', gap: 4, justifyContent: 'flex-end', marginTop: 12 }}>
              <button onClick={() => setPage(0)}           disabled={page === 0}              style={pgBtn(page === 0)}>«</button>
              <button onClick={() => setPage(p => p - 1)} disabled={page === 0}              style={pgBtn(page === 0)}>‹</button>
              {Array.from({ length: totalPages }, (_, i) => (
                <button key={i} onClick={() => setPage(i)} style={pgBtn(false, i === page)}>{i + 1}</button>
              ))}
              <button onClick={() => setPage(p => p + 1)} disabled={page === totalPages - 1} style={pgBtn(page === totalPages - 1)}>›</button>
              <button onClick={() => setPage(totalPages - 1)} disabled={page === totalPages - 1} style={pgBtn(page === totalPages - 1)}>»</button>
            </div>
          )}
        </div>
      </div>

      {depositModal  && <ActiveTransferModal user={depositModal}  type="deposit"  onClose={() => setDeposit(null)}  onDone={() => { setDeposit(null);  load() }} />}
      {withdrawModal && <ActiveTransferModal user={withdrawModal} type="withdraw" onClose={() => setWithdraw(null)} onDone={() => { setWithdraw(null); load() }} />}
    </div>
  )
}

function pgBtn(disabled: boolean, active = false): React.CSSProperties {
  return {
    padding: '4px 10px', fontSize: 12, borderRadius: 4, cursor: disabled ? 'default' : 'pointer',
    border: '1px solid #dee2e6',
    background: active ? '#23292e' : disabled ? '#f8f9fa' : '#fff',
    color: active ? '#fff' : disabled ? '#aaa' : '#212529',
  }
}

// Re-uses the same TransferModal pattern as the Account List page
function ActiveTransferModal({
  user, type, onClose, onDone,
}: {
  user: AccountRow
  type: 'deposit' | 'withdraw'
  onClose: () => void
  onDone: () => void
}) {
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
      adminApi.getAdminBalance(user.parentId)
        .then(b => { setParentBal(b.main); setRemainParentBal(b.main) })
        .catch(() => {})
    }
    // Use already-fetched balance if available, else fetch
    if (user.balance) {
      setUserBal(user.balance.main); setRemainUserBal(user.balance.main)
    } else {
      adminApi.getAdminBalance(user.id)
        .then(b => { setUserBal(b.main); setRemainUserBal(b.main) })
        .catch(() => {})
    }
  }, [user.id, user.parentId])

  function handleAmountChange(val: string) {
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
      isDeposit
        ? await adminApi.creditDeposit(user.id, amt, remark)
        : await adminApi.creditWithdraw(user.id, amt, remark)
      toast.success(isDeposit ? 'Deposit successful!' : 'Withdraw successful!')
      onDone()
    } catch (e: any) {
      toast.error(e?.response?.data?.error || 'Transaction failed')
    } finally {
      setSaving(false)
    }
  }

  const fmt = (v: number) => v.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
  const headerBg     = isDeposit ? '#34c38f' : '#f46a6a'
  const inputStyle: React.CSSProperties   = { display: 'block', width: '100%', padding: '.47rem .75rem', fontSize: '.8125rem', border: '1px solid #ced4da', borderRadius: '.25rem', background: '#fff' }
  const readonlyStyle: React.CSSProperties = { ...inputStyle, background: '#eee', textAlign: 'right', cursor: 'not-allowed' }
  const labelStyle: React.CSSProperties   = { display: 'flex', alignItems: 'center', width: '33%', fontSize: 13, fontWeight: 500 }
  const rowStyle: React.CSSProperties     = { display: 'flex', gap: 12, marginBottom: 14, flexWrap: 'wrap' }

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', justifyContent: 'center', alignItems: 'flex-start', zIndex: 9999, paddingTop: 60 }}>
      <div style={{ background: '#fff', width: '90%', maxWidth: 600, borderRadius: 8, overflow: 'hidden', boxShadow: '0 2px 10px rgba(0,0,0,0.2)' }}>
        <div style={{ background: headerBg, display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 16px' }}>
          <h5 style={{ margin: 0, color: '#fff', fontWeight: 600, textTransform: 'uppercase', fontSize: 18 }}>{isDeposit ? 'Deposit' : 'Withdraw'}</h5>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#fff', fontSize: 24, cursor: 'pointer', lineHeight: 1 }}>&times;</button>
        </div>
        <div style={{ padding: 16 }}>
          <div style={{ borderBottom: '1px solid #ced4da', marginBottom: 12 }}>
            <span style={{ display: 'inline-block', padding: '.5rem 1rem', fontSize: 13, fontWeight: 500, color: '#495057', borderBottom: `2px solid ${headerBg}` }}>{isDeposit ? 'Deposit' : 'Withdraw'}</span>
          </div>
          <form onSubmit={submit} style={{ border: '1px solid #ced4da', padding: 7 }}>
            <div style={rowStyle}>
              <label style={labelStyle}>{parentName}</label>
              <div style={{ flex: 1, display: 'flex', gap: 8 }}>
                <input type="text" readOnly value={fmt(parentBal)}       style={readonlyStyle} placeholder="Amount" />
                <input type="text" readOnly value={fmt(remainParentBal)} style={readonlyStyle} placeholder="Amount" />
              </div>
            </div>
            <div style={rowStyle}>
              <label style={labelStyle}>{user.username}</label>
              <div style={{ flex: 1, display: 'flex', gap: 8 }}>
                <input type="text" readOnly value={fmt(userBal)}       style={readonlyStyle} placeholder="Amount" />
                <input type="text" readOnly value={fmt(remainUserBal)} style={readonlyStyle} placeholder="Amount" />
              </div>
            </div>
            <div style={rowStyle}>
              <label style={labelStyle}>Profit/Loss</label>
              <div style={{ flex: 1, display: 'flex', gap: 8 }}>
                <input type="text" readOnly value="0.00" style={readonlyStyle} placeholder="P/L" />
                <input type="text" readOnly value="0.00" style={readonlyStyle} placeholder="P/L" />
              </div>
            </div>
            <div style={rowStyle}>
              <label style={labelStyle}>Amount</label>
              <div style={{ flex: 1 }}>
                <input type="number" placeholder="Amount" value={amount} onChange={e => handleAmountChange(e.target.value)} style={{ ...inputStyle, textAlign: 'right' }} />
              </div>
            </div>
            <div style={rowStyle}>
              <label style={labelStyle}>Remark</label>
              <div style={{ flex: 1 }}>
                <textarea placeholder="Remark" value={remark} onChange={e => setRemark(e.target.value)} style={{ ...inputStyle, height: 'auto', resize: 'vertical' }} rows={3} />
              </div>
            </div>
            <div style={rowStyle}>
              <label style={labelStyle}>Transaction Code</label>
              <div style={{ flex: 1 }}>
                <input type="password" placeholder="Transaction Code" value={txnCode} onChange={e => setTxnCode(e.target.value)} style={inputStyle} />
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <button type="submit" disabled={saving} style={{ background: headerBg, color: '#fff', border: 'none', padding: '6px 18px', borderRadius: 4, cursor: 'pointer', fontSize: 13, fontWeight: 500 }}>
                {saving ? 'Processing...' : 'submit'} &#x2192;
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
