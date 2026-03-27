import { NextRequest, NextResponse } from 'next/server'
import { getAuthUser } from '@/lib/supabase/server'
import { getActiveScenarios } from '@/lib/data/stories'

export async function GET(req: NextRequest) {
    const user = await getAuthUser()
    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const pair = searchParams.get('pair')

    if (!pair) {
        return NextResponse.json({ error: 'pair is required' }, { status: 400 })
    }

    const scenarios = await getActiveScenarios(user.id, pair)
    return NextResponse.json({ scenarios })
}
