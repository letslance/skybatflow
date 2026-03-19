'use client'

import { useEffect, useState } from 'react'
import PageHeader from '@/components/ui/PageHeader'
import { adminApi } from '@/lib/api'
import toast from 'react-hot-toast'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

function Toggle({ checked, onChange, danger }: { checked: boolean; onChange: (v: boolean) => void; danger?: boolean }) {
  return (
    <label className="relative inline-flex cursor-pointer">
      <input type="checkbox" checked={checked} onChange={e => onChange(e.target.checked)} className="sr-only peer" />
      <div className={`w-9 h-5 rounded-full peer transition-colors after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-4 ${danger ? 'bg-bg-hover peer-checked:bg-loss' : 'bg-bg-hover peer-checked:bg-primary'}`} />
    </label>
  )
}

export default function GlobalSettingsPage() {
  const [saving,          setSaving]          = useState(false)
  const [signupEnabled,   setSignupEnabled]   = useState(true)
  const [maintenanceMode, setMaintenanceMode] = useState(false)
  const [bettingDisabled, setBettingDisabled] = useState(false)
  const [casinoDisabled,  setCasinoDisabled]  = useState(false)
  const [siteTitle,       setSiteTitle]       = useState('BetPlatform')
  const [siteMessage,     setSiteMessage]     = useState('')
  const [fbUrl,           setFbUrl]           = useState('')
  const [igUrl,           setIgUrl]           = useState('')
  const [tgUrl,           setTgUrl]           = useState('')
  const [waUrl,           setWaUrl]           = useState('')
  const [minStack,        setMinStack]        = useState('100')
  const [maxStack,        setMaxStack]        = useState('500000')
  const [fancyMinStack,   setFancyMinStack]   = useState('100')
  const [fancyMaxStack,   setFancyMaxStack]   = useState('100000')

  useEffect(() => {
    adminApi.getSettings()
      .then((d: any) => {
        if (!d) return
        setSignupEnabled(d.signupEnabled   ?? true)
        setMaintenanceMode(d.maintenanceMode ?? false)
        setBettingDisabled(d.bettingDisabled ?? false)
        setCasinoDisabled(d.casinoDisabled   ?? false)
        setSiteTitle(d.siteTitle    ?? 'BetPlatform')
        setSiteMessage(d.siteMessage ?? '')
        setFbUrl(d.fbUrl ?? ''); setIgUrl(d.igUrl ?? '')
        setTgUrl(d.tgUrl ?? ''); setWaUrl(d.waUrl ?? '')
        setMinStack(String(d.minStack        ?? 100))
        setMaxStack(String(d.maxStack        ?? 500000))
        setFancyMinStack(String(d.fancyMinStack ?? 100))
        setFancyMaxStack(String(d.fancyMaxStack ?? 100000))
      })
      .catch(() => { /* use defaults */ })
  }, [])

  async function save() {
    setSaving(true)
    try {
      await adminApi.updateSettings({
        signupEnabled, maintenanceMode, bettingDisabled, casinoDisabled,
        siteTitle, siteMessage,
        fbUrl, igUrl, tgUrl, waUrl,
        minStack:      parseFloat(minStack),
        maxStack:      parseFloat(maxStack),
        fancyMinStack: parseFloat(fancyMinStack),
        fancyMaxStack: parseFloat(fancyMaxStack),
      })
      toast.success('Settings saved')
    } catch {
      toast.error('Failed to save settings')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div>
      <PageHeader title="Global Settings" subtitle="Site-wide platform configuration">
        <Link href="/admin/settings" className="btn-outline btn-sm flex items-center gap-1">
          <ArrowLeft size={12} /> Back
        </Link>
      </PageHeader>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

        {/* Platform toggles */}
        <div className="card">
          <div className="card-header">Platform Controls</div>
          <div className="p-4 space-y-4">
            {[
              { label: 'User Sign-Up',   sub: 'Allow new user registrations',         val: signupEnabled,   set: setSignupEnabled,   danger: false },
              { label: 'Maintenance',    sub: 'Show maintenance page to all users',    val: maintenanceMode, set: setMaintenanceMode, danger: true  },
              { label: 'Disable Betting',sub: 'Block new bet placements (casino still active)', val: bettingDisabled, set: setBettingDisabled, danger: true },
              { label: 'Disable Casino', sub: 'Block casino game launches',             val: casinoDisabled,  set: setCasinoDisabled,  danger: true  },
            ].map(item => (
              <div key={item.label} className="flex items-center justify-between">
                <div>
                  <div className="text-xs font-medium text-tx-primary">{item.label}</div>
                  <div className="text-[11px] text-tx-muted">{item.sub}</div>
                </div>
                <Toggle checked={item.val} onChange={item.set} danger={item.danger} />
              </div>
            ))}
          </div>
        </div>

        {/* Site info */}
        <div className="card">
          <div className="card-header">Site Information</div>
          <div className="p-4 space-y-3">
            <div>
              <label className="block text-xs text-tx-secondary mb-1">Site Title</label>
              <input value={siteTitle} onChange={e => setSiteTitle(e.target.value)} className="input" placeholder="BetPlatform" />
            </div>
            <div>
              <label className="block text-xs text-tx-secondary mb-1">Site Announcement / Message</label>
              <textarea
                value={siteMessage}
                onChange={e => setSiteMessage(e.target.value)}
                className="input resize-none h-20 text-xs"
                placeholder="Banner message shown to all users..."
              />
            </div>
          </div>
        </div>

        {/* Default stake limits */}
        <div className="card">
          <div className="card-header">Default Stake Limits</div>
          <div className="p-4 grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-tx-secondary mb-1">Match Min Stack (₹)</label>
              <input type="number" value={minStack} onChange={e => setMinStack(e.target.value)} min="1" className="input" />
            </div>
            <div>
              <label className="block text-xs text-tx-secondary mb-1">Match Max Stack (₹)</label>
              <input type="number" value={maxStack} onChange={e => setMaxStack(e.target.value)} min="1" className="input" />
            </div>
            <div>
              <label className="block text-xs text-tx-secondary mb-1">Fancy Min Stack (₹)</label>
              <input type="number" value={fancyMinStack} onChange={e => setFancyMinStack(e.target.value)} min="1" className="input" />
            </div>
            <div>
              <label className="block text-xs text-tx-secondary mb-1">Fancy Max Stack (₹)</label>
              <input type="number" value={fancyMaxStack} onChange={e => setFancyMaxStack(e.target.value)} min="1" className="input" />
            </div>
          </div>
        </div>

        {/* Social links */}
        <div className="card">
          <div className="card-header">Social Links</div>
          <div className="p-4 space-y-3">
            {[
              { label: 'Facebook',  val: fbUrl, set: setFbUrl, ph: 'https://facebook.com/...' },
              { label: 'Instagram', val: igUrl, set: setIgUrl, ph: 'https://instagram.com/...' },
              { label: 'Telegram',  val: tgUrl, set: setTgUrl, ph: 'https://t.me/...' },
              { label: 'WhatsApp',  val: waUrl, set: setWaUrl, ph: 'https://wa.me/...' },
            ].map(s => (
              <div key={s.label}>
                <label className="block text-xs text-tx-secondary mb-1">{s.label}</label>
                <input value={s.val} onChange={e => s.set(e.target.value)} className="input text-xs" placeholder={s.ph} />
              </div>
            ))}
          </div>
        </div>

      </div>

      <div className="mt-4">
        <button onClick={save} disabled={saving} className="btn-primary">
          {saving ? 'Saving...' : 'Save All Settings'}
        </button>
      </div>
    </div>
  )
}
