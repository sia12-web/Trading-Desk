import Anthropic from '@anthropic-ai/sdk'
import { logAIUsage } from '../usage-logger'

let _client: Anthropic | null = null
function getClient() {
    if (!_client) {
        _client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
    }
    return _client
}

export interface UsageContext {
    userId: string
    feature: string
}

interface ClaudeOptions {
    system?: string
    timeout?: number
    maxTokens?: number
    noFallback?: boolean
    model?: string
    usage?: UsageContext
}

/**
 * Call Claude API with structured options.
 * Default: claude-opus-4-6 (Decision Architect) for analysis.
 * Use model override for coach/counselor (claude-sonnet-4-6).
 */
export async function callClaude(
    prompt: string,
    options: ClaudeOptions = {}
): Promise<string> {
    const {
        system,
        timeout = 60_000,
        maxTokens = 4096,
        model = 'claude-opus-4-6',
        usage,
    } = options

    const promptPreview = prompt.slice(0, 80).replace(/\n/g, ' ')
    console.log(`[AI] CLAUDE (Decision Architect) | model=${model} | maxTokens=${maxTokens} | timeout=${timeout}ms | prompt="${promptPreview}..."`)

    const start = Date.now()
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), timeout)

    try {
        const message = await getClient().messages.create(
            {
                model,
                max_tokens: maxTokens,
                ...(system ? { system } : {}),
                messages: [{ role: 'user', content: prompt }],
            },
            { signal: controller.signal }
        )

        const elapsed = Date.now() - start
        const block = message.content[0]
        if (block.type === 'text') {
            const tokens = message.usage
            console.log(`[AI] CLAUDE DONE | ${elapsed}ms | input=${tokens?.input_tokens ?? '?'} output=${tokens?.output_tokens ?? '?'} tokens | ${block.text.length} chars`)

            if (usage) {
                logAIUsage({
                    userId: usage.userId,
                    provider: 'anthropic',
                    model,
                    feature: usage.feature,
                    inputTokens: tokens?.input_tokens ?? 0,
                    outputTokens: tokens?.output_tokens ?? 0,
                    durationMs: elapsed,
                    success: true,
                })
            }

            return block.text
        }
        throw new Error(`Unexpected response block type: ${block.type}`)
    } catch (error) {
        const elapsed = Date.now() - start
        console.error(`[AI] CLAUDE FAILED | ${elapsed}ms | ${error instanceof Error ? error.message : 'Unknown error'}`)

        if (usage) {
            logAIUsage({
                userId: usage.userId,
                provider: 'anthropic',
                model,
                feature: usage.feature,
                inputTokens: 0,
                outputTokens: 0,
                durationMs: elapsed,
                success: false,
                errorMessage: error instanceof Error ? error.message : 'Unknown error',
            })
        }

        throw error
    } finally {
        clearTimeout(timer)
    }
}

interface CachedClaudeOptions {
    timeout?: number
    maxTokens?: number
    model?: string
    usage?: UsageContext
}

/**
 * Call Claude with prompt caching — stable prefix text gets cached at 90% discount.
 * Use for Story narrator where system identity + Bible + JSON schema are stable across pairs.
 *
 * @param cacheablePrefix - Stable text (identity, rules, schema) — marked with cache_control
 * @param dynamicPrompt - Variable text (Gemini/DeepSeek output, market data)
 */
export async function callClaudeWithCaching(
    cacheablePrefix: string,
    dynamicPrompt: string,
    options: CachedClaudeOptions = {}
): Promise<string> {
    const {
        timeout = 180_000,
        maxTokens = 8192,
        model = 'claude-opus-4-6',
        usage,
    } = options

    console.log(`[AI] CLAUDE CACHED | model=${model} | maxTokens=${maxTokens} | prefix=${cacheablePrefix.length} chars | dynamic=${dynamicPrompt.length} chars`)

    const start = Date.now()
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), timeout)

    try {
        const message = await getClient().messages.create(
            {
                model,
                max_tokens: maxTokens,
                messages: [
                    {
                        role: 'user',
                        content: [
                            {
                                type: 'text',
                                text: cacheablePrefix,
                                cache_control: { type: 'ephemeral' },
                            },
                            {
                                type: 'text',
                                text: dynamicPrompt,
                            },
                        ],
                    },
                ],
            },
            { signal: controller.signal }
        )

        const elapsed = Date.now() - start
        const block = message.content[0]
        if (block.type === 'text') {
            const tokens = message.usage
            const cacheRead = (tokens as unknown as Record<string, unknown>)?.cache_read_input_tokens ?? 0
            const cacheCreation = (tokens as unknown as Record<string, unknown>)?.cache_creation_input_tokens ?? 0
            console.log(`[AI] CLAUDE CACHED DONE | ${elapsed}ms | input=${tokens?.input_tokens ?? '?'} output=${tokens?.output_tokens ?? '?'} | cache_read=${cacheRead} cache_creation=${cacheCreation} | ${block.text.length} chars`)

            if (usage) {
                logAIUsage({
                    userId: usage.userId,
                    provider: 'anthropic',
                    model,
                    feature: usage.feature,
                    inputTokens: tokens?.input_tokens ?? 0,
                    outputTokens: tokens?.output_tokens ?? 0,
                    cacheReadTokens: cacheRead as number,
                    cacheCreationTokens: cacheCreation as number,
                    durationMs: elapsed,
                    success: true,
                })
            }

            return block.text
        }
        throw new Error(`Unexpected response block type: ${block.type}`)
    } catch (error) {
        const elapsed = Date.now() - start
        console.error(`[AI] CLAUDE CACHED FAILED | ${elapsed}ms | ${error instanceof Error ? error.message : 'Unknown error'}`)

        if (usage) {
            logAIUsage({
                userId: usage.userId,
                provider: 'anthropic',
                model,
                feature: usage.feature,
                inputTokens: 0,
                outputTokens: 0,
                durationMs: elapsed,
                success: false,
                errorMessage: error instanceof Error ? error.message : 'Unknown error',
            })
        }

        throw error
    } finally {
        clearTimeout(timer)
    }
}
