import { createServiceClient } from '@/lib/supabase/service'
import { getCurrentPrices } from '@/lib/oanda/client'
import { updateScenarioStatus } from '@/lib/data/stories'
import { createTask } from '@/lib/background-tasks/manager'
import { notifyUser } from '@/lib/notifications/notifier'
import { generateStory } from './pipeline'
import type { SupabaseClient } from '@supabase/supabase-js'

interface MonitorableScenario {
    id: string
    user_id: string
    pair: string
    title: string
    direction: string
    trigger_level: number
    trigger_direction: 'above' | 'below'
    invalidation_level: number
    invalidation_direction: 'above' | 'below'
    episode_id: string
}

interface MonitorResult {
    checked: number
    triggered: number
    invalidated: number
    generationsQueued: number
    skippedThrottled: number
    skippedMarketClosed: boolean
}

/**
 * Check if the forex market is currently open.
 * Forex market hours: Sunday 10PM UTC → Friday 10PM UTC
 */
export function isForexMarketOpen(): boolean {
    const now = new Date()
    const day = now.getUTCDay() // 0=Sun, 6=Sat
    const hour = now.getUTCHours()

    // Saturday: always closed
    if (day === 6) return false
    // Sunday: only open after 10PM UTC
    if (day === 0 && hour < 22) return false
    // Friday: closed after 10PM UTC
    if (day === 5 && hour >= 22) return false

    return true
}

/**
 * Fetch all active scenarios that have structured monitoring levels.
 */
async function getMonitorableScenarios(client: SupabaseClient): Promise<MonitorableScenario[]> {
    const { data, error } = await client
        .from('story_scenarios')
        .select('id, user_id, pair, title, direction, trigger_level, trigger_direction, invalidation_level, invalidation_direction, episode_id')
        .eq('status', 'active')
        .eq('monitor_active', true)
        .not('trigger_level', 'is', null)
        .not('invalidation_level', 'is', null)

    if (error) {
        console.error('[ScenarioMonitor] Failed to fetch scenarios:', error.message)
        return []
    }

    return (data || []) as MonitorableScenario[]
}

/**
 * Check if price has crossed a scenario's trigger or invalidation level.
 * Returns 'triggered', 'invalidated', or null.
 */
function evaluateScenario(
    scenario: MonitorableScenario,
    currentPrice: number
): 'triggered' | 'invalidated' | null {
    // Check trigger
    if (scenario.trigger_direction === 'above' && currentPrice >= scenario.trigger_level) {
        return 'triggered'
    }
    if (scenario.trigger_direction === 'below' && currentPrice <= scenario.trigger_level) {
        return 'triggered'
    }

    // Check invalidation
    if (scenario.invalidation_direction === 'above' && currentPrice >= scenario.invalidation_level) {
        return 'invalidated'
    }
    if (scenario.invalidation_direction === 'below' && currentPrice <= scenario.invalidation_level) {
        return 'invalidated'
    }

    return null
}

/**
 * Anti-spam: check if a bot-triggered generation already happened for this pair
 * within the throttle window (hours).
 */
async function isGenerationThrottled(
    client: SupabaseClient,
    userId: string,
    pair: string,
    hours: number
): Promise<boolean> {
    const cutoff = new Date(Date.now() - hours * 60 * 60 * 1000).toISOString()

    const { data } = await client
        .from('story_episodes')
        .select('id')
        .eq('user_id', userId)
        .eq('pair', pair)
        .eq('generation_source', 'bot')
        .gte('created_at', cutoff)
        .limit(1)

    return (data?.length ?? 0) > 0
}

/**
 * Main orchestrator: check all monitorable scenarios against live prices.
 * Resolves triggered/invalidated scenarios and queues new episode generation.
 */
