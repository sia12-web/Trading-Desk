import { getOpenTrades } from '@/lib/oanda/client'
import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    try {
        const result = await getOpenTrades()
        return NextResponse.json({ trades: result.data || [] })
    } catch (error: any) {
        return NextResponse.json({ error: 'Failed to fetch trades' }, { status: 500 })
    }
}
