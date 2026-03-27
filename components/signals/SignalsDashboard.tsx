'use client'

import React, { useState, useEffect } from 'react'
import {
    Zap, Power, TrendingUp, TrendingDown, CheckCircle, XCircle,
    Clock, Target, AlertCircle, Loader2, Bell, BellOff
} from 'lucide-react'

interface Signal {
    id: string
    strategy_id: string
    instrument: string
    timeframe: string
    direction: 'long' | 'short'
    entry_price: number
    stop_loss: number
    take_profit: number
    trigger_price: number
    reason: string
    confidence: number
    signal_data: {
        indicators: Record<string, any>
        params: Record<string, any>
    }
    status: string
    expiry_at: string
    created_at: string
    telegram_sent: boolean
}

interface Engine {
    id: string
    strategy_id: string
    instrument: string
    timeframe: string
    is_active: boolean
    indicator_params: Record<string, any>
    last_check_at: string | null
    signals_generated: number
}

interface Props {
    instrument: string
    strategyId: string
    timeframe: string
}

export default function SignalsDashboard({ instrument, strategyId, timeframe }: Props) {
    const [engine, setEngine] = useState<Engine | null>(null)
    const [signals, setSignals] = useState<Signal[]>([])
    const [loading, setLoading] = useState(true)
    const [actionLoading, setActionLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const fetchData = async () => {
        try {
            const [engineRes, signalsRes] = await Promise.all([
                fetch(`/api/signals/engine?strategy_id=${strategyId}`),
                fetch(`/api/signals/list?strategy_id=${strategyId}&status=new,acknowledged`)
            ])

            const engineData = await engineRes.json()
            const signalsData = await signalsRes.json()

            if (engineData.engines) {
                const activeEngine = engineData.engines.find(
                    (e: Engine) => e.instrument === instrument && e.timeframe === timeframe
                )
                setEngine(activeEngine || null)
            }

            if (signalsData.signals) {
                setSignals(signalsData.signals.filter((s: Signal) =>
                    s.instrument === instrument && s.timeframe === timeframe
                ))
            }
        } catch (error: any) {
            console.error('Failed to fetch data:', error)
            setError(error.message)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchData()

        const interval = setInterval(() => {
            if (engine?.is_active) {
                fetchData()
            }
        }, 30000)

        return () => clearInterval(interval)
    }, [instrument, timeframe, strategyId])

    const handleStart = async () => {
        setActionLoading(true)
        setError(null)
        try {
            const res = await fetch('/api/signals/engine', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ strategy_id: strategyId, instrument, timeframe })
            })

            const data = await res.json()
            if (!res.ok) {
                setError(data.error)
                return
            }

            setEngine(data.engine)
            await fetch('/api/signals/generate', { method: 'POST' })
            await fetchData()
        } catch (error: any) {
            setError(error.message)
        } finally {
            setActionLoading(false)
        }
    }

    const handleStop = async () => {
        setActionLoading(true)
        setError(null)
        try {
            const res = await fetch(
                `/api/signals/engine?strategy_id=${strategyId}&instrument=${instrument}`,
                { method: 'DELETE' }
            )

            if (!res.ok) {
                const data = await res.json()
                setError(data.error)
                return
            }

            setEngine(null)
        } catch (error: any) {
            setError(error.message)
        } finally {
            setActionLoading(false)
        }
    }

    const handleExecute = async (signal: Signal) => {
        try {
            await fetch('/api/signals/update', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ signal_id: signal.id, action: 'execute' })
            })

            const stateToSave = {
                selectedInstrument: signal.instrument,
                direction: signal.direction,
                units: 1000,
                stopLoss: signal.stop_loss,
                takeProfit: signal.take_profit,
                orderType: 'MARKET',
                timestamp: Date.now()
            }
            localStorage.setItem('tradeFormState', JSON.stringify(stateToSave))
            window.location.href = '/trade'
        } catch (error: any) {
            console.error('Execute error:', error)
        }
    }

    const handleDismiss = async (signalId: string) => {
        try {
            await fetch('/api/signals/update', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ signal_id: signalId, action: 'dismiss' })
            })

            setSignals(prev => prev.filter(s => s.id !== signalId))
        } catch (error: any) {
            console.error('Dismiss error:', error)
        }
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center p-8">
                <Loader2 className="animate-spin text-neutral-500" size={32} />
            </div>
        )
    }

    const isActive = engine?.is_active || false

    return (
        <div className="space-y-6">
            <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                        <Zap className={isActive ? 'text-green-400' : 'text-neutral-500'} size={24} />
                        <div>
                            <h3 className="text-lg font-bold text-white">Signal Engine</h3>
                            <p className="text-xs text-neutral-400">
                                {isActive ? 'Scanning for signals...' : 'Turn on to receive signals'}
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={isActive ? handleStop : handleStart}
                        disabled={actionLoading}
                        className={`flex items-center gap-2 px-4 py-2 rounded-xl font-bold transition-all ${
                            isActive
                                ? 'bg-red-600 hover:bg-red-500 text-white'
                                : 'bg-green-600 hover:bg-green-500 text-white'
                        } disabled:opacity-50`}
                    >
                        {actionLoading ? (
                            <Loader2 size={16} className="animate-spin" />
                        ) : isActive ? (
                            <><Power size={16} /> Stop</>
                        ) : (
                            <><Power size={16} /> Start</>
                        )}
                    </button>
                </div>

                {engine && (
                    <div className="grid grid-cols-3 gap-4 mt-4 pt-4 border-t border-neutral-800">
                        <div>
                            <p className="text-xs text-neutral-500 mb-1">Status</p>
                            <p className={`text-sm font-bold ${isActive ? 'text-green-400' : 'text-neutral-500'}`}>
                                {isActive ? 'Active' : 'Stopped'}
                            </p>
                        </div>
                        <div>
                            <p className="text-xs text-neutral-500 mb-1">Signals Generated</p>
                            <p className="text-sm font-bold text-white">{engine.signals_generated}</p>
                        </div>
                        <div>
                            <p className="text-xs text-neutral-500 mb-1">Last Check</p>
                            <p className="text-sm font-bold text-white">
                                {engine.last_check_at
                                    ? new Date(engine.last_check_at).toLocaleTimeString()
                                    : '—'}
                            </p>
                        </div>
                    </div>
                )}

                {engine?.indicator_params && Object.keys(engine.indicator_params).length > 0 && (
                    <div className="mt-4 p-3 rounded-xl bg-neutral-800/50 border border-neutral-700/50">
                        <p className="text-xs font-bold text-neutral-400 uppercase mb-2">Optimized Indicators</p>
                        <div className="flex flex-wrap gap-2">
                            {Object.entries(engine.indicator_params).map(([key, value]: [string, any]) => (
                                <span key={key} className="text-xs px-2 py-1 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20">
                                    {key.replace(/_/g, ' ').toUpperCase()}
                                </span>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {error && (
                <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm flex items-center gap-3">
                    <AlertCircle size={18} />
                    <span>{error}</span>
                </div>
            )}

            {signals.length > 0 ? (
                <div className="space-y-4">
                    <h3 className="text-sm font-bold text-neutral-400 uppercase tracking-widest">Active Signals</h3>
                    {signals.map((signal) => (
                        <div
                            key={signal.id}
                            className={`bg-neutral-900 border rounded-2xl p-6 ${
                                signal.direction === 'long' ? 'border-green-500/30' : 'border-red-500/30'
                            }`}
                        >
                            <div className="flex items-center justify-between mb-4">
                                <div className="flex items-center gap-3">
                                    {signal.direction === 'long' ? (
                                        <TrendingUp className="text-green-400" size={24} />
                                    ) : (
                                        <TrendingDown className="text-red-400" size={24} />
                                    )}
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <h4 className="text-lg font-bold text-white">
                                                {signal.direction.toUpperCase()} {signal.instrument.replace('_', '/')}
                                            </h4>
                                            <span className="px-2 py-0.5 rounded text-xs font-bold bg-neutral-800 text-neutral-400">
                                                {signal.timeframe}
                                            </span>
                                        </div>
                                        <p className="text-xs text-neutral-400 flex items-center gap-2 mt-1">
                                            <Clock size={12} />
                                            {new Date(signal.created_at).toLocaleString()}
                                            {signal.telegram_sent && (
                                                <span className="flex items-center gap-1 text-blue-400">
                                                    <Bell size={12} /> Sent
                                                </span>
                                            )}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className={`px-3 py-1 rounded-lg text-xs font-bold ${
                                        signal.confidence >= 80 ? 'bg-green-500/20 text-green-400' :
                                        signal.confidence >= 60 ? 'bg-yellow-500/20 text-yellow-400' :
                                        'bg-neutral-700 text-neutral-400'
                                    }`}>
                                        {signal.confidence}% confidence
                                    </div>
                                </div>
                            </div>

                            <div className="bg-neutral-800/30 rounded-xl p-3 mb-4">
                                <p className="text-sm text-neutral-300">{signal.reason}</p>
                            </div>

                            <div className="grid grid-cols-3 gap-4 mb-4">
                                <div className="bg-neutral-800/50 p-3 rounded-xl text-center">
                                    <p className="text-[9px] font-bold text-blue-400 uppercase mb-1">Entry</p>
                                    <p className="text-lg font-mono font-bold text-white">{signal.entry_price.toFixed(5)}</p>
                                </div>
                                <div className="bg-neutral-800/50 p-3 rounded-xl text-center">
                                    <p className="text-[9px] font-bold text-red-400 uppercase mb-1">Stop Loss</p>
                                    <p className="text-lg font-mono font-bold text-white">{signal.stop_loss.toFixed(5)}</p>
                                </div>
                                <div className="bg-neutral-800/50 p-3 rounded-xl text-center">
                                    <p className="text-[9px] font-bold text-green-400 uppercase mb-1">Take Profit</p>
                                    <p className="text-lg font-mono font-bold text-white">{signal.take_profit.toFixed(5)}</p>
                                </div>
                            </div>

                            {signal.signal_data?.indicators && (
                                <div className="bg-neutral-950/50 rounded-xl p-3 mb-4">
                                    <p className="text-[9px] font-bold text-neutral-500 uppercase mb-2">Indicators</p>
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
                                        {Object.entries(signal.signal_data.indicators).map(([key, value]) => (
                                            <div key={key}>
                                                <span className="text-neutral-500">{key}:</span>{' '}
                                                <span className="text-white font-mono">
                                                    {typeof value === 'number' ? value.toFixed(2) : JSON.stringify(value)}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <div className="flex gap-3">
                                <button
                                    onClick={() => handleExecute(signal)}
                                    className="flex-1 flex items-center justify-center gap-2 bg-green-600 hover:bg-green-500 text-white font-bold py-3 rounded-xl transition-all"
                                >
                                    <CheckCircle size={18} />
                                    Execute Trade
                                </button>
                                <button
                                    onClick={() => handleDismiss(signal.id)}
                                    className="flex items-center justify-center gap-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-400 font-bold px-4 py-3 rounded-xl transition-all"
                                >
                                    <XCircle size={18} />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            ) : isActive ? (
                <div className="bg-neutral-900/50 border border-neutral-800 rounded-2xl p-12 text-center">
                    <Target className="text-neutral-700 mx-auto mb-4" size={48} />
                    <h3 className="text-lg font-bold text-white mb-2">Scanning for Signals...</h3>
                    <p className="text-neutral-400 text-sm">
                        The engine is actively monitoring {instrument.replace('_', '/')} on {timeframe}.
                        You'll be notified when a signal is generated.
                    </p>
                </div>
            ) : (
                <div className="bg-neutral-900/50 border border-neutral-800 rounded-2xl p-12 text-center">
                    <BellOff className="text-neutral-700 mx-auto mb-4" size={48} />
                    <h3 className="text-lg font-bold text-white mb-2">Signal Engine Stopped</h3>
                    <p className="text-neutral-400 text-sm">
                        Start the engine to begin receiving trading signals for {instrument.replace('_', '/')} on {timeframe}.
                    </p>
                </div>
            )}
        </div>
    )
}
