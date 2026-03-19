'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { matchApi } from '@/lib/api'
import { Event } from '@/types'
import { Wifi, ChevronRight } from 'lucide-react'

export default function InplayPage() {
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    matchApi.inplay().then(setEvents).catch(() => {}).finally(() => setLoading(false))
    const interval = setInterval(() => {
      matchApi.inplay().then(setEvents).catch(() => {})
    }, 10_000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="p-3">
      <div className="flex items-center gap-2 mb-3">
        <Wifi size={14} className="text-loss animate-pulse" />
        <h1 className="text-sm font-bold text-tx-primary">In-Play</h1>
        <span className="badge-red">{events.length}</span>
      </div>

      {loading && (
        <div className="card p-8 text-center text-tx-muted text-sm">Loading...</div>
      )}

      {!loading && events.length === 0 && (
        <div className="card p-8 text-center text-tx-muted text-sm">
          No live events right now
        </div>
      )}

      <div className="space-y-2">
        {events.map(event => (
          <Link key={event.id} href={`/event/${event.id}`} className="card block hover:bg-bg-hover transition-colors">
            <div className="flex items-center justify-between p-3">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-loss animate-pulse" />
                  <span className="text-[10px] text-tx-muted">{event.competition}</span>
                </div>
                <div className="text-xs font-semibold text-tx-primary">{event.name}</div>
                {event.elapsed && (
                  <div className="text-[10px] text-loss mt-0.5">{event.elapsed}</div>
                )}
              </div>

              <div className="flex items-center gap-3">
                {event.scoreHome != null && (
                  <div className="text-center">
                    <div className="text-base font-bold text-tx-primary">
                      {event.scoreHome} – {event.scoreAway}
                    </div>
                  </div>
                )}
                <span className="text-[10px] text-tx-muted bg-bg-input px-2 py-0.5 rounded">
                  {event.markets.length} mkts
                </span>
                <ChevronRight size={13} className="text-tx-muted" />
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
