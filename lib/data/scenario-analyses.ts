import type { SupabaseClient } from '@supabase/supabase-js'
import type { ScenarioAnalysisRow, ScenarioAnalysisResult } from '@/lib/scenario-analysis/types'

/**
 * Create a new scenario analysis record.
 */
export async function createScenarioAnalysis(
    userId: string,
    pair: string,
    result: ScenarioAnalysisResult,
    meta: {
        currentPrice: number
        atr14: number
        geminiOutput: string
        deepseekOutput: string
        claudeOutput: string
        newsContext: Record<string, unknown> | null
    },
    client: SupabaseClient
): Promise<ScenarioAnalysisRow> {
    const { data, error } = await client
        .from('scenario_analyses')
        .insert({
            user_id: userId,
            pair,
            market_context: result.market_context,
            scenarios: result.scenarios,
            historical_patterns: result.historical_patterns,
            impact_factors: result.impact_factors,
            takeaways: result.takeaways,
            summary: result.summary,
            confidence: result.confidence,
            current_price: meta.currentPrice,
            atr14: meta.atr14,
            gemini_output: { raw: meta.geminiOutput },
            deepseek_output: { raw: meta.deepseekOutput },
            claude_output: { raw: meta.claudeOutput },
            news_context: meta.newsContext,
        })
        .select('*')
        .single()

    if (error) throw new Error(`Failed to create scenario analysis: ${error.message}`)
    return data as ScenarioAnalysisRow
}

/**
 * Get the latest non-expired scenario analysis for a pair.
 */
export async function getLatestScenarioAnalysis(
    userId: string,
    pair: string,
    client: SupabaseClient
): Promise<ScenarioAnalysisRow | null> {
    const { data, error } = await client
        .from('scenario_analyses')
        .select('*')
        .eq('user_id', userId)
        .eq('pair', pair)
        .gt('expires_at', new Date().toISOString())
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle()

    if (error) {
        console.error('Failed to fetch latest scenario analysis:', error.message)
        return null
    }
    return data as ScenarioAnalysisRow | null
}

/**
 * List scenario analyses for a pair (most recent first).
 */
export async function listScenarioAnalyses(
    userId: string,
    pair: string,
    limit: number,
    client: SupabaseClient
): Promise<ScenarioAnalysisRow[]> {
    const { data, error } = await client
        .from('scenario_analyses')
        .select('id, pair, summary, confidence, current_price, atr14, created_at, expires_at')
        .eq('user_id', userId)
        .eq('pair', pair)
        .order('created_at', { ascending: false })
        .limit(limit)

    if (error) {
        console.error('Failed to list scenario analyses:', error.message)
        return []
    }
    return (data || []) as unknown as ScenarioAnalysisRow[]
}

/**
 * Get a specific scenario analysis by ID.
 */
export async function getScenarioAnalysisById(
    analysisId: string,
    client: SupabaseClient
): Promise<ScenarioAnalysisRow | null> {
    const { data, error } = await client
        .from('scenario_analyses')
        .select('*')
        .eq('id', analysisId)
        .maybeSingle()

    if (error) {
        console.error('Failed to fetch scenario analysis:', error.message)
        return null
    }
    return data as ScenarioAnalysisRow | null
}
