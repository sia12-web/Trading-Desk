import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/service'
import { createTask } from '@/lib/background-tasks/manager'
import { generateScenarioAnalysis } from '@/lib/scenario-analysis/pipeline'

export const maxDuration = 300 // 5 minutes

/**
 * Weekly cron: auto-generates scenario analysis for all active story pairs.
 * Runs Monday 3:30 AM UTC — before story agents (4AM) and story generation (5AM).
 *
 * Scenario Analysis is the "institutional weekly report" that story episodes reference.
 * Running weekly is sufficient since key levels, liquidity pools, and macro scenarios
 * change on a weekly basis, not daily.
 *
 * Auth: Bearer CRON_SECRET
 */
export async function GET(req: NextRequest) {
    const rawSecret = process.env.CRON_SECRET || ''
    const secret = rawSecret.trim()
    const authHeader = req.headers.get('authorization')
    const queryKey = req.nextUrl.searchParams.get('key')
    const expectedSecret = `Bearer ${secret}`

    // Debugging (Masked Logs)
    const headerStatus = authHeader ? 'Present' : 'Missing'
    const queryStatus = queryKey ? 'Present' : 'Missing'
    console.log(`[Cron Debug] Auth Attempt: Header=${headerStatus}, Query=${queryStatus}`)
    
    if (!secret) {
        console.error('[Cron Debug] CRON_SECRET is NOT SET in Railway environment variables.')
        return NextResponse.json({ error: 'Config missing' }, { status: 500 })
    }

    // Resilience: URL params often turn '+' into ' ' (space)
    const normalizedQueryKey = queryKey?.trim().replace(/ /g, '+')
    
    const isAuthorized = 
        (authHeader && authHeader.trim() === expectedSecret) || 
        (normalizedQueryKey === secret)

    if (!isAuthorized) {
        console.warn(`[Cron Debug] Unauthorized: Secret Lengths differ (S:${secret.length} Q:${queryKey?.length || 0})`)
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const client = createServiceClient()

    console.log('[Cron:ScenarioAnalysis] Starting weekly scenario analysis generation')

    // Fetch ALL active subscriptions across all users
    const { data: subscriptions, error: subError } = await client
        .from('pair_subscriptions')
        .select('user_id, pair')
        .eq('is_active', true)

    if (subError) {
        console.error('[Cron:ScenarioAnalysis] Failed to fetch subscriptions:', subError.message)
        return NextResponse.json({ error: 'Failed to fetch subscriptions' }, { status: 500 })
    }

    if (!subscriptions?.length) {
        console.log('[Cron:ScenarioAnalysis] No active subscriptions')
        return NextResponse.json({ message: 'No active subscriptions', processed: 0 })
    }

    console.log(`[Cron:ScenarioAnalysis] Processing ${subscriptions.length} pair(s)`)

    const results: Array<{ user_id: string; pair: string; status: string; error?: string }> = []

    const taskIds: string[] = []
    
    // Trigger in parallel (or sequential background) to avoid timing out the cron trigger
    for (const sub of subscriptions) {
        console.log(`[Cron:ScenarioAnalysis] ── Triggering background analysis for ${sub.pair} (user: ${sub.user_id.slice(0, 8)}...)`)

        try {
            const taskId = await createTask(
                sub.user_id,
                'scenario_analysis',
                { pair: sub.pair, source: 'cron' },
                client
            )
            taskIds.push(taskId)

            // Fire-and-forget: start the long process but don't AWAIT it here
            generateScenarioAnalysis(sub.user_id, sub.pair, taskId, { useServiceRole: true }).catch(err => {
                const msg = err instanceof Error ? err.message : 'Unknown error'
                console.error(`[Cron:ScenarioAnalysis] Background process FAILED for ${sub.pair}:`, msg)
            })
        } catch (error) {
            console.error(`[Cron:ScenarioAnalysis] Failed to create task for ${sub.pair}:`, error instanceof Error ? error.message : error)
        }
    }

    return NextResponse.json({
        message: 'Weekly scenario analysis triggered in background',
        count: taskIds.length,
        taskIds,
    })
}
