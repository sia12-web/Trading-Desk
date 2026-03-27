// ── Scenario Analysis Types ──

export interface MarketContext {
    structure_summary: string
    key_levels: Array<{
        price: number
        type: 'support' | 'resistance' | 'pivot'
        timeframe: string
        significance: string
    }>
    liquidity_pools: Array<{
        price: number
        type: 'buy_side' | 'sell_side'
        description: string
    }>
    anomalies: string[]
    current_bias: 'bullish' | 'bearish' | 'neutral'
}

export interface InstitutionalScenario {
    id: string
    title: string
    direction: 'bullish' | 'bearish'
    probability: number
    narrative: string  // institutional story (who's trapped, liquidity targets)
    trigger: {
        level: number
        description: string
    }
    invalidation: {
        level: number
        description: string
    }
    targets: number[]
    timeframe: string  // expected timeframe for this scenario
}

export interface HistoricalPatterns {
    weekly_behaviors: Array<{
        pattern: string
        frequency: string
        last_occurrence: string
    }>
    conditional_patterns: Array<{
        condition: string   // "if X"
        outcome: string     // "then Y"
        reliability: string // "high" | "medium" | "low"
    }>
}

export interface ImpactFactors {
    usd_strength: { direction: string; description: string }
    risk_sentiment: { level: string; description: string }
    session_dynamics: { dominant_session: string; notes: string }
    news_events: Array<{ event: string; impact: string; timing: string }>
    correlated_pairs: Array<{ pair: string; correlation: string; implication: string }>
}

export interface Takeaways {
    preparation_list: Array<{
        action: string
        priority: 'high' | 'medium' | 'low'
    }>
    key_levels_watchlist: Array<{
        price: number
        label: string
        action_if_reached: string
    }>
    avoid_list: string[]
}

export interface ScenarioAnalysisResult {
    market_context: MarketContext
    scenarios: InstitutionalScenario[]
    historical_patterns: HistoricalPatterns
    impact_factors: ImpactFactors
    takeaways: Takeaways
    summary: string
    confidence: number
}

// ── Database row shape ──

export interface ScenarioAnalysisRow {
    id: string
    user_id: string
    pair: string
    market_context: MarketContext
    scenarios: InstitutionalScenario[]
    historical_patterns: HistoricalPatterns
    impact_factors: ImpactFactors
    takeaways: Takeaways
    summary: string | null
    confidence: number | null
    current_price: number | null
    atr14: number | null
    gemini_output: Record<string, unknown> | null
    deepseek_output: Record<string, unknown> | null
    claude_output: Record<string, unknown> | null
    news_context: Record<string, unknown> | null
    created_at: string
    expires_at: string
}
