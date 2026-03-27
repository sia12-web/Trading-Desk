/**
 * Forex Factory Economic Calendar Client
 *
 * Uses Forex Factory's public JSON feed - the calendar most traders rely on.
 * No API key needed - completely free.
 *
 * Source: https://nfs.faireconomy.media/ff_calendar_thisweek.json
 */

export interface ForexFactoryEvent {
    title: string
    country: string
    date: string // ISO format
    impact: 'High' | 'Medium' | 'Low' | 'Holiday'
    forecast: string
    previous: string
    actual?: string
    currency: string // USD, EUR, GBP, etc.
}

export interface ProcessedNewsEvent {
    event: string
    currency: string
    time: string
    impact: 'HIGH' | 'MEDIUM' | 'LOW'
    timeUntilEvent: number // minutes
    affectedPairs: string[] // e.g., ['EUR/USD', 'GBP/USD']
    forecast: string
    previous: string
    actual?: string
    recommendation: string
}

/**
 * Fetch this week's economic calendar from Forex Factory
 */
export async function fetchForexFactoryCalendar(): Promise<ForexFactoryEvent[]> {
    try {
        const response = await fetch('https://nfs.faireconomy.media/ff_calendar_thisweek.json', {
            headers: {
                'User-Agent': 'Mozilla/5.0'
            },
            next: { revalidate: 3600 } // Cache for 1 hour
        })

        if (!response.ok) {
            console.error('Forex Factory API error:', response.status)
            return []
        }

        const data = await response.json()
        return data as ForexFactoryEvent[]
    } catch (error) {
        console.error('Failed to fetch Forex Factory calendar:', error)
        return []
    }
}

/**
 * Get upcoming high-impact events for a specific currency pair
 */
export async function getUpcomingEventsForPair(
    pair: string, // e.g., "EUR/USD"
    hoursAhead: number = 6
): Promise<ProcessedNewsEvent[]> {
    const events = await fetchForexFactoryCalendar()
    const now = new Date()
    const cutoffTime = new Date(now.getTime() + hoursAhead * 60 * 60 * 1000)

    // Extract currencies from pair (e.g., "EUR/USD" -> ["EUR", "USD"])
    const currencies = pair.split('/').map(c => c.trim())

    const relevantEvents: ProcessedNewsEvent[] = []

    for (const event of events) {
        const eventTime = new Date(event.date)

        // Only include future events within the time window
        if (eventTime < now || eventTime > cutoffTime) continue

        // Only include events that affect our currencies
        if (!currencies.includes(event.currency)) continue

        // Only include Medium and High impact events
        if (event.impact !== 'High' && event.impact !== 'Medium') continue

        const minutesUntil = Math.floor((eventTime.getTime() - now.getTime()) / 60000)

        // Determine which pairs are affected
        const affectedPairs = getAffectedPairs(event.currency)

        // Generate recommendation based on impact and timing
        let recommendation = ''
        if (event.impact === 'High') {
            if (minutesUntil < 120) {
                recommendation = 'CRITICAL: Avoid all trading. Wait until 60 minutes after release.'
            } else {
                recommendation = 'HIGH RISK: Close positions or reduce size before event.'
            }
        } else {
            recommendation = 'MODERATE RISK: Be cautious, consider tightening stops.'
        }

        relevantEvents.push({
            event: event.title,
            currency: event.currency,
            time: event.date,
            impact: event.impact.toUpperCase() as 'HIGH' | 'MEDIUM' | 'LOW',
            timeUntilEvent: minutesUntil,
            affectedPairs,
            forecast: event.forecast,
            previous: event.previous,
            actual: event.actual,
            recommendation
        })
    }

    // Sort by time (nearest first)
    return relevantEvents.sort((a, b) => a.timeUntilEvent - b.timeUntilEvent)
}

/**
 * Get all pairs affected by a currency's news
 */
