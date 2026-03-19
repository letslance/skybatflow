'use client'

import { useState } from 'react'
import PageHeader from '@/components/ui/PageHeader'
import toast from 'react-hot-toast'
import { adminApi } from '@/lib/api'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export default function PlatformConfigPage() {
  const [minBet,   setMinBet]   = useState('100')
  const [maxBet,   setMaxBet]   = useState('500000')
  const [oddsTol,  setOddsTol]  = useState('2')
  const [saving,   setSaving]   = useState(false)

  async function save() {
    setSaving(true)
    try {
      await adminApi.updateSettings({
        minBet:       parseFloat(minBet),
        maxBet:       parseFloat(maxBet),
        oddsTolerance: parseFloat(oddsTol),
      })
      toast.success('Settings saved')
    } catch {
      toast.error('Failed to save settings')
    } finally {
      setSaving(false)
    }
  }

  function Toggle({ label, sub, danger = false }: { label: string; sub: string; danger?: boolean }) {
    const [on, setOn] = useState(false)
    return (
      <div className="flex items-center justify-between">
        <div>
          <div className="text-xs font-medium text-tx-primary">{label}</div>
          <div className="text-[11px] text-tx-muted">{sub}</div>
        </div>
        <label className="relative inline-flex cursor-pointer">
          <input type="checkbox" checked={on} onChange={e => setOn(e.target.checked)} className="sr-only peer" />
          <div className={`w-9 h-5 rounded-full peer transition-colors after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-4 ${danger ? 'bg-bg-hover peer-checked:bg-loss' : 'bg-bg-hover peer-checked:bg-primary'}`} />
        </label>
      </div>
    )
  }

  return (
    <div>
      <PageHeader title="Platform Config" subtitle="Odds providers, bet tolerance, maintenance">
        <Link href="/admin/settings" className="btn-outline btn-sm flex items-center gap-1">
          <ArrowLeft size={12} /> Back
        </Link>
      </PageHeader>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="card">
          <div className="card-header">Betting Limits</div>
          <div className="p-4 space-y-3">
            <div>
              <label className="block text-xs text-tx-secondary mb-1">Global Minimum Bet (₹)</label>
              <input value={minBet} onChange={e => setMinBet(e.target.value)} type="number" className="input" />
            </div>
            <div>
              <label className="block text-xs text-tx-secondary mb-1">Global Maximum Bet (₹)</label>
              <input value={maxBet} onChange={e => setMaxBet(e.target.value)} type="number" className="input" />
            </div>
            <div>
              <label className="block text-xs text-tx-secondary mb-1">Odds Change Tolerance (%)</label>
              <input value={oddsTol} onChange={e => setOddsTol(e.target.value)} type="number" step="0.5" className="input" />
              <p className="text-[11px] text-tx-muted mt-1">
                Bets rejected if odds shift more than this between selection and placement.
              </p>
            </div>
            <button onClick={save} disabled={saving} className="btn-primary">
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>

        <div className="card">
          <div className="card-header">Odds Provider</div>
          <div className="p-4 space-y-3">
            <div className="flex items-center justify-between p-3 rounded bg-bg-input border border-[#3a444c]">
              <div>
                <div className="text-xs font-semibold text-tx-primary">SkyEx777</div>
                <div className="text-[11px] text-tx-muted">adminapi.skyex777.com</div>
              </div>
              <span className="badge badge-green">Active</span>
            </div>
            <p className="text-[11px] text-tx-muted">
              Polled every 1s (in-play) / 5s (pre-match). Implement <code className="text-primary">OddsProvider</code> interface to add new providers.
            </p>
          </div>
        </div>

        <div className="card">
          <div className="card-header">Casino Provider</div>
          <div className="p-4 space-y-3">
            <div className="flex items-center justify-between p-3 rounded bg-bg-input border border-[#3a444c]">
              <div>
                <div className="text-xs font-semibold text-tx-primary">Custom Casino API</div>
                <div className="text-[11px] text-tx-muted">Webhook: /api/casino/webhook/custom</div>
              </div>
              <span className="badge badge-green">Active</span>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-header">Maintenance</div>
          <div className="p-4 space-y-4">
            <Toggle label="Maintenance Mode"  sub="Disable user access to the platform"             danger />
            <Toggle label="Disable Betting"   sub="Stop new bets without full maintenance"           danger />
          </div>
        </div>
      </div>
    </div>
  )
}
