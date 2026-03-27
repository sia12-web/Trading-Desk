import OpenAI from 'openai'
import { logAIUsage } from '../usage-logger'
import type { UsageContext } from './claude'

let _client: OpenAI | null = null
function getClient() {
    if (!_client) {
        _client = new OpenAI({
            apiKey: process.env.DEEPSEEK_API_KEY,
            baseURL: 'https://api.deepseek.com',
        })
    }
    return _client
}

interface DeepSeekOptions {
    timeout?: number
    maxTokens?: number
    model?: string
    usage?: UsageContext
}

/**
 * Call DeepSeek API via OpenAI-compatible endpoint.
 * Used as the "Quantitative Engine" for zone validation and risk models.
 */
export async function callDeepSeek(
    prompt: string,
    options: DeepSeekOptions = {}
): Promise<string> {
    const {
        timeout = 90_000,
        maxTokens = 4096,
        model = 'deepseek-chat',
        usage,
    } = options

    const promptPreview = prompt.slice(0, 80).replace(/\n/g, ' ')
    console.log(`[AI] DEEPSEEK (Quant Engine) | model=${model} | maxTokens=${maxTokens} | timeout=${timeout}ms | prompt="${promptPreview}..."`)

    const start = Date.now()
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), timeout)

    try {
        const response = await getClient().chat.completions.create(
            {
                model,
                max_tokens: maxTokens,
                messages: [{ role: 'user', content: prompt }],
            },
            { signal: controller.signal }
        )

        const elapsed = Date.now() - start
        const content = response.choices[0]?.message?.content
        if (!content) {
            throw new Error('DeepSeek returned empty response')
        }
        const tokens = response.usage
        const inputTokens = tokens?.prompt_tokens ?? 0
        const outputTokens = tokens?.completion_tokens ?? 0
        console.log(`[AI] DEEPSEEK DONE | ${elapsed}ms | input=${inputTokens} output=${outputTokens} tokens | ${content.length} chars`)

        if (usage) {
            logAIUsage({
                userId: usage.userId,
                provider: 'deepseek',
                model,
                feature: usage.feature,
                inputTokens,
                outputTokens,
                durationMs: elapsed,
                success: true,
            })
        }

        return content
    } catch (error) {
        const elapsed = Date.now() - start
        console.error(`[AI] DEEPSEEK FAILED | ${elapsed}ms | ${error instanceof Error ? error.message : 'Unknown error'}`)

        if (usage) {
            logAIUsage({
                userId: usage.userId,
                provider: 'deepseek',
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
