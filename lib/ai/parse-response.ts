import JSON5 from 'json5'

/**
 * Parse AI-generated JSON responses with tolerance for common issues:
 * - Trailing commas
 * - Markdown code fences (```json ... ```)
 * - Unquoted keys
 * - Comments
 */
export function parseAIJson<T>(raw: string): T {
    // Strip markdown code fences if present
    let cleaned = raw.trim()
    const fenceMatch = cleaned.match(/```(?:json)?\s*\n?([\s\S]*?)\n?\s*```/)
    if (fenceMatch) {
        cleaned = fenceMatch[1].trim()
    }

    try {
        return JSON5.parse(cleaned) as T
    } catch {
        // Try to extract JSON object/array from surrounding text
        const objectMatch = cleaned.match(/(\{[\s\S]*\})/)
        const arrayMatch = cleaned.match(/(\[[\s\S]*\])/)
        const match = objectMatch || arrayMatch

        if (match) {
            try {
                return JSON5.parse(match[1]) as T
            } catch {
                throw new Error(`Failed to parse AI JSON response: ${cleaned.slice(0, 200)}...`)
            }
        }

        throw new Error(`No JSON found in AI response: ${cleaned.slice(0, 200)}...`)
    }
}
