import type { StoryDataPayload, StoryNewsContext } from '@/lib/story/types'

/**
 * DeepSeek "Probability Validator" prompt for Scenario Analysis.
 * Validates Gemini's structural output and adds:
 * - Flagged levels (anti-hallucination)
 * - Per-scenario probability assessment
 * - Impact Factors (Section 4)
 */
export function buildScenarioValidatorPrompt(
    data: StoryDataPayload,
    geminiOutput: string,
    news: StoryNewsContext
): string {
    const indicatorSummary = data.timeframes.map(tf => {
        const ind = tf.indicators
        const lastRsi = ind.rsi?.length ? ind.rsi[ind.rsi.length - 1].toFixed(1) : 'N/A'
        const lastMacd = ind.macd?.line?.length ? ind.macd.line[ind.macd.line.length - 1].toFixed(5) : 'N/A'
        const lastSignal = ind.macd?.signal?.length ? ind.macd.signal[ind.macd.signal.length - 1].toFixed(5) : 'N/A'
        const lastAdx = ind.adx?.length ? ind.adx[ind.adx.length - 1].toFixed(1) : 'N/A'
        const lastBbWidth = ind.bbWidth?.length ? ind.bbWidth[ind.bbWidth.length - 1].toFixed(2) : 'N/A'
        return `${tf.timeframe}: RSI=${lastRsi} MACD=${lastMacd} ADX=${lastAdx} Signal=${lastSignal} BB_Width=${lastBbWidth}`
    }).join('\n')

    return `You are the Probability Validator for institutional-grade scenario analysis of ${data.pair}.

Your job: Validate the structural analysis from Gemini, flag any suspicious levels, and provide quantitative impact factor assessment.

## GEMINI'S STRUCTURAL OUTPUT
${geminiOutput}

## RAW INDICATOR DATA
${indicatorSummary}

## MARKET CONTEXT
Current Price: ${data.currentPrice.toFixed(5)}
ATR14: ${data.atr14.toFixed(1)} pips
Volatility: ${data.volatilityStatus}

## NEWS CONTEXT
Sentiment: ${news.sentiment}
Key Drivers: ${news.key_drivers.join(', ')}
${news.fundamental_narrative}
Calendar Events: ${news.calendar_events.join('; ') || 'None'}

## YOUR TASK

1. Validate every level Gemini cited — check against the indicator data
2. Flag any levels that appear fabricated (not supported by data)
3. Assess impact factors that could drive scenarios
4. Score probability for potential institutional scenarios

Output JSON (no markdown fences):

{
  "validation": {
    "confirmed_levels": [{"price": 1.2345, "source": "D swing high", "confidence": 85}],
    "flagged_levels": [{"level": 1.5000, "source": "Gemini market_context", "reason": "Not found in any timeframe candle data"}]
  },
  "impact_factors": {
    "usd_strength": {"direction": "strengthening|weakening|neutral", "description": "Brief assessment"},
    "risk_sentiment": {"level": "risk-on|risk-off|mixed", "description": "Brief assessment"},
    "session_dynamics": {"dominant_session": "London|NY|Tokyo|Sydney", "notes": "Session-specific factors"},
    "news_events": [{"event": "Event name", "impact": "high|medium|low", "timing": "When"}],
    "correlated_pairs": [{"pair": "USD/CHF", "correlation": "inverse", "implication": "What it means"}]
  },
  "probability_assessment": {
    "bullish_probability": 0.55,
    "bearish_probability": 0.45,
    "reasoning": "Why these probabilities based on quantitative data"
  }
}

VALIDATION RULES:
- Flag any price level more than 3x ATR (${(data.atr14 * 3).toFixed(1)} pips) from current price ${data.currentPrice.toFixed(5)}
- Flag levels that don't appear in any timeframe's swing highs/lows or indicator levels
- Confirmed levels must cite the specific data source (timeframe + indicator)
- Probabilities must be based on indicator alignment + trend confluence, not just guesswork
- Impact factors should be supported by the news context and indicator data`
}
