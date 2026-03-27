import { createClient } from '@/lib/supabase/server'
import { createTrade } from '@/lib/data/trades'
import { NextResponse } from 'next/server'

const VALID_INSTRUMENTS = [
    'EUR_USD', 'GBP_USD', 'USD_JPY', 'USD_CHF', 'AUD_USD', 'NZD_USD', 'USD_CAD',
    'EUR_GBP', 'EUR_JPY', 'GBP_JPY', 'AUD_JPY', 'EUR_AUD', 'EUR_CAD', 'EUR_CHF',
    'GBP_AUD', 'GBP_CAD', 'GBP_CHF', 'AUD_CAD', 'AUD_CHF', 'AUD_NZD',
    'NZD_JPY', 'NZD_CAD', 'NZD_CHF', 'CAD_JPY', 'CAD_CHF', 'CHF_JPY',
    'XAU_USD', 'BTC_USD', 'ETH_USD', 'US30'
]

export async function POST(req: Request) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const {
        instrument,
        direction,
        units,
        entryPrice,
        stopLoss,
        takeProfit,
        orderType,
        limitPrice,
        name,
        strategy_explanation
    } = body

    // Validate required fields
    if (!instrument || !VALID_INSTRUMENTS.includes(instrument)) {
        return NextResponse.json({ error: 'Invalid instrument' }, { status: 400 })
    }
    if (!direction || !['long', 'short'].includes(direction)) {
        return NextResponse.json({ error: 'Invalid direction' }, { status: 400 })
    }
    if (!stopLoss || stopLoss <= 0) {
        return NextResponse.json({ error: 'Stop loss is required' }, { status: 400 })
    }
    if (!units || units <= 0) {
        return NextResponse.json({ error: 'Position size is required' }, { status: 400 })
    }

    try {
        const effectiveEntryPrice = orderType === 'LIMIT' ? parseFloat(limitPrice) : (entryPrice || 0)

        const trade = await createTrade({
            pair: instrument.replace('_', '/'),
            direction,
            entry_price: effectiveEntryPrice,
            stop_loss: stopLoss,
            take_profit: takeProfit || null,
            lot_size: units / 100000,
            status: 'planned',
            name: name?.trim()?.slice(0, 200) || null,
            strategy_explanation: strategy_explanation?.trim() || null,
        }, [], [])

        return NextResponse.json({
            success: true,
            tradeId: trade.id,
        })
    } catch (error: any) {
        console.error('Plan trade error:', error)
        return NextResponse.json({ error: 'Failed to save planned trade' }, { status: 500 })
    }
}
