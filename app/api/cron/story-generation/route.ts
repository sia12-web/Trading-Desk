import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/service'
import { createTask } from '@/lib/background-tasks/manager'
import { generateStory } from '@/lib/story/pipeline'

/**
 * Daily cron: auto-generates story episodes for all active pair subscriptions.
 * Runs at 5:00 AM UTC, weekdays only (forex market closed on weekends).
 *
 * Sequential processing to respect OANDA rate limits.
 * Individual try/catch — one failure doesn't stop others.
 */
export async function GET(req: NextRequest) {
    // Verify cron secret
    const authHeader = req.headers.get('authorization')
    const expectedSecret = `Bearer ${(process.env.CRON_SECRET || '').trim()}`

    if (!authHeader || authHeader.trim() !== expectedSecret) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const client = createServiceClient()
    const today = new Date().toISOString().split('T')[0] // YYYY-MM-DD

    // Fetch ALL active subscriptions across all users
    const { data: subscriptions, error: subError } = await client
        .from('pair_subscriptions')
        .select('user_id, pair')
        .eq('is_active', true)

    if (subError) {
        console.error('Cron: Failed to fetch subscriptions:', subError.message)
        return NextResponse.json({ error: 'Failed to fetch subscriptions' }, { status: 500 })
    }

    if (!subscriptions?.length) {
        return NextResponse.json({ message: 'No active subscriptions', processed: 0 })
    }

    // Check which pairs already have an episode generated today
    const { data: todayEpisodes } = await client
        .from('story_episodes')
        .select('user_id, pair')
        .gte('created_at', `${today}T00:00:00Z`)
        .lte('created_at', `${today}T23:59:59Z`)

    const alreadyGenerated = new Set(
        (todayEpisodes || []).map(e => `${e.user_id}:${e.pair}`)
    )

    const results: Array<{ user_id: string; pair: string; status: string; error?: string }> = []

    // Process sequentially to respect OANDA rate limits
    for (const sub of subscriptions) {
        const key = `${sub.user_id}:${sub.pair}`

        if (alreadyGenerated.has(key)) {
            results.push({ user_id: sub.user_id, pair: sub.pair, status: 'skipped' })
            continue
        }

        try {
            const taskId = await createTask(
                sub.user_id,
                'story_generation',
                { pair: sub.pair, source: 'cron' },
                client
            )

            await generateStory(sub.user_id, sub.pair, taskId, { useServiceRole: true })
            results.push({ user_id: sub.user_id, pair: sub.pair, status: 'generated' })
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Unknown error'
            console.error(`Cron: Failed to generate story for ${sub.user_id}/${sub.pair}:`, message)
            results.push({ user_id: sub.user_id, pair: sub.pair, status: 'failed', error: message })
        }
    }

    const processed = results.filter(r => r.status === 'generated').length
    const skipped = results.filter(r => r.status === 'skipped').length
    const failed = results.filter(r => r.status === 'failed').length

    return NextResponse.json({
        message: `Story cron complete`,
        processed,
        skipped,
        failed,
        total: subscriptions.length,
    })
}
