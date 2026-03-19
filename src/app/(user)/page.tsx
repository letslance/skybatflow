'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Flame, ChevronRight } from 'lucide-react'
import { matchApi } from '@/lib/api'
import { Event } from '@/types'
import { formatDate } from '@/lib/utils'

const SPORT_ICONS: Record<string, string> = {
  '4': '🏏',  // Cricket
  '1': '⚽',  // Football
  '2': '🎾',  // Tennis
  '7': '🏇',  // Horse Racing
}

function EventRow({ event }: { event: Event }) {
  const firstMarket = event.markets?.[0]
  const runners = firstMarket?.runners ?? []

  return (
    <Link
      href={`/event/${event.id}`}
      className="flex items-center justify-between px-3 py-2.5 border-b border-[#2a3340] hover:bg-bg-hover transition-colors group"
    >
      <div className="flex items-center gap-2 flex-1 min-w-0">
        {event.inplay && (
          <span className="flex-shrink-0 w-1.5 h-1.5 rounded-full bg-loss animate-pulse" />
        )}
        <div className="min-w-0">
          <div className="text-xs font-medium text-tx-primary truncate group-hover:text-primary transition-colors">
            {event.name}
          </div>
          <div className="text-[10px] text-tx-muted">
            {event.competition} · {event.inplay ? '🔴 Live' : formatDate(event.openDate)}
          </div>
        </div>
      </div>
      <div className="flex items-center gap-2 flex-shrink-0 ml-2">
        {runners.slice(0, 2).map(r => (
          <div key={r.id} className="text-right">
            <div className="text-[10px] text-tx-muted truncate max-w-[60px]">{r.name}</div>
            <div className="text-[11px] font-bold" style={{ color: '#f994ba' }}>
              {r.backOdds?.[0]?.price?.toFixed(2) ?? '-'}
            </div>
          </div>
        ))}
        <ChevronRight size={13} className="text-tx-muted group-hover:text-primary" />
      </div>
    </Link>
  )
}

function SportSection({ title, icon, events }: { title: string; icon: string; events: Event[] }) {
  if (!events.length) return null
  return (
    <div className="card mb-3">
      <div className="card-header">
        <div className="flex items-center gap-2">
          <span>{icon}</span>
          <span>{title}</span>
          <span className="text-primary">({events.length})</span>
        </div>
        <ChevronRight size={12} />
      </div>
      <div>
        {events.slice(0, 8).map(ev => <EventRow key={ev.id} event={ev} />)}
        {events.length > 8 && (
          <div className="px-3 py-2 text-center text-[11px] text-primary hover:underline cursor-pointer">
            View all {events.length} matches
          </div>
        )}
      </div>
    </div>
  )
}

export default function HomePage() {
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    matchApi.events().then(setEvents).catch(() => {}).finally(() => setLoading(false))
  }, [])

  const inplay    = events.filter(e => e.inplay)
  const cricket   = events.filter(e => !e.inplay && e.sportSlug === 'cricket')
  const football  = events.filter(e => !e.inplay && e.sportSlug === 'football')
  const tennis    = events.filter(e => !e.inplay && e.sportSlug === 'tennis')
  const other     = events.filter(e => !e.inplay && !['cricket','football','tennis'].includes(e.sportSlug ?? ''))

  return (
    <div className="p-3">
      {/* Live ticker */}
      {inplay.length > 0 && (
        <div className="ticker-wrap rounded mb-3">
          <div className="ticker-inner py-1.5 px-3">
            {[...inplay, ...inplay].map((ev, i) => (
              <Link key={i} href={`/event/${ev.id}`} className="flex items-center gap-2 text-[11px] text-tx-secondary hover:text-primary transition-colors">
                <span className="w-1.5 h-1.5 rounded-full bg-loss animate-pulse flex-shrink-0" />
                <span>{ev.name}</span>
                {ev.scoreHome != null && (
                  <span className="font-bold text-tx-primary">{ev.scoreHome} - {ev.scoreAway}</span>
                )}
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* In-Play section */}
      {inplay.length > 0 && (
        <div className="card mb-3">
          <div className="card-header">
            <div className="flex items-center gap-2 text-loss">
              <Flame size={13} />
              <span>In-Play</span>
              <span className="text-[10px] bg-loss text-white px-1.5 rounded">{inplay.length}</span>
            </div>
          </div>
          {inplay.map(ev => <EventRow key={ev.id} event={ev} />)}
        </div>
      )}

      {loading && (
        <div className="text-center py-12 text-tx-muted text-sm">Loading events...</div>
      )}

      <SportSection title="Cricket" icon="🏏" events={cricket} />
      <SportSection title="Football" icon="⚽" events={football} />
      <SportSection title="Tennis" icon="🎾" events={tennis} />
      {other.length > 0 && <SportSection title="Other Sports" icon="🏆" events={other} />}
    </div>
  )
}
