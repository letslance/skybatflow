'use client'

import { useState } from 'react'
import { X, Trash2 } from 'lucide-react'
import { useBetSlipStore, useAuthStore, useBalanceStore } from '@/lib/store'
import { betApi, walletApi } from '@/lib/api'
import { calcPotentialPayout, calcLiability, formatCurrency, cn } from '@/lib/utils'
import toast from 'react-hot-toast'

const QUICK_STAKES = [100, 500, 1000, 2000, 5000, 10000]

export default function BetSlip() {
  const { open, entries, updateStake, removeEntry, clearSlip, setOpen } = useBetSlipStore()
  const { user } = useAuthStore()
  const { setBalance } = useBalanceStore()
  const [placing, setPlacing] = useState(false)
  const [acceptOddsChange, setAcceptOddsChange] = useState(false)

  if (!open || entries.length === 0) return null

  async function handlePlaceAll() {
    const invalid = entries.find(e => !e.stake || e.stake <= 0)
    if (invalid) { toast.error('Enter stake for all bets'); return }

    setPlacing(true)

    // Place all bets in parallel — avoids serial inplay delays stacking up
    const results = await Promise.allSettled(
      entries.map(entry =>
        betApi.place({
          marketId:      entry.marketId,
          runnerId:      entry.runnerId,
          betType:       entry.betType,
          odds:          entry.odds,
          stake:         entry.stake!,
          acceptAnyOdds: acceptOddsChange,
        })
      )
    )

    setPlacing(false)

    let placed = 0
    results.forEach((result, i) => {
      if (result.status === 'fulfilled') {
        placed++
      } else {
        const err = result.reason
        const msg = err?.response?.data?.error || 'Bet placement failed'
        toast.error(`${entries[i].runnerName}: ${msg}`)
      }
    })

    if (placed > 0) {
      toast.success(`${placed} bet${placed > 1 ? 's' : ''} placed!`)
      clearSlip()

      // Refresh balance immediately — exposure has been reserved by the wallet service
      walletApi.balance().then(setBalance).catch(() => { /* non-critical */ })
    }
  }

  const totalStake    = entries.reduce((s, e) => s + (e.stake || 0), 0)
  const totalPayout   = entries.reduce((s, e) => s + (e.stake ? calcPotentialPayout(e.odds, e.stake) : 0), 0)
  const totalLiab     = entries
    .filter(e => e.betType === 'LAY')
    .reduce((s, e) => s + (e.stake ? calcLiability(e.odds, e.stake) : 0), 0)

  return (
    <>
      {/* Backdrop on mobile */}
      <div className="fixed inset-0 bg-black/50 z-40 md:hidden" onClick={() => setOpen(false)} />

      <div className="betslip-enter fixed bottom-0 right-0 w-[320px] md:w-[280px] z-50 rounded-tl-lg overflow-hidden shadow-2xl"
           style={{ background: '#1a2025', border: '1px solid #3a444c', borderBottom: 0, borderRight: 0 }}>

        {/* Header */}
        <div className="flex items-center justify-between px-3 py-2 border-b border-[#3a444c]"
             style={{ background: '#126e51' }}>
          <span className="text-xs font-bold text-white uppercase tracking-wide">
            Bet Slip ({entries.length})
          </span>
          <div className="flex items-center gap-1">
            <button onClick={clearSlip} className="p-1 rounded hover:bg-white/10 text-white/70 hover:text-white">
              <Trash2 size={13} />
            </button>
            <button onClick={() => setOpen(false)} className="p-1 rounded hover:bg-white/10 text-white/70 hover:text-white">
              <X size={14} />
            </button>
          </div>
        </div>

        {/* Entries */}
        <div className="max-h-[60vh] overflow-y-auto">
          {entries.map((entry, i) => (
            <BetEntry key={i} entry={entry} index={i} onRemove={removeEntry} onStake={updateStake} />
          ))}
        </div>

        {/* Accept odds change */}
        <div className="px-3 py-2 border-t border-[#3a444c] flex items-center gap-2">
          <input
            type="checkbox"
            id="accept-odds"
            checked={acceptOddsChange}
            onChange={e => setAcceptOddsChange(e.target.checked)}
            className="accent-primary"
          />
          <label htmlFor="accept-odds" className="text-[11px] text-tx-secondary cursor-pointer">
            Accept any odds change
          </label>
        </div>

        {/* Totals */}
        <div className="px-3 py-2 bg-bg-surface border-t border-[#3a444c] space-y-1">
          <div className="flex justify-between text-[11px]">
            <span className="text-tx-muted">Total Stake</span>
            <span className="font-semibold text-tx-primary">₹{formatCurrency(totalStake)}</span>
          </div>
          <div className="flex justify-between text-[11px]">
            <span className="text-tx-muted">Potential Payout</span>
            <span className="font-semibold text-win">₹{formatCurrency(totalPayout)}</span>
          </div>
          {totalLiab > 0 && (
            <div className="flex justify-between text-[11px]">
              <span className="text-tx-muted">Lay Liability</span>
              <span className="font-semibold text-loss">(₹{formatCurrency(totalLiab)})</span>
            </div>
          )}
        </div>

        {/* Place button */}
        <div className="px-3 py-3 border-t border-[#3a444c]">
          <button
            onClick={handlePlaceAll}
            disabled={placing}
            className="btn-primary w-full py-2 text-sm"
          >
            {placing ? 'Placing...' : `Place ${entries.length} Bet${entries.length > 1 ? 's' : ''}`}
          </button>
        </div>
      </div>
    </>
  )
}

