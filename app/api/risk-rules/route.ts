import { createClient } from '@/lib/supabase/server'
import { createRiskRule } from '@/lib/data/risk-rules'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    try {
        const body = await req.json()
        const result = await createRiskRule(user.id, body)
        return NextResponse.json(result)
    } catch (error: any) {
        return NextResponse.json({ error: 'Failed to create rule' }, { status: 500 })
    }
}
