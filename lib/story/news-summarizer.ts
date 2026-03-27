import { callGemini } from '@/lib/ai/clients'
import { parseAIJson } from '@/lib/ai/parse-response'
import { fetchForexNews, type NewsHeadline } from '@/lib/news/forex-news-client'
import { getUpcomingEventsForPair, getNewsContextForAI } from '@/lib/news/forex-factory-client'
import type { StoryNewsContext } from './types'

/**
 * Summarize news + economic calendar into a narrative context for Story.
 * Uses Gemini (fast + cheap) for summarization.
 */
export async function summarizeNewsForStory(pair: string): Promise<StoryNewsContext> {
    // Gather raw data
    const [headlines, calendarEvents, newsContext] = await Promise.all([
        fetchForexNews(15),
        getUpcomingEventsForPair(pair, 48),
        getNewsContextForAI(pair),
    ])

    // Filter headlines relevant to this pair's currencies
    const currencies = pair.split('/')
    const relevantHeadlines = headlines.filter(h =>
        currencies.some(c => h.title.toUpperCase().includes(c))
    )

    // If no relevant news, return neutral context
    if (relevantHeadlines.length === 0 && calendarEvents.length === 0) {
        return {
            sentiment: 'neutral',
            key_drivers: ['No significant news for this pair'],
            fundamental_narrative: `No major news events are currently driving ${pair}. Technical factors dominate.`,
            calendar_events: [],
            avoidTrading: false,
        }
    }

    // Build prompt for Gemini to summarize
    const prompt = buildNewsSummaryPrompt(pair, relevantHeadlines, calendarEvents, newsContext)

    try {
        const raw = await callGemini(prompt, { timeout: 30_000, maxTokens: 1024 })
        return parseAIJson<StoryNewsContext>(raw)
    } catch (error) {
        // Fallback: return basic context without AI
        return {
            sentiment: 'neutral',
            key_drivers: relevantHeadlines.slice(0, 3).map(h => h.title),
            fundamental_narrative: newsContext,
            calendar_events: calendarEvents.map(e => `${e.event} (${e.currency}, ${e.impact})`),
            avoidTrading: calendarEvents.some(e => e.impact === 'HIGH' && e.timeUntilEvent < 120),
        }
    }
}

function buildNewsSummaryPrompt(
    pair: string,
    headlines: NewsHeadline[],
    calendarEvents: Array<{ event: string; currency: string; impact: string; timeUntilEvent: number }>,
    newsContext: string
): string {
    const headlineBlock = headlines.length > 0
        ? headlines.map(h => `- ${h.title} (${h.source}, ${h.time})`).join('\n')
        : 'No relevant headlines.'

    const calendarBlock = calendarEvents.length > 0
        ? calendarEvents.map(e => `- ${e.event} (${e.currency}) — ${e.impact} impact, in ${e.timeUntilEvent} minutes`).join('\n')
        : 'No upcoming events.'

    return `You are a forex fundamental analyst. Summarize the current news landscape for ${pair}.

## Headlines
${headlineBlock}

## Economic Calendar
${calendarBlock}

## Additional Context
${newsContext}

Respond with a JSON object (no markdown fences):
{
  "sentiment": "bullish" | "bearish" | "neutral",
  "key_drivers": ["driver1", "driver2", ...],
  "fundamental_narrative": "A 2-3 sentence narrative about what's driving this pair fundamentally.",
  "calendar_events": ["event summary 1", "event summary 2", ...],
  "avoidTrading": true/false (true if high-impact news within 2 hours)
}`
}
