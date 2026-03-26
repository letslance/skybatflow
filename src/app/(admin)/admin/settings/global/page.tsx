'use client'

import { useEffect, useRef, useState } from 'react'
import PageHeader from '@/components/ui/PageHeader'
import { adminApi } from '@/lib/api'
import { applyTheme } from '@/lib/theme'
import toast from 'react-hot-toast'
import Link from 'next/link'
import { ArrowLeft, Upload } from 'lucide-react'

// ─── Shared sub-components ────────────────────────────────────────────────────
function Toggle({ checked, onChange, danger }: { checked: boolean; onChange: (v: boolean) => void; danger?: boolean }) {
  return (
    <label className="relative inline-flex cursor-pointer">
      <input type="checkbox" checked={checked} onChange={e => onChange(e.target.checked)} className="sr-only peer" />
      <div className={`w-9 h-5 rounded-full peer transition-colors after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-4 ${danger ? 'bg-bg-hover peer-checked:bg-loss' : 'bg-bg-hover peer-checked:bg-primary'}`} />
    </label>
  )
}

function SectionCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="card">
      <div className="card-header">{title}</div>
      <div className="p-4">{children}</div>
    </div>
  )
}

// ─── Image upload field ────────────────────────────────────────────────────────
function AssetUpload({
  label, hint, previewUrl, onUploaded,
}: {
  label: string
  hint: string
  previewUrl: string
  onUploaded: (url: string) => void
}) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const assetKey = label.toLowerCase().replace(/ /g, '_') as 'logo' | 'favicon' | 'welcome_banner'

  async function handleFile(file: File) {
    setUploading(true)
    try {
      const result = await adminApi.uploadBrandingAsset(assetKey, file)
      onUploaded(result.url)
      toast.success(`${label} uploaded`)
    } catch {
      toast.error(`Failed to upload ${label}`)
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="space-y-2">
      <label className="block text-xs text-tx-secondary">{label} <span className="text-tx-muted">({hint})</span></label>
      <div className="flex items-center gap-3">
        {previewUrl && (
          <img src={previewUrl} alt={label} className="h-10 max-w-[120px] object-contain border border-[#3a444c] rounded p-1 bg-bg-input" />
        )}
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="btn-outline btn-sm flex items-center gap-1"
        >
          <Upload size={11} />
          {uploading ? 'Uploading...' : 'Upload'}
        </button>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f) }}
        />
      </div>
    </div>
  )
}

