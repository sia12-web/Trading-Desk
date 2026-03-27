import type { SupabaseClient } from '@supabase/supabase-js'
import { getLatestScenarioAnalysis } from '@/lib/data/scenario-analyses'
import type { ScenarioAnalysisRow, InstitutionalScenario, MarketContext, ImpactFactors, HistoricalPatterns, Takeaways } from './types'

/**
 * Build a rich context block from a scenario analysis for injection
 * into the Story narrator prompt. Includes full scenario details,
 * market context, impact factors, and actionable levels so the
 * narrator can ground its episode in the institutional analysis.
 */
export function buildScenarioAnalysisContextBlock(
    analysis: ScenarioAnalysisRow
): string {
    const scenarios = (analysis.scenarios || []) as InstitutionalScenario[]
    const marketContext = analysis.market_context as MarketContext | null
    const impactFactors = analysis.impact_factors as ImpactFactors | null
    const historicalPatterns = analysis.historical_patterns as HistoricalPatterns | null
    const takeaways = analysis.takeaways as Takeaways | null

    const isExpired = new Date(analysis.expires_at) < new Date()
    const ageNote = isExpired ? ' (EXPIRED — treat as background context only, not actionable)' : ''

    // ── Market Context ──
    const marketBias = marketContext?.current_bias || 'unknown'
    const structureSummary = marketContext?.structure_summary || ''

    const keyLevelsBlock = marketContext?.key_levels?.length
        ? marketContext.key_levels
            .map(l => `- ${l.price.toFixed(5)} (${l.type}, ${l.timeframe}): ${l.significance}`)
            .join('\n')
        : 'None available.'

    const liquidityBlock = marketContext?.liquidity_pools?.length
        ? marketContext.liquidity_pools
            .map(p => `- ${p.price.toFixed(5)} (${p.type}): ${p.description}`)
            .join('\n')
        : 'None.'

    // ── Institutional Scenarios (full detail) ──
    const scenarioBlock = scenarios.length > 0
        ? scenarios.map(s =>
            `### ${s.title} (${s.direction.toUpperCase()}, ${(s.probability * 100).toFixed(0)}%)
Trigger: ${s.trigger.level.toFixed(5)} — ${s.trigger.description}
Invalidation: ${s.invalidation.level.toFixed(5)} — ${s.invalidation.description}
Targets: ${s.targets.map(t => t.toFixed(5)).join(', ')}
Timeframe: ${s.timeframe}
Institutional Narrative: ${s.narrative}`
        ).join('\n\n')
        : 'No scenarios available.'

    // ── Impact Factors (compact) ──
    const impactBlock = impactFactors
        ? `USD: ${impactFactors.usd_strength.direction} — ${impactFactors.usd_strength.description}
Risk Sentiment: ${impactFactors.risk_sentiment.level} — ${impactFactors.risk_sentiment.description}
Session: ${impactFactors.session_dynamics.dominant_session} — ${impactFactors.session_dynamics.notes}
${impactFactors.news_events.length > 0 ? `Upcoming Events: ${impactFactors.news_events.map(e => `${e.event} (${e.impact}, ${e.timing})`).join('; ')}` : ''}
${impactFactors.correlated_pairs.length > 0 ? `Correlated Pairs: ${impactFactors.correlated_pairs.map(p => `${p.pair} (${p.correlation}: ${p.implication})`).join('; ')}` : ''}`
        : ''

    // ── Historical Patterns (compact) ──
    const patternsBlock = historicalPatterns?.conditional_patterns?.length
        ? historicalPatterns.conditional_patterns
            .map(p => `- IF ${p.condition} THEN ${p.outcome} (${p.reliability} reliability)`)
            .join('\n')
        : ''

    // ── Takeaways (key levels + avoid list) ──
    const watchlistBlock = takeaways?.key_levels_watchlist?.length
        ? takeaways.key_levels_watchlist
            .map(l => `- ${l.price.toFixed(5)}: ${l.label} → ${l.action_if_reached}`)
            .join('\n')
        : ''

    const avoidBlock = takeaways?.avoid_list?.length
        ? takeaways.avoid_list.map(a => `- ${a}`).join('\n')
        : ''

    return `## SCENARIO ANALYSIS CONTEXT (Institutional Weekly Report)${ageNote}
Generated: ${new Date(analysis.created_at).toLocaleString()}
Overall Confidence: ${analysis.confidence ? (analysis.confidence * 100).toFixed(0) + '%' : 'N/A'}
Market Bias: ${marketBias.toUpperCase()}
Executive Summary: ${analysis.summary || 'No summary available.'}

### Market Structure
${structureSummary}

### Validated Key Levels
${keyLevelsBlock}

### Liquidity Pools
${liquidityBlock}

### Institutional Scenarios
${scenarioBlock}

${impactBlock ? `### Impact Factors\n${impactBlock}` : ''}

${patternsBlock ? `### Historical Conditional Patterns\n${patternsBlock}` : ''}

${watchlistBlock ? `### Key Levels Watchlist (with Actions)\n${watchlistBlock}` : ''}

${avoidBlock ? `### Avoid List\n${avoidBlock}` : ''}`
}

/**
 * Fetch the latest non-expired scenario analysis for a pair and build
 * the context block. Returns null if none exists.
 */
export async function getLatestScenarioAnalysisForPrompt(
    userId: string,
    pair: string,
    client: SupabaseClient
): Promise<string | null> {
    const analysis = await getLatestScenarioAnalysis(userId, pair, client)
    if (!analysis) return null
    return buildScenarioAnalysisContextBlock(analysis)
}