function getAffectedPairs(currency: string): string[] {
    const majorPairs: Record<string, string[]> = {
        'USD': ['EUR/USD', 'GBP/USD', 'USD/JPY', 'USD/CHF', 'AUD/USD', 'USD/CAD', 'NZD/USD'],
        'EUR': ['EUR/USD', 'EUR/GBP', 'EUR/JPY', 'EUR/CHF', 'EUR/AUD'],
        'GBP': ['GBP/USD', 'EUR/GBP', 'GBP/JPY', 'GBP/CHF', 'GBP/AUD'],
        'JPY': ['USD/JPY', 'EUR/JPY', 'GBP/JPY', 'AUD/JPY', 'NZD/JPY'],
        'AUD': ['AUD/USD', 'EUR/AUD', 'GBP/AUD', 'AUD/JPY', 'AUD/NZD'],
        'CAD': ['USD/CAD', 'EUR/CAD', 'GBP/CAD', 'CAD/JPY'],
        'CHF': ['USD/CHF', 'EUR/CHF', 'GBP/CHF', 'CHF/JPY'],
        'NZD': ['NZD/USD', 'EUR/NZD', 'GBP/NZD', 'NZD/JPY', 'AUD/NZD']
    }

    return majorPairs[currency] || []
}

/**
 * Check if trading should be avoided due to imminent high-impact news
 */
export async function shouldAvoidTrading(pair: string): Promise<{
    avoid: boolean
    reason: string
    nextSafeTime?: string
}> {
    const upcomingEvents = await getUpcomingEventsForPair(pair, 3) // Next 3 hours

    // Check for high-impact events in the next 2 hours
    const criticalEvents = upcomingEvents.filter(
        e => e.impact === 'HIGH' && e.timeUntilEvent < 120
    )

    if (criticalEvents.length > 0) {
        const event = criticalEvents[0]
        const safeTime = new Date(new Date(event.time).getTime() + 60 * 60 * 1000) // 1 hour after

        return {
            avoid: true,
            reason: `${event.event} (${event.currency}) in ${event.timeUntilEvent} minutes. High volatility expected.`,
            nextSafeTime: safeTime.toISOString()
        }
    }

    return {
        avoid: false,
        reason: 'No critical news events imminent. Safe to trade.'
    }
}

/**
 * Get news context summary for AI prompt
 */
export async function getNewsContextForAI(pair: string): Promise<string> {
    const upcomingEvents = await getUpcomingEventsForPair(pair, 24) // Next 24 hours
    const avoidanceCheck = await shouldAvoidTrading(pair)

    if (upcomingEvents.length === 0) {
        return `**NEWS CONTEXT:** No significant economic events scheduled for ${pair} in the next 24 hours. Technical analysis is primary driver.`
    }

    let context = `**NEWS CONTEXT FOR ${pair}:**\n\n`

    // Avoidance warning
    if (avoidanceCheck.avoid) {
        context += `⚠️ **TRADING ALERT:** ${avoidanceCheck.reason}\n`
        context += `**Recommendation:** WAIT until after ${new Date(avoidanceCheck.nextSafeTime!).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', timeZone: 'UTC' })} UTC\n\n`
    }

    // Upcoming events
    context += `**Upcoming Economic Events (Next 24h):**\n`
    for (const event of upcomingEvents.slice(0, 5)) { // Top 5 events
        const timeStr = new Date(event.time).toLocaleString('en-US', {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            timeZone: 'UTC'
        })

        context += `- **${event.event}** (${event.currency}) - ${event.impact} IMPACT\n`
        context += `  Time: ${timeStr} UTC (in ${event.timeUntilEvent} minutes)\n`
        context += `  Forecast: ${event.forecast || 'N/A'} | Previous: ${event.previous || 'N/A'}\n`
        context += `  ${event.recommendation}\n\n`
    }

    context += `**AI INSTRUCTIONS:**\n`
    context += `- If high-impact news is <2 hours away: Recommend WAIT strategy\n`
    context += `- If medium-impact news upcoming: Reduce position size, suggest waiting for news to pass\n`
    context += `- If no major news: Proceed with technical analysis normally\n`
    context += `- ALWAYS mention upcoming news in your analysis narrative\n`

    return context
}