// ─── Page ──────────────────────────────────────────────────────────────────────
export default function GlobalSettingsPage() {
  // ── Site info ─────────────────────────────────────────────
  const [siteTitle,      setSiteTitle]      = useState('BetPlatform')
  const [siteMessage,    setSiteMessage]    = useState('')

  // ── Branding assets ───────────────────────────────────────
  const [logoUrl,         setLogoUrl]        = useState('')
  const [faviconUrl,      setFaviconUrl]     = useState('')
  const [welcomeBanner,   setWelcomeBanner]  = useState('')
  const [primaryColor,    setPrimaryColor]   = useState('#03b37f')
  const [secondaryColor,  setSecondaryColor] = useState('#126e51')

  // ── Feature toggles ───────────────────────────────────────
  const [signupEnabled,   setSignupEnabled]   = useState(true)
  const [maintenanceMode, setMaintenanceMode] = useState(false)
  const [bettingDisabled, setBettingDisabled] = useState(false)
  const [casinoDisabled,  setCasinoDisabled]  = useState(false)
  const [showCashout,     setShowCashout]     = useState(true)
  const [paymentGateway,  setPaymentGateway]  = useState('0')
  const [withdrawUrl,     setWithdrawUrl]     = useState('')

  // ── Default stake limits ──────────────────────────────────
  const [minStack,      setMinStack]      = useState('100')
  const [maxStack,      setMaxStack]      = useState('500000')
  const [fancyMinStack, setFancyMinStack] = useState('100')
  const [fancyMaxStack, setFancyMaxStack] = useState('100000')
  const [defaultMaxMarketExposure, setDefaultMaxMarketExposure] = useState('100000')

  // ── Social links ──────────────────────────────────────────
  const [fbUrl, setFbUrl]   = useState('')
  const [igUrl, setIgUrl]   = useState('')
  const [tgUrl, setTgUrl]   = useState('')
  const [waUrl, setWaUrl]   = useState('')
  const [twUrl, setTwUrl]   = useState('')

  // ── Transaction code + loading ────────────────────────────
  const [txnCode, setTxnCode] = useState('')
  const [saving,  setSaving]  = useState(false)

  // ── Load current settings on mount ───────────────────────
  useEffect(() => {
    adminApi.getSettings()
      .then((d: any) => {
        if (!d) return
        setSiteTitle(d.siteTitle      ?? 'BetPlatform')
        setSiteMessage(d.siteMessage  ?? '')
        setLogoUrl(d.logoUrl          ?? '')
        setFaviconUrl(d.faviconUrl    ?? '')
        setWelcomeBanner(d.welcomeBanner ?? '')
        setPrimaryColor(d.primaryColor   ?? '#03b37f')
        setSecondaryColor(d.secondaryColor ?? '#126e51')
        setSignupEnabled(d.signupEnabled   ?? true)
        setMaintenanceMode(d.maintenanceMode ?? false)
        setBettingDisabled(d.bettingDisabled ?? false)
        setCasinoDisabled(d.casinoDisabled   ?? false)
        setShowCashout(d.showCashout         ?? true)
        setPaymentGateway(String(d.paymentGateway ?? '0'))
        setWithdrawUrl(d.withdrawUrl ?? '')
        setMinStack(String(d.minStack        ?? 100))
        setMaxStack(String(d.maxStack        ?? 500000))
        setFancyMinStack(String(d.fancyMinStack ?? 100))
        setFancyMaxStack(String(d.fancyMaxStack ?? 100000))
        setDefaultMaxMarketExposure(String(d.defaultMaxMarketExposure ?? 100000))
        setFbUrl(d.fbUrl ?? ''); setIgUrl(d.igUrl ?? '')
        setTgUrl(d.tgUrl ?? ''); setWaUrl(d.waUrl ?? '')
        setTwUrl(d.twUrl ?? '')
      })
      .catch(() => { /* keep defaults */ })
  }, [])

  // ── Save ──────────────────────────────────────────────────
  async function save() {
    if (!/^\d{6}$/.test(txnCode)) {
      toast.error('Enter your 6-digit transaction code')
      return
    }
    setSaving(true)
    try {
      await adminApi.updateSettings({
        siteTitle, siteMessage,
        logoUrl, faviconUrl, welcomeBanner,
        primaryColor, secondaryColor,
        signupEnabled, maintenanceMode, bettingDisabled, casinoDisabled,
        showCashout, paymentGateway, withdrawUrl,
        minStack:      parseFloat(minStack)      || 100,
        maxStack:      parseFloat(maxStack)      || 500000,
        fancyMinStack: parseFloat(fancyMinStack) || 100,
        fancyMaxStack: parseFloat(fancyMaxStack) || 100000,
        defaultMaxMarketExposure: parseFloat(defaultMaxMarketExposure) || 100000,
        fbUrl, igUrl, tgUrl, waUrl, twUrl,
      }, txnCode)

      // Apply brand colors immediately — no page reload needed
      applyTheme({ primaryColor, secondaryColor })
      toast.success('Settings saved')
      setTxnCode('')
    } catch (e: any) {
      const msg = e?.response?.data?.message || e?.response?.data?.error || 'Failed to save settings'
      toast.error(msg)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div>
      <PageHeader title="Global Settings" subtitle="Tenant-wide platform configuration">
        <Link href="/admin/settings" className="btn-outline btn-sm flex items-center gap-1">
          <ArrowLeft size={12} /> Back
        </Link>
      </PageHeader>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

        {/* Site info */}
        <SectionCard title="Site Information">
          <div className="space-y-3">
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
        </SectionCard>

        {/* Branding */}
        <SectionCard title="Branding">
          <div className="space-y-4">
            <AssetUpload label="Logo"           hint="185×45 PNG"  previewUrl={logoUrl}       onUploaded={setLogoUrl} />
            <AssetUpload label="Favicon"        hint="32×32 ICO"   previewUrl={faviconUrl}    onUploaded={setFaviconUrl} />
            <AssetUpload label="Welcome Banner" hint="1200×300 JPG" previewUrl={welcomeBanner} onUploaded={setWelcomeBanner} />
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-tx-secondary mb-1">Primary Color</label>
                <div className="flex items-center gap-2">
                  <input type="color" value={primaryColor} onChange={e => setPrimaryColor(e.target.value)} className="h-8 w-14 rounded cursor-pointer border border-[#3a444c] bg-bg-input" />
                  <input value={primaryColor} onChange={e => setPrimaryColor(e.target.value)} className="input flex-1 font-mono text-xs" placeholder="#03b37f" />
                </div>
              </div>
              <div>
                <label className="block text-xs text-tx-secondary mb-1">Secondary Color</label>
                <div className="flex items-center gap-2">
                  <input type="color" value={secondaryColor} onChange={e => setSecondaryColor(e.target.value)} className="h-8 w-14 rounded cursor-pointer border border-[#3a444c] bg-bg-input" />
                  <input value={secondaryColor} onChange={e => setSecondaryColor(e.target.value)} className="input flex-1 font-mono text-xs" placeholder="#126e51" />
                </div>
              </div>
            </div>
          </div>
        </SectionCard>

        {/* Platform toggles */}
        <SectionCard title="Platform Controls">
          <div className="space-y-4">
            {[
              { label: 'User Sign-Up',    sub: 'Allow new user registrations',              val: signupEnabled,   set: setSignupEnabled,   danger: false },
              { label: 'Maintenance',     sub: 'Show maintenance page to all users',         val: maintenanceMode, set: setMaintenanceMode, danger: true  },
              { label: 'Disable Betting', sub: 'Block new bet placements',                   val: bettingDisabled, set: setBettingDisabled, danger: true  },
              { label: 'Disable Casino',  sub: 'Block casino game launches',                 val: casinoDisabled,  set: setCasinoDisabled,  danger: true  },
              { label: 'Show Cashout',    sub: 'Display cashout option on active bets',      val: showCashout,     set: setShowCashout,     danger: false },
            ].map(item => (
              <div key={item.label} className="flex items-center justify-between">
                <div>
                  <div className="text-xs font-medium text-tx-primary">{item.label}</div>
                  <div className="text-[11px] text-tx-muted">{item.sub}</div>
                </div>
                <Toggle checked={item.val} onChange={item.set} danger={item.danger} />
              </div>
            ))}
            <div>
              <label className="block text-xs text-tx-secondary mb-1">Payment Gateway</label>
              <select value={paymentGateway} onChange={e => setPaymentGateway(e.target.value)} className="select">
                <option value="0">Inactive</option>
                <option value="1">Manual Payment</option>
                <option value="2">INR Gateway</option>
                <option value="3">BDT Gateway</option>
              </select>
            </div>
            <div>
              <label className="block text-xs text-tx-secondary mb-1">Withdraw URL</label>
              <input value={withdrawUrl} onChange={e => setWithdrawUrl(e.target.value)} className="input text-xs" placeholder="https://..." />
            </div>
          </div>
        </SectionCard>

        {/* Default stake limits — cascade to new users */}
        <SectionCard title="Default Bet Limits (applied to new users)">
          <p className="text-[11px] text-tx-muted mb-3">These defaults are inherited by newly created users. Individual limits can be overridden per user.</p>
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: 'Match Min Stake (₹)',     val: minStack,      set: setMinStack },
              { label: 'Match Max Stake (₹)',     val: maxStack,      set: setMaxStack },
              { label: 'Fancy Min Stake (₹)',     val: fancyMinStack, set: setFancyMinStack },
              { label: 'Fancy Max Stake (₹)',     val: fancyMaxStack, set: setFancyMaxStack },
              { label: 'Max Market Exposure (₹)', val: defaultMaxMarketExposure, set: setDefaultMaxMarketExposure },
            ].map(f => (
              <div key={f.label}>
                <label className="block text-xs text-tx-secondary mb-1">{f.label}</label>
                <input type="number" min="1" value={f.val} onChange={e => f.set(e.target.value)} className="input" />
              </div>
            ))}
          </div>
        </SectionCard>

        {/* Social links */}
        <SectionCard title="Social Links">
          <div className="space-y-3">
            {[
              { label: 'Facebook',  val: fbUrl, set: setFbUrl, ph: 'https://facebook.com/...' },
              { label: 'Instagram', val: igUrl, set: setIgUrl, ph: 'https://instagram.com/...' },
              { label: 'Twitter',   val: twUrl, set: setTwUrl, ph: 'https://twitter.com/...' },
              { label: 'Telegram',  val: tgUrl, set: setTgUrl, ph: 'https://t.me/...' },
              { label: 'WhatsApp',  val: waUrl, set: setWaUrl, ph: 'https://wa.me/91...' },
            ].map(s => (
              <div key={s.label}>
                <label className="block text-xs text-tx-secondary mb-1">{s.label}</label>
                <input value={s.val} onChange={e => s.set(e.target.value)} className="input text-xs" placeholder={s.ph} />
              </div>
            ))}
          </div>
        </SectionCard>

      </div>

      {/* Transaction code + Save */}
      <div className="mt-4 flex items-center gap-3">
        <input
          type="password"
          maxLength={6}
          value={txnCode}
          onChange={e => setTxnCode(e.target.value.replace(/\D/g, ''))}
          className="input w-40"
          placeholder="Transaction code"
        />
        <button onClick={save} disabled={saving} className="btn-primary">
          {saving ? 'Saving...' : 'Save All Settings'}
        </button>
      </div>
    </div>
  )
}
