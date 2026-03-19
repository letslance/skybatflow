'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { matchApi } from '@/lib/api'
import { Event } from '@/types'
import MarketCard from '@/components/betting/MarketCard'
import { formatDate } from '@/lib/utils'
import { Wifi } from 'lucide-react'

export default function EventPage() {
  const { id } = useParams<{ id: string }>()
  const [event, setEvent] = useState<Event | null>(null)
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState<'markets' | 'fancy'>('markets')

  useEffect(() => {
    matchApi.event(id).then(setEvent).catch(() => {}).finally(() => setLoading(false))
  }, [id])

  if (loading) return (
    <div className="flex items-center justify-center py-20 text-tx-muted text-sm">Loading event...</div>
  )

  if (!event) return (
    <div className="flex items-center justify-center py-20 text-tx-muted text-sm">Event not found</div>
  )

  const regularMarkets = event.markets.filter(m => m.marketType !== 'FANCY' && m.marketType !== 'BOOKMAKER2')
  const fancyMarkets   = event.markets.filter(m => m.marketType === 'FANCY' || m.marketType === 'BOOKMAKER2')

  return (
    <div className="p-3">
      {/* Event header */}
      <div className="card mb-3 p-3">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              {event.inplay && (
                <div className="flex items-center gap-1 text-[10px] bg-loss/20 text-loss px-2 py-0.5 rounded-full">
                  <Wifi size={10} />
                  <span className="font-bold">LIVE</span>
                </div>
              )}
              <span className="text-[10px] text-tx-muted">{event.competition}</span>
            </div>
            <h1 className="text-sm font-bold text-tx-primary mb-1">{event.name}</h1>
            <div className="text-[11px] text-tx-muted">
              {event.inplay ? 'In Progress' : formatDate(event.openDate)}
            </div>
          </div>

          {/* Live score */}
          {event.inplay && event.scoreHome != null && (
            <div className="text-center bg-bg-input px-4 py-2 rounded-lg">
              <div className="text-xs text-tx-muted mb-1">{event.elapsed ?? ''}</div>
              <div className="text-lg font-bold text-tx-primary">
                {event.scoreHome} – {event.scoreAway}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Tab switcher (if fancy markets) */}
      {fancyMarkets.length > 0 && (
        <div className="flex gap-1 mb-3">
          <button
            onClick={() => setTab('markets')}
            className={tab === 'markets' ? 'btn-primary btn-sm' : 'btn-outline btn-sm'}
          >
            Markets
          </button>
          <button
            onClick={() => setTab('fancy')}
            className={tab === 'fancy' ? 'btn-primary btn-sm' : 'btn-outline btn-sm'}
          >
            Fancy ({fancyMarkets.length})
          </button>
        </div>
      )}

      {/* Markets */}
      {tab === 'markets' && regularMarkets.map(market => (
        <MarketCard key={market.id} market={market} eventName={event.name} />
      ))}

      {tab === 'fancy' && fancyMarkets.map(market => (
        <MarketCard key={market.id} market={market} eventName={event.name} />
      ))}

      {event.markets.length === 0 && (
        <div className="card p-8 text-center text-tx-muted text-sm">
          No markets available
        </div>
      )}
    </div>
  )
}
