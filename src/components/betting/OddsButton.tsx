'use client'

import { cn } from '@/lib/utils'
import { useBetSlipStore } from '@/lib/store'
import { BetType } from '@/types'

interface OddsButtonProps {
  marketId: string
  marketName: string
  eventName: string
  runnerId: string
  runnerName: string
  betType: BetType
  price?: number
  size?: number
  suspended?: boolean
  className?: string
}

export default function OddsButton({
  marketId, marketName, eventName,
  runnerId, runnerName, betType,
  price, size, suspended, className,
}: OddsButtonProps) {
  const { addEntry } = useBetSlipStore()

  if (suspended || !price) {
    return (
      <div className={cn('odds-btn-suspended', className)}>
        <span className="text-[10px]">{suspended ? 'SUSP' : '-'}</span>
      </div>
    )
  }

  function handleClick() {
    addEntry({ marketId, marketName, eventName, runnerId, runnerName, betType, odds: price! })
  }

  return (
    <button
      onClick={handleClick}
      className={cn(
        betType === 'BACK' ? 'odds-btn-back' : 'odds-btn-lay',
        className
      )}
    >
      <span className="text-[13px] leading-none">{price.toFixed(2)}</span>
      {size != null && (
        <span className="text-[9px] font-normal opacity-80 leading-none mt-0.5">
          {size >= 1000 ? `${(size / 1000).toFixed(1)}k` : size}
        </span>
      )}
    </button>
  )
}

// Compact odds cell for market tables (shows 3-back + 3-lay)
export function OddsCell({
  marketId, marketName, eventName,
  runnerId, runnerName, suspended,
  backOdds = [], layOdds = [],
}: {
  marketId: string; marketName: string; eventName: string
  runnerId: string; runnerName: string; suspended: boolean
  backOdds?: { price: number; size: number }[]
  layOdds?: { price: number; size: number }[]
}) {
  const best3back = [...backOdds].sort((a, b) => b.price - a.price).slice(0, 3).reverse()
  const best3lay  = [...layOdds].sort((a, b) => a.price - b.price).slice(0, 3)

  // Pad to 3
  while (best3back.length < 3) best3back.unshift({ price: 0, size: 0 })
  while (best3lay.length  < 3) best3lay.push({ price: 0, size: 0 })

  return (
    <div className="flex items-center gap-0.5">
      {best3back.map((o, i) => (
        <OddsButton
          key={`b${i}`}
          marketId={marketId} marketName={marketName} eventName={eventName}
          runnerId={runnerId} runnerName={runnerName}
          betType="BACK"
          price={o.price || undefined}
          size={o.size || undefined}
          suspended={suspended}
          className="min-w-[44px]"
        />
      ))}
      {best3lay.map((o, i) => (
        <OddsButton
          key={`l${i}`}
          marketId={marketId} marketName={marketName} eventName={eventName}
          runnerId={runnerId} runnerName={runnerName}
          betType="LAY"
          price={o.price || undefined}
          size={o.size || undefined}
          suspended={suspended}
          className="min-w-[44px]"
        />
      ))}
    </div>
  )
}
