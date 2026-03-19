'use client'

import { useState } from 'react'
import { useAuthStore, useBalanceStore } from '@/lib/store'
import { authApi } from '@/lib/api'
import PageHeader from '@/components/ui/PageHeader'
import { formatCurrency } from '@/lib/utils'
import toast from 'react-hot-toast'

export default function ProfilePage() {
  const { user } = useAuthStore()
  const { balance } = useBalanceStore()
  const [curr, setCurr] = useState('')
  const [next, setNext] = useState('')
  const [conf, setConf] = useState('')
  const [changing, setChanging] = useState(false)

  async function changePassword() {
    if (next !== conf) { toast.error('Passwords do not match'); return }
    if (next.length < 6) { toast.error('Password must be at least 6 characters'); return }
    setChanging(true)
    try {
      await authApi.changePassword(curr, next)
      toast.success('Password changed successfully')
      setCurr(''); setNext(''); setConf('')
    } catch (e: any) {
      toast.error(e?.response?.data?.error || 'Failed to change password')
    } finally { setChanging(false) }
  }

  if (!user) return null

  return (
    <div className="p-3">
      <PageHeader title="My Profile" />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Account info */}
        <div className="card">
          <div className="card-header">Account Details</div>
          <div className="p-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center text-primary text-xl font-bold">
                {user.username[0].toUpperCase()}
              </div>
              <div>
                <div className="text-sm font-bold text-tx-primary">{user.username}</div>
                <div className="text-[11px] text-primary font-medium">{user.role}</div>
                <div className="text-[11px] text-tx-muted">ID: {user.id.slice(0, 8)}…</div>
              </div>
            </div>

            <div className="space-y-2">
              {[
                { label: 'Main Balance',   value: `₹${formatCurrency(balance?.main ?? 0)}`,     color: 'text-tx-primary' },
                { label: 'Casino Balance', value: `₹${formatCurrency(balance?.casino ?? 0)}`,   color: 'text-tx-primary' },
                { label: 'Exposure',       value: `(₹${formatCurrency(balance?.exposure ?? 0)})`, color: 'text-loss' },
                { label: 'Available',      value: `₹${formatCurrency(balance?.available ?? 0)}`, color: 'text-win' },
              ].map(item => (
                <div key={item.label} className="flex justify-between items-center py-2 border-b border-[#2a3340] last:border-0">
                  <span className="text-xs text-tx-muted">{item.label}</span>
                  <span className={`text-xs font-semibold ${item.color}`}>{item.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Change password */}
        <div className="card">
          <div className="card-header">Change Password</div>
          <div className="p-4 space-y-3">
            <div>
              <label className="block text-xs text-tx-secondary mb-1">Current Password</label>
              <input
                type="password"
                value={curr}
                onChange={e => setCurr(e.target.value)}
                className="input"
                placeholder="••••••"
              />
            </div>
            <div>
              <label className="block text-xs text-tx-secondary mb-1">New Password</label>
              <input
                type="password"
                value={next}
                onChange={e => setNext(e.target.value)}
                className="input"
                placeholder="••••••"
              />
            </div>
            <div>
              <label className="block text-xs text-tx-secondary mb-1">Confirm Password</label>
              <input
                type="password"
                value={conf}
                onChange={e => setConf(e.target.value)}
                className="input"
                placeholder="••••••"
              />
            </div>
            <button
              onClick={changePassword}
              disabled={changing || !curr || !next || !conf}
              className="btn-primary w-full"
            >
              {changing ? 'Changing...' : 'Change Password'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
