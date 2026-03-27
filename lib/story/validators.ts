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

        // Use JSON5-style lenient parsing via the existing parseAIJson utility
        // But here we do a simple JSON.parse since deepseek output should be clean
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
