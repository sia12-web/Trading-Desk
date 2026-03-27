/**
 * Multi-indicator trend scorer.
 * Scores 5 components (0-20 each) for a total 0-100 trend score.
 * ADX acts as gatekeeper: ADX < 20 → canScalp = false regardless.
 */
import { OandaCandle } from '@/lib/types/oanda'
import {
    calculateEMA,
    calculateRSI,
    calculateMACD,
    calculateSMA,
    calculateADX
} from '@/lib/utils/indicators'

export interface TrendAssessment {
    direction: 'bullish' | 'bearish' | 'neutral'
    score: number           // 0-100 absolute (50 = neutral)
    adxValue: number
    canScalp: boolean
    components: {
        ema: { score: number; detail: string }
        rsi: { score: number; detail: string }
        macd: { score: number; detail: string }
        volume: { score: number; detail: string }
        structure: { score: number; detail: string }
    }
}

function getHighs(candles: OandaCandle[]): number[] {
    return candles.map(c => parseFloat(c.mid.h))
}

function getLows(candles: OandaCandle[]): number[] {
    return candles.map(c => parseFloat(c.mid.l))
}

function getCloses(candles: OandaCandle[]): number[] {
    return candles.map(c => parseFloat(c.mid.c))
}

function getVolumes(candles: OandaCandle[]): number[] {
    return candles.map(c => c.volume)
}

