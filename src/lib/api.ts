/**
 * Axios API client.
 *
 * Auth strategy: httpOnly cookies (set by /api/auth/* BFF routes).
 * Tokens are NEVER stored in localStorage — they live exclusively in Secure, httpOnly
 * cookies which are sent automatically by the browser on every same-origin request.
 *
 * The Spring Cloud Gateway reads the access_token cookie and injects the
 * Authorization header before forwarding to downstream services.
 */
import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios'
import { ApiResponse } from '@/types'
import { getFingerprint } from './fingerprint'

const BASE = process.env.NEXT_PUBLIC_API_URL || ''   // empty = same origin (recommended)

export const api = axios.create({
  baseURL:         BASE,
  headers:         { 'Content-Type': 'application/json' },
  timeout:         15_000,
  withCredentials: true,   // send cookies on cross-origin requests (needed when BASE != '')
})

// ─── Fingerprint on every request ─────────────────────────────────────────
api.interceptors.request.use(async (config: InternalAxiosRequestConfig) => {
  try {
    const fp = await getFingerprint()
    config.headers.set('X-Client-Fingerprint', fp)
  } catch { /* never block the request */ }
  return config
})

// ─── Auto-refresh on 401 ───────────────────────────────────────────────────
let refreshing = false
let refreshPromise: Promise<void> | null = null

api.interceptors.response.use(
  res => res,
  async (err: AxiosError) => {
    const original = err.config as InternalAxiosRequestConfig & { _retry?: boolean }

    if (err.response?.status === 401 && !original._retry) {
      original._retry = true

      if (!refreshing) {
        refreshing = true
        refreshPromise = fetch('/api/auth/refresh', { method: 'POST', credentials: 'include' })
          .then(async res => {
            if (!res.ok) {
              // Refresh failed (session expired or force-logged out) — redirect to login
              if (typeof window !== 'undefined') {
                const isAdmin = window.location.pathname.startsWith('/admin')
                window.location.href = isAdmin ? '/admin/login' : '/login'
              }
              throw new Error('Session expired')
            }
          })
          .finally(() => {
            refreshing = false
            refreshPromise = null
          })
      }

      try {
        await refreshPromise
        return api(original)
      } catch {
        return Promise.reject(err)
      }
    }

    return Promise.reject(err)
  }
)

// ─── Typed helpers ─────────────────────────────────────────────────────────
export const apiGet  = <T>(url: string, params?: object) =>
  api.get<ApiResponse<T>>(url, { params }).then(r => r.data.data)

export const apiPost = <T>(url: string, body?: object) =>
  api.post<ApiResponse<T>>(url, body).then(r => r.data.data)

export const apiPut  = <T>(url: string, body?: object) =>
  api.put<ApiResponse<T>>(url, body).then(r => r.data.data)

export const apiDelete = <T>(url: string) =>
  api.delete<ApiResponse<T>>(url).then(r => r.data.data)

// ─── Domain helpers ────────────────────────────────────────────────────────

/**
 * Auth — routed through Next.js BFF so tokens stay in httpOnly cookies.
 * The BFF routes call Spring Boot and set cookies server-side.
 */
export const authApi = {
  login: async (username: string, password: string) => {
    // Call Next.js BFF route (not Spring Boot directly) — sets httpOnly cookies.
    // Returns AuthUser on normal login, or { requiresPasswordChange: true } on first login.
    const res = await fetch('/api/auth/login', {
      method:      'POST',
      headers:     { 'Content-Type': 'application/json' },
      credentials: 'include',
      body:        JSON.stringify({ username, password }),
    })
    const data = await res.json()
    if (!res.ok) throw { response: { data } }
    return data.data as (import('@/types').AuthUser & { requiresPasswordChange?: boolean })
  },
  activate: async (currentPassword: string, newPassword: string) => {
    const res = await fetch('/api/auth/activate', {
      method:      'POST',
      headers:     { 'Content-Type': 'application/json' },
      credentials: 'include',
      body:        JSON.stringify({ currentPassword, newPassword }),
    })
    const data = await res.json()
    if (!res.ok) throw { response: { data } }
    return data.data as { transactionCode: string; message: string }
  },
  logout: async () => {
    await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' })
  },
  refresh: async () => {
    const res = await fetch('/api/auth/refresh', { method: 'POST', credentials: 'include' })
    if (!res.ok) throw new Error('Refresh failed')
    return res.json()
  },
  changePassword: (current: string, newPwd: string) =>
    apiPut('/api/auth/password', { currentPassword: current, newPassword: newPwd }),
}

