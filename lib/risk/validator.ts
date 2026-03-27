import { getAccountSummary, getOpenTrades } from '@/lib/oanda/client'
import { getActiveRiskRules } from '@/lib/data/risk-rules'
import { createClient } from '@/lib/supabase/server'
import { startOfDay } from 'date-fns'
import { PAIR_KNOWLEDGE } from '@/lib/utils/pair-knowledge'

export interface TradeParams {
    instrument: string    // "EUR_USD"
    direction: "long" | "short"
    units: number         // lot size in OANDA units (e.g., 10000 = 0.1 lots)
    entryPrice: number
    stopLoss: number
    takeProfit?: number
}

export interface RiskCheck {
    ruleName: string
    ruleType: string
    passed: boolean
    isWarning: boolean
    message: string
    currentValue: number
    limitValue: number
}

export interface RiskValidationResult {
    passed: boolean
    checks: RiskCheck[]
    blockers: RiskCheck[]
    warnings: RiskCheck[]
}

export async function validateTrade(params: TradeParams, userId: string): Promise<RiskValidationResult> {
    const activeRules = await getActiveRiskRules(userId)
    const { data: account } = await getAccountSummary()
    const { data: openTrades = [] } = await getOpenTrades()

    const supabase = await createClient()

    const checks: RiskCheck[] = []

    const balance = parseFloat(account?.balance || '0')
    const unrealizedPL = parseFloat(account?.unrealizedPL || '0')

    for (const rule of activeRules) {
        const value = rule.value as any

        switch (rule.rule_type) {
            case 'max_risk_per_trade': {
                // Calculate risk = |entry_price - stop_loss| × units
                const riskAmount = Math.abs(params.entryPrice - params.stopLoss) * params.units
                const riskPercent = (riskAmount / balance) * 100
                const limit = value.percent

                checks.push({
                    ruleName: rule.rule_name,
                    ruleType: rule.rule_type,
                    passed: riskPercent <= limit,
                    isWarning: riskPercent > limit * 0.8 && riskPercent <= limit,
                    message: `Risk per trade: ${riskPercent.toFixed(2)}% (limit: ${limit}%)`,
                    currentValue: riskPercent,
                    limitValue: limit
                })
                break
            }

            case 'max_daily_loss': {
                // Sum today's closed P&L
                const today = startOfDay(new Date()).toISOString()
                const { data: closedToday } = await supabase
                    .from('trade_pnl')
                    .select('pnl_amount')
                    .eq('user_id', userId)
                    .gte('recorded_at', today)

                const realizedToday = (closedToday || []).reduce((sum, p) => sum + p.pnl_amount, 0)
                const totalTodayLoss = realizedToday + unrealizedPL

                // Start of day balance (approximate)
                const sodBalance = balance - realizedToday
                const lossPercent = sodBalance > 0 ? (Math.abs(Math.min(0, totalTodayLoss)) / sodBalance) * 100 : 0
                const limit = value.percent

                checks.push({
                    ruleName: rule.rule_name,
                    ruleType: rule.rule_type,
                    passed: lossPercent <= limit,
                    isWarning: lossPercent > limit * 0.8 && lossPercent <= limit,
                    message: `Today's relative loss: ${lossPercent.toFixed(2)}% (limit: ${limit}%)`,
                    currentValue: lossPercent,
                    limitValue: limit
                })
                break
            }

            case 'max_open_trades': {
                const count = openTrades.length
                const limit = value.count

                checks.push({
                    ruleName: rule.rule_name,
                    ruleType: rule.rule_type,
                    passed: count <= limit,
                    isWarning: count === limit - 1,
                    message: `Open trades: ${count} (limit: ${limit})`,
                    currentValue: count,
                    limitValue: limit
                })
                break
            }

            case 'max_position_size': {
                const lots = params.units / 100000
                const limit = value.lots

                checks.push({
                    ruleName: rule.rule_name,
                    ruleType: rule.rule_type,
                    passed: lots <= limit,
                    isWarning: lots > limit * 0.8 && lots <= limit,
                    message: `Position size: ${lots.toFixed(2)} lots (limit: ${limit} lots)`,
                    currentValue: lots,
                    limitValue: limit
                })
                break
            }

            case 'custom': {
                // Handle custom/correlated if labeled as such in my seed
                const desc = typeof value.description === 'string' ? value.description : ''
                if (desc.includes('correlated') || rule.rule_name.includes('Correlated')) {
                    const limit = value.count
                    const [base, quote] = params.instrument.split('_')
                    const correlatedTrades = openTrades.filter(ot =>
                        ot.instrument.includes(base) || ot.instrument.includes(quote)
                    )
                    const correlatedCount = correlatedTrades.length

                    let extraNote = ""
                    const pairStr = params.instrument.replace('_', '/')
                    const knowledge = PAIR_KNOWLEDGE[pairStr]

                    if (knowledge && correlatedTrades.length > 0) {
                        for (const ot of correlatedTrades) {
                            const otPair = ot.instrument.replace('_', '/')
                            const corr = knowledge.correlations.find(c => c.pair === otPair)
                            if (corr && otPair !== pairStr) {
                                extraNote = ` Note: ${pairStr} and ${otPair} are ${corr.strength}ly ${corr.type}ly correlated — ${corr.explanation.toLowerCase()}`
                                break
                            }
                        }
                    }

                    checks.push({
                        ruleName: rule.rule_name,
                        ruleType: 'correlated_exposure',
                        passed: correlatedCount <= limit,
                        isWarning: correlatedCount === limit - 1,
                        message: `Correlated exposure: ${correlatedCount} ${base}/${quote} trades (limit: ${limit}).${extraNote}`,
                        currentValue: correlatedCount,
                        limitValue: limit
                    })
                } else {
                    checks.push({
                        ruleName: rule.rule_name,
                        ruleType: rule.rule_type,
                        passed: true,
                        isWarning: true,
                        message: `Manual check required: ${value.description || 'Custom Validation'}`,
                        currentValue: 0,
                        limitValue: 0
                    })
                }
                break
            }

            case 'min_reward_risk': {
                const limit = value.ratio
                if (!params.takeProfit) {
                    checks.push({
                        ruleName: rule.rule_name,
                        ruleType: rule.rule_type,
                        passed: false,
                        isWarning: false,
                        message: `Take Profit is required when Minimum R:R rule is active`,
                        currentValue: 0,
                        limitValue: limit
                    })
                } else {
                    const reward = Math.abs(params.takeProfit - params.entryPrice)
                    const risk = Math.abs(params.entryPrice - params.stopLoss)
                    const actual_rr = risk > 0 ? reward / risk : 0

                    checks.push({
                        ruleName: rule.rule_name,
                        ruleType: rule.rule_type,
                        passed: actual_rr >= limit,
                        isWarning: actual_rr < limit * 1.2 && actual_rr >= limit,
                        message: `R:R ratio: ${actual_rr.toFixed(2)}:1 (minimum: ${limit}:1)`,
                        currentValue: actual_rr,
                        limitValue: limit
                    })
                }
                break
            }
        }
    }

    const blockers = checks.filter(c => !c.passed)
    const warnings = checks.filter(c => c.isWarning && c.passed)

    return {
        passed: blockers.length === 0,
        checks,
        blockers,
        warnings
    }
}
