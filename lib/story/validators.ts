import type { StoryDataPayload } from './types'
import type { StoryResult } from './types'

export interface ValidationWarning {
    type: 'out_of_range' | 'no_source'
    level: number
    context: string
    observedRange: { min: number; max: number }
}

/**
 * Validate that all price levels in the story result fall within
 * the observed price range from candle data (+ 5% buffer).
 * Returns warnings — does not block episode creation.
 */
export function validateStoryLevels(
    result: StoryResult,
    data: StoryDataPayload
): ValidationWarning[] {
    const warnings: ValidationWarning[] = []

    // Compute observed price range across ALL timeframe candles
    let min = Infinity
    let max = -Infinity
    for (const tf of data.timeframes) {
        for (const candle of tf.candles) {
            const low = parseFloat(candle.mid.l)
            const high = parseFloat(candle.mid.h)
            if (low < min) min = low
            if (high > max) max = high
        }
    }

    if (min === Infinity || max === -Infinity) return warnings

    // Apply 5% buffer
    const range = max - min
    const buffer = range * 0.05
    const rangeMin = min - buffer
    const rangeMax = max + buffer
    const observedRange = { min: rangeMin, max: rangeMax }

    function checkLevel(level: number, context: string) {
        if (level < rangeMin || level > rangeMax) {
            warnings.push({ type: 'out_of_range', level, context, observedRange })
        }
    }

    // Check key_levels
    if (result.key_levels) {
        result.key_levels.entries?.forEach(l => checkLevel(l, 'key_levels.entries'))
        result.key_levels.stop_losses?.forEach(l => checkLevel(l, 'key_levels.stop_losses'))
        result.key_levels.take_profits?.forEach(l => checkLevel(l, 'key_levels.take_profits'))
    }

    // Check scenario structured levels
    for (const s of result.scenarios || []) {
        if (s.trigger_level != null) {
            checkLevel(s.trigger_level, `scenario "${s.title}" trigger_level`)
        }
        if (s.invalidation_level != null) {
            checkLevel(s.invalidation_level, `scenario "${s.title}" invalidation_level`)
        }
    }

    return warnings
}

/**
 * Hard validation for scenario levels — checks that trigger and invalidation
 * are on the correct sides of the current price based on direction.
 *
 * Returns { valid: true } if all checks pass, or { valid: false, errors: [...] }
 * with specific details about what's wrong so the narrator can be retried.
 */
export function validateScenarioLevels(
    result: StoryResult,
    currentPrice: number,
    atr: number
): { valid: boolean; errors: string[] } {
    const errors: string[] = []

    for (const s of result.scenarios || []) {
        // All scenarios must have structured levels
        if (s.trigger_level == null || s.invalidation_level == null) {
            errors.push(`Scenario "${s.title}": missing trigger_level or invalidation_level`)
            continue
        }
        if (!s.trigger_direction || !s.invalidation_direction) {
            errors.push(`Scenario "${s.title}": missing trigger_direction or invalidation_direction`)
            continue
        }

        // Direction consistency check
        if (s.direction === 'bullish') {
            if (s.trigger_direction !== 'above') {
                errors.push(`Scenario "${s.title}": bullish scenario must have trigger_direction="above", got "${s.trigger_direction}"`)
            }
            if (s.invalidation_direction !== 'below') {
                errors.push(`Scenario "${s.title}": bullish scenario must have invalidation_direction="below", got "${s.invalidation_direction}"`)
            }
        } else if (s.direction === 'bearish') {
            if (s.trigger_direction !== 'below') {
                errors.push(`Scenario "${s.title}": bearish scenario must have trigger_direction="below", got "${s.trigger_direction}"`)
            }
            if (s.invalidation_direction !== 'above') {
                errors.push(`Scenario "${s.title}": bearish scenario must have invalidation_direction="above", got "${s.invalidation_direction}"`)
            }
        }

        // Range check: levels must be within 3x ATR of current price
        const maxDistance = atr * 3
        if (maxDistance > 0) {
            if (Math.abs(s.trigger_level - currentPrice) > maxDistance) {
                errors.push(`Scenario "${s.title}": trigger_level ${s.trigger_level} is ${Math.abs(s.trigger_level - currentPrice).toFixed(5)} from price (max ${maxDistance.toFixed(5)})`)
            }
            if (Math.abs(s.invalidation_level - currentPrice) > maxDistance) {
                errors.push(`Scenario "${s.title}": invalidation_level ${s.invalidation_level} is ${Math.abs(s.invalidation_level - currentPrice).toFixed(5)} from price (max ${maxDistance.toFixed(5)})`)
            }
        }
    }

    // Probability check
    const totalProb = (result.scenarios || []).reduce((sum, s) => sum + s.probability, 0)
    if (result.scenarios?.length === 2 && (totalProb < 0.85 || totalProb > 1.15)) {
        errors.push(`Scenario probabilities sum to ${totalProb.toFixed(2)}, expected ~1.0`)
    }

    return { valid: errors.length === 0, errors }
}

/**
 * Parse flagged_levels from DeepSeek output (best-effort).
 * Returns empty array if parsing fails.
 */
export function parseFlaggedLevels(
    deepseekOutput: string
): Array<{ level: number; source: string; reason: string }> {
    try {
        // Try to find JSON in the output
        const jsonMatch = deepseekOutput.match(/\{[\s\S]*\}/)
        if (!jsonMatch) return []

        const parsed = JSON.parse(jsonMatch[0])
        if (Array.isArray(parsed.flagged_levels)) {
            return parsed.flagged_levels.filter(
                (f: unknown): f is { level: number; source: string; reason: string } =>
                    typeof f === 'object' && f !== null &&
                    'level' in f && typeof (f as Record<string, unknown>).level === 'number'
            )
        }
        return []
    } catch {
        return []
    }
}
