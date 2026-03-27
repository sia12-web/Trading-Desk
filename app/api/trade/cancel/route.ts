import { createClient } from '@/lib/supabase/server'
import { cancelOrder } from '@/lib/oanda/client'
import { logExecution } from '@/lib/data/execution-logs'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const { oandaOrderId, localTradeId } = body

    try {
        const oandaResponse = await cancelOrder(oandaOrderId)

        if (oandaResponse.error) {
            await logExecution({
                user_id: user.id,
                action: 'cancel_order',
                oanda_trade_id: oandaOrderId,
                request_payload: body,
                response_payload: oandaResponse.error,
                status: 'failed',
                error_message: oandaResponse.error.errorMessage || 'OANDA API Error'
            })
            return NextResponse.json({ error: oandaResponse.error.errorMessage || 'Cancellation failed' }, { status: 500 })
        }

        // Update local record
        if (localTradeId) {
            await supabase
                .from('trades')
                .update({ status: 'cancelled' })
                .eq('id', localTradeId)
        }

        await logExecution({
            user_id: user.id,
            action: 'cancel_order',
            trade_id: localTradeId,
            oanda_trade_id: oandaOrderId,
            request_payload: body,
            response_payload: oandaResponse.data,
            status: 'success'
        })

        return NextResponse.json({ success: true, data: oandaResponse.data })
    } catch (error: any) {
        return NextResponse.json({ error: 'Failed to cancel order' }, { status: 500 })
    }
}
