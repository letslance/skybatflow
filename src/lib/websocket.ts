/**
 * WebSocket client — STOMP over SockJS with HMAC-SHA256 message verification.
 *
 * Architecture:
 *   1. Single shared STOMP connection per browser session.
 *   2. All active subscriptions are stored in a registry.
 *   3. On every (re)connect, the registry is fully re-subscribed so
 *      callers never have to handle reconnect manually.
 *   4. Every inbound message is verified against a HMAC-SHA256 signature
 *      using the shared secret (NEXT_PUBLIC_WS_HMAC_SECRET) before being
 *      applied to state.
 */
import { Client, IMessage } from '@stomp/stompjs'
import SockJS from 'sockjs-client'
import { useOddsStore } from './store'
import type { Market } from '@/types'

const WS_URL = process.env.NEXT_PUBLIC_WS_URL || 'http://localhost:7085/ws'

// ── Message envelope ──────────────────────────────────────────────────────────

interface SignedMessage<T> {
  data: T
  ts: number
  nonce: string
  sig: string
}

// ── HMAC-SHA256 verification (Web Crypto API) ─────────────────────────────────

const MAX_MESSAGE_AGE_MS = 30_000
let _signingKey: CryptoKey | null = null

async function getSigningKey(): Promise<CryptoKey> {
  if (_signingKey) return _signingKey
  const secret   = process.env.NEXT_PUBLIC_WS_HMAC_SECRET || 'change_this_ws_hmac_secret_32chars_min'
  const keyBytes = new TextEncoder().encode(secret)
  _signingKey    = await crypto.subtle.importKey(
    'raw', keyBytes, { name: 'HMAC', hash: 'SHA-256' }, false, ['verify']
  )
  return _signingKey
}

async function verifySignature<T>(msg: SignedMessage<T>): Promise<boolean> {
  try {
    if (Date.now() - msg.ts > MAX_MESSAGE_AGE_MS) {
      console.warn('[WS] Stale message discarded (age=%dms)', Date.now() - msg.ts)
      return false
    }
    const canonical    = JSON.stringify(msg.data)
    const signedString = `${canonical}.${msg.ts}.${msg.nonce}`
    const key          = await getSigningKey()
    const sigBytes     = hexToBytes(msg.sig)
    const dataBytes    = new TextEncoder().encode(signedString)
    return await crypto.subtle.verify('HMAC', key, sigBytes.buffer as ArrayBuffer, dataBytes)
  } catch {
    return false
  }
}

function hexToBytes(hex: string): Uint8Array {
  const bytes = new Uint8Array(hex.length / 2)
  for (let i = 0; i < hex.length; i += 2) {
    bytes[i / 2] = parseInt(hex.slice(i, i + 2), 16)
  }
  return bytes
}

// ── Subscription registry ─────────────────────────────────────────────────────
//
// Maps a subscription key (topic string) to a factory function that creates
// the actual STOMP subscription. The factory is stored (not the StompSubscription)
// so it can be re-invoked on every reconnect transparently.

type SubscribeFactory = (client: Client) => void

const subscriptionRegistry = new Map<string, SubscribeFactory>()
const activeSubscriptions   = new Map<string, { unsubscribe: () => void }>()

function registerSubscription(key: string, factory: SubscribeFactory): () => void {
  subscriptionRegistry.set(key, factory)
  // If already connected, subscribe immediately
  if (stompClient?.active) {
    factory(stompClient)
  }
  // Return unsubscribe handle
  return () => {
    activeSubscriptions.get(key)?.unsubscribe()
    activeSubscriptions.delete(key)
    subscriptionRegistry.delete(key)
  }
}

// ── Connection ────────────────────────────────────────────────────────────────

let stompClient: Client | null = null

