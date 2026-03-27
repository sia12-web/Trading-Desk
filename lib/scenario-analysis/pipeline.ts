import { callClaudeWithCaching, callGemini, callDeepSeek } from '@/lib/ai/clients'
import { parseAIJson } from '@/lib/ai/parse-response'
import { createClient } from '@/lib/supabase/server'
import { updateProgress, completeTask, failTask } from '@/lib/background-tasks/manager'
import { collectStoryData } from '@/lib/story/data-collector'
import { summarizeNewsForStory } from '@/lib/story/news-summarizer'
import { getAgentReportsForPair } from '@/lib/story/agents/data'
import { parseFlaggedLevels } from '@/lib/story/validators'
import { buildScenarioScannerPrompt } from './prompts/gemini-scanner'
import { buildScenarioValidatorPrompt } from './prompts/deepseek-validator'
import { buildScenarioSynthesizerPromptCached } from './prompts/claude-synthesizer'
import { createScenarioAnalysis } from '@/lib/data/scenario-analyses'
import { validateScenarioAnalysisLevels } from './validators'
import type { ScenarioAnalysisResult } from './types'
import type { SupabaseClient } from '@supabase/supabase-js'

/**
 * Scenario Analysis pipeline orchestrator.
 * Runs as a background task: data collection → tri-model analysis → DB storage.
 *
 * All 3 models must succeed — no fallbacks.
 */
export async function generateScenarioAnalysis(
    userId: string,
    pair: string,
    taskId: string
): Promise<void> {
    const client: SupabaseClient = await createClient()

    try {
        // ── Step 1: Collect OANDA data ──
        await updateProgress(taskId, 10, 'Fetching market data across 5 timeframes...', client)
        const data = await collectStoryData(userId, pair, client)

        // ── Step 2: Get news context ──
        await updateProgress(taskId, 20, 'Gathering news and economic calendar...', client)
        const news = await summarizeNewsForStory(pair)

        // ── Step 2.5: Fetch agent intelligence (best-effort) ──
        await updateProgress(taskId, 22, 'Loading intelligence reports...', client)
        const agentIntelligence = await getAgentReportsForPair(userId, pair, client)

        // ── Step 3: Gemini structural scan ──
        await updateProgress(taskId, 30, 'Gemini scanning market structure...', client)
        const geminiPrompt = buildScenarioScannerPrompt(data, news)
        const geminiOutput = await callGemini(geminiPrompt, {
            timeout: 90_000,
            maxTokens: 8192,
        })

        // ── Step 4: DeepSeek probability validation ──
        await updateProgress(taskId, 55, 'DeepSeek validating levels and probabilities...', client)
        const deepseekPrompt = buildScenarioValidatorPrompt(data, geminiOutput, news)
        const deepseekOutput = await callDeepSeek(deepseekPrompt, {
            timeout: 90_000,
            maxTokens: 4096,
        })

        // ── Step 4.5: Parse flagged levels ──
        const flaggedLevels = parseFlaggedLevels(deepseekOutput)
        if (flaggedLevels.length > 0) {
            console.log(`[ScenarioAnalysis] DeepSeek flagged ${flaggedLevels.length} suspicious levels`)
        }

        // ── Step 5: Claude institutional synthesis ──
        await updateProgress(taskId, 75, 'Claude crafting institutional analysis...', client)

        // Build compact agent summary for Claude
        const agentSummary = agentIntelligence.crossMarket
            ? {
                summary: agentIntelligence.crossMarket.summary,
                risk_appetite: agentIntelligence.crossMarket.risk_appetite,
            }
            : null

        const { cacheablePrefix, dynamicPrompt } = buildScenarioSynthesizerPromptCached(
            data,
            geminiOutput,
            deepseekOutput,
            news,
            flaggedLevels,
            agentSummary
        )
        const claudeOutput = await callClaudeWithCaching(cacheablePrefix, dynamicPrompt, {
            timeout: 90_000,
            maxTokens: 8192,
        })

        // ── Step 6: Parse and validate ──
        await updateProgress(taskId, 85, 'Validating AI output...', client)
        let result = parseAIJson<ScenarioAnalysisResult>(claudeOutput)

        // ── Step 6a: Hard validation — all levels within 3x ATR ──
        const validation = validateScenarioAnalysisLevels(result, data.currentPrice, data.atr14)
        if (!validation.valid) {
            console.warn(`[ScenarioAnalysis] ${pair} validation failed:`, validation.errors)

            // Retry Claude once with correction context
            await updateProgress(taskId, 88, 'Correcting levels (retry)...', client)
            const correctionPrompt = `${dynamicPrompt}

⚠️ CORRECTION REQUIRED — your previous response had these errors:
${validation.errors.map(e => `- ${e}`).join('\n')}

Fix these issues and regenerate the COMPLETE JSON response. Remember:
- All price levels must be within 3x ATR (${(data.atr14 * 3).toFixed(1)} pips) of current price ${data.currentPrice.toFixed(5)}
- Scenario probabilities must sum to ~1.0
- Every scenario must have trigger.level and invalidation.level`

            try {
                const retryOutput = await callClaudeWithCaching(cacheablePrefix, correctionPrompt, {
                    timeout: 90_000,
                    maxTokens: 8192,
                })
                result = parseAIJson<ScenarioAnalysisResult>(retryOutput)
                console.log(`[ScenarioAnalysis] ${pair} retry succeeded after validation failure`)
            } catch (retryErr) {
                console.warn(`[ScenarioAnalysis] ${pair} retry failed, using original result:`, retryErr instanceof Error ? retryErr.message : retryErr)
            }
        }

        await updateProgress(taskId, 90, 'Saving analysis...', client)

        const analysis = await createScenarioAnalysis(userId, pair, result, {
            currentPrice: data.currentPrice,
            atr14: data.atr14,
            geminiOutput,
            deepseekOutput,
            claudeOutput,
            newsContext: news as unknown as Record<string, unknown>,
        }, client)

        await completeTask(taskId, {
            analysisId: analysis.id,
            pair,
            summary: result.summary,
            scenarioCount: result.scenarios.length,
        }, client)

    } catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown error during scenario analysis'
        console.error('Scenario analysis pipeline error:', message)
        await failTask(taskId, message, client)
    }
}
