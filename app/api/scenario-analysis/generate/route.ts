import { NextRequest, NextResponse } from 'next/server'
import { getAuthUser } from '@/lib/supabase/server'
import { checkRateLimit } from '@/lib/ai/rate-limiter'
import { createTask } from '@/lib/background-tasks/manager'
import { generateScenarioAnalysis } from '@/lib/scenario-analysis/pipeline'

const VALID_PAIRS = [
    'EUR/USD', 'GBP/USD', 'USD/JPY', 'EUR/GBP', 'AUD/USD',
    'USD/CAD', 'NZD/USD', 'EUR/JPY', 'USD/CHF', 'GBP/JPY',
]

export async function POST(req: NextRequest) {
    const user = await getAuthUser()
    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const pair = body.pair as string

    if (!pair || !VALID_PAIRS.includes(pair)) {
        return NextResponse.json({ error: 'Invalid pair' }, { status: 400 })
    }

    // Rate limit check (shared pool with Story)
    const limit = checkRateLimit(user.id)
    if (!limit.allowed) {
        const minutes = Math.ceil(limit.resetIn / 60_000)
        return NextResponse.json(
            { error: `Rate limit exceeded. Try again in ${minutes} minutes.` },
            { status: 429 }
        )
    }

    // Create background task and start pipeline
    const taskId = await createTask(user.id, 'scenario_analysis', { pair })

    // Fire and forget — pipeline runs in background
    generateScenarioAnalysis(user.id, pair, taskId).catch(err => {
        console.error('Scenario analysis generation error:', err)
    })

    return NextResponse.json({ taskId, remaining: limit.remaining })
}