function BetEntry({
  entry, index, onRemove, onStake,
}: {
  entry: import('@/types').BetSlipEntry
  index: number
  onRemove: (i: number) => void
  onStake: (i: number, stake: number) => void
}) {
  const payout = entry.stake ? calcPotentialPayout(entry.odds, entry.stake) : 0
  const liability = entry.betType === 'LAY' && entry.stake
    ? calcLiability(entry.odds, entry.stake)
    : 0

  return (
    <div
      className="px-3 py-2 border-b border-[#2a3340]"
      style={{ background: entry.betType === 'BACK' ? 'rgba(249,148,186,0.06)' : 'rgba(114,187,239,0.06)' }}
    >
      <div className="flex items-start justify-between mb-1.5">
        <div>
          <div className="text-[11px] font-semibold text-tx-primary leading-tight">{entry.runnerName}</div>
          <div className="text-[10px] text-tx-muted leading-tight">{entry.marketName}</div>
          <div className="flex items-center gap-1.5 mt-1">
            <span className={cn(
              'text-[10px] font-bold px-1.5 py-0.5 rounded',
              entry.betType === 'BACK' ? 'bg-back text-bg-body' : 'bg-lay text-bg-body'
            )}>
              {entry.betType}
            </span>
            <span className="text-[12px] font-bold text-tx-primary">@{entry.odds}</span>
          </div>
        </div>
        <button onClick={() => onRemove(index)} className="p-1 text-tx-muted hover:text-loss transition-colors">
          <X size={12} />
        </button>
      </div>

      {/* Stake input */}
      <div className="flex items-center gap-2 mb-1.5">
        <div className="relative flex-1">
          <span className="absolute left-2 top-1/2 -translate-y-1/2 text-[11px] text-tx-muted">₹</span>
          <input
            type="number"
            placeholder="Stake"
            value={entry.stake || ''}
            onChange={e => onStake(index, parseFloat(e.target.value) || 0)}
            className="input pl-5 h-7 text-xs"
          />
        </div>
        {payout > 0 && (
          <div className="text-right text-[10px]">
            <div className="text-tx-muted">
              {entry.betType === 'LAY' ? 'Liability' : 'Payout'}
            </div>
            <div className={cn('font-semibold', entry.betType === 'LAY' ? 'text-loss' : 'text-win')}>
              ₹{formatCurrency(entry.betType === 'LAY' ? liability : payout)}
            </div>
          </div>
        )}
      </div>

      {/* Quick stakes */}
      <div className="flex gap-1 flex-wrap">
        {QUICK_STAKES.map(s => (
          <button
            key={s}
            onClick={() => onStake(index, s)}
            className="px-2 py-0.5 text-[10px] rounded bg-bg-hover hover:bg-bg-surface text-tx-secondary hover:text-tx-primary transition-colors"
          >
            {s >= 1000 ? `${s / 1000}k` : s}
          </button>
        ))}
      </div>
    </div>
  )
}