export function connectWebSocket(): Client {
  if (stompClient?.active) return stompClient

  stompClient = new Client({
    webSocketFactory: () => new SockJS(WS_URL),
    // No Authorization header — access_token httpOnly cookie is sent automatically
    // by the browser during the SockJS HTTP upgrade handshake.
    connectHeaders: {},
    reconnectDelay: 5000,
    onStompError: (frame) => {
      console.error('[WS] STOMP error', frame.headers['message'])
    },
    onDisconnect: () => {
      // Clear active subscription handles; they will be re-created on reconnect
      activeSubscriptions.clear()
    },
  })

  stompClient.onConnect = () => {
    // Re-subscribe everything in the registry — handles both initial connect
    // and transparent reconnect after a network drop.
    subscriptionRegistry.forEach((factory) => factory(stompClient!))
  }

  stompClient.activate()
  return stompClient
}

export function disconnectWebSocket(): void {
  stompClient?.deactivate()
  stompClient = null
  subscriptionRegistry.clear()
  activeSubscriptions.clear()
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function subscribe<T>(
  topic: string,
  onMessage: (data: T) => void,
): () => void {
  return registerSubscription(topic, (client) => {
    const sub = client.subscribe(topic, async (msg: IMessage) => {
      try {
        const envelope: SignedMessage<T> = JSON.parse(msg.body)
        const valid = await verifySignature(envelope)
        if (!valid) {
          console.warn('[WS] Signature invalid or stale — discarded:', topic)
          return
        }
        onMessage(envelope.data)
      } catch {
        /* ignore parse errors */
      }
    })
    activeSubscriptions.set(topic, { unsubscribe: () => sub.unsubscribe() })
  })
}

// ── Public subscription API ───────────────────────────────────────────────────

/**
 * Subscribe to live odds updates for a market.
 * Updates `useOddsStore` and optionally calls `onUpdate`.
 * Automatically re-subscribes after reconnect.
 */
export function subscribeMarketOdds(
  marketId: string,
  onUpdate?: (market: Market) => void,
): () => void {
  const topic = `/topic/odds/${marketId}`
  return subscribe<Market>(topic, (market) => {
    useOddsStore.getState().setMarket(marketId, market)
    onUpdate?.(market)
  })
}

/**
 * Subscribe to market status changes (SUSPENDED / OPEN / CLOSED).
 * Expected payload: `{ marketId: string, status: string }`.
 * Updates `useOddsStore` by merging the new status into the cached market.
 */
export function subscribeMarketStatus(
  marketId: string,
  onUpdate?: (status: string) => void,
): () => void {
  const topic = `/topic/market/${marketId}/status`
  return subscribe<{ marketId: string; status: string }>(topic, ({ status }) => {
    const existing = useOddsStore.getState().markets[marketId]
    if (existing) {
      useOddsStore.getState().setMarket(marketId, {
        ...existing,
        status: status as Market['status'],
      })
    }
    onUpdate?.(status)
  })
}

/**
 * Subscribe to live score updates for an event.
 * Payload matches `ScoreUpdatedEvent` from the backend.
 */
export function subscribeScore(
  eventId: string,
  onUpdate: (score: ScoreUpdate) => void,
): () => void {
  const topic = `/topic/score/${eventId}`
  return subscribe<ScoreUpdate>(topic, onUpdate)
}

export interface ScoreUpdate {
  eventId: string
  sport: string
  scoreJson: string
  triggerType: string
  occurredAt: string
}

/**
 * Subscribe to personal bet settlement notifications.
 * Requires an authenticated WebSocket session.
 * The `userId` must match the authenticated user's ID.
 */
export function subscribeBetUpdates(
  userId: string,
  onSettled: (event: BetSettledNotification) => void,
): () => void {
  // /user/{userId}/queue/bets is Spring's user-destination — routed by Principal
  const topic = `/user/${userId}/queue/bets`
  return subscribe<BetSettledNotification>(topic, onSettled)
}

export interface BetSettledNotification {
  betId: string
  userId: string
  marketId: string
  marketName: string
  runnerName: string
  betType: 'BACK' | 'LAY'
  result: 'WON' | 'LOST' | 'VOID'
  stake: number
  payout: number
  settledAt: string
}