export function assessTrend(candles: OandaCandle[], adxPeriod: number = 14): TrendAssessment {
    const highs = getHighs(candles)
    const lows = getLows(candles)
    const closes = getCloses(candles)
    const volumes = getVolumes(candles)
    const len = closes.length

    if (len < 60) {
        return {
            direction: 'neutral',
            score: 50,
            adxValue: 0,
            canScalp: false,
            components: {
                ema: { score: 0, detail: 'Insufficient data' },
                rsi: { score: 0, detail: 'Insufficient data' },
                macd: { score: 0, detail: 'Insufficient data' },
                volume: { score: 0, detail: 'Insufficient data' },
                structure: { score: 0, detail: 'Insufficient data' },
            }
        }
    }

    // 1. EMA Alignment (8/21/50) → 0-20
    const ema8 = calculateEMA(closes, 8)
    const ema21 = calculateEMA(closes, 21)
    const ema50 = calculateEMA(closes, 50)

    const last = len - 1
    let emaScore = 0
    let emaDetail = ''

    const e8 = ema8[last], e21 = ema21[last], e50 = ema50[last]
    if (!isNaN(e8) && !isNaN(e21) && !isNaN(e50)) {
        if (e8 > e21 && e21 > e50) {
            emaScore = 20
            emaDetail = `Bullish: EMA 8 > 21 > 50`
        } else if (e8 > e21 && e8 > e50) {
            emaScore = 14
            emaDetail = `Mostly bullish: EMA 8 leading`
        } else if (e8 < e21 && e21 < e50) {
            emaScore = 0
            emaDetail = `Bearish: EMA 8 < 21 < 50`
        } else if (e8 < e21 && e8 < e50) {
            emaScore = 6
            emaDetail = `Mostly bearish: EMA 8 lagging`
        } else {
            emaScore = 10
            emaDetail = `Tangled EMAs — no clear trend`
        }
    }

    // 2. RSI (14) → 0-20
    const rsi = calculateRSI(closes, 14)
    let rsiScore = 0
    let rsiDetail = ''

    const rsiVal = rsi[last]
    const rsiPrev = rsi[last - 1]
    if (!isNaN(rsiVal) && !isNaN(rsiPrev)) {
        if (rsiVal >= 55 && rsiVal <= 70 && rsiVal > rsiPrev) {
            rsiScore = 20
            rsiDetail = `RSI ${rsiVal.toFixed(1)} rising in bullish zone`
        } else if (rsiVal >= 55 && rsiVal <= 70) {
            rsiScore = 15
            rsiDetail = `RSI ${rsiVal.toFixed(1)} in bullish zone but flat`
        } else if (rsiVal >= 30 && rsiVal <= 45 && rsiVal < rsiPrev) {
            rsiScore = 0
            rsiDetail = `RSI ${rsiVal.toFixed(1)} falling in bearish zone`
        } else if (rsiVal >= 30 && rsiVal <= 45) {
            rsiScore = 5
            rsiDetail = `RSI ${rsiVal.toFixed(1)} in bearish zone but flat`
        } else if (rsiVal > 70) {
            rsiScore = 12
            rsiDetail = `RSI ${rsiVal.toFixed(1)} overbought — caution`
        } else if (rsiVal < 30) {
            rsiScore = 8
            rsiDetail = `RSI ${rsiVal.toFixed(1)} oversold — caution`
        } else {
            rsiScore = 10
            rsiDetail = `RSI ${rsiVal.toFixed(1)} neutral`
        }
    }

    // 3. MACD Histogram → 0-20
    const { histogram } = calculateMACD(closes, 12, 26, 9)
    let macdScore = 0
    let macdDetail = ''

    const h = histogram[last]
    const hPrev = histogram[last - 1]
    if (!isNaN(h) && !isNaN(hPrev)) {
        if (h > 0 && h > hPrev) {
            macdScore = 20
            macdDetail = `Histogram positive & increasing`
        } else if (h > 0 && h <= hPrev) {
            macdScore = 14
            macdDetail = `Histogram positive but weakening`
        } else if (h < 0 && h < hPrev) {
            macdScore = 0
            macdDetail = `Histogram negative & decreasing`
        } else if (h < 0 && h >= hPrev) {
            macdScore = 6
            macdDetail = `Histogram negative but recovering`
        } else {
            macdScore = 10
            macdDetail = `MACD histogram flat`
        }
    }

    // 4. Volume → 0-20
    const volSMA = calculateSMA(volumes, 20)
    let volumeScore = 0
    let volumeDetail = ''

    const vol = volumes[last]
    const avgVol = volSMA[last]
    if (!isNaN(avgVol) && avgVol > 0) {
        const volRatio = vol / avgVol
        const lastBullish = closes[last] > closes[last - 1]
        const trendBullish = emaScore > 10
        if (volRatio >= 1.5 && lastBullish === trendBullish) {
            volumeScore = 20
            volumeDetail = `Volume ${volRatio.toFixed(1)}x avg — confirms trend`
        } else if (volRatio >= 1.0 && lastBullish === trendBullish) {
            volumeScore = 15
            volumeDetail = `Volume ${volRatio.toFixed(1)}x avg — supports trend`
        } else if (volRatio < 0.7) {
            volumeScore = 8
            volumeDetail = `Volume ${volRatio.toFixed(1)}x avg — thin market`
        } else if (volRatio >= 1.5 && lastBullish !== trendBullish) {
            volumeScore = 4
            volumeDetail = `Volume ${volRatio.toFixed(1)}x avg — against trend`
        } else {
            volumeScore = 10
            volumeDetail = `Volume ${volRatio.toFixed(1)}x avg — neutral`
        }
    }

    // 5. Candle Structure (HH/HL or LH/LL) → 0-20
    let structureScore = 0
    let structureDetail = ''

    if (len >= 5) {
        let hhhl = 0
        let lhll = 0
        for (let i = len - 3; i < len; i++) {
            if (highs[i] > highs[i - 1] && lows[i] > lows[i - 1]) hhhl++
            if (highs[i] < highs[i - 1] && lows[i] < lows[i - 1]) lhll++
        }

        if (hhhl >= 3) {
            structureScore = 20
            structureDetail = `3 consecutive higher-highs/higher-lows`
        } else if (hhhl >= 2) {
            structureScore = 15
            structureDetail = `${hhhl} of 3 candles making HH/HL`
        } else if (lhll >= 3) {
            structureScore = 0
            structureDetail = `3 consecutive lower-highs/lower-lows`
        } else if (lhll >= 2) {
            structureScore = 5
            structureDetail = `${lhll} of 3 candles making LH/LL`
        } else {
            structureScore = 10
            structureDetail = `Mixed structure — consolidation`
        }
    }

    // Total Score
    const rawScore = emaScore + rsiScore + macdScore + volumeScore + structureScore

    // ADX Gatekeeper
    const adxResult = calculateADX(highs, lows, closes, adxPeriod)
    const adxValue = adxResult.adx[last]
    const validADX = !isNaN(adxValue) ? adxValue : 0

    let direction: 'bullish' | 'bearish' | 'neutral' = 'neutral'
    if (rawScore >= 70) direction = 'bullish'
    else if (rawScore <= 30) direction = 'bearish'

    const canScalp = rawScore >= 65 && validADX >= 20

    return {
        direction,
        score: rawScore,
        adxValue: validADX,
        canScalp,
        components: {
            ema: { score: emaScore, detail: emaDetail },
            rsi: { score: rsiScore, detail: rsiDetail },
            macd: { score: macdScore, detail: macdDetail },
            volume: { score: volumeScore, detail: volumeDetail },
            structure: { score: structureScore, detail: structureDetail },
        }
    }
}
