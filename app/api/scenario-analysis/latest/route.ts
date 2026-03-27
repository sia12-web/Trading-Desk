import { NextRequest, NextResponse } from 'next/server'
import { getAuthUser, createClient } from '@/lib/supabase/server'
import { getLatestScenarioAnalysis } from '@/lib/data/scenario-analyses'

export async function GET(req: NextRequest) {
    const user = await getAuthUser()
    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const pair = req.nextUrl.searchParams.get('pair')
    if (!pair) {
        return NextResponse.json({ error: 'Missing pair parameter' }, { status: 400 })
    }

    const client = await createClient()
    const analysis = await getLatestScenarioAnalysis(user.id, pair, client)

    return NextResponse.json({ analysis })
}
