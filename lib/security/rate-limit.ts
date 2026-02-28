/**
 * Next.js App Router compatible rate limiter.
 * express-rate-limit only works in Express pipelines — this replaces it
 * with a lightweight in-memory Map that works in Next.js Node runtime.
 *
 * NOTE: For multi-instance deployments swap the Map for a Redis store.
 */

interface RateLimitEntry {
  count: number
  reset: number   // epoch ms when the window resets
}

const stores: Record<string, Map<string, RateLimitEntry>> = {}

function getStore(name: string): Map<string, RateLimitEntry> {
  if (!stores[name]) stores[name] = new Map()
  return stores[name]
}

export interface RateLimitOptions {
  /** Unique name for this limiter (keeps separate counters per limiter) */
  name: string
  /** Max requests per window */
  max: number
  /** Window length in milliseconds */
  windowMs: number
}

/**
 * Returns allowed=true if under the limit, false if exceeded.
 * Pass the client IP (or any stable per-user identifier).
 */
export function checkRateLimit(
  identifier: string,
  options: RateLimitOptions
): { allowed: boolean; remaining: number; resetInMs: number } {
  const store = getStore(options.name)
  const now = Date.now()

  let entry = store.get(identifier)
  if (!entry || now > entry.reset) {
    entry = { count: 1, reset: now + options.windowMs }
    store.set(identifier, entry)
    return { allowed: true, remaining: options.max - 1, resetInMs: options.windowMs }
  }

  entry.count++
  const remaining = Math.max(0, options.max - entry.count)
  const resetInMs = entry.reset - now

  if (entry.count > options.max) {
    return { allowed: false, remaining: 0, resetInMs }
  }
  return { allowed: true, remaining, resetInMs }
}

/** Helper: extract best-effort client IP from a NextRequest */
export function getClientIp(req: { headers: { get(k: string): string | null } }): string {
  return (
    req.headers.get('x-forwarded-for')?.split(',')[0].trim() ??
    req.headers.get('x-real-ip') ??
    'unknown'
  )
}

// ── Pre-configured limiters ──────────────────────────────────────────────
/** General API — 100 req / 15 min */
export const API_LIMIT: RateLimitOptions     = { name: 'api',    max: 100, windowMs: 15 * 60 * 1000 }
/** Auth endpoints — 10 req / 15 min */
export const AUTH_LIMIT: RateLimitOptions    = { name: 'auth',   max: 10,  windowMs: 15 * 60 * 1000 }
/** File uploads — 10 req / hour */
export const UPLOAD_LIMIT: RateLimitOptions  = { name: 'upload', max: 10,  windowMs: 60 * 60 * 1000 }
/** AI chat — 50 req / 15 min */
export const CHAT_LIMIT: RateLimitOptions    = { name: 'chat',   max: 50,  windowMs: 15 * 60 * 1000 }
/** TTS — 60 req / 15 min */
export const TTS_LIMIT: RateLimitOptions     = { name: 'tts',    max: 60,  windowMs: 15 * 60 * 1000 }
