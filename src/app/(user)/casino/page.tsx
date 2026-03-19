'use client'

import { useEffect, useState } from 'react'
import { casinoApi } from '@/lib/api'
import { CasinoGame } from '@/types'
import { Gamepad2, Search } from 'lucide-react'
import toast from 'react-hot-toast'

const CATEGORIES = ['ALL', 'LIVE', 'SLOTS', 'TABLE', 'CRASH']

export default function CasinoPage() {
  const [games, setGames]       = useState<CasinoGame[]>([])
  const [loading, setLoading]   = useState(true)
  const [category, setCategory] = useState('ALL')
  const [search, setSearch]     = useState('')
  const [launching, setLaunching] = useState<string | null>(null)

  useEffect(() => {
    casinoApi.games().then(setGames).catch(() => {}).finally(() => setLoading(false))
  }, [])

  async function handleLaunch(game: CasinoGame) {
    setLaunching(game.id)
    try {
      const res = await casinoApi.launch(game.id, game.provider)
      window.open(res.launchUrl, '_blank', 'noopener')
    } catch (e: any) {
      toast.error(e?.response?.data?.error || 'Failed to launch game')
    } finally {
      setLaunching(null)
    }
  }

  const filtered = games
    .filter(g => category === 'ALL' || g.category === category)
    .filter(g => !search || g.name.toLowerCase().includes(search.toLowerCase()))

  return (
    <div className="p-3">
      <div className="flex items-center gap-2 mb-3">
        <Gamepad2 size={16} className="text-primary" />
        <h1 className="text-sm font-bold text-tx-primary">Casino</h1>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-2 mb-4 flex-wrap">
        <div className="flex gap-1">
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={cat === category ? 'btn-primary btn-sm' : 'btn-outline btn-sm'}
            >
              {cat}
            </button>
          ))}
        </div>
        <div className="relative ml-auto">
          <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-tx-muted" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search games..."
            className="input pl-7 h-7 text-xs w-44"
          />
        </div>
      </div>

      {/* Game grid */}
      {loading ? (
        <div className="text-center py-12 text-tx-muted">Loading games...</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12 text-tx-muted">No games found</div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
          {filtered.map(game => (
            <GameCard
              key={game.id}
              game={game}
              launching={launching === game.id}
              onLaunch={() => handleLaunch(game)}
            />
          ))}
        </div>
      )}
    </div>
  )
}

function GameCard({
  game, launching, onLaunch,
}: { game: CasinoGame; launching: boolean; onLaunch: () => void }) {
  return (
    <div
      className="card overflow-hidden cursor-pointer group hover:border-primary/50 transition-all"
      onClick={onLaunch}
    >
      {/* Thumbnail */}
      <div
        className="aspect-[4/3] flex items-center justify-center relative overflow-hidden"
        style={{ background: '#1a2025' }}
      >
        {game.thumbnail ? (
          <img src={game.thumbnail} alt={game.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
        ) : (
          <div className="flex flex-col items-center gap-2 opacity-40">
            <Gamepad2 size={32} className="text-tx-muted" />
          </div>
        )}
        {launching && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/60">
            <div className="text-xs text-white">Launching...</div>
          </div>
        )}
        <div className="absolute top-1.5 right-1.5">
          <span className="badge badge-gray text-[8px]">{game.provider}</span>
        </div>
      </div>

      <div className="p-2">
        <div className="text-xs font-medium text-tx-primary truncate">{game.name}</div>
        <div className="text-[10px] text-tx-muted">{game.category}</div>
      </div>
    </div>
  )
}
