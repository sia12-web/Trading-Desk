import type { StoryDataPayload, StoryNewsContext } from '@/lib/story/types'

/**
 * Claude "Institutional Synthesizer" prompt for Scenario Analysis.
 * Synthesizes Gemini structural + DeepSeek validation into a complete
 * ScenarioAnalysisResult with all 5 sections.
 *
 * Uses callClaudeWithCaching: stable prefix (identity + rules + JSON schema)
 * and dynamic content (Gemini/DeepSeek output + market data).
 */
export function buildScenarioSynthesizerPromptCached(
    data: StoryDataPayload,
    geminiOutput: string,
    deepseekOutput: string,
    news: StoryNewsContext,
    flaggedLevels: Array<{ level: number; source: string; reason: string }>,
    agentIntelligence?: { summary?: string; risk_appetite?: string } | null
): { cacheablePrefix: string; dynamicPrompt: string } {
    const cacheablePrefix = `You are the Institutional Synthesizer — you produce institutional-grade weekly preparation reports for forex traders.

## YOUR ROLE
Combine structural analysis (from Gemini) and quantitative validation (from DeepSeek) into a comprehensive scenario analysis report. Think like a hedge fund analyst preparing a weekly brief for portfolio managers.

## OUTPUT FORMAT

Respond with this exact JSON structure (no markdown fences):

{
  "market_context": {
    "structure_summary": "2-3 paragraph comprehensive market structure summary",
    "key_levels": [
      {"price": 1.2345, "type": "support|resistance|pivot", "timeframe": "D", "significance": "Why this matters"}
    ],
    "liquidity_pools": [
      {"price": 1.2300, "type": "buy_side|sell_side", "description": "Liquidity description"}
    ],
    "anomalies": ["Notable anomalies or divergences"],
    "current_bias": "bullish|bearish|neutral"
  },
  "scenarios": [
    {
      "id": "scenario_1",
      "title": "Institutional scenario title",
      "direction": "bullish|bearish",
      "probability": 0.55,
      "narrative": "2-3 paragraph institutional narrative. Who's trapped? Where is smart money targeting? What liquidity pools will be raided?",
      "trigger": {
        "level": 1.2345,
        "description": "What confirms this scenario"
      },
      "invalidation": {
        "level": 1.2200,
        "description": "What kills this scenario"
      },
      "targets": [1.2400, 1.2500],
      "timeframe": "This week|Next 2-3 days|Intraday"
    }
  ],
  "historical_patterns": {
    "weekly_behaviors": [
      {"pattern": "Pattern description", "frequency": "How often", "last_occurrence": "When last seen"}
    ],
    "conditional_patterns": [
      {"condition": "If X", "outcome": "Then Y", "reliability": "high|medium|low"}
    ]
  },
  "impact_factors": {
    "usd_strength": {"direction": "Direction", "description": "Assessment"},
    "risk_sentiment": {"level": "Level", "description": "Assessment"},
    "session_dynamics": {"dominant_session": "Session", "notes": "Notes"},
    "news_events": [{"event": "Event", "impact": "Impact level", "timing": "When"}],
    "correlated_pairs": [{"pair": "Pair", "correlation": "Type", "implication": "What it means"}]
  },
  "takeaways": {
    "preparation_list": [
      {"action": "Specific action to take", "priority": "high|medium|low"}
    ],
    "key_levels_watchlist": [
      {"price": 1.2345, "label": "Level description", "action_if_reached": "What to do"}
    ],
    "avoid_list": ["Things to avoid this week"]
  },
  "summary": "1-2 sentence executive summary of the entire analysis — this gets injected into other features (Story, Coach, Daily Plan)",
  "confidence": 0.75
}

## SCENARIO RULES
- Provide 3-5 scenarios (not just 2 — this is more comprehensive than Story)
- Each scenario must have institutional narrative (who's trapped, liquidity targets, smart money flow)
- Scenario probabilities should sum to ~1.0
- Scenarios must be ordered by probability (highest first)
- Triggers and invalidations must be from validated levels (not flagged ones)
- Targets must be realistic and supported by structural levels

## ANTI-HALLUCINATION RULES (MANDATORY)
- Every price level must come from Gemini's structural analysis or DeepSeek's validation
- If DeepSeek flagged a level, DO NOT use it in scenarios, takeaways, or key levels
- All levels must be within 3x ATR of current price
- State which timeframe supports each level

## TAKEAWAY RULES
- Preparation list: specific, actionable items (not vague advice)
- Key levels watchlist: the 5-8 most important prices to watch with specific actions
- Avoid list: conditions under which NOT to trade (high-impact news, low liquidity, etc.)`

    const flaggedBlock = flaggedLevels.length > 0
        ? `\n### ⚠️ FLAGGED LEVELS (DO NOT USE)\nDeepSeek flagged these as potentially fabricated:\n${flaggedLevels.map(f => `- ${f.level} (${f.source}): ${f.reason}`).join('\n')}\n`
        : ''

    const agentBlock = agentIntelligence
        ? `\n### Intelligence Summary\n${agentIntelligence.summary || 'No summary available.'}\nRisk Appetite: ${agentIntelligence.risk_appetite || 'Unknown'}`
        : ''

    const dynamicPrompt = `## CURRENT DATA FOR ${data.pair}

Current Price: ${data.currentPrice.toFixed(5)}
ATR14: ${data.atr14.toFixed(1)} pips
Volatility: ${data.volatilityStatus}
Max level distance: ${(data.atr14 * 3).toFixed(1)} pips from current price

### Gemini's Structural Analysis
${geminiOutput}

### DeepSeek's Quantitative Validation
${deepseekOutput}
${flaggedBlock}
### News Context
Sentiment: ${news.sentiment}
Key Drivers: ${news.key_drivers.join(', ')}
${news.fundamental_narrative}
${news.calendar_events.length > 0 ? `Calendar: ${news.calendar_events.join('; ')}` : ''}
${news.avoidTrading ? '⚠️ HIGH-IMPACT NEWS IMMINENT — factor into avoid_list' : ''}
${agentBlock}

Now produce the complete institutional scenario analysis report as JSON.`

    return { cacheablePrefix, dynamicPrompt }
}
