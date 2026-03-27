import { createClient } from '@/lib/supabase/server'
import { getOpenTrades, getCurrentPrices } from '@/lib/oanda/client'
import { NextResponse } from 'next/server'

export async function GET() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: trades, error: tradesError } = await getOpenTrades()

    if (tradesError) {
        return NextResponse.json({ error: tradesError }, { status: 500 })
    }

    if (trades.length === 0) {
        return NextResponse.json({ trades: [], prices: [] })
    }

    const instruments = Array.from(new Set(trades.map(t => t.instrument)))
    const { data: prices, error: pricesError } = await getCurrentPrices(instruments)

    if (pricesError) {
        return NextResponse.json({ trades, prices: [], error: pricesError })
    }

    return NextResponse.json({ trades, prices })
}
