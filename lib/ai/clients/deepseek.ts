import OpenAI from 'openai'

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
        const usage = response.usage
        console.log(`[AI] DEEPSEEK DONE | ${elapsed}ms | input=${usage?.prompt_tokens ?? '?'} output=${usage?.completion_tokens ?? '?'} tokens | ${content.length} chars`)
        return content
    } catch (error) {
        const elapsed = Date.now() - start
        console.error(`[AI] DEEPSEEK FAILED | ${elapsed}ms | ${error instanceof Error ? error.message : 'Unknown error'}`)
        throw error
    } finally {
        clearTimeout(timer)
    }
}
