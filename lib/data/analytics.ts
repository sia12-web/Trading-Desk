import { createClient } from '@/lib/supabase/server'
import { getActiveAccountId } from '@/lib/oanda/account'
import { startOfMonth, endOfMonth, format, subMonths } from 'date-fns'

export async function getPortfolioSummary(userId: string) {
    const supabase = await createClient()
    const accountId = await getActiveAccountId()

    const { data: trades, error } = await supabase
        .from('trades')
        .select(`
      *,
      trade_pnl (*)
    `)
        .eq('user_id', userId)
        .eq('oanda_account_id', accountId)
        .eq('status', 'closed')

    if (error) throw error

    if (!trades || trades.length === 0) {
        return {
            totalPnL: 0,
            winRate: 0,
            totalTrades: 0,
            avgWin: 0,
            avgLoss: 0,
            profitFactor: 0,
            bestTrade: 0,
            worstTrade: 0
        }
    }

    let totalPnL = 0
    let wins = 0
    let totalWinsAmount = 0
    let totalLossesAmount = 0
    let bestTrade = -Infinity
    let worstTrade = Infinity

    trades.forEach(trade => {
        const pnl = trade.trade_pnl?.[0]?.pnl_amount || 0
        totalPnL += pnl

        if (pnl > 0) {
            wins++
            totalWinsAmount += pnl
        } else {
            totalLossesAmount += Math.abs(pnl)
        }

        if (pnl > bestTrade) bestTrade = pnl
        if (pnl < worstTrade) worstTrade = pnl
    })

    const winRate = (wins / trades.length) * 100
    const avgWin = wins > 0 ? totalWinsAmount / wins : 0
    const avgLoss = (trades.length - wins) > 0 ? totalLossesAmount / (trades.length - wins) : 0
    const profitFactor = totalLossesAmount > 0 ? totalWinsAmount / totalLossesAmount : totalWinsAmount > 0 ? Infinity : 0

    return {
        totalPnL,
        winRate,
        totalTrades: trades.length,
        avgWin,
        avgLoss,
        profitFactor,
        bestTrade: bestTrade === -Infinity ? 0 : bestTrade,
        worstTrade: worstTrade === Infinity ? 0 : worstTrade
    }
}

export async function getCumulativePnL(userId: string) {
    const supabase = await createClient()
    const accountId = await getActiveAccountId()

    // Get trade IDs for this account
    const { data: accountTrades } = await supabase
        .from('trades')
        .select('id')
        .eq('user_id', userId)
        .eq('oanda_account_id', accountId)
        .eq('status', 'closed')
    const tradeIds = (accountTrades || []).map(t => t.id)
    if (tradeIds.length === 0) return []

    const { data, error } = await supabase
        .from('trade_pnl')
        .select('pnl_amount, recorded_at')
        .in('trade_id', tradeIds)
        .order('recorded_at', { ascending: true })

    if (error) throw error

    let runningTotal = 0
    return (data || []).map(record => {
        runningTotal += Number(record.pnl_amount)
        return {
            date: format(new Date(record.recorded_at), 'MM/dd'),
            pnl: runningTotal
        }
    })
}

export async function getPnLByPair(userId: string) {
    const supabase = await createClient()
    const accountId = await getActiveAccountId()

    const { data, error } = await supabase
        .from('trades')
        .select(`
      pair,
      trade_pnl (pnl_amount)
    `)
        .eq('user_id', userId)
        .eq('oanda_account_id', accountId)
        .eq('status', 'closed')

    if (error) throw error

    const pairPnL: Record<string, number> = {}
    data.forEach(trade => {
        const pnl = trade.trade_pnl?.[0]?.pnl_amount || 0
        pairPnL[trade.pair] = (pairPnL[trade.pair] || 0) + Number(pnl)
    })

    return Object.entries(pairPnL).map(([pair, pnl]) => ({ pair, pnl }))
}

export async function getMonthlyPnL(userId: string) {
    const supabase = await createClient()
    const accountId = await getActiveAccountId()

    // Get trade IDs for this account
    const { data: accountTrades } = await supabase
        .from('trades')
        .select('id')
        .eq('user_id', userId)
        .eq('oanda_account_id', accountId)
        .eq('status', 'closed')
    const tradeIds = (accountTrades || []).map(t => t.id)
    if (tradeIds.length === 0) return []

    const { data, error } = await supabase
        .from('trade_pnl')
        .select('pnl_amount, recorded_at')
        .in('trade_id', tradeIds)
        .order('recorded_at', { ascending: true })

    if (error) throw error

    const monthlyPnL: Record<string, number> = {};
    (data || []).forEach(record => {
        const month = format(new Date(record.recorded_at), 'MMM yyyy')
        monthlyPnL[month] = (monthlyPnL[month] || 0) + Number(record.pnl_amount)
    })

    return Object.entries(monthlyPnL).map(([month, pnl]) => ({ month, pnl }))
}

export async function getRecentClosedTrades(userId: string, limit: number = 10) {
    const supabase = await createClient()
    const accountId = await getActiveAccountId()

    const { data, error } = await supabase
        .from('trades')
        .select(`
      *,
      trade_pnl (*)
    `)
        .eq('user_id', userId)
        .eq('oanda_account_id', accountId)
        .eq('status', 'closed')
        .order('closed_at', { ascending: false })
        .limit(limit)

    if (error) throw error
    return data
}

export async function getDashboardStats(userId: string) {
    const supabase = await createClient()
    const accountId = await getActiveAccountId()

    const { data: openTrades } = await supabase
        .from('trades')
        .select('id')
        .eq('user_id', userId)
        .eq('oanda_account_id', accountId)
        .eq('status', 'open')

    const now = new Date()
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString()

    // Get trade IDs for this account to filter trade_pnl
    const { data: accountTrades } = await supabase
        .from('trades')
        .select('id')
        .eq('user_id', userId)
        .eq('oanda_account_id', accountId)
        .eq('status', 'closed')
    const tradeIds = (accountTrades || []).map(t => t.id)

    let todayPnLAmount = 0
    if (tradeIds.length > 0) {
        const { data: todayPnL } = await supabase
            .from('trade_pnl')
            .select('pnl_amount')
            .in('trade_id', tradeIds)
            .gte('recorded_at', startOfDay)

        todayPnLAmount = todayPnL?.reduce((acc, curr) => acc + Number(curr.pnl_amount), 0) || 0
    }

    return {
        openTradesCount: openTrades?.length || 0,
        todayPnL: todayPnLAmount
    }
}
