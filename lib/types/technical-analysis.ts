export type AnalysisType = 'macd' | 'volume' | 'pivot' | 'institutional' | 'decision'
export type Timeframe = 'Monthly' | 'Weekly' | 'Daily' | '4H' | '1H' | '15min'

export interface TechnicalAnalysis {
  id: string
  user_id: string
  pair: string
  timeframe: Timeframe
  analysis_type: AnalysisType
  structured_data: MacdStructuredData | VolumeStructuredData | PivotStructuredData | InstitutionalStructuredData | DecisionStructuredData | null
  narrative: string
  full_text: string
  screenshot_base64: string | null
  created_at: string
  updated_at: string
}

// --- MACD ---
export interface MacdStructuredData {
  macd_line_position: string
  histogram_state: string
  zero_line_relationship: string
  crossovers: Array<{
    type: 'bullish_cross' | 'bearish_cross'
    location: string
    recency: string
    significance: string
  }>
  divergences: Array<{
    type: 'regular_bullish' | 'regular_bearish' | 'hidden_bullish' | 'hidden_bearish'
    description: string
    reliability: string
  }>
  momentum_assessment: {
    direction: 'bullish' | 'bearish' | 'neutral'
    strength: 'strong' | 'moderate' | 'weak' | 'exhausting'
    reasoning: string
  }
  signal: {
    bias: 'bullish' | 'bearish' | 'neutral'
    confidence_percent: number
    watch_for: string
  }
}

// --- Volume ---
export interface VolumeStructuredData {
  volume_trend: string
  recent_volume_bars: Array<{
    description: string
    relative_size: string
    candle_color: 'bullish' | 'bearish'
    interpretation: string
  }>
  volume_patterns: Array<{
    pattern: string
    location: string
    implication: string
  }>
  divergences: Array<{
    type: 'price_up_volume_down' | 'price_down_volume_up' | 'breakout_no_volume' | 'breakout_with_volume'
    description: string
    significance: string
  }>
  volume_assessment: {
    confirms_trend: boolean
    reasoning: string
    watch_for: string
  }
}

// --- Pivot/S&R ---
export interface PivotStructuredData {
  key_levels: Array<{
    type: 'support' | 'resistance' | 'pivot' | 'round_number'
    price: string
    strength: 'strong' | 'moderate' | 'weak'
    touches: number
    description: string
  }>
  current_position: string
  nearest_support: { level: string; distance_pips: string }
  nearest_resistance: { level: string; distance_pips: string }
  breakout_analysis: {
    most_likely_break: 'support' | 'resistance'
    probability_percent: number
    reasoning: string
  }
  pivot_zones: Array<{
    zone: string
    significance: string
    action: string
  }>
  assessment: {
    bias: 'bullish' | 'bearish' | 'range_bound'
    reasoning: string
    watch_for: string
  }
}

// --- Institutional ---
export interface InstitutionalStructuredData {
  order_blocks: Array<{
    type: 'bullish' | 'bearish'
    zone: string
    description: string
  }>
  liquidity_pools: Array<{
    location: string
    type: 'buy_stops' | 'sell_stops'
    hunted: boolean
    description: string
  }>
  fair_value_gaps: Array<{
    location: string
    filled: boolean
    implication: string
  }>
  break_of_structure: {
    detected: boolean
    type: 'BOS' | 'CHoCH' | null
    direction: 'bullish' | 'bearish' | null
    description: string
  }
  premium_discount: {
    zone: 'premium' | 'discount' | 'equilibrium'
    implication: string
  }
  cross_analysis_synthesis: string
  institutional_bias: {
    direction: 'long' | 'short' | 'neutral'
    confidence_percent: number
    reasoning: string
  }
  trap_warning: string
}

// --- Decision ---
export interface DecisionStructuredData {
  analyses_considered: string[]
  confluence_score: number
  trend_verdict: {
    direction: 'continuation' | 'reversal' | 'unclear'
    confidence_percent: number
    reasoning: string
  }
  bullish_factors: string[]
  bearish_factors: string[]
  conflicting_signals: string[]
  recommendation: {
    action: 'buy' | 'sell' | 'wait' | 'close_existing'
    entry_zone: string
    stop_loss_zone: string
    target_zone: string
    risk_reward: string
    timing: string
  }
  final_verdict: string
}
