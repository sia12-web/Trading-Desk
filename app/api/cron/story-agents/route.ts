import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/service'
import { runAgentsForPair } from '@/lib/story/agents/runner'
import { notifyUser } from '@/lib/notifications/notifier'

export const maxDuration = 300 // 5 minutes

/**
 * Daily cron: runs intelligence agents for all active pair subscriptions.
 * Runs at 4:00 AM UTC weekdays — 1 hour before story generation.
 *
 * Sequential processing to respect OANDA rate limits.
 * Individual try/catch — one pair's failure doesn't stop others.
 */
export async function GET(req: NextRequest) {
    // Verify cron secret (Bearer header or ?key= param)
    const rawSecret = process.env.CRON_SECRET || ''
    const secret = rawSecret.trim()
    const authHeader = req.headers.get('authorization')
    const queryKey = req.nextUrl.searchParams.get('key')
    const expectedSecret = `Bearer ${secret}`

    if (!secret) {
        console.error('[Agents Cron Debug] CRON_SECRET is NOT SET')
        return NextResponse.json({ error: 'Config missing' }, { status: 500 })
    }

    // Resilience: URL params often turn '+' into ' ' (space)
    const normalizedQueryKey = queryKey?.trim().replace(/ /g, '+')

    const isAuthorized = 
        (authHeader && authHeader.trim() === expectedSecret) || 
        (normalizedQueryKey === secret)

    if (!isAuthorized) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const client = createServiceClient()

    // Fetch ALL active subscriptions across all users
    const { data: subscriptions, error: subError } = await client
        .from('pair_subscriptions')
        .select('user_id, pair')
        .eq('is_active', true)

    if (subError) {
        console.error('Agents cron: Failed to fetch subscriptions:', subError.message)
        return NextResponse.json({ error: 'Failed to fetch subscriptions' }, { status: 500 })
    }

    if (!subscriptions?.length) {
        return NextResponse.json({ message: 'No active subscriptions', processed: 0 })
    }

    // Process in background to avoid timing out the cron trigger
    for (const sub of subscriptions) {
        console.log(`[Agents Cron] Triggering background agents for ${sub.pair}`)
        runAgentsForPair(sub.user_id, sub.pair, client).then(async (intelligence) => {
            const completedAgents: string[] = []
            if (intelligence.optimizer) completedAgents.push('optimizer')
            if (intelligence.news) completedAgents.push('news')
            if (intelligence.crossMarket) completedAgents.push('cross_market')

            if (completedAgents.length > 0) {
                let summary = ''
                if (intelligence.optimizer) summary += `📊 *Indicators:* ${intelligence.optimizer.summary.substring(0, 100)}...\n`
                if (intelligence.news) summary += `📰 *News:* ${intelligence.news.summary.substring(0, 100)}...\n`
                if (intelligence.crossMarket) summary += `🌐 *Market:* ${intelligence.crossMarket.summary.substring(0, 100)}...\n`

                await notifyUser(sub.user_id, {
                    title: `🤖 Intelligence Brief: ${sub.pair}`,
                    body: summary || 'No major insights found today.',
                    url: `/story/${sub.pair.replace('/', '-')}`
                }, client)
            }
        }).catch(err => {
            console.error(`[Agents Cron] Background process FAILED for ${sub.pair}:`, err instanceof Error ? err.message : err)
        })

        // Slight stagger to avoid rate limiting even in background
        await new Promise(resolve => setTimeout(resolve, 500))
    }

    return NextResponse.json({
        message: 'Story agents triggered in background',
        count: subscriptions.length,
    })
}
