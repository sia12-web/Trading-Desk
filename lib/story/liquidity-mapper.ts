import type { OandaCandle } from '@/lib/types/oanda'
import type { LiquidityZone } from './types'

/**
 * Map liquidity zones: equal highs/lows, stop hunts, and order blocks.
 * These represent areas where stop losses cluster (Smart Money targets).
 */
export function mapLiquidityZones(candles: OandaCandle[], timeframe: string): LiquidityZone[] {
    if (candles.length < 20) return []

    const zones: LiquidityZone[] = []

    zones.push(...findEqualHighsLows(candles, timeframe))
    zones.push(...findStopHunts(candles, timeframe))
    zones.push(...findOrderBlocks(candles, timeframe))

    return zones
}

/**
 * Equal highs/lows = liquidity pools where stops accumulate.
 * When multiple candles hit the same level, retail stops cluster there.
 */
function findEqualHighsLows(candles: OandaCandle[], timeframe: string): LiquidityZone[] {
    const zones: LiquidityZone[] = []
    const threshold = getThreshold(candles)

    // Check last 50 candles for equal highs
    const slice = candles.slice(-50)
    const highs = slice.map(c => parseFloat(c.mid.h))
    const lows = slice.map(c => parseFloat(c.mid.l))

    // Find clusters of similar highs
    for (let i = 0; i < highs.length; i++) {
        let count = 0
        for (let j = i + 1; j < highs.length; j++) {
            if (Math.abs(highs[j] - highs[i]) < threshold) count++
        }
        if (count >= 2) {
            // Check if this level hasn't been broken yet
            const levelPrice = highs[i]
            const lastPrice = parseFloat(slice[slice.length - 1].mid.c)
            const swept = lastPrice > levelPrice

            zones.push({
                type: 'equal_highs',
                price: levelPrice,
                timeframe,
                description: `Equal highs at ${levelPrice.toFixed(5)} (${count + 1} touches) — buy-side liquidity pool`,
                swept,
            })
            break // only report the most significant cluster
        }
    }

    // Find clusters of similar lows
    for (let i = 0; i < lows.length; i++) {
        let count = 0
        for (let j = i + 1; j < lows.length; j++) {
            if (Math.abs(lows[j] - lows[i]) < threshold) count++
        }
        if (count >= 2) {
            const levelPrice = lows[i]
            const lastPrice = parseFloat(slice[slice.length - 1].mid.c)
            const swept = lastPrice < levelPrice

            zones.push({
                type: 'equal_lows',
                price: levelPrice,
                timeframe,
                description: `Equal lows at ${levelPrice.toFixed(5)} (${count + 1} touches) — sell-side liquidity pool`,
                swept,
            })
            break
        }
    }

    return zones
}

/**
 * Stop hunts: wicks that exceed a range then close back inside.
 * Classic manipulation — price grabs liquidity then reverses.
 */
function findStopHunts(candles: OandaCandle[], timeframe: string): LiquidityZone[] {
    const zones: LiquidityZone[] = []
    if (candles.length < 25) return zones

    const recent = candles.slice(-10)
    const lookback = candles.slice(-30, -10)
    const rangeHigh = Math.max(...lookback.map(c => parseFloat(c.mid.h)))
    const rangeLow = Math.min(...lookback.map(c => parseFloat(c.mid.l)))

    for (const c of recent) {
        const h = parseFloat(c.mid.h)
        const l = parseFloat(c.mid.l)
        const o = parseFloat(c.mid.o)
        const cl = parseFloat(c.mid.c)

        // Wick above range high but close inside range
        if (h > rangeHigh && Math.max(o, cl) < rangeHigh) {
            zones.push({
                type: 'stop_hunt',
                price: h,
                timeframe,
                description: `Stop hunt above ${rangeHigh.toFixed(5)} — wick to ${h.toFixed(5)} then reversed`,
                swept: true,
            })
        }

        // Wick below range low but close inside range
        if (l < rangeLow && Math.min(o, cl) > rangeLow) {
            zones.push({
                type: 'stop_hunt',
                price: l,
                timeframe,
                description: `Stop hunt below ${rangeLow.toFixed(5)} — wick to ${l.toFixed(5)} then reversed`,
                swept: true,
            })
        }
    }

    return zones
}

/**
 * Order blocks: last opposing candle before a strong impulse move.
 * Smart money leaves unfilled orders at these levels.
 */
function findOrderBlocks(candles: OandaCandle[], timeframe: string): LiquidityZone[] {
    const zones: LiquidityZone[] = []
    if (candles.length < 10) return zones

    const recent = candles.slice(-20)
    const avgRange = getAvgRange(recent)

    for (let i = 1; i < recent.length - 1; i++) {
        const prev = recent[i - 1]
        const curr = recent[i]
        const next = recent[i + 1]

        const currO = parseFloat(curr.mid.o)
        const currC = parseFloat(curr.mid.c)
        const nextO = parseFloat(next.mid.o)
        const nextC = parseFloat(next.mid.c)
        const prevO = parseFloat(prev.mid.o)
        const prevC = parseFloat(prev.mid.c)

        const nextRange = Math.abs(nextC - nextO)

        // Bullish order block: last bearish candle before strong bullish impulse
        if (prevC < prevO && currC < currO && nextC > nextO && nextRange > avgRange * 2) {
            zones.push({
                type: 'order_block',
                price: parseFloat(curr.mid.l),
                timeframe,
                description: `Bullish order block at ${parseFloat(curr.mid.l).toFixed(5)} — demand zone`,
                swept: false,
            })
        }

        // Bearish order block: last bullish candle before strong bearish impulse
        if (prevC > prevO && currC > currO && nextC < nextO && nextRange > avgRange * 2) {
            zones.push({
                type: 'order_block',
                price: parseFloat(curr.mid.h),
                timeframe,
                description: `Bearish order block at ${parseFloat(curr.mid.h).toFixed(5)} — supply zone`,
                swept: false,
            })
        }
    }

    return zones
}

function getAvgRange(candles: OandaCandle[]): number {
    const ranges = candles.map(c => Math.abs(parseFloat(c.mid.c) - parseFloat(c.mid.o)))
    return ranges.reduce((a, b) => a + b, 0) / ranges.length
}

function getThreshold(candles: OandaCandle[]): number {
    // ~0.05% of average price — determines "equal" level tolerance
    const prices = candles.slice(-20).map(c => parseFloat(c.mid.c))
    const avg = prices.reduce((a, b) => a + b, 0) / prices.length
    return avg * 0.0005
}
