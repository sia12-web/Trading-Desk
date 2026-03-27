import { createClient } from '@/lib/supabase/server'
import { validateTrade } from '@/lib/risk/validator'
import { createMarketOrder } from '@/lib/oanda/client'
import { logExecution } from '@/lib/data/execution-logs'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { tradeId } = await req.json()

    if (!tradeId) {
        return NextResponse.json({ error: 'Trade ID is required' }, { status: 400 })
    }

    // 1. Fetch the planned trade
    const { data: trade, error: fetchError } = await supabase
        .from('trades')
        .select('*')
        .eq('id', tradeId)
        .eq('user_id', user.id)
        .single()

    if (fetchError || !trade) {
        return NextResponse.json({ error: 'Trade not found' }, { status: 404 })
    }

    if (trade.status !== 'planned') {
        return NextResponse.json({ error: 'Trade is not in planned status' }, { status: 400 })
    }

    if (trade.oanda_trade_id) {
        return NextResponse.json({ error: 'Trade already has an OANDA order' }, { status: 400 })
    }

    // 2. Run risk validation
    const instrument = trade.pair.replace('/', '_')
    const units = Math.round(trade.lot_size * 100000)
    const riskParams = {
        instrument,
        direction: trade.direction,
        units,
        entryPrice: trade.entry_price,
        stopLoss: trade.stop_loss,
        takeProfit: trade.take_profit
    }

    const riskResult = await validateTrade(riskParams, user.id)

    if (!riskResult.passed) {
        await logExecution({
            user_id: user.id,
            action: 'place_order',
            trade_id: tradeId,
            request_payload: { tradeId, instrument },
            risk_validation: riskResult,
            status: 'blocked',
            error_message: 'Risk validation failed'
        })
        return NextResponse.json(riskResult, { status: 403 })
    }

    // 3. Execute on OANDA as market order
    const signedUnits = trade.direction === 'long' ? units : -units

    try {
        const oandaResponse = await createMarketOrder({
            instrument,
            units: signedUnits,
            stopLossOnFill: { price: trade.stop_loss.toString() },
            takeProfitOnFill: trade.take_profit ? { price: trade.take_profit.toString() } : undefined,
        })

        if (oandaResponse.error) {
            await logExecution({
                user_id: user.id,
                action: 'place_order',
                trade_id: tradeId,
                request_payload: { tradeId, instrument },
                response_payload: oandaResponse.error,
                risk_validation: riskResult,
                status: 'failed',
                error_message: oandaResponse.error.errorMessage || 'OANDA API Error'
            })
            return NextResponse.json({ error: oandaResponse.error.errorMessage || 'Order execution failed' }, { status: 500 })
        }

        // 4. Update the planned trade to open
        const oandaTradeId = oandaResponse.data?.orderFillTransaction?.tradeOpened?.tradeID
        const fillPrice = parseFloat(oandaResponse.data?.orderFillTransaction?.price || trade.entry_price.toString())

        await supabase.from('trades').update({
            status: 'open',
            oanda_trade_id: oandaTradeId,
            entry_price: fillPrice,
            opened_at: new Date().toISOString(),
        }).eq('id', tradeId)

        await logExecution({
            user_id: user.id,
            action: 'place_order',
            trade_id: tradeId,
            oanda_trade_id: oandaTradeId,
            request_payload: { tradeId, instrument },
            response_payload: oandaResponse.data,
            risk_validation: riskResult,
            status: 'success'
        })

        return NextResponse.json({
            success: true,
            oandaResponse: oandaResponse.data,
            fillPrice,
            oandaTradeId,
        })
    } catch (error: any) {
        console.error('Execute planned trade error:', error)
        return NextResponse.json({ error: 'Trade execution failed' }, { status: 500 })
    }
}
