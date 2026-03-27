import { createClient } from '@/lib/supabase/server'
import { modifyTrade } from '@/lib/oanda/client'
import { logExecution } from '@/lib/data/execution-logs'
import { NextResponse } from 'next/server'

export async function PUT(req: Request) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const { oandaTradeId, stopLoss, takeProfit, localTradeId } = body

    try {
        const oandaResponse = await modifyTrade(oandaTradeId, {
            stopLoss: stopLoss ? { price: stopLoss.toString() } : undefined,
            takeProfit: takeProfit ? { price: takeProfit.toString() } : undefined
        })

        if (oandaResponse.error) {
            await logExecution({
                user_id: user.id,
                action: 'modify_trade',
                oanda_trade_id: oandaTradeId,
                request_payload: body,
                response_payload: oandaResponse.error,
                status: 'failed',
                error_message: oandaResponse.error.errorMessage || 'OANDA API Error'
            })
            return NextResponse.json({ error: oandaResponse.error.errorMessage || 'Modification failed' }, { status: 500 })
        }

        // Update local record
        if (localTradeId) {
            await supabase
                .from('trades')
                .update({
                    stop_loss: stopLoss,
                    take_profit: takeProfit
                })
                .eq('id', localTradeId)
        }

        await logExecution({
            user_id: user.id,
            action: 'modify_trade',
            trade_id: localTradeId,
            oanda_trade_id: oandaTradeId,
            request_payload: body,
            response_payload: oandaResponse.data,
            status: 'success'
        })

        return NextResponse.json({ success: true, data: oandaResponse.data })
    } catch (error: any) {
        return NextResponse.json({ error: 'Failed to modify trade' }, { status: 500 })
    }
}
