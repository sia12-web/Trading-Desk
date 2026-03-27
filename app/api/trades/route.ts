import { createClient } from '@/lib/supabase/server'
import { listTrades } from '@/lib/data/trades'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    try {
        const url = new URL(req.url)
        const status = url.searchParams.get('status')
        const pair = url.searchParams.get('pair')

        const trades = await listTrades({
            status: status ? status.split(',') : undefined,
            pair: pair || undefined,
        })
        return NextResponse.json(trades)
    } catch (error: any) {
        return NextResponse.json({ error: 'Failed to fetch trades' }, { status: 500 })
    }
}
