'use client'

import React, { useState } from 'react'
import {
    Search,
    ShieldCheck,
    Target,
    TrendingUp,
    TrendingDown,
    AlertCircle,
    Loader2,
    CheckCircle2,
    ArrowRight,
    Info,
    BarChart3,
    XCircle,
    Zap
} from 'lucide-react'
import { PipelineResult, StrategySignal, ProposedTrade } from '@/lib/strategy/types'

interface StrategyScannerProps {
    instrument: string
    strategyId: string
    title?: string
}

export function StrategyScanner({ instrument, strategyId, title }: StrategyScannerProps) {
    const [isScanning, setIsScanning] = useState(false)
    const [result, setResult] = useState<{
        pipelineResult: PipelineResult,
        signals: StrategySignal[],
        proposedTrades: ProposedTrade[]
        indicators?: any
    } | null>(null)
    const [error, setError] = useState<string | null>(null)

    const handleScan = async () => {
        setIsScanning(true)
        setError(null)
        setResult(null)

        try {
            const res = await fetch('/api/strategy/scan', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ instrument, strategyId })
            })

            if (!res.ok) {
                const data = await res.json()
                throw new Error(data.error || 'Failed to scan')
            }

            const data = await res.json()
            setResult(data)
        } catch (err: any) {
            setError(err.message)
        } finally {
            setIsScanning(false)
        }
    }

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'confirmed': return <CheckCircle2 size={14} className="text-emerald-400" />
            case 'conflicting': return <XCircle size={14} className="text-rose-400" />
            case 'neutral': return <Info size={14} className="text-sky-400" />
            case 'unavailable': return <AlertCircle size={14} className="text-neutral-500" />
            default: return null
        }
    }

    const getStatusBg = (status: string) => {
        switch (status) {
            case 'confirmed': return 'bg-emerald-500/5 border-emerald-500/10'
            case 'conflicting': return 'bg-rose-500/5 border-rose-500/10'
            case 'neutral': return 'bg-sky-500/5 border-sky-500/10'
            case 'unavailable': return 'bg-neutral-500/5 border-neutral-800'
            default: return 'bg-neutral-900 border-neutral-800'
        }
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                        <Search size={20} className="text-blue-500" />
                        {title || 'Setup Scanner'}
                    </h3>
                    <p className="text-xs text-neutral-500 mt-1">
                        Find high-probability entry signals for {instrument.replace('_', '/')}
                    </p>
                </div>
                <button
                    onClick={handleScan}
                    disabled={isScanning}
                    className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl transition-all disabled:opacity-50 shadow-lg shadow-blue-900/20"
                >
                    {isScanning ? <Loader2 size={16} className="animate-spin" /> : <Search size={16} />}
                    Scan Now
                </button>
            </div>

            {error && (
                <div className="bg-rose-500/10 border border-rose-500/20 rounded-xl p-4 flex items-center gap-3">
                    <AlertCircle size={18} className="text-rose-400 shrink-0" />
                    <p className="text-rose-200/80 text-xs font-medium">{error}</p>
                </div>
            )}

            {!result && !isScanning && !error && (
                <div className="min-h-[200px] flex items-center justify-center border border-neutral-800 rounded-2xl bg-neutral-900/30 border-dashed">
                    <div className="text-center space-y-3 max-w-sm px-6">
                        <div className="w-12 h-12 bg-neutral-800/50 rounded-xl flex items-center justify-center mx-auto">
                            <Zap size={20} className="text-neutral-500" />
                        </div>
                        <p className="text-sm text-neutral-400">
                            Click "Scan Now" to find entry signals
                        </p>
                    </div>
                </div>
            )}

            {isScanning && (
                <div className="min-h-[200px] flex items-center justify-center bg-neutral-900/50 border border-neutral-800/50 rounded-2xl">
                    <div className="text-center space-y-4">
                        <div className="relative">
                            <div className="w-12 h-12 border-2 border-blue-500/20 rounded-full mx-auto" />
                            <div className="absolute top-0 left-1/2 -ml-6 w-12 h-12 border-t-2 border-blue-500 rounded-full animate-spin" />
                        </div>
                        <p className="text-sm font-bold text-white">Analyzing Layers...</p>
                    </div>
                </div>
            )}

            {result && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Signals */}
                    <div className="lg:col-span-2 space-y-4">
                        {result.signals.length === 0 ? (
                            <div className="bg-neutral-900/50 border border-neutral-800 rounded-2xl p-8 text-center space-y-3">
                                <p className="text-neutral-300 font-bold">No High-Probability Signals</p>
                                <p className="text-neutral-500 text-xs max-w-sm mx-auto leading-relaxed">
                                    {result.pipelineResult.canTrade
                                        ? `Pipeline aligned, but price hasn't reached a key zone. Monitor for bounces at pivot levels.`
                                        : `Signals blocked by trend layer. Market: ${result.pipelineResult.layers.find(l => l.name === 'Trend Confirmation')?.bias || 'Unknown'}.`}
                                </p>
                            </div>
                        ) : (
                            result.proposedTrades.map((trade, i) => (
                                <div key={i} className="bg-neutral-900 border border-neutral-800 rounded-2xl overflow-hidden hover:border-blue-500/30 transition-all">
                                    <div className="p-5">
                                        <div className="flex items-start justify-between mb-4">
                                            <div className="flex items-center gap-3">
                                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${trade.direction === 'long' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'}`}>
                                                    {trade.direction === 'long' ? <TrendingUp size={20} /> : <TrendingDown size={20} />}
                                                </div>
                                                <div>
                                                    <p className="text-[10px] font-black text-neutral-500 uppercase tracking-[0.2em]">{trade.direction} / {trade.entryType}</p>
                                                    <p className="text-lg font-bold text-white leading-none mt-0.5">@ {trade.entryPrice.toFixed(5)}</p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <div className={`text-sm font-bold ${trade.riskRewardRatio >= 1.5 ? 'text-emerald-400' : 'text-amber-400'}`}>
                                                    {trade.riskRewardRatio}:1 RR
                                                </div>
                                                <p className="text-[10px] font-bold text-neutral-500 uppercase">TP1 Ratio</p>
                                            </div>
                                        </div>

                                        <div className="bg-neutral-950/50 rounded-xl p-3 mb-4 border border-neutral-800/50">
                                            <p className="text-[11px] text-neutral-400 leading-relaxed italic">
                                                "{result.signals[i].reason}"
                                            </p>
                                        </div>

                                        <div className="grid grid-cols-3 gap-2 mb-4">
                                            <div className="bg-neutral-800/30 p-2 rounded-lg border border-neutral-700/20 text-center">
                                                <p className="text-[9px] font-bold text-rose-500 uppercase mb-0.5">SL</p>
                                                <p className="text-xs font-mono font-bold text-white">{trade.stopLoss.toFixed(5)}</p>
                                            </div>
                                            <div className="bg-neutral-800/30 p-2 rounded-lg border border-neutral-700/20 text-center">
                                                <p className="text-[9px] font-bold text-emerald-500 uppercase mb-0.5">TP1</p>
                                                <p className="text-xs font-mono font-bold text-white">{trade.takeProfit[0].toFixed(5)}</p>
                                            </div>
                                            <div className="bg-neutral-800/30 p-2 rounded-lg border border-neutral-700/20 text-center">
                                                <p className="text-[9px] font-bold text-sky-500 uppercase mb-0.5">TP2</p>
                                                <p className="text-xs font-mono font-bold text-white">{trade.takeProfit[1]?.toFixed(5) || '—'}</p>
                                            </div>
                                        </div>

                                        <button
                                            onClick={() => window.location.href = `/trade?instrument=${instrument}&direction=${trade.direction}&entry=${trade.entryPrice}&sl=${trade.stopLoss}&tp=${trade.takeProfit[0]}`}
                                            className="w-full py-2.5 bg-neutral-800 hover:bg-neutral-700 text-white rounded-xl font-bold text-xs transition-all flex items-center justify-center gap-2"
                                        >
                                            Load in Trade Terminal
                                            <ArrowRight size={14} />
                                        </button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                    {/* Pipeline Sidebar */}
                    <div className="space-y-4">
                        <div className="bg-neutral-900 border border-neutral-800 rounded-2xl overflow-hidden">
                            <div className="p-4 border-b border-neutral-800">
                                <div className="flex items-center justify-between mb-3">
                                    <h4 className="text-xs font-black text-neutral-500 uppercase tracking-[0.2em] flex items-center gap-2">
                                        <ShieldCheck size={14} className="text-blue-500" />
                                        Pipeline
                                    </h4>
                                    <div className={`text-xl font-black ${result.pipelineResult.alignmentScore >= 80 ? 'text-emerald-400' :
                                            result.pipelineResult.alignmentScore >= 50 ? 'text-amber-400' :
                                                'text-rose-400'
                                        }`}>
                                        {result.pipelineResult.alignmentScore}%
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    {result.pipelineResult.layers.map(layer => (
                                        <div key={layer.name} className={`p-3 rounded-xl border ${getStatusBg(layer.status)} relative overflow-hidden`}>
                                            <div className="flex items-center justify-between mb-1">
                                                <span className="text-[10px] font-bold text-neutral-500 uppercase">{layer.name}</span>
                                                {getStatusIcon(layer.status)}
                                            </div>
                                            <div className="flex items-end justify-between gap-2">
                                                <p className="text-[11px] text-white font-medium line-clamp-1 flex-1">{layer.details}</p>
                                                <span className="text-[10px] font-mono text-neutral-500">{layer.confidence}%</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="p-4 bg-neutral-950/50">
                                <p className="text-[11px] text-neutral-500 leading-relaxed italic text-center">
                                    "{result.pipelineResult.summary}"
                                </p>
                            </div>
                        </div>

                        {/* Pivot Levels */}
                        {result.indicators?.pivotPoints && (
                            <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-4">
                                <h4 className="text-[10px] font-black text-neutral-500 uppercase tracking-[0.2em] flex items-center gap-2 mb-3">
                                    <BarChart3 size={14} className="text-amber-500" />
                                    Pivots
                                </h4>
                                <div className="space-y-1">
                                    {[
                                        { label: 'R3', val: result.indicators.pivotPoints.r3, color: 'text-rose-400' },
                                        { label: 'R2', val: result.indicators.pivotPoints.r2, color: 'text-rose-400' },
                                        { label: 'R1', val: result.indicators.pivotPoints.r1, color: 'text-rose-500' },
                                        { label: 'PP', val: result.indicators.pivotPoints.pp, color: 'text-amber-400', bold: true },
                                        { label: 'S1', val: result.indicators.pivotPoints.s1, color: 'text-emerald-500' },
                                        { label: 'S2', val: result.indicators.pivotPoints.s2, color: 'text-emerald-400' },
                                        { label: 'S3', val: result.indicators.pivotPoints.s3, color: 'text-emerald-400' },
                                    ].map(p => (
                                        <div key={p.label} className={`flex items-center justify-between py-1.5 px-2 rounded-lg ${p.bold ? 'bg-neutral-800 border border-neutral-700/50' : ''}`}>
                                            <span className={`text-[10px] font-black ${p.color}`}>{p.label}</span>
                                            <span className={`text-[11px] font-mono text-neutral-400 ${p.bold ? 'text-white font-bold' : ''}`}>{p.val.toFixed(5)}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    )
}
