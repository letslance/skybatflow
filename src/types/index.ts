// ─── Auth ──────────────────────────────────────────────────────────────────
// Must match com.betting.shared.enums.UserRole enum exactly — JWT claims use these values.
export type UserRole = 'SUPERADMIN' | 'ADMIN' | 'SUBADMIN' | 'MANAGER' | 'MASTER' | 'PLAYER'

/** Roles with access to the admin back-office. Single source of truth used by middleware + layouts. */
export const ADMIN_ROLES: UserRole[] = ['SUPERADMIN', 'ADMIN', 'SUBADMIN', 'MANAGER', 'MASTER']

export interface AuthUser {
  id: string
  username: string
  role: UserRole
  tenantId: string
}

export interface LoginResponse {
  accessToken: string
  refreshToken: string
  expiresIn?: number
  user: AuthUser
}

// ─── Wallet ────────────────────────────────────────────────────────────────
export interface Balance {
  main: number
  casino: number
  exposure: number
  available: number
}

export type TransactionType = 'DEPOSIT' | 'WITHDRAWAL' | 'BET_DEBIT' | 'BET_WIN' | 'CASINO_DEBIT' | 'CASINO_WIN' | 'TRANSFER_IN' | 'TRANSFER_OUT' | 'COMMISSION'
export type TransactionStatus = 'PENDING' | 'COMPLETED' | 'FAILED' | 'REVERSED'
export type AccountStatus = 'ACTIVE' | 'INACTIVE' | 'SUSPENDED' | 'LOCKED' | 'DEACTIVATED'

export interface Transaction {
  id: string
  type: TransactionType
  amount: number
  balanceBefore: number
  balanceAfter: number
  description: string
  createdAt: string
  status: TransactionStatus
}

// ─── Markets / Odds ────────────────────────────────────────────────────────
export type MarketStatus = 'OPEN' | 'SUSPENDED' | 'SETTLED' | 'CANCELLED' | 'CLOSED'

export interface Runner {
  id: string
  name: string
  sortPriority: number
  backOdds?: OddsPoint[]
  layOdds?: OddsPoint[]
}

export interface OddsPoint {
  price: number
  size: number
}

export interface Market {
  id: string
  name: string
  marketType: string
  status: MarketStatus
  inplay: boolean
  runners: Runner[]
  minStake?: number
  maxStake?: number
}

export interface Event {
  id: string
  name: string
  competition: string
  eventTypeId: string
  sportSlug?: string
  openDate: string
  inplay: boolean
  markets: Market[]
  scoreHome?: number
  scoreAway?: number
  elapsed?: string
}

// ─── Bets ──────────────────────────────────────────────────────────────────
export type BetType = 'BACK' | 'LAY'
export type BetStatus = 'PENDING' | 'MATCHED' | 'WON' | 'LOST' | 'VOID' | 'CANCELLED'

export interface Bet {
  id: string
  marketId: string
  marketName: string
  eventName: string
  runnerName: string
  betType: BetType
  odds: number
  stake: number
  potentialPayout: number
  potentialLiability: number
  status: BetStatus
  createdAt: string
  settledAt?: string
  profit?: number
  username?: string
}

export interface PlaceBetRequest {
  marketId: string
  runnerId: string
  betType: BetType
  odds: number
  stake: number
  /** When true, user accepts any odds movement — backend skips tolerance check. */
  acceptAnyOdds: boolean
}

export interface BetSlipEntry {
  marketId: string
  marketName: string
  eventName: string
  runnerId: string
  runnerName: string
  betType: BetType
  odds: number
  stake?: number
}

// ─── Casino ────────────────────────────────────────────────────────────────
export interface CasinoGame {
  id: string
  name: string
  provider: string
  category: string
  thumbnail?: string
}

export type CasinoTransactionStatus = 'OPEN' | 'PENDING' | 'SETTLED' | 'CANCELLED' | 'VOID'

export interface CasinoTransaction {
  id: string
  gameName: string
  provider: string
  roundId: string
  debit: number
  credit: number
  profit: number
  status: CasinoTransactionStatus
  createdAt: string
}

// ─── Admin ─────────────────────────────────────────────────────────────────
export interface UserAccount {
  id: string
  username: string
  fullName?: string
  city?: string
  role: UserRole
  status: AccountStatus
  tenantId?: string
  // Financials — fetched separately from wallet-service (GET /api/wallet/admin/balance?userId=)
  creditLimit: number
  // Bet limits
  minBet: number
  maxBet: number
  maxMarketExposure: number
  betDelay: number
  // Commission — nested object matching UserResponse.CommissionInfo from user-service
  commission: {
    sportsCommissionPct: number
    casinoCommissionPct: number
    partnershipPct: number
  }
  /** Shorthand alias for sportsCommissionPct — used in list views */
  commissionRate: number
  // Profile
  mobile?: string
  email?: string
  parentId?: string
  createdAt: string
  lastLoginAt?: string
}

export interface ApiResponse<T> {
  success: boolean
  data: T
  message?: string
  error?: string
}

export interface PagedResponse<T> {
  items: T[]
  total: number
  page: number
  size: number
}
