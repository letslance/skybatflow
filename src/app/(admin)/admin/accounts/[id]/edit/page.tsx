'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { adminApi } from '@/lib/api'
import { UserAccount } from '@/types'
import PageHeader from '@/components/ui/PageHeader'
import toast from 'react-hot-toast'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export default function EditAccountPage() {
  const { id } = useParams<{ id: string }>()
  const router  = useRouter()

  const [user, setUser]       = useState<UserAccount | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving]   = useState(false)

  const [form, setForm] = useState({
    sportsCommissionPct: 0,
    casinoCommissionPct: 0,
    partnershipPct:      0,
    minBet:              1,
    maxBet:              100000,
    maxMarketExposure:   500000,
  })
  const [txnCode, setTxnCode] = useState('')

  useEffect(() => {
    adminApi.getUser(id)
      .then(u => {
        setUser(u)
        setForm({
          sportsCommissionPct: u.commission?.sportsCommissionPct ?? u.commissionRate ?? 0,
          casinoCommissionPct: u.commission?.casinoCommissionPct ?? 0,
          partnershipPct:      u.commission?.partnershipPct      ?? 0,
          minBet:              u.minBet              ?? 1,
          maxBet:              u.maxBet              ?? 100000,
          maxMarketExposure:   u.maxMarketExposure   ?? 500000,
        })
      })
      .catch(() => toast.error('Failed to load account'))
      .finally(() => setLoading(false))
  }, [id])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!/^\d{6}$/.test(txnCode)) { toast.error('Transaction code must be exactly 6 digits'); return }
    setSaving(true)
    try {
      await adminApi.updateUser(id, form, txnCode)
      toast.success('Account updated')
      router.push('/admin/accounts')
    } catch (err: any) {
      const msg: string = err?.response?.data?.error || err?.response?.data?.message || 'Failed to update'
      if (msg.includes('logged out for security')) {
        toast.error(msg)
        setTimeout(() => { window.location.href = '/admin/login' }, 1500)
        return
      }
      toast.error(msg)
    } finally {
      setSaving(false)
    }
  }

  function field(key: keyof typeof form, label: string, min = 0, max = 999999) {
    return (
      <div key={key}>
        <label className="block text-xs text-tx-secondary mb-1">{label}</label>
        <input
          type="number"
          value={form[key]}
          min={min}
          max={max}
          step={key.includes('Commission') || key.includes('Pct') ? '0.01' : '1'}
          onChange={e => setForm(f => ({ ...f, [key]: parseFloat(e.target.value) || 0 }))}
          className="input w-full"
        />
      </div>
    )
  }

  if (loading) return <div className="p-4 text-xs text-tx-muted">Loading...</div>
  if (!user)   return <div className="p-4 text-xs text-loss">Account not found</div>

  return (
    <div>
      <PageHeader title={`Edit — ${user.username}`} subtitle={user.role}>
        <Link href="/admin/accounts" className="btn-outline btn-sm flex items-center gap-1">
          <ArrowLeft size={12} /> Back
        </Link>
      </PageHeader>

      <form onSubmit={handleSubmit} className="card p-4 max-w-lg space-y-4">
        {/* Commission */}
        <div>
          <div className="text-xs font-semibold text-tx-primary mb-3 border-b border-[#3a444c] pb-1">
            Commission Settings
          </div>
          <div className="grid grid-cols-2 gap-3">
            {field('sportsCommissionPct', 'Sports Commission %', 0, 100)}
            {field('casinoCommissionPct', 'Casino Commission %', 0, 100)}
            {field('partnershipPct',      'Partnership %',       0, 100)}
          </div>
        </div>

        {/* Bet limits */}
        <div>
          <div className="text-xs font-semibold text-tx-primary mb-3 border-b border-[#3a444c] pb-1">
            Bet Limits
          </div>
          <div className="grid grid-cols-2 gap-3">
            {field('minBet',            'Min Bet (₹)',         0, 1000000)}
            {field('maxBet',            'Max Bet (₹)',         0, 1000000)}
            {field('maxMarketExposure', 'Max Market Exposure', 0, 10000000)}
          </div>
        </div>

        {/* Transaction code */}
        <div>
          <label className="block text-xs text-tx-secondary mb-1">
            Your Transaction Code <span className="text-loss">*</span>
          </label>
          <input
            type="password"
            value={txnCode}
            onChange={e => setTxnCode(e.target.value)}
            placeholder="Enter your 6-digit transaction code"
            maxLength={6}
            required
            className="input w-full"
            style={{ background: txnCode ? undefined : '#ffffcc', color: '#212529' }}
          />
          <p className="text-xs text-tx-muted mt-1">
            Enter <strong>your own</strong> transaction code to authorize this update.
          </p>
        </div>

        <div className="flex gap-2 pt-1">
          <button type="submit" disabled={saving} className="btn-primary flex-1">
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
          <Link href="/admin/accounts" className="btn-outline flex-1 text-center">
            Cancel
          </Link>
        </div>
      </form>
    </div>
  )
}
