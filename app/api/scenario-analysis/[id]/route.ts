import { NextRequest, NextResponse } from 'next/server'
import { getAuthUser, createClient } from '@/lib/supabase/server'
import { getScenarioAnalysisById } from '@/lib/data/scenario-analyses'

export async function GET(
    _req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const user = await getAuthUser()
    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const client = await createClient()
    const analysis = await getScenarioAnalysisById(id, client)

    if (!analysis) {
        return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }

    if (analysis.user_id !== user.id) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    return NextResponse.json({ analysis })
}
