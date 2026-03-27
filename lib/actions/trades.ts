'use server'

import { createClient } from '@/lib/supabase/server'
import {
    createTrade,
    updateTrade,
    closeTrade,
    cancelTrade,
    deleteTrade,
    TradeFormData,
    ScreenshotData,
    StrategyStepData
} from '@/lib/data/trades'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function submitTradeAction(formData: FormData, tradeId?: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Unauthorized')

    const tradeData: TradeFormData = {
        pair: formData.get('pair') as string,
        direction: formData.get('direction') as 'long' | 'short',
        entry_price: formData.get('entry_price') ? parseFloat(formData.get('entry_price') as string) : null,
        stop_loss: formData.get('stop_loss') ? parseFloat(formData.get('stop_loss') as string) : null,
        take_profit: formData.get('take_profit') ? parseFloat(formData.get('take_profit') as string) : null,
        lot_size: formData.get('lot_size') ? parseFloat(formData.get('lot_size') as string) : null,
        status: formData.get('status') as any || 'planned',
        name: formData.get('name') as string | null,
        strategy_explanation: formData.get('strategy_explanation') as string | null,
        trade_reasoning: formData.get('trade_reasoning')
            ? JSON.parse(formData.get('trade_reasoning') as string)
            : null,
    }

    const strategiesJson = formData.get('strategies') as string
    const strategies: StrategyStepData[] = JSON.parse(strategiesJson)

    const screenshotsJson = formData.get('screenshots') as string
    const screenshots: ScreenshotData[] = JSON.parse(screenshotsJson)

    let resultTrade
    if (tradeId) {
        await updateTrade(tradeId, tradeData, strategies, screenshots)
        resultTrade = { id: tradeId }
    } else {
        resultTrade = await createTrade(tradeData, screenshots, strategies)
    }

    revalidatePath('/journal')
    revalidatePath(`/journal/${resultTrade.id}`)
    redirect(`/journal/${resultTrade.id}`)
}

export async function closeTradeAction(id: string, exitPrice: number, pnlData: any) {
    await closeTrade(id, exitPrice, pnlData)
    revalidatePath('/journal')
    revalidatePath(`/journal/${id}`)
    revalidatePath('/pnl')
    revalidatePath('/')
}

export async function cancelTradeAction(id: string) {
    await cancelTrade(id)
    revalidatePath('/journal')
    revalidatePath(`/journal/${id}`)
}

export async function deleteTradeAction(id: string) {
    await deleteTrade(id)
    revalidatePath('/journal')
    revalidatePath('/pnl')
    revalidatePath('/')
    redirect('/journal')
}
