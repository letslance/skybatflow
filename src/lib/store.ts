import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { AuthUser, BetSlipEntry } from '@/types'

// ─── Auth store ────────────────────────────────────────────────────────────
// Tokens are stored ONLY in httpOnly cookies (set by /api/auth/* BFF routes).
// This store holds only non-sensitive identity info (username, role).
// Balance is NOT stored here — use useBalanceStore for live financial figures.
interface AuthState {
  user: AuthUser | null
  /** True once the persisted store has rehydrated from localStorage.
   *  Guards against redirect-to-login on page refresh before hydration completes. */
  _hasHydrated: boolean
  setAuth: (user: AuthUser) => void
  logout: () => void
  setHasHydrated: (v: boolean) => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      _hasHydrated: false,
      setAuth: (user) => set({ user }),
      logout: () => set({ user: null }),
      setHasHydrated: (v) => set({ _hasHydrated: v }),
    }),
    {
      name: 'auth-store',
      // Persist identity only — balance is in useBalanceStore (in-memory, fetched fresh each session)
      partialize: s => ({ user: s.user }),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true)
      },
    }
  )
)

// ─── Balance store (in-memory — wallet-service is the source of truth) ─────
interface WalletBalance {
  main: number
  casino: number
  exposure: number
  available: number
}

interface BalanceState {
  balance: WalletBalance | null
  setBalance: (b: WalletBalance) => void
  clearBalance: () => void
}

export const useBalanceStore = create<BalanceState>((set) => ({
  balance: null,
  setBalance: (b) => set({ balance: b }),
  clearBalance: () => set({ balance: null }),
}))

// ─── Bet slip store ────────────────────────────────────────────────────────
interface BetSlipState {
  open: boolean
  entries: BetSlipEntry[]
  addEntry: (entry: BetSlipEntry) => void
  updateStake: (index: number, stake: number) => void
  removeEntry: (index: number) => void
  clearSlip: () => void
  setOpen: (open: boolean) => void
}

export const useBetSlipStore = create<BetSlipState>((set) => ({
  open: false,
  entries: [],
  addEntry: (entry) =>
    set(state => ({
      open: true,
      entries: [
        // replace if same market+runner+type
        ...state.entries.filter(
          e => !(e.marketId === entry.marketId && e.runnerId === entry.runnerId && e.betType === entry.betType)
        ),
        entry,
      ],
    })),
  updateStake: (index, stake) =>
    set(state => ({
      entries: state.entries.map((e, i) => (i === index ? { ...e, stake } : e)),
    })),
  removeEntry: (index) =>
    set(state => ({
      entries: state.entries.filter((_, i) => i !== index),
    })),
  clearSlip: () => set({ entries: [], open: false }),
  setOpen: (open) => set({ open }),
}))

// ─── Sidebar store ─────────────────────────────────────────────────────────
interface SidebarState {
  collapsed: boolean
  toggle: () => void
  setCollapsed: (v: boolean) => void
}

export const useSidebarStore = create<SidebarState>()(
  persist(
    (set) => ({
      collapsed: false,
      toggle: () => set(state => ({ collapsed: !state.collapsed })),
      setCollapsed: (v) => set({ collapsed: v }),
    }),
    { name: 'sidebar-store' }
  )
)

// ─── Odds cache (in-memory, updated by WebSocket) ──────────────────────────
interface OddsState {
  markets: Record<string, import('@/types').Market>
  setMarket: (marketId: string, market: import('@/types').Market) => void
}

export const useOddsStore = create<OddsState>((set) => ({
  markets: {},
  setMarket: (marketId, market) =>
    set(state => ({ markets: { ...state.markets, [marketId]: market } })),
}))
