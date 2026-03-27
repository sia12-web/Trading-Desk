import type { ScenarioAnalysisResult } from './types'

/**
 * Hard validation for scenario analysis levels.
 * Checks all key_levels, scenario triggers/invalidations, and targets
 * are within 3x ATR of current price and logically consistent.
 *
 * Returns { valid: true } if all checks pass, or { valid: false, errors: [...] }
 * with details so Claude can retry with corrections.
 */
export function validateScenarioAnalysisLevels(
    result: ScenarioAnalysisResult,
    currentPrice: number,
    atr: number
): { valid: boolean; errors: string[] } {
    const errors: string[] = []
    const maxDistance = atr * 3

    // ── Validate market_context.key_levels ──
    for (const level of result.market_context?.key_levels || []) {
        if (maxDistance > 0 && Math.abs(level.price - currentPrice) > maxDistance) {
            errors.push(`market_context key_level ${level.price} (${level.type}, ${level.timeframe}) is ${Math.abs(level.price - currentPrice).toFixed(5)} from price (max ${maxDistance.toFixed(5)})`)
        }
    }

    // ── Validate market_context.liquidity_pools ──
    for (const pool of result.market_context?.liquidity_pools || []) {
        if (maxDistance > 0 && Math.abs(pool.price - currentPrice) > maxDistance) {
            errors.push(`liquidity_pool ${pool.price} (${pool.type}) is ${Math.abs(pool.price - currentPrice).toFixed(5)} from price (max ${maxDistance.toFixed(5)})`)
        }
    }

    // ── Validate scenarios ──
    for (const s of result.scenarios || []) {
        // Must have trigger and invalidation
        if (!s.trigger?.level || !s.invalidation?.level) {
            errors.push(`Scenario "${s.title}": missing trigger.level or invalidation.level`)
            continue
        }

        // Range check
        if (maxDistance > 0) {
            if (Math.abs(s.trigger.level - currentPrice) > maxDistance) {
                errors.push(`Scenario "${s.title}": trigger ${s.trigger.level} is ${Math.abs(s.trigger.level - currentPrice).toFixed(5)} from price (max ${maxDistance.toFixed(5)})`)
            }
            if (Math.abs(s.invalidation.level - currentPrice) > maxDistance) {
                errors.push(`Scenario "${s.title}": invalidation ${s.invalidation.level} is ${Math.abs(s.invalidation.level - currentPrice).toFixed(5)} from price (max ${maxDistance.toFixed(5)})`)
            }
        }

        // Targets range check
        for (const target of s.targets || []) {
            if (maxDistance > 0 && Math.abs(target - currentPrice) > maxDistance * 1.5) {
                errors.push(`Scenario "${s.title}": target ${target} is ${Math.abs(target - currentPrice).toFixed(5)} from price (max ${(maxDistance * 1.5).toFixed(5)})`)
            }
        }

        // Probability check
        if (s.probability < 0 || s.probability > 1) {
            errors.push(`Scenario "${s.title}": probability ${s.probability} is outside 0-1 range`)
        }
    }

    // ── Validate probability sum ──
    const totalProb = (result.scenarios || []).reduce((sum, s) => sum + s.probability, 0)
    if (result.scenarios?.length >= 2 && (totalProb < 0.85 || totalProb > 1.15)) {
        errors.push(`Scenario probabilities sum to ${totalProb.toFixed(2)}, expected ~1.0`)
    }

    // ── Validate takeaways.key_levels_watchlist ──
    for (const level of result.takeaways?.key_levels_watchlist || []) {
        if (maxDistance > 0 && Math.abs(level.price - currentPrice) > maxDistance) {
            errors.push(`takeaway watchlist level ${level.price} (${level.label}) is ${Math.abs(level.price - currentPrice).toFixed(5)} from price (max ${maxDistance.toFixed(5)})`)
        }
    }

    // ── Validate confidence ──
    if (result.confidence < 0 || result.confidence > 1) {
        errors.push(`Overall confidence ${result.confidence} is outside 0-1 range`)
    }

    return { valid: errors.length === 0, errors }
}