export const walletApi = {
  balance: () => apiGet<import('@/types').Balance>('/api/wallet/balance'),
  adminBalance: (userId: string) =>
    apiGet<import('@/types').Balance>('/api/wallet/admin/balance', { userId }),
  deposit: (amount: number, reference: string) =>
    apiPost('/api/wallet/deposit', { amount, reference }),
  withdraw: (amount: number) =>
    apiPost('/api/wallet/withdraw', { amount }),
  transfer: (toUserId: string, amount: number) =>
    apiPost('/api/wallet/transfer', { toUserId, amount }),
  statement: (page = 0, size = 20) =>
    apiGet<import('@/types').Transaction[]>('/api/wallet/statement', { page, size }),
}

export const matchApi = {
  events: (params?: object) =>
    apiGet<import('@/types').Event[]>('/api/matches/events', params),
  event: (id: string) =>
    apiGet<import('@/types').Event>(`/api/matches/events/${id}`),
  inplay: () =>
    apiGet<import('@/types').Event[]>('/api/matches/inplay'),
  eventTypes: () =>
    apiGet<{ id: string; name: string }[]>('/api/matches/event-types'),
  odds: (marketId: string) =>
    apiGet<import('@/types').Market>(`/api/odds/markets/${marketId}`),
}

export const betApi = {
  place: (req: import('@/types').PlaceBetRequest) =>
    apiPost<import('@/types').Bet>('/api/bets/place', req),
  list: (params?: object) =>
    apiGet<import('@/types').Bet[]>('/api/bets', params),
  open: () =>
    apiGet<import('@/types').Bet[]>('/api/bets/open'),
  exposure: (marketId: string) =>
    apiGet<number>(`/api/bets/market/${marketId}/exposure`),
  placeFancy: (req: object) =>
    apiPost<import('@/types').Bet>('/api/bets/fancy/place', req),
  fancyList: (params?: object) =>
    apiGet<import('@/types').Bet[]>('/api/bets/fancy', params),
}

export const casinoApi = {
  games: () =>
    apiGet<import('@/types').CasinoGame[]>('/api/casino/games'),
  launch: (gameId: string, provider: string) =>
    apiPost<{ launchUrl: string }>('/api/casino/launch', { gameId, provider }),
  history: (page = 0, size = 20) =>
    apiGet<import('@/types').CasinoTransaction[]>('/api/casino/history', { page, size }),
}

