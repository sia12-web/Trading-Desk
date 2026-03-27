'use client'

import React, { useState, useEffect } from 'react'
import { ShieldAlert, ArrowRight, CheckCircle2, AlertTriangle } from 'lucide-react'
import Link from 'next/link'

export function RiskStatusWidget() {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [data, setData] = useState<any>(null)
    const [loading, setLoading] = useState(true)

    const fetchStatus = async () => {
        try {
            const res = await fetch('/api/oanda/account', { cache: 'no-store' })
            const account = await res.json()

            const resRules = await fetch('/api/risk/validate', {
                method: 'POST',
                body: JSON.stringify({
                    instrument: 'EUR_USD',
                    direction: 'long',
                    units: 0,
                    entryPrice: 1,
                    stopLoss: 1
                }),
                headers: { 'Content-Type': 'application/json' }
            })
            const validation = await resRules.json()

            setData({
                account,
                validation,
                activeRules: validation.checks?.length || 0
            })
        } catch (err) {
            console.error(err)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchStatus()
    }, [])

    if (loading || !data) {
        return <div className="bg-neutral-900 border-none rounded-3xl h-64 animate-pulse p-6" />
    }

    const dailyLossRule = data.validation.checks.find((c: { ruleType: string; currentValue: number; limitValue: number; passed: boolean }) => c.ruleType === 'max_daily_loss')
    const openTradesRule = data.validation.checks.find((c: { ruleType: string; currentValue: number; limitValue: number; passed: boolean }) => c.ruleType === 'max_open_trades')
    const isOk = data.validation.passed

    return (
        <div className="bg-neutral-900 border-none rounded-3xl p-5 space-y-5 flex-1 flex flex-col justify-between h-full group">
            {/* Header - Compact */}
            <div className="flex items-center justify-between shrink-0">
                <h3 className="text-[10px] font-black text-neutral-500 uppercase tracking-[0.2em] flex items-center gap-2">
                    <ShieldAlert className={isOk ? 'text-blue-500' : 'text-rose-500'} size={14} />
                    Risk Engine
                </h3>
                <div className="flex items-center gap-2">
                    <span className={`text-[9px] font-black uppercase tracking-widest ${isOk ? 'text-emerald-500' : 'text-rose-500'}`}>
                        {isOk ? 'Safe' : 'Exceeded'}
                    </span>
                    <div className={`w-2 h-2 rounded-full ${isOk ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.5)]'} animate-pulse`} />
                </div>
            </div>

            <div className="space-y-4 flex-1">
                {/* Daily Loss Progress - Compacted */}
                {dailyLossRule && (
                    <div className="space-y-2">
                        <div className="flex justify-between text-[9px] font-black uppercase tracking-widest px-1">
                            <span className="text-neutral-500">Daily Drawdown</span>
                            <span className={dailyLossRule.passed ? 'text-neutral-400' : 'text-rose-400'}>
                                {dailyLossRule.currentValue.toFixed(1)}% / {dailyLossRule.limitValue}%
                            </span>
                        </div>
                        <div className="h-1.5 w-full bg-neutral-950/50 rounded-full overflow-hidden border border-neutral-800/30">
                            <div
                                className={`h-full transition-all duration-1000 ${
                                    dailyLossRule.currentValue >= dailyLossRule.limitValue 
                                        ? 'bg-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.4)]' 
                                        : dailyLossRule.currentValue > dailyLossRule.limitValue * 0.8 
                                            ? 'bg-amber-400 shadow-[0_0_10px_rgba(251,191,36,0.3)]' 
                                            : 'bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.3)]'
                                }`}
                                style={{ width: `${Math.min(100, (dailyLossRule.currentValue / dailyLossRule.limitValue) * 100)}%` }}
                            />
                        </div>
                    </div>
                )}

                {/* Status Items Grid */}
                <div className="grid grid-cols-2 gap-2">
                    {openTradesRule && (
                        <div className="bg-neutral-950/40 p-3 rounded-2xl border border-neutral-800/50 flex flex-col gap-1">
                            <span className="text-[9px] font-black text-neutral-500 uppercase tracking-widest">Open Ops</span>
                            <span className={`font-mono text-xs font-black ${openTradesRule.passed ? 'text-white' : 'text-rose-400'}`}>
                                {openTradesRule.currentValue} / {openTradesRule.limitValue}
                            </span>
                        </div>
                    )}

                    <div className="bg-neutral-950/40 p-3 rounded-2xl border border-neutral-800/50 flex flex-col gap-1">
                        <span className="text-[9px] font-black text-neutral-500 uppercase tracking-widest">Active Rules</span>
                        <span className="font-mono text-xs font-black text-white">{data.activeRules}</span>
                    </div>
                </div>
            </div>

            {/* Verification Footer */}
            <div className="flex items-center gap-3 p-3 bg-neutral-950/50 rounded-2xl border border-neutral-800/50 shrink-0">
                {isOk ? (
                    <CheckCircle2 size={14} className="text-emerald-500" />
                ) : (
                    <AlertTriangle size={14} className="text-rose-500" />
                )}
                <div className="flex-1 min-w-0">
                    <p className="text-[10px] font-bold text-neutral-400 leading-tight truncate">
                        {isOk ? 'Allocation verified by risk kernel.' : 'Risk threshold breach detected.'}
                    </p>
                </div>
                <Link
                    href="/risk-rules"
                    className="p-1.5 bg-neutral-800 hover:bg-neutral-700 rounded-lg text-neutral-400 hover:text-white transition-all group/btn shrink-0"
                >
                    <ArrowRight size={10} className="group-hover/btn:translate-x-0.5 transition-transform" />
                </Link>
            </div>
        </div>
    )
}
