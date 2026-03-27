'use client'

import React, { useState, useEffect } from 'react'
import { Wallet, TrendingUp, Shield, RefreshCw, AlertCircle, BarChart3, ShieldAlert, CheckCircle2, AlertTriangle, ArrowRight } from 'lucide-react'
import Link from 'next/link'

interface RiskCheck {
    ruleType: string
    currentValue: number
    limitValue: number
    passed: boolean
}

export function AccountRiskWidget() {
    const [account, setAccount] = useState<Record<string, string> | null>(null)
    const [riskChecks, setRiskChecks] = useState<RiskCheck[]>([])
    const [riskPassed, setRiskPassed] = useState(true)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [lastSynced, setLastSynced] = useState<Date | null>(null)

    const fetchData = async () => {
        try {
            const [accountRes, riskRes] = await Promise.all([
                fetch('/api/oanda/account', { cache: 'no-store' }),
                fetch('/api/risk/validate', {
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
            ])

            if (accountRes.ok) {
                const accountData = await accountRes.json()
                setAccount(accountData)
                setLastSynced(new Date())
                setError(null)
            } else {
                const errData = await accountRes.json()
                setError(errData.error?.errorMessage || 'Failed to fetch OANDA data')
            }

            if (riskRes.ok) {
                const riskData = await riskRes.json()
                setRiskChecks(riskData.checks || [])
                setRiskPassed(riskData.passed)
            }
        } catch {
            setError('Connection error')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchData()
        const interval = setInterval(fetchData, 30000)
        return () => clearInterval(interval)
    }, [])

    if (error) {
        return (
            <div className="p-5">
                <div className="bg-rose-500/10 border border-rose-500/20 rounded-2xl p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <AlertCircle size={20} className="text-rose-500 shrink-0" />
                        <div>
                            <h3 className="text-xs font-black text-rose-500 uppercase tracking-widest">Connection Error</h3>
                            <p className="text-[10px] text-rose-400 font-bold">{error}</p>
                        </div>
                    </div>
                    <button onClick={fetchData} className="p-2 bg-rose-500/10 hover:bg-rose-500/20 rounded-xl text-rose-500 transition-colors">
                        <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
                    </button>
                </div>
            </div>
        )
    }

    if (loading && !account) {
        return <div className="animate-pulse bg-neutral-900 rounded-3xl p-5 h-[300px]" />
    }

    const isPositive = account && parseFloat(account.unrealizedPL || '0') >= 0
    const dailyLossRule = riskChecks.find(c => c.ruleType === 'max_daily_loss')
    const openTradesRule = riskChecks.find(c => c.ruleType === 'max_open_trades')

    return (
        <div className="p-5 space-y-5">
            {/* Header */}
            <div className="flex items-center justify-between">
                <h3 className="text-[10px] font-black text-neutral-500 uppercase tracking-[0.2em] flex items-center gap-2">
                    <BarChart3 className="text-blue-500" size={14} />
                    Account & Risk
                </h3>
                <div className="flex items-center gap-2">
                    {lastSynced && (
                        <span className="text-[9px] text-neutral-700 font-mono tracking-tighter">
                            {lastSynced.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                    )}
                    <button
                        onClick={fetchData}
                        className="p-1 hover:bg-neutral-800 rounded-lg text-neutral-600 hover:text-white transition-all"
                    >
                        <RefreshCw className={`h-3 w-3 ${loading ? 'animate-spin' : ''}`} />
                    </button>
                </div>
            </div>

            {/* Balance */}
            <div className="space-y-1">
                <div className="flex items-center gap-2 text-neutral-500 mb-0.5">
                    <Wallet size={12} className="text-blue-500" />
                    <span className="text-[9px] font-black uppercase tracking-widest opacity-60">Total Equity</span>
                </div>
                <p className="text-3xl font-black tracking-tighter text-white">
                    {account?.currency === 'USD' ? '$' : ''}{parseFloat(account?.balance || '0').toLocaleString(undefined, { minimumFractionDigits: 0 })}
                    <span className="text-xs ml-1 text-neutral-600 font-bold">{account?.currency}</span>
                </p>
            </div>

            {/* P&L + Margin Grid */}
            <div className="grid grid-cols-2 gap-2">
                <div className="bg-neutral-950/40 rounded-2xl p-3 border border-neutral-800/50">
                    <div className="flex items-center gap-1.5 text-neutral-500 mb-1">
                        <TrendingUp size={10} className={isPositive ? 'text-emerald-500' : 'text-rose-500'} />
                        <span className="text-[9px] font-black uppercase tracking-widest">P&L Float</span>
                    </div>
                    <p className={`text-sm font-black tracking-tight ${isPositive ? 'text-emerald-400' : 'text-rose-500'}`}>
                        {parseFloat(account?.unrealizedPL || '0') >= 0 ? '+' : ''}
                        {parseFloat(account?.unrealizedPL || '0').toFixed(2)}
                    </p>
                </div>
                <div className="bg-neutral-950/40 rounded-2xl p-3 border border-neutral-800/50">
                    <div className="flex items-center gap-1.5 text-neutral-500 mb-1">
                        <Shield size={10} className="text-blue-500" />
                        <span className="text-[9px] font-black uppercase tracking-widest">Margin Free</span>
                    </div>
                    <p className="text-sm font-black tracking-tight text-white/90">
                        ${(parseFloat(account?.marginAvailable || '0') / 1000).toFixed(1)}k
                    </p>
                </div>
            </div>

            {/* Divider */}
            <div className="border-t border-neutral-800/50" />

            {/* Risk Status */}
            <div className="flex items-center justify-between">
                <h4 className="text-[10px] font-black text-neutral-500 uppercase tracking-[0.2em] flex items-center gap-2">
                    <ShieldAlert className={riskPassed ? 'text-blue-500' : 'text-rose-500'} size={12} />
                    Risk Status
                </h4>
                <div className="flex items-center gap-1.5">
                    <span className={`text-[9px] font-black uppercase tracking-widest ${riskPassed ? 'text-emerald-500' : 'text-rose-500'}`}>
                        {riskPassed ? 'Safe' : 'Exceeded'}
                    </span>
                    <div className={`w-2 h-2 rounded-full ${riskPassed ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.5)]'} animate-pulse`} />
                </div>
            </div>

            {/* Daily Loss Progress */}
            {dailyLossRule && (
                <div className="space-y-1.5">
                    <div className="flex justify-between text-[9px] font-black uppercase tracking-widest px-0.5">
                        <span className="text-neutral-500">Daily Drawdown</span>
                        <span className={dailyLossRule.passed ? 'text-neutral-400' : 'text-rose-400'}>
                            {dailyLossRule.currentValue.toFixed(1)}% / {dailyLossRule.limitValue}%
                        </span>
                    </div>
                    <div className="h-1.5 w-full bg-neutral-950/50 rounded-full overflow-hidden border border-neutral-800/30">
                        <div
                            className={`h-full transition-all duration-1000 ${dailyLossRule.currentValue > dailyLossRule.limitValue * 0.8 ? 'bg-rose-500' : 'bg-blue-500'}`}
                            style={{ width: `${Math.min(100, (dailyLossRule.currentValue / dailyLossRule.limitValue) * 100)}%` }}
                        />
                    </div>
                </div>
            )}

            {/* Open Ops + Rules Grid */}
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
                    <span className="font-mono text-xs font-black text-white">{riskChecks.length}</span>
                </div>
            </div>

            {/* Footer */}
            <div className="flex items-center gap-3 p-3 bg-neutral-950/50 rounded-2xl border border-neutral-800/50">
                {riskPassed ? (
                    <CheckCircle2 size={14} className="text-emerald-500 shrink-0" />
                ) : (
                    <AlertTriangle size={14} className="text-rose-500 shrink-0" />
                )}
                <p className="text-[10px] font-bold text-neutral-400 leading-tight flex-1 min-w-0 truncate">
                    {riskPassed ? 'Risk parameters within limits.' : 'Risk threshold breach detected.'}
                </p>
                <Link
                    href="/risk-rules"
                    className="p-1.5 bg-neutral-800 hover:bg-neutral-700 rounded-lg text-neutral-400 hover:text-white transition-all shrink-0"
                >
                    <ArrowRight size={10} />
                </Link>
            </div>

            {/* OANDA Online indicator */}
            <div className="flex items-center gap-2 px-1">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)] animate-pulse" />
                <span className="text-[9px] font-black text-neutral-600 uppercase tracking-widest">Oanda Online</span>
            </div>
        </div>
    )
}
