import { NextRequest, NextResponse } from 'next/server'
import { runScenarioMonitor } from '@/lib/story/scenario-monitor'

export const maxDuration = 60

/**
 * Cron: monitors active story scenarios against live OANDA prices.
 * Runs every 15 minutes. Auto-resolves triggered/invalidated scenarios
 * and queues new episode generation when a scenario triggers.
 *
 * Auth: Bearer CRON_SECRET
 */
export async function GET(req: NextRequest) {
    const authHeader = req.headers.get('authorization')
    const expectedSecret = `Bearer ${(process.env.CRON_SECRET || '').trim()}`

    if (!authHeader || authHeader.trim() !== expectedSecret) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    try {
        const result = await runScenarioMonitor()
        return NextResponse.json(result)
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown error'
        console.error('[ScenarioMonitor Cron] Error:', message)
        return NextResponse.json({ error: message }, { status: 500 })
    }
}
