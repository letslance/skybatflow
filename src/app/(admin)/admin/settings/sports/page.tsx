'use client'

import { useEffect, useState } from 'react'
import PageHeader from '@/components/ui/PageHeader'
import { adminApi } from '@/lib/api'
import toast from 'react-hot-toast'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

interface SportConfig {
  sport:         string
  sportId:       string
  minBet:        number
  maxBet:        number
  oddsDelay:     number   // seconds — pre-match
  inplayDelay:   number   // seconds — in-play (bet delay)
  enabled:       boolean
}

const DEFAULT_SPORTS: SportConfig[] = [
  { sport: 'Cricket',      sportId: '4',       minBet: 100, maxBet: 500000, oddsDelay: 0, inplayDelay: 3,  enabled: true },
  { sport: 'Football',     sportId: '1',       minBet: 100, maxBet: 200000, oddsDelay: 0, inplayDelay: 3,  enabled: true },
  { sport: 'Tennis',       sportId: '2',       minBet: 100, maxBet: 100000, oddsDelay: 0, inplayDelay: 3,  enabled: true },
  { sport: 'Horse Racing', sportId: '7',       minBet: 100, maxBet: 100000, oddsDelay: 0, inplayDelay: 5,  enabled: true },
  { sport: 'Basketball',   sportId: '2378962', minBet: 100, maxBet:  50000, oddsDelay: 0, inplayDelay: 3,  enabled: true },
  { sport: 'Kabaddi',      sportId: '138',     minBet: 100, maxBet:  50000, oddsDelay: 0, inplayDelay: 3,  enabled: false },
  { sport: 'Table Tennis', sportId: '2593174', minBet: 100, maxBet:  50000, oddsDelay: 0, inplayDelay: 3,  enabled: false },
  { sport: 'Volleyball',   sportId: '998917',  minBet: 100, maxBet:  50000, oddsDelay: 0, inplayDelay: 3,  enabled: false },
]

export default function SportSettingsPage() {
  const [sports,  setSports]  = useState<SportConfig[]>(DEFAULT_SPORTS)
  const [saving,  setSaving]  = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    adminApi.getSportSettings()
      .then((d: any) => { if (Array.isArray(d) && d.length) setSports(d) })
      .catch(() => { /* use defaults */ })
      .finally(() => setLoading(false))
  }, [])

  function update(sportId: string, field: keyof SportConfig, value: unknown) {
    setSports(prev => prev.map(s => s.sportId === sportId ? { ...s, [field]: value } : s))
  }

  async function save() {
    setSaving(true)
    try {
      await adminApi.updateSportSettings(sports)
      toast.success('Sport settings saved')
    } catch {
      toast.error('Failed to save sport settings')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div>
      <PageHeader title="Sport Settings" subtitle="Bet limits and timing per sport">
        <Link href="/admin/settings" className="btn-outline btn-sm flex items-center gap-1">
          <ArrowLeft size={12} /> Back
        </Link>
      </PageHeader>

      <div className="card overflow-x-auto">
        <table className="data-table">
          <thead>
            <tr>
              <th>Sport</th>
              <th>Enabled</th>
              <th>Min Bet (₹)</th>
              <th>Max Bet (₹)</th>
              <th>Odds Delay (s)</th>
              <th>Inplay Delay (s)</th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr><td colSpan={6} className="text-center py-6 text-tx-muted text-xs">Loading...</td></tr>
            )}
            {!loading && sports.map(s => (
              <tr key={s.sportId}>
                <td className="font-medium">{s.sport}</td>
                <td>
                  <label className="relative inline-flex cursor-pointer">
                    <input
                      type="checkbox"
                      checked={s.enabled}
                      onChange={e => update(s.sportId, 'enabled', e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-bg-hover rounded-full peer peer-checked:bg-primary transition-colors after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-4" />
                  </label>
                </td>
                {(['minBet', 'maxBet', 'oddsDelay', 'inplayDelay'] as const).map(field => (
                  <td key={field}>
                    <input
                      type="number"
                      value={s[field] as number}
                      min={0}
                      onChange={e => update(s.sportId, field, parseFloat(e.target.value) || 0)}
                      className="input w-24 h-6 text-xs text-center"
                    />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-4">
        <button onClick={save} disabled={saving || loading} className="btn-primary">
          {saving ? 'Saving...' : 'Save Sport Settings'}
        </button>
      </div>
    </div>
  )
}