export const adminApi = {
  // ── User management (admin prefix — PLAYER role blocked at gateway) ─────────
  users: (params?: object) =>
    apiGet<import('@/types').UserAccount[]>('/api/admin/users', params),
  getUser: (id: string) =>
    apiGet<import('@/types').UserAccount>(`/api/admin/users/${id}`),
  createUser: (data: object) =>
    apiPost<import('@/types').UserAccount>('/api/admin/users', data),
  /** Update a downline user's profile/limits. Requires caller's own 6-digit transaction code. */
  updateUser: (id: string, data: object, transactionCode: string) =>
    apiPut<import('@/types').UserAccount>(`/api/admin/users/${id}`, { ...data, transactionCode }),
  /**
   * Set user-lock and bet-lock for a downline user.
   * userLock=true suspends the account and immediately invalidates their session.
   * betLock=true blocks bet placement while keeping the account active.
   * Requires caller's own 6-digit transaction code as a second factor.
   */
  setLocks: (id: string, userLock: boolean, betLock: boolean, transactionCode: string) =>
    apiPut(`/api/admin/users/${id}/locks`, { userLock, betLock, transactionCode }),
  /** Reset a downline user's password. Requires caller's own 6-digit transaction code. */
  resetClientPassword: (targetUserId: string, newPassword: string, transactionCode: string) =>
    apiPut(`/api/admin/users/${targetUserId}/password`, { newPassword, transactionCode }),
  /** Credit deposit into a downline user's wallet (admin-level transfer). Requires caller's transaction code. */
  creditDeposit: (userId: string, amount: number, transactionCode: string, remark?: string) =>
    apiPost(`/api/wallet/admin/credit`, { userId, amount, remark, transactionCode }),
  /** Withdraw (debit) from a downline user's wallet. Requires caller's transaction code. */
  creditWithdraw: (userId: string, amount: number, transactionCode: string, remark?: string) =>
    apiPost(`/api/wallet/admin/debit`, { userId, amount, remark, transactionCode }),
  /** Get live wallet balance for any user (used in Deposit/Withdraw modals). */
  getAdminBalance: (userId: string) =>
    apiGet<{ main: number; casino: number; exposure: number; available: number }>('/api/wallet/admin/balance', { userId }),
  markets: (params?: object) =>
    apiGet('/api/matches/markets', params),
  updateMarketStatus: (id: string, status: string) =>
    apiPut(`/api/matches/markets/${id}/status`, { status }),
  settleMarket: (id: string, winnerRunnerId: string) =>
    apiPost(`/api/matches/markets/${id}/result`, { winnerRunnerId }),
  fancyMarkets: (params?: object) =>
    apiGet<FancyMarket[]>('/api/matches/fancy-markets', params),
  updateFancyStatus: (id: string, status: string) =>
    apiPut(`/api/matches/fancy-markets/${id}/status`, { status }),
  settleFancyMarket: (id: string, result: number) =>
    apiPost(`/api/bets/fancy/settle/${id}`, { result }),
  casinoTransactions: (params?: object) =>
    apiGet<CasinoTx[]>('/api/casino/admin/transactions', params),

  // ── Reports ──────────────────────────────────────────────────────────────
  /** Resolve username → userId for statement lookup */
  resolveUser: (username: string) =>
    apiGet<import('@/types').UserAccount[]>('/api/admin/users').then(
      users => users.find(u => u.username.toLowerCase() === username.toLowerCase())
    ),
  reportStatement: (params?: object) =>
    apiGet('/api/reports/statement', params),
  reportPartyWl: (params?: object) =>
    apiGet('/api/reports/party-wl', params),
  reportTurnover: (params?: object) =>
    apiGet('/api/reports/turnover', params),
  reportGgr: (params?: object) =>
    apiGet('/api/reports/ggr', params),
  updateGgr: (sport: string, customerGgrPct: number) =>
    apiPut('/api/reports/ggr', { sport, customerGgrPct }),
  reportUserHistory: (params?: object) =>
    apiGet('/api/reports/user-history', params),

  // ── Settings ─────────────────────────────────────────────────────────────
  getSettings: () =>
    apiGet('/api/admin/settings'),
  /** Save global settings. transactionCode is validated server-side. */
  updateSettings: (data: object, transactionCode: string) =>
    apiPut('/api/admin/settings', { ...data, transactionCode }),
  getSportSettings: () =>
    apiGet('/api/admin/settings/sports'),
  /** Save sport settings. Sports array is wrapped with transactionCode. */
  updateSportSettings: (sports: object[], transactionCode: string) =>
    apiPut('/api/admin/settings/sports', { sports, transactionCode }),
  /** Upload a branding asset (logo | favicon | welcome_banner). Returns { url }. */
  uploadBrandingAsset: (assetType: 'logo' | 'favicon' | 'welcome_banner', file: File) => {
    const form = new FormData()
    form.append('assetType', assetType)
    form.append('file', file)
    return axios.post<{ data: { url: string } }>('/api/admin/tenant/upload', form, {
      withCredentials: true,
      headers: { 'Content-Type': 'multipart/form-data' },
    }).then(r => r.data.data)
  },

  // ── Bonus ─────────────────────────────────────────────────────────────────
  listBonuses: () =>
    apiGet('/api/admin/bonuses'),
  createBonus: (data: object) =>
    apiPost('/api/admin/bonuses', data),
  updateBonus: (id: string, data: object) =>
    apiPut(`/api/admin/bonuses/${id}`, data),
  deleteBonus: (id: string) =>
    apiDelete(`/api/admin/bonuses/${id}`),
  toggleBonus: (id: string, active: boolean) =>
    apiPut(`/api/admin/bonuses/${id}/status`, { active }),
}

interface FancyMarket {
  id: string; eventId: string; name: string; status: string;
  yesRate: number; noRate: number; result: number | null; settledAt: string | null
}
interface CasinoTx {
  id: string; userId: string; username: string; gameId: string;
  betAmount: number; winAmount: number; result: string; createdAt: string
}
