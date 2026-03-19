'use client'

import { useEffect, useState } from 'react'
import { matchApi } from '@/lib/api'
import { Event } from '@/types'
import { Tv2, Radio } from 'lucide-react'
import Link from 'next/link'

export default function LiveTvPage() {
  const [inplay, setInplay] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)
  const [active, setActive] = useState<Event | null>(null)

  useEffect(() => {
    matchApi.inplay()
      .then(events => { setInplay(events); if (events.length > 0) setActive(events[0]) })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center gap-2">
        <Tv2 size={16} className="text-primary" />
        <h1 className="text-sm font-semibold text-tx-primary">Live TV</h1>
        <span className="flex items-center gap-1 text-[10px] text-loss font-bold ml-1">
          <Radio size={9} className="animate-pulse" /> LIVE
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Stream player */}
        <div className="lg:col-span-2">
          <div
            className="rounded border border-[#3a444c] overflow-hidden"
            style={{ background: '#111' }}
          >
            {active ? (
              <div
                className="flex flex-col items-center justify-center"
                style={{ height: 340 }}
              >
                <Tv2 size={40} className="text-tx-muted mb-3" />
                <p className="text-sm font-semibold text-tx-primary">{active.name}</p>
                <p className="text-xs text-tx-muted mt-1">Stream available for subscribed users</p>
                <Link
                  href={`/event/${active.id}`}
                  className="mt-4 btn-primary text-xs px-4 py-1.5 rounded"
                >
                  Watch &amp; Bet
                </Link>
              </div>
            ) : (
              <div
                className="flex flex-col items-center justify-center"
                style={{ height: 340 }}
              >
                <Tv2 size={40} className="text-tx-muted mb-3" />
                <p className="text-xs text-tx-muted">
                  {loading ? 'Loading...' : 'No live streams available right now'}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Live match list */}
        <div className="space-y-1">
          <div className="section-title mb-2">In-Play Events</div>
          {loading && (
            <div className="text-xs text-tx-muted p-2">Loading...</div>
          )}
          {!loading && inplay.length === 0 && (
            <div className="text-xs text-tx-muted p-2">No events in play</div>
          )}
          {inplay.map(ev => (
            <button
              key={ev.id}
              onClick={() => setActive(ev)}
              className={[
                'w-full text-left px-3 py-2 rounded text-xs transition-colors',
                active?.id === ev.id
                  ? 'bg-primary/15 text-primary border border-primary/30'
                  : 'text-tx-secondary hover:bg-bg-hover hover:text-tx-primary',
              ].join(' ')}
            >
              <div className="font-medium">{ev.name}</div>
              <div className="text-[10px] text-tx-muted mt-0.5 capitalize">
                {ev.eventTypeId?.toLowerCase?.() ?? 'sport'}
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
