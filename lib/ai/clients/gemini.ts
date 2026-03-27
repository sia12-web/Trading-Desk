import { GoogleGenAI } from '@google/genai'

let _client: GoogleGenAI | null = null
function getClient() {
    if (!_client) {
        _client = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! })
    }
    return _client
}

interface GeminiOptions {
    timeout?: number
    maxTokens?: number
    model?: string
}

/**
 * Call Gemini API — used as the "Pattern Archaeologist" for structural analysis.
 * Default model: gemini-3-flash-preview (Gemini 3 Flash).
 */
export async function callGemini(
    prompt: string,
    options: GeminiOptions = {}
): Promise<string> {
    const {
        timeout = 90_000,
        maxTokens = 8192,
        model = 'gemini-3-flash-preview',
    } = options

    const promptPreview = prompt.slice(0, 80).replace(/\n/g, ' ')
    console.log(`[AI] GEMINI (Pattern Archaeologist) | model=${model} | maxTokens=${maxTokens} | timeout=${timeout}ms | prompt="${promptPreview}..."`)

    const start = Date.now()
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), timeout)

    try {
        const response = await getClient().models.generateContent({
            model,
            contents: prompt,
            config: {
                maxOutputTokens: maxTokens,
            },
        })

        const elapsed = Date.now() - start
        const text = response.text
        if (!text) {
            throw new Error('Gemini returned empty response')
        }
        console.log(`[AI] GEMINI DONE | ${elapsed}ms | ${text.length} chars`)
        return text
    } catch (error) {
        const elapsed = Date.now() - start
        console.error(`[AI] GEMINI FAILED | ${elapsed}ms | ${error instanceof Error ? error.message : 'Unknown error'}`)
        throw error
    } finally {
        clearTimeout(timer)
    }
}
