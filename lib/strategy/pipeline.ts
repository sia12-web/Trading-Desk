import { createClient } from '@/lib/supabase/server'
import { PipelineInput, PipelineLayer, PipelineResult } from './types'
import { assessTrend } from '@/lib/utils/trend-detector'
import { getCandles } from '@/lib/oanda/client'
import { displayToOandaPair } from '@/lib/utils/forex'

export async function runPipeline(input: PipelineInput): Promise<PipelineResult> {
    const supabase = await createClient()
    const layers: PipelineLayer[] = []

    // Layer 1: Wave Context
    const { data: waveAnalysis } = await supabase
        .from('wave_analysis')
        .select('*')
        .eq('user_id', input.userId)
        .eq('pair', input.instrument)
        .order('created_at', { ascending: false })
        .limit(1)
        .single()

    if (waveAnalysis && !isExpired(waveAnalysis.created_at, 30)) {
        const analysis = waveAnalysis.analysis_result
        const monthlyBias = analysis.monthly_analysis?.trend_direction?.toLowerCase()

        // Check if wave bias matches proposed direction
        const status = monthlyBias === directionToBias(input.proposedDirection) ? "confirmed" :
            monthlyBias === "neutral" ? "neutral" : "conflicting"

        layers.push({
            name: "Wave Context",
            status,
            bias: monthlyBias as any,
            confidence: waveAnalysis.confidence === "high" ? 80 : waveAnalysis.confidence === "moderate" ? 60 : 40,
            details: `Monthly: ${analysis.monthly_analysis?.current_position || 'Unknown'}. Weekly: ${analysis.weekly_analysis?.current_position || 'Unknown'}.`,
            canProceed: true  // wave layer never blocks
        })
    } else {
        layers.push({
            name: "Wave Context",
            status: "unavailable",
            bias: null,
            confidence: 0,
            details: waveAnalysis ? "Wave analysis expired (>30 days). Update your monthly/weekly count." : "No wave analysis for this pair.",
            canProceed: true
        })
    }

    // Layer 2: Candle Identification
    const { data: candleAnalysis } = await supabase
        .from('candle_analysis')
        .select('*')
        .eq('user_id', input.userId)
        .eq('instrument', input.instrument)
        .order('created_at', { ascending: false })
        .limit(1)
        .single()

    if (candleAnalysis && !isExpired(candleAnalysis.created_at, 1)) {
        const analysis = candleAnalysis.analysis_result
        const prob = analysis.trend_assessment?.continuation_probability || 50
        const prevailing = analysis.prevailing_trend?.toLowerCase() || ""

        const candleBias = prob > 55 ?
            (prevailing.includes("bullish") || prevailing.includes("up") ? "bullish" : "bearish") : "neutral"

        const status = candleBias === directionToBias(input.proposedDirection) ? "confirmed" :
            candleBias === "neutral" ? "neutral" : "conflicting"

        layers.push({
            name: "Candle Identification",
            status,
            bias: candleBias as any,
            confidence: prob,
            details: `${analysis.patterns_identified?.[0]?.pattern || "No clear pattern"}. Continuation: ${prob}%.`,
            canProceed: true  // candle layer never blocks
        })
    } else {
        layers.push({
            name: "Candle Identification",
            status: "unavailable",
            bias: null,
            confidence: 0,
            details: "No recent candle analysis. Upload a chart screenshot for candle context.",
            canProceed: true
        })
    }

    // Layer 3: Trend Confirmation (MANDATORY)
    const detectionTimeframe = mapToDetectionTimeframe(input.strategyTimeframe)
    const oandaInstrument = displayToOandaPair(input.instrument)

    // Fetch candles for trend detection (need at least 100 for indicators)
    const { data: candles, error: candleErr } = await getCandles({
        instrument: oandaInstrument,
        count: 100,
        granularity: detectionTimeframe
    })

    const trendSignal = (candles && candles.length >= 60) ? assessTrend(candles) : { direction: 'neutral', score: 0, adxValue: 0, canScalp: false }
    const trendBias = trendSignal.direction // bullish, bearish, neutral

    const status = trendBias === "neutral" ? "neutral" :
        trendBias === directionToBias(input.proposedDirection) ? "confirmed" : "conflicting"

    layers.push({
        name: "Trend Confirmation",
        status,
        bias: trendBias as any,
        confidence: trendSignal.score,
        details: `${trendSignal.direction.toUpperCase()} (score: ${trendSignal.score}/100, ADX: ${trendSignal.adxValue.toFixed(1)}).`,
        canProceed: trendBias !== "neutral" && (trendSignal.canScalp || trendSignal.score > 60)
    })

    // Calculate overall result
    const confirmedLayers = layers.filter(l => l.status === "confirmed")
    const conflictingLayers = layers.filter(l => l.status === "conflicting")
    const availableLayers = layers.filter(l => l.status !== "unavailable")

    const alignmentScore = availableLayers.length > 0
        ? Math.round((confirmedLayers.length / availableLayers.length) * 100)
        : 0

    const trendLayer = layers.find(l => l.name === "Trend Confirmation")
    const canTrade = trendLayer?.canProceed ?? false

    return {
        layers,
        overallAlignment: conflictingLayers.length > 0 ? "conflicting" :
            confirmedLayers.length >= 2 ? "aligned" :
                confirmedLayers.length === 1 ? "partial" : "insufficient",
        canTrade,
        directionBias: trendBias === "bullish" ? "long" : trendBias === "bearish" ? "short" : "neutral",
        alignmentScore,
        warnings: conflictingLayers.map(l => `${l.name} says ${l.bias} — conflicts with your ${input.proposedDirection}`),
        summary: generateSummary(layers, canTrade, alignmentScore),
        manoukContext: generateManoukContext(layers, canTrade, alignmentScore)
    }
}

function isExpired(createdAt: string, days: number): boolean {
    const date = new Date(createdAt)
    const now = new Date()
    const diffTime = Math.abs(now.getTime() - date.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays > days
}

function directionToBias(direction: "long" | "short"): "bullish" | "bearish" {
    return direction === "long" ? "bullish" : "bearish"
}

function mapToDetectionTimeframe(strategyTF: string): any {
    const map: Record<string, string> = {
        "H1": "H4",    // 1-hour strategy → detect on 4H
        "H4": "D",     // 4-hour strategy → detect on daily
        "D": "W",      // daily strategy → detect on weekly
    }
    return map[strategyTF] || "H4"
}

function generateSummary(layers: PipelineLayer[], canTrade: boolean, score: number): string {
    if (!canTrade) return "Trend layer blocked trade. Market is sideways or conflicting."
    const layersCount = layers.filter(l => l.status !== "unavailable").length
    const confirmedCount = layers.filter(l => l.status === "confirmed").length
    return `Pipeline ${score}% aligned (${confirmedCount}/${layersCount} layers confirmed). Ready to scan.`
}

function generateManoukContext(layers: PipelineLayer[], canTrade: boolean, score: number): string {
    const confirmed = layers.filter(l => l.status === "confirmed").map(l => l.name)
    const conflicting = layers.filter(l => l.status === "conflicting").map(l => l.name)

    let ctx = `PIPELINE: ${score}% alignment. `
    if (confirmed.length > 0) ctx += `Confirmed by: ${confirmed.join(', ')}. `
    if (conflicting.length > 0) ctx += `Conflicts: ${conflicting.join(', ')}. `
    if (!canTrade) ctx += "TREND BLOCKED."

    return ctx.trim().substring(0, 160) // Keep it compact
}
