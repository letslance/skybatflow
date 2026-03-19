/**
 * Browser fingerprint singleton.
 *
 * Uses FingerprintJS (open-source) to generate a stable SHA-256 visitor ID
 * from browser signals: user-agent, screen, timezone, canvas, WebGL, audio, etc.
 *
 * The fingerprint is cached in module scope after first load — subsequent calls
 * return immediately from cache. It is NOT stored in localStorage or cookies.
 *
 * Purpose: fraud detection signal sent as X-Client-Fingerprint on every API
 * request and the WebSocket connect. The server correlates it with:
 *   - Multi-account detection (same fingerprint → multiple userIds)
 *   - Session anomalies (token used from a different fingerprint mid-session)
 *   - Bet velocity limits per device fingerprint
 */
import FingerprintJS from '@fingerprintjs/fingerprintjs'

let cached: string | null = null
let loadPromise: Promise<string> | null = null

export async function getFingerprint(): Promise<string> {
  if (cached) return cached

  if (!loadPromise) {
    loadPromise = FingerprintJS.load()
      .then(fp => fp.get())
      .then(result => {
        cached = result.visitorId
        return cached
      })
      .catch(() => {
        // FingerprintJS failed (e.g. privacy extension blocking canvas) —
        // fall back to a random ID for this page session so the header is
        // always present and downstream code doesn't have to handle null.
        cached = crypto.randomUUID()
        return cached
      })
  }

  return loadPromise
}
