import type { OandaCandle } from '@/lib/types/oanda'
import type { CalculatedIndicators } from '@/lib/strategy/types'
import type { AMDPhase, AMDPhaseName } from './types'

/**
 * Detect AMD (Accumulation-Manipulation-Distribution) phase using Smart Money Concepts.
 *
 * Accumulation: Low ADX, tight BB, low volume, range-bound
 * Manipulation: Liquidity sweep (wick beyond range), volume spike, false breakout
 * Distribution: Directional move, ADX rising, volume confirmation
 */
export function detectAMDPhase(candles: OandaCandle[], indicators: CalculatedIndicators): AMDPhase {
    if (candles.length < 20) {
        return { phase: 'unknown', confidence: 0, signals: ['Insufficient data'] }
    }

    const scores: Record<AMDPhaseName, number> = {
        accumulation: 0,
        manipulation: 0,
        distribution: 0,
        unknown: 0,
    }
    const signals: string[] = []

    const adx = indicators.adx
    const bbWidth = indicators.bbWidth
    const volume = indicators.volume
    const volumeSma = indicators.volumeSma
    const lastIdx = candles.length - 1

    // ── ADX Analysis ──
    const currentADX = adx[adx.length - 1] || 0
    const prevADX = adx[adx.length - 5] || 0

    if (currentADX < 20) {
        scores.accumulation += 30
        signals.push(`ADX low (${currentADX.toFixed(1)}) — weak trend, possible accumulation`)
    } else if (currentADX < 25) {
        scores.accumulation += 15
        scores.manipulation += 10
        signals.push(`ADX moderate (${currentADX.toFixed(1)}) — transitioning`)
    } else {
        scores.distribution += 25
        signals.push(`ADX strong (${currentADX.toFixed(1)}) — directional move`)
    }

    if (currentADX > prevADX + 5) {
        scores.distribution += 15
        signals.push('ADX rising sharply — breakout in progress')
    }

    // ── Bollinger Band Width Analysis ──
    if (bbWidth.length > 20) {
        const currentBBW = bbWidth[bbWidth.length - 1]
        const bbwSlice = bbWidth.slice(-50)
        const avgBBW = bbwSlice.reduce((a, b) => a + b, 0) / bbwSlice.length

        if (currentBBW < avgBBW * 0.7) {
            scores.accumulation += 25
            signals.push('BB Width squeeze — volatility compression (accumulation)')
        } else if (currentBBW > avgBBW * 1.5) {
            scores.distribution += 20
            signals.push('BB Width expanding — volatility breakout (distribution)')
        }
    }

    // ── Volume Analysis ──
    if (volume.length > 5 && volumeSma.length > 0) {
        const recentVol = volume.slice(-3)
        const avgVol = volumeSma[volumeSma.length - 1] || 1
        const currentVol = recentVol[recentVol.length - 1]

        if (currentVol > avgVol * 2) {
            // Volume spike — could be manipulation or distribution
            const priceChange = Math.abs(
                parseFloat(candles[lastIdx].mid.c) - parseFloat(candles[lastIdx - 1].mid.c)
            )
            const avgRange = getAvgRange(candles.slice(-20))

            if (priceChange < avgRange * 0.5) {
                scores.manipulation += 25
                signals.push('Volume spike with minimal price movement — manipulation')
            } else {
                scores.distribution += 20
                signals.push('Volume spike with directional move — distribution')
            }
        } else if (currentVol < avgVol * 0.5) {
            scores.accumulation += 15
            signals.push('Low volume — institutional accumulation')
        }
    }

    // ── Wick Analysis (Liquidity Sweeps) ──
    const last5 = candles.slice(-5)
    const recent20 = candles.slice(-20)
    const rangeHigh = Math.max(...recent20.map(c => parseFloat(c.mid.h)))
    const rangeLow = Math.min(...recent20.map(c => parseFloat(c.mid.l)))

    for (const c of last5) {
        const h = parseFloat(c.mid.h)
        const l = parseFloat(c.mid.l)
        const o = parseFloat(c.mid.o)
        const cl = parseFloat(c.mid.c)
        const upperWick = h - Math.max(o, cl)
        const lowerWick = Math.min(o, cl) - l
        const body = Math.abs(cl - o)

        // Long wick near range boundary = manipulation (stop hunt)
        if (h >= rangeHigh * 0.998 && upperWick > body * 1.5) {
            scores.manipulation += 20
            signals.push('Upper wick near range high — potential stop hunt')
            break
        }
        if (l <= rangeLow * 1.002 && lowerWick > body * 1.5) {
            scores.manipulation += 20
            signals.push('Lower wick near range low — potential stop hunt')
            break
        }
    }

    // ── Determine winning phase ──
    const entries = Object.entries(scores) as [AMDPhaseName, number][]
    entries.sort((a, b) => b[1] - a[1])
    const [topPhase, topScore] = entries[0]
    const totalScore = entries.reduce((sum, [, s]) => sum + s, 0)
    const confidence = totalScore > 0 ? Math.min(95, Math.round((topScore / totalScore) * 100)) : 0

    return {
        phase: topScore > 0 ? topPhase : 'unknown',
        confidence,
        signals,
    }
}

function getAvgRange(candles: OandaCandle[]): number {
    if (candles.length === 0) return 0
    const ranges = candles.map(c => parseFloat(c.mid.h) - parseFloat(c.mid.l))
    return ranges.reduce((a, b) => a + b, 0) / ranges.length
}
