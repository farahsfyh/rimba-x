/**
 * Next.js App Router compatible rate limiter.
 *
 * Production (Netlify): uses Upstash Redis so counters persist across
 * serverless cold starts. Requires UPSTASH_REDIS_REST_URL and
 * UPSTASH_REDIS_REST_TOKEN environment variables.
 *
 * Local dev: falls back to an in-memory Map (single process, good enough).
 *
 * To enable Redis on Netlify:
 *   1. Create a free Upstash Redis database at https://console.upstash.com
 *   2. Add UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN to
 *      Netlify > Site settings > Environment variables
 */
import { Redis } from '@upstash/redis'

// ── Types ────────────────────────────────────────────────────────────────

interface RateLimitEntry {
  count: number
  reset: number   // epoch ms when the window resets
}

export interface RateLimitOptions {
  /** Unique name for this limiter (keeps separate counters per limiter) */
  name: string
  /** Max requests per window */
  max: number
  /** Window length in milliseconds */
  windowMs: number
}

// ── Redis (production) ───────────────────────────────────────────────────

let _redis: Redis | null | undefined = undefined   // undefined = not yet resolved

function getRedis(): Redis | null {
  if (_redis !== undefined) return _redis
  if (
    process.env.UPSTASH_REDIS_REST_URL &&
    process.env.UPSTASH_REDIS_REST_TOKEN
  ) {
    try {
      _redis = new Redis({
        url: process.env.UPSTASH_REDIS_REST_URL,
        token: process.env.UPSTASH_REDIS_REST_TOKEN,
      })
    } catch {
      _redis = null
    }
  } else {
    _redis = null
  }
  return _redis
}

// ── In-memory fallback (local dev) ───────────────────────────────────────

const stores: Record<string, Map<string, RateLimitEntry>> = {}

function getStore(name: string): Map<string, RateLimitEntry> {
  if (!stores[name]) stores[name] = new Map()
  return stores[name]
}

// ── Public API ───────────────────────────────────────────────────────────

/**
 * Async rate-limit check. Returns allowed=true if under the limit.
 * Works across Netlify serverless invocations when Redis is configured.
 */
export async function checkRateLimit(
  identifier: string,
  options: RateLimitOptions
): Promise<{ allowed: boolean; remaining: number; resetInMs: number }> {
  const redis = getRedis()

  if (redis) {
    // Fixed-window counter in Redis — survives cold starts
    const windowBucket = Math.floor(Date.now() / options.windowMs)
    const key = `rl:${options.name}:${identifier}:${windowBucket}`
    const count = await redis.incr(key)
    if (count === 1) {
      // First hit in this window — set expiry so keys don't accumulate
      await redis.expire(key, Math.ceil(options.windowMs / 1000))
    }
    const remaining = Math.max(0, options.max - count)
    const resetInMs = (windowBucket + 1) * options.windowMs - Date.now()
    return { allowed: count <= options.max, remaining, resetInMs }
  }

  // In-memory fallback
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
/** Auth-adjacent endpoints — 10 req / 15 min */
export const AUTH_LIMIT: RateLimitOptions    = { name: 'auth',   max: 10,  windowMs: 15 * 60 * 1000 }
/** File uploads / parse — 10 req / hour */
export const UPLOAD_LIMIT: RateLimitOptions  = { name: 'upload', max: 10,  windowMs: 60 * 60 * 1000 }
/** AI chat — 50 req / 15 min */
export const CHAT_LIMIT: RateLimitOptions    = { name: 'chat',   max: 50,  windowMs: 15 * 60 * 1000 }
/** TTS — 60 req / 15 min */
export const TTS_LIMIT: RateLimitOptions     = { name: 'tts',    max: 60,  windowMs: 15 * 60 * 1000 }