export async function runScenarioMonitor(): Promise<MonitorResult> {
    const result: MonitorResult = {
        checked: 0,
        triggered: 0,
        invalidated: 0,
        generationsQueued: 0,
        skippedThrottled: 0,
        skippedMarketClosed: false,
    }

    // Guard: market must be open
    if (!isForexMarketOpen()) {
        result.skippedMarketClosed = true
        console.log('[ScenarioMonitor] Market closed, skipping.')
        return result
    }

    const client = createServiceClient()
    const scenarios = await getMonitorableScenarios(client)

    if (scenarios.length === 0) {
        console.log('[ScenarioMonitor] No monitorable scenarios found.')
        return result
    }

    result.checked = scenarios.length

    // Get unique instruments (pair → OANDA format)
    const uniquePairs = [...new Set(scenarios.map(s => s.pair))]
    const instruments = uniquePairs.map(p => p.replace('/', '_'))

    // Single batch OANDA call for all pairs
    const { data: prices, error: priceError } = await getCurrentPrices(instruments)
    if (priceError || !prices?.length) {
        console.error('[ScenarioMonitor] Failed to fetch prices:', priceError)
        return result
    }

    // Build price map: instrument → mid price
    const priceMap: Record<string, number> = {}
    for (const p of prices) {
        const mid = (parseFloat(p.asks[0].price) + parseFloat(p.bids[0].price)) / 2
        const pair = p.instrument.replace('_', '/')
        priceMap[pair] = mid
    }

    // Track which user+pair combos need new episodes
    const generationQueue: Array<{ userId: string; pair: string }> = []

    // Evaluate each scenario
    for (const scenario of scenarios) {
        const price = priceMap[scenario.pair]
        if (price == null) continue

        const evaluation = evaluateScenario(scenario, price)
        if (!evaluation) continue

        // Resolve the scenario
        const outcomeNotes = evaluation === 'triggered'
            ? `Bot detected: price ${price.toFixed(5)} crossed trigger level ${scenario.trigger_level} (${scenario.trigger_direction})`
            : `Bot detected: price ${price.toFixed(5)} crossed invalidation level ${scenario.invalidation_level} (${scenario.invalidation_direction})`

        try {
            await updateScenarioStatus(
                scenario.id,
                evaluation,
                outcomeNotes,
                'bot',
                client
            )

            // Notify user of outcome
            await notifyUser(scenario.user_id, {
                title: `${evaluation === 'triggered' ? '🎯 Scenario Triggered' : '❌ Scenario Invalidated'}: ${scenario.pair}`,
                body: `${scenario.title}\n\n${outcomeNotes}`,
                url: `/story/${scenario.pair.replace('/', '-')}`
            }, client)

            if (evaluation === 'triggered') {
                result.triggered++
                // Queue generation for triggered scenarios (not invalidated)
                const alreadyQueued = generationQueue.some(
                    g => g.userId === scenario.user_id && g.pair === scenario.pair
                )
                if (!alreadyQueued) {
                    generationQueue.push({ userId: scenario.user_id, pair: scenario.pair })
                }
            } else {
                result.invalidated++
            }

            console.log(`[ScenarioMonitor] ${scenario.pair} "${scenario.title}" → ${evaluation} at ${price.toFixed(5)}`)
        } catch (error) {
            console.error(`[ScenarioMonitor] Failed to resolve ${scenario.id}:`, error instanceof Error ? error.message : error)
        }
    }

    // Queue new episode generation for triggered scenarios (fire-and-forget)
    for (const { userId, pair } of generationQueue) {
        try {
            const throttled = await isGenerationThrottled(client, userId, pair, 6)
            if (throttled) {
                result.skippedThrottled++
                console.log(`[ScenarioMonitor] ${pair} generation throttled (< 6h since last bot generation)`)
                continue
            }

            const taskId = await createTask(
                userId,
                'story_generation',
                { pair, source: 'bot', trigger: 'scenario_monitor' },
                client
            )

            // Fire-and-forget: don't await story generation
            generateStory(userId, pair, taskId, {
                useServiceRole: true,
                generationSource: 'bot',
            }).catch(err => {
                console.error(`[ScenarioMonitor] Background story generation failed for ${pair}:`, err instanceof Error ? err.message : err)
            })

            result.generationsQueued++
            console.log(`[ScenarioMonitor] Queued new episode for ${pair} (task: ${taskId})`)
        } catch (error) {
            console.error(`[ScenarioMonitor] Failed to queue generation for ${pair}:`, error instanceof Error ? error.message : error)
        }
    }

    console.log(`[ScenarioMonitor] Done: checked=${result.checked} triggered=${result.triggered} invalidated=${result.invalidated} queued=${result.generationsQueued} throttled=${result.skippedThrottled}`)
    return result
}
