import { OandaCandle } from "@/lib/types/oanda"

export interface PipelineInput {
    instrument: string
    strategyTimeframe: string  // "H1", "H4", "D" — the timeframe the strategy executes on
    proposedDirection: "long" | "short"
    userId: string
}

export interface PipelineLayer {
    name: string
    status: "confirmed" | "conflicting" | "neutral" | "unavailable"
    bias: "bullish" | "bearish" | "neutral" | null
    confidence: number  // 0-100
    details: string
    canProceed: boolean  // false only if mandatory layer fails
}

export interface PipelineResult {
    layers: PipelineLayer[]
    overallAlignment: "aligned" | "partial" | "conflicting" | "insufficient"
    canTrade: boolean  // true if trend layer confirms and no hard blocks
    directionBias: "long" | "short" | "neutral"
    alignmentScore: number  // 0-100, how many layers agree
    warnings: string[]
    summary: string  // one-line for pre-trade panel
    manoukContext: string  // compact string for coaching (~80 tokens)
}

export interface StrategySignal {
    direction: "long" | "short"
    triggerPrice: number
    triggerTime: Date
    reason: string
    confidence: number  // 0-100 based on how many conditions are met
    pipelineAlignment: number  // from the pipeline
}

export interface ProposedTrade {
    instrument: string
    direction: "long" | "short"
    entryPrice: number
    entryType: "market" | "limit"
    stopLoss: number
    takeProfit: number[]  // can have multiple TPs
    units: number
    riskPercent: number
    riskRewardRatio: number
    strategyName: string
    pipelineResult: PipelineResult | null
    confidence: number
}

export interface PivotPointLevels {
    pp: number     // Pivot Point (central)
    r1: number     // Resistance 1
    r2: number     // Resistance 2
    r3: number     // Resistance 3
    s1: number     // Support 1
    s2: number     // Support 2
    s3: number     // Support 3

    // Midpoints
    m1: number     // Midpoint between S1 and PP
    m2: number     // Midpoint between PP and R1
    m3: number     // Midpoint between R1 and R2
    m4: number     // Midpoint between S1 and S2
}

export interface CalculatedIndicators {
    ema: Record<number, number[]>  // period → values
    sma: Record<number, number[]>
    rsi: number[]
    macd: { line: number[], signal: number[], histogram: number[] }
    stochastic: { k: number[], d: number[] }
    bollingerBands: { upper: number[], middle: number[], lower: number[] }
    bbWidth: number[]  // (upper - lower) / middle * 100 — measures Bollinger Band squeeze
    atr: number[]
    pivotPoints: PivotPointLevels
    parabolicSar: { sar: number[], direction: string[] }
    adx: number[]
    volume: number[]
    volumeSma: number[]
}

export interface Strategy {
    id: string
    name: string
    displayName: string
    description: string
    timeframe: string  // primary execution timeframe
    type: "manual" | "semi_auto" | "auto"

    // Required indicators
    requiredIndicators: string[]

    // Strategy-specific parameters
    parameters: Record<string, number | string | boolean>

    // Generate signals from candle data + indicators
    generateSignals(
        candles: OandaCandle[],
        indicators: CalculatedIndicators,
        pipelineResult: PipelineResult
    ): StrategySignal[]

    // Calculate entry, SL, TP from a signal
    calculateTrade(
        signal: StrategySignal,
        candles: OandaCandle[],
        accountBalance: number,
        riskPercent: number,
        pipLocation: number,
        instrument?: string
    ): ProposedTrade
}
