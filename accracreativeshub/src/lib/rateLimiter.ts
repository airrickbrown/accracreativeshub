// ── src/lib/rateLimiter.ts ──

interface Entry { count: number; resetAt: number }
const store = new Map<string, Entry>()

const LIMITS: Record<string, { max: number; windowMs: number }> = {
  login:         { max: 5,  windowMs: 15 * 60 * 1000 },
  signup:        { max: 3,  windowMs: 60 * 60 * 1000 },
  passwordReset: { max: 3,  windowMs: 60 * 60 * 1000 },
  resendVerify:  { max: 3,  windowMs: 60 * 60 * 1000 },
  contactForm:   { max: 5,  windowMs: 60 * 60 * 1000 },
}

export function checkRateLimit(
  action: string,
  id = 'global'
): { allowed: boolean; retryAfterMs?: number } {
  const cfg = LIMITS[action]
  if (!cfg) return { allowed: true }

  const key   = `${action}:${id}`
  const now   = Date.now()
  const entry = store.get(key)

  if (!entry || now > entry.resetAt) {
    store.set(key, { count: 1, resetAt: now + cfg.windowMs })
    return { allowed: true }
  }
  if (entry.count >= cfg.max) {
    return { allowed: false, retryAfterMs: entry.resetAt - now }
  }
  entry.count++
  return { allowed: true }
}

export function formatRetryTime(ms: number): string {
  const m = Math.ceil(ms / 60000)
  return m < 2 ? '1 minute' : `${m} minutes`
}

export function resetRateLimit(action: string, id = 'global') {
  store.delete(`${action}:${id}`)
}