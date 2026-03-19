'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { matchApi } from '@/lib/api'
import { Event } from '@/types'
import { formatDate } from '@/lib/utils'
import { ChevronRight } from 'lucide-react'

const SPORT_MAP: Record<string, { name: string; eventTypeId: string; icon: string }> = {
  cricket:      { name: 'Cricket',      eventTypeId: '4', icon: '🏏' },
  football:     { name: 'Football',     eventTypeId: '1', icon: '⚽' },
  tennis:       { name: 'Tennis',       eventTypeId: '2', icon: '🎾' },
  'horse-racing': { name: 'Horse Racing', eventTypeId: '7', icon: '🏇' },
  kabaddi:      { name: 'Kabaddi',      eventTypeId: '21', icon: '🏅' },
}

export default function SportPage() {
  const { sport } = useParams<{ sport: string }>()
  const sportInfo = SPORT_MAP[sport]
  const [events, setEvents]   = useState<Event[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!sportInfo) return
    matchApi.events({ sportSlug: sport })
      .then(setEvents).catch(() => {}).finally(() => setLoading(false))
  }, [sport])

  if (!sportInfo) return (
    <div className="p-3 text-center text-tx-muted py-12">Sport not found</div>
  )

  const inplay  = events.filter(e => e.inplay)
  const upcoming = events.filter(e => !e.inplay)

  return (
    <div className="p-3">
      <div className="flex items-center gap-2 mb-3">
        <span className="text-xl">{sportInfo.icon}</span>
        <h1 className="text-sm font-bold text-tx-primary">{sportInfo.name}</h1>
        <span className="badge badge-gray">{events.length}</span>
      </div>

      {loading && <div className="card p-8 text-center text-tx-muted text-sm">Loading...</div>}

      {!loading && events.length === 0 && (
        <div className="card p-8 text-center text-tx-muted text-sm">No events available</div>
      )}

      {inplay.length > 0 && (
        <div className="card mb-3">
          <div className="card-header">
            <span className="text-loss flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-loss animate-pulse inline-block" />
              Live Now ({inplay.length})
            </span>
          </div>
          {inplay.map(ev => <EventRow key={ev.id} event={ev} />)}
        </div>
      )}

      {upcoming.length > 0 && (
        <div className="card">
          <div className="card-header">Upcoming ({upcoming.length})</div>
          {upcoming.map(ev => <EventRow key={ev.id} event={ev} />)}
        </div>
      )}
    </div>
  )
}

function EventRow({ event }: { event: Event }) {
  return (
    <Link
      href={`/event/${event.id}`}
      className="flex items-center justify-between px-3 py-2.5 border-b border-[#2a3340] last:border-0 hover:bg-bg-hover transition-colors group"
    >
      <div className="flex items-center gap-2 flex-1 min-w-0">
        {event.inplay && <span className="w-1.5 h-1.5 rounded-full bg-loss animate-pulse flex-shrink-0" />}
        <div className="min-w-0">
          <div className="text-xs font-medium text-tx-primary truncate group-hover:text-primary transition-colors">{event.name}</div>
          <div className="text-[10px] text-tx-muted">
            {event.competition} · {event.inplay ? '🔴 Live' : formatDate(event.openDate)}
          </div>
        </div>
      </div>
      <div className="flex items-center gap-2 flex-shrink-0 ml-2">
        <span className="text-[10px] text-tx-muted bg-bg-input px-2 py-0.5 rounded">
          {event.markets.length} mkts
        </span>
        <ChevronRight size={13} className="text-tx-muted group-hover:text-primary" />
      </div>
    </Link>
  )
}
