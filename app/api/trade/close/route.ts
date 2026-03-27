import { createClient } from '@/lib/supabase/server'
import { closeTrade } from '@/lib/oanda/client'
import { logExecution } from '@/lib/data/execution-logs'
import { calculatePips } from '@/lib/utils/forex'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const { oandaTradeId, units, localTradeId } = body

    try {
        const oandaResponse = await closeTrade(oandaTradeId, units || 'ALL')

        if (oandaResponse.error) {
            await logExecution({
                user_id: user.id,
                action: 'close_trade',
                oanda_trade_id: oandaTradeId,
                request_payload: body,
                response_payload: oandaResponse.error,
                status: 'failed',
                error_message: oandaResponse.error.errorMessage || 'OANDA API Error'
            })
            return NextResponse.json({ error: oandaResponse.error.errorMessage || 'Closing failed' }, { status: 500 })
        }

        // Update local record and record P&L
        const fill = oandaResponse.data?.orderFillTransaction
        if (localTradeId && fill) {
            const plAmount = parseFloat(fill.pl || '0')
            const exitPrice = parseFloat(fill.price || '0')

            // Get local trade for pip calculation
            const { data: localTrade } = await supabase
                .from('trades')
                .select('entry_price, pair, direction')
                .eq('id', localTradeId)
                .single()

            let pnlPips = 0
            if (localTrade?.entry_price) {
                pnlPips = calculatePips(
                    Number(localTrade.entry_price),
                    exitPrice,
                    localTrade.direction as 'long' | 'short',
                    localTrade.pair
                )
            }

            // Update trade status to closed
            await supabase
                .from('trades')
                .update({
                    status: 'closed',
                    exit_price: exitPrice,
                    closed_at: new Date().toISOString()
                })
                .eq('id', localTradeId)

            // Record P&L
            await supabase
                .from('trade_pnl')
                .insert([{
                    trade_id: localTradeId,
                    user_id: user.id,
                    pnl_amount: plAmount,
                    pnl_pips: parseFloat(pnlPips.toFixed(1)),
                    fees: Math.abs(parseFloat(fill.financing || '0')),
                    recorded_at: new Date().toISOString()
                }])
        }

        await logExecution({
            user_id: user.id,
            action: 'close_trade',
            trade_id: localTradeId,
            oanda_trade_id: oandaTradeId,
            request_payload: body,
            response_payload: oandaResponse.data,
            status: 'success'
        })

        return NextResponse.json({ success: true, data: oandaResponse.data })
    } catch (error: any) {
        return NextResponse.json({ error: 'Failed to close trade' }, { status: 500 })
    }
}
