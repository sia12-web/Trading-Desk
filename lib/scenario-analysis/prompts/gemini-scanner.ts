import type { StoryDataPayload, StoryNewsContext } from '@/lib/story/types'

/**
 * Gemini "Structural Scanner" prompt for Scenario Analysis.
 * Processes all 5 TFs of raw data to extract:
 * - Market Context (Section 1): key highs/lows, imbalances, liquidity pools, anomalies
 * - Historical Patterns (Section 3): repeating weekly behaviors, conditional patterns
 */
export function buildScenarioScannerPrompt(
    data: StoryDataPayload,
    news: StoryNewsContext
): string {
    const tfSummaries = data.timeframes.map(tf => {
        const candles = tf.candles
        const last = candles[candles.length - 1]
        const highs = tf.swingHighs.slice(0, 5).map(h => h.price.toFixed(5)).join(', ')
        const lows = tf.swingLows.slice(0, 5).map(l => l.price.toFixed(5)).join(', ')

        const ind = tf.indicators
        const lastRsi = ind.rsi?.length ? ind.rsi[ind.rsi.length - 1].toFixed(1) : 'N/A'
        const lastMacd = ind.macd?.line?.length ? ind.macd.line[ind.macd.line.length - 1].toFixed(5) : 'N/A'
        const lastAdx = ind.adx?.length ? ind.adx[ind.adx.length - 1].toFixed(1) : 'N/A'
        const lastBbWidth = ind.bbWidth?.length ? ind.bbWidth[ind.bbWidth.length - 1].toFixed(2) : 'N/A'

        return `### ${tf.timeframe} Timeframe (${candles.length} candles)
Last candle: O=${parseFloat(last.mid.o).toFixed(5)} H=${parseFloat(last.mid.h).toFixed(5)} L=${parseFloat(last.mid.l).toFixed(5)} C=${parseFloat(last.mid.c).toFixed(5)}
Trend: ${tf.trend.direction} (score ${tf.trend.score}/100)
Swing Highs: ${highs || 'None detected'}
Swing Lows: ${lows || 'None detected'}
Patterns: ${tf.patterns.join(', ') || 'None'}
Indicators: RSI=${lastRsi}, MACD=${lastMacd}, ADX=${lastAdx}, BB_Width=${lastBbWidth}`
    }).join('\n\n')

    const liquidityBlock = data.liquidityZones.length > 0
        ? data.liquidityZones.map(z => `- ${z.type} at ${z.price.toFixed(5)} (${z.timeframe}): ${z.description}${z.swept ? ' [SWEPT]' : ''}`).join('\n')
        : 'No liquidity zones detected.'

    const amdBlock = Object.entries(data.amdPhases)
        .map(([tf, p]) => `- ${tf}: ${p.phase} (${p.confidence}% confidence)`)
        .join('\n')

    return `You are the Structural Scanner for institutional-grade scenario analysis of ${data.pair}.

Your job: Analyze ALL timeframe data and extract a comprehensive market structure map + historical pattern analysis.

## CURRENT MARKET DATA

Current Price: ${data.currentPrice.toFixed(5)}
ATR14: ${data.atr14.toFixed(1)} pips
Volatility: ${data.volatilityStatus}

## AMD Phase Detection
${amdBlock}

## Liquidity Zones
${liquidityBlock}

## Timeframe Analysis
${tfSummaries}

## News Context
Sentiment: ${news.sentiment}
Key Drivers: ${news.key_drivers.join(', ')}
${news.fundamental_narrative}
${news.avoidTrading ? '⚠️ HIGH-IMPACT NEWS IMMINENT' : ''}

## YOUR TASK

Analyze the complete structural picture and output JSON (no markdown fences):

{
  "market_context": {
    "structure_summary": "2-3 paragraph summary of the current market structure across all timeframes",
    "key_levels": [
      {"price": 1.2345, "type": "support|resistance|pivot", "timeframe": "D", "significance": "Why this level matters"}
    ],
    "liquidity_pools": [
      {"price": 1.2300, "type": "buy_side|sell_side", "description": "What liquidity sits here"}
    ],
    "anomalies": ["Any unusual price behavior, divergences, or structural oddities"],
    "current_bias": "bullish|bearish|neutral"
  },
  "historical_patterns": {
    "weekly_behaviors": [
      {"pattern": "Description of repeating pattern", "frequency": "How often it occurs", "last_occurrence": "When it last happened"}
    ],
    "conditional_patterns": [
      {"condition": "If X happens", "outcome": "Then Y typically follows", "reliability": "high|medium|low"}
    ]
  }
}

GROUNDING RULES (MANDATORY):
- Every price level MUST come from actual swing high/low data or indicator levels in the data above
- Never invent levels — only cite what exists in the candle data
- Key levels should span multiple timeframes where possible (confluence)
- Liquidity pools should be based on equal highs/lows or stop hunt zones from the data
- Historical patterns should be derived from the candle data patterns, not assumed
- All prices must be within 3x ATR (${(data.atr14 * 3).toFixed(1)} pips) of current price ${data.currentPrice.toFixed(5)}`
}
