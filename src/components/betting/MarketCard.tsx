'use client'

import { useState, useEffect } from 'react'
import { ChevronDown, ChevronUp, Lock } from 'lucide-react'
import { Market, Runner } from '@/types'
import { OddsCell } from './OddsButton'
import { subscribeMarketOdds, subscribeMarketStatus } from '@/lib/websocket'
import { useOddsStore } from '@/lib/store'
import { cn } from '@/lib/utils'

interface MarketCardProps {
  market: Market
  eventName: string
  defaultOpen?: boolean
}

export default function MarketCard({ market: initialMarket, eventName, defaultOpen = true }: MarketCardProps) {
  const [open, setOpen] = useState(defaultOpen)
  const liveMarket = useOddsStore(s => s.markets[initialMarket.id])
  const market = liveMarket ?? initialMarket

  useEffect(() => {
    // Always subscribe to status changes so suspension is instant regardless of odds state
    const unsubStatus = subscribeMarketStatus(market.id)

    // Subscribe to live odds only while market is open
    let unsubOdds: (() => void) | undefined
    if (market.status === 'OPEN') {
      unsubOdds = subscribeMarketOdds(market.id)
    }

    return () => {
      unsubStatus()
      unsubOdds?.()
    }
  }, [market.id])

  const suspended = market.status === 'SUSPENDED' || market.status === 'CLOSED'

  return (
    <div className="card mb-2">
      {/* Market header */}
      <div
        className="flex items-center justify-between px-3 py-2 cursor-pointer select-none bg-tableHeader"
        onClick={() => setOpen(v => !v)}
      >
        <div className="flex items-center gap-2">
          {suspended && <Lock size={12} className="text-yellow-400" />}
          <span className="text-xs font-semibold text-white">{market.name}</span>
          {market.inplay && (
            <span className="text-[9px] bg-loss text-white px-1.5 py-0.5 rounded font-bold">LIVE</span>
          )}
          {suspended && (
            <span className="text-[9px] bg-yellow-500/20 text-yellow-400 px-1.5 py-0.5 rounded font-bold">SUSP</span>
          )}
        </div>

        <div className="flex items-center gap-4">
          {/* Column headers */}
          {open && (
            <div className="hidden sm:flex items-center gap-0.5 text-[9px] font-bold text-white/60 uppercase">
              <div className="w-[132px] text-center text-back">BACK</div>
              <div className="w-[132px] text-center text-lay">LAY</div>
            </div>
          )}
          {open ? <ChevronUp size={14} className="text-white/60" /> : <ChevronDown size={14} className="text-white/60" />}
        </div>
      </div>

      {/* Runners */}
      {open && (
        <div>
          {market.runners.map(runner => (
            <RunnerRow
              key={runner.id}
              runner={runner}
              marketId={market.id}
              marketName={market.name}
              eventName={eventName}
              suspended={suspended}
            />
          ))}
        </div>
      )}
    </div>
  )
}

function RunnerRow({
  runner, marketId, marketName, eventName, suspended,
}: {
  runner: Runner; marketId: string; marketName: string; eventName: string; suspended: boolean
}) {
  return (
    <div className={cn(
      'flex items-center justify-between px-3 py-2 border-b border-[#2a3340] last:border-0',
      'hover:bg-bg-hover transition-colors'
    )}>
      <div className="flex-1 min-w-0">
        <div className="text-xs font-medium text-tx-primary truncate">{runner.name}</div>
      </div>

      <OddsCell
        marketId={marketId}
        marketName={marketName}
        eventName={eventName}
        runnerId={runner.id}
        runnerName={runner.name}
        suspended={suspended}
        backOdds={runner.backOdds}
        layOdds={runner.layOdds}
      />
    </div>
  )
}
