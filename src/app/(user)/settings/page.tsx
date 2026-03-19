'use client'

import { useState } from 'react'
import { authApi } from '@/lib/api'
import toast from 'react-hot-toast'
import { Settings, Bell, BarChart2, Lock } from 'lucide-react'

export default function SettingsPage() {
  // Password change
  const [pwd, setPwd] = useState({ current: '', newPwd: '', confirm: '' })
  const [savingPwd, setSavingPwd] = useState(false)

  // Preferences (local-only — persist to localStorage)
  const [oddsFormat, setOddsFormat] = useState<'DECIMAL' | 'FRACTIONAL'>(() =>
    (typeof window !== 'undefined' && (localStorage.getItem('oddsFormat') as any)) || 'DECIMAL'
  )
  const [notifications, setNotifications] = useState(() =>
    typeof window !== 'undefined' ? localStorage.getItem('notifications') !== 'false' : true
  )
  const [stakeConfirm, setStakeConfirm] = useState(() =>
    typeof window !== 'undefined' ? localStorage.getItem('stakeConfirm') !== 'false' : true
  )

  function savePrefs() {
    if (typeof window !== 'undefined') {
      localStorage.setItem('oddsFormat', oddsFormat)
      localStorage.setItem('notifications', String(notifications))
      localStorage.setItem('stakeConfirm', String(stakeConfirm))
    }
    toast.success('Preferences saved')
  }

  async function changePassword(e: React.FormEvent) {
    e.preventDefault()
    if (pwd.newPwd !== pwd.confirm) { toast.error('Passwords do not match'); return }
    if (pwd.newPwd.length < 8) { toast.error('Minimum 8 characters'); return }
    setSavingPwd(true)
    try {
      await authApi.changePassword(pwd.current, pwd.newPwd)
      toast.success('Password changed')
      setPwd({ current: '', newPwd: '', confirm: '' })
    } catch (err: any) {
      toast.error(err?.response?.data?.error || 'Failed to change password')
    } finally {
      setSavingPwd(false)
    }
  }

  return (
    <div className="p-4 space-y-4 max-w-lg">
      <div className="flex items-center gap-2 mb-2">
        <Settings size={15} className="text-primary" />
        <h1 className="text-sm font-semibold text-tx-primary">Settings</h1>
      </div>

      {/* Betting preferences */}
      <div className="card p-4 space-y-4">
        <div className="flex items-center gap-2 text-xs font-semibold text-tx-primary border-b border-[#3a444c] pb-2">
          <BarChart2 size={13} /> Betting Preferences
        </div>

        <div className="space-y-3">
          <div>
            <label className="block text-xs text-tx-secondary mb-1">Odds Format</label>
            <select
              value={oddsFormat}
              onChange={e => setOddsFormat(e.target.value as any)}
              className="select w-full max-w-xs"
            >
              <option value="DECIMAL">Decimal (1.90)</option>
              <option value="FRACTIONAL">Fractional (9/10)</option>
            </select>
          </div>

          <label className="flex items-center justify-between cursor-pointer">
            <span className="text-xs text-tx-secondary">Confirm before placing bet</span>
            <input
              type="checkbox"
              checked={stakeConfirm}
              onChange={e => setStakeConfirm(e.target.checked)}
              className="w-4 h-4 accent-primary"
            />
          </label>
        </div>
      </div>

      {/* Notifications */}
      <div className="card p-4 space-y-3">
        <div className="flex items-center gap-2 text-xs font-semibold text-tx-primary border-b border-[#3a444c] pb-2">
          <Bell size={13} /> Notifications
        </div>

        <label className="flex items-center justify-between cursor-pointer">
          <span className="text-xs text-tx-secondary">Bet result notifications</span>
          <input
            type="checkbox"
            checked={notifications}
            onChange={e => setNotifications(e.target.checked)}
            className="w-4 h-4 accent-primary"
          />
        </label>
      </div>

      <button onClick={savePrefs} className="btn-primary w-full text-xs py-2">
        Save Preferences
      </button>

      {/* Change password */}
      <form onSubmit={changePassword} className="card p-4 space-y-3">
        <div className="flex items-center gap-2 text-xs font-semibold text-tx-primary border-b border-[#3a444c] pb-2">
          <Lock size={13} /> Change Password
        </div>

        <div>
          <label className="block text-xs text-tx-secondary mb-1">Current Password</label>
          <input
            type="password"
            value={pwd.current}
            onChange={e => setPwd(p => ({ ...p, current: e.target.value }))}
            className="input w-full"
            required
          />
        </div>
        <div>
          <label className="block text-xs text-tx-secondary mb-1">New Password</label>
          <input
            type="password"
            value={pwd.newPwd}
            onChange={e => setPwd(p => ({ ...p, newPwd: e.target.value }))}
            className="input w-full"
            required minLength={8}
          />
        </div>
        <div>
          <label className="block text-xs text-tx-secondary mb-1">Confirm New Password</label>
          <input
            type="password"
            value={pwd.confirm}
            onChange={e => setPwd(p => ({ ...p, confirm: e.target.value }))}
            className="input w-full"
            required minLength={8}
          />
        </div>
        <button type="submit" disabled={savingPwd} className="btn-primary w-full text-xs py-2">
          {savingPwd ? 'Saving...' : 'Change Password'}
        </button>
      </form>
    </div>
  )
}
