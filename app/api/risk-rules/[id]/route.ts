import { createClient } from '@/lib/supabase/server'
import { updateRiskRule, deleteRiskRule } from '@/lib/data/risk-rules'
import { NextResponse } from 'next/server'

export async function PATCH(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    try {
        const { id } = await params
        const body = await req.json()
        const result = await updateRiskRule(id, body)
        return NextResponse.json(result)
    } catch (error: any) {
        return NextResponse.json({ error: 'Failed to update rule' }, { status: 500 })
    }
}

export async function DELETE(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    try {
        const { id } = await params
        await deleteRiskRule(id)
        return NextResponse.json({ success: true })
    } catch (error: any) {
        return NextResponse.json({ error: 'Failed to delete rule' }, { status: 500 })
    }
}
