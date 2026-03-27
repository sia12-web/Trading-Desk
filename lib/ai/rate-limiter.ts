/**
 * Simple in-memory rate limiter for AI pipeline calls.
 * 5 calls per hour per user. Resets each hour.
 */
const userCalls = new Map<string, { count: number; windowStart: number }>()

const MAX_CALLS_PER_HOUR = 5
const HOUR_MS = 60 * 60 * 1000

export function checkRateLimit(userId: string): { allowed: boolean; remaining: number; resetIn: number } {
    const now = Date.now()
    const entry = userCalls.get(userId)

    if (!entry || now - entry.windowStart > HOUR_MS) {
        userCalls.set(userId, { count: 1, windowStart: now })
        return { allowed: true, remaining: MAX_CALLS_PER_HOUR - 1, resetIn: HOUR_MS }
    }

    if (entry.count >= MAX_CALLS_PER_HOUR) {
        const resetIn = HOUR_MS - (now - entry.windowStart)
        return { allowed: false, remaining: 0, resetIn }
    }

    entry.count++
    return {
        allowed: true,
        remaining: MAX_CALLS_PER_HOUR - entry.count,
        resetIn: HOUR_MS - (now - entry.windowStart),
    }
}
