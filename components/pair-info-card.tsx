'use client'

import React, { useState, useEffect } from 'react'
import { ChevronDown, ChevronUp, AlertTriangle, CheckCircle2, AlertCircle, Link as LinkIcon, Info } from 'lucide-react'

export interface PairKnowledgeResponse {
    pair: string
    displayName: string
    baseCurrency: string
    quoteCurrency: string
    nickname: string | null
    bestSessions: string[]
    worstSessions: string[]
    avgDailyRange: number
    avgRangeBySession: Record<string, number>
    drivers: string[]
    correlations: { pair: string; type: 'positive' | 'negative'; strength: 'strong' | 'moderate'; explanation: string }[]
    warnings: string[]
    tips: string[]
    intelligenceSummary: string
    currentSession: {
        status: string
        isIdeal: boolean
        isWorst: boolean
        marketPhase?: string
    }
    correlatedPositions: { tradeId: string; instrument: string; units: string; correlation: { type: string; strength: string } }[]
}

export default function PairInfoCard({ instrument }: { instrument: string }) {
    const [data, setData] = useState<PairKnowledgeResponse | null>(null)
    const [isExpanded, setIsExpanded] = useState(false)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        if (!instrument) return

        let isMounted = true
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setLoading(true)

        fetch(`/api/pairs/info?pair=${instrument}`)
            .then(res => res.json())
            .then(resData => {
                if (isMounted) {
                    setData(resData)
                    setLoading(false)
                }
            })
            .catch(err => {
                console.error('Failed to fetch pair info', err)
                if (isMounted) setLoading(false)
            })

        return () => { isMounted = false }
    }, [instrument])

    if (loading) {
        return <div className="text-xs text-neutral-500 animate-pulse bg-neutral-900 border border-neutral-800 rounded-xl p-3">Loading pair knowledge...</div>
    }

    if (!data || !data.drivers || data.drivers.length === 0) {
        return (
            <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-3 text-xs text-neutral-500 flex items-center justify-between">
                <span>{data?.displayName || instrument} — No standard knowledge base entry.</span>
            </div>
        )
    }

    const { currentSession, correlatedPositions } = data

    const isIdeal = currentSession.isIdeal
    const isWorst = currentSession.isWorst

    // Collapsed summary text construction
    let sessionStatusIcon = <Info className="w-4 h-4 text-neutral-400" />
    let sessionStatusText = `${currentSession.status} OPEN`

    if (isIdeal) {
        sessionStatusIcon = <CheckCircle2 className="w-4 h-4 text-green-500" />
        sessionStatusText += ' — IDEAL'
    } else if (isWorst) {
        sessionStatusIcon = <AlertTriangle className="w-4 h-4 text-amber-500" />
        sessionStatusText += ' — WARNING (Suboptimal)'
    }

    return (
        <div className="bg-neutral-900 border border-neutral-800 rounded-2xl overflow-hidden transition-all duration-300">
            <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="w-full flex items-center justify-between p-4 bg-neutral-800/20 hover:bg-neutral-800/40 transition-colors"
            >
                <div className="flex items-center gap-3 text-xs flex-wrap">
                    <span className="font-bold text-premium-white">
                        {data.pair} {data.nickname ? `"${data.nickname}"` : ''}
                    </span>
                    <span className="text-neutral-600">—</span>
                    <span className="flex items-center gap-1 font-medium">
                        {sessionStatusIcon}
                        <span className={isIdeal ? 'text-green-400' : isWorst ? 'text-amber-400' : 'text-neutral-400'}>
                            {sessionStatusText}
                        </span>
                    </span>
                    <span className="text-neutral-600">|</span>
                    <span className="text-neutral-400">Avg range: ~{data.avgDailyRange} pips</span>
                </div>

                <div className="flex items-center gap-2 text-xs text-neutral-500 font-bold uppercase tracking-widest shrink-0">
                    {isExpanded ? 'Less info' : 'More info'}
                    {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                </div>
            </button>

            {isExpanded && (
                <div className="p-5 border-t border-neutral-800 space-y-6 animate-in slide-in-from-top-2 duration-200">
                    {/* Header */}
                    <div>
                        <h3 className="text-lg font-bold text-white flex items-center gap-2">
                            {data.pair}
                            {data.nickname && <span className="text-neutral-500 text-sm font-normal">&quot;{data.nickname}&quot;</span>}
                        </h3>
                        <p className="text-sm text-neutral-400">{data.displayName}</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                            <div className="bg-blue-500/5 p-4 rounded-xl border border-blue-500/10">
                                <p className="text-sm font-bold text-blue-400 mb-1">Session Intelligence</p>
                                <p className="text-xs text-neutral-400 leading-relaxed italic">&quot;{data.intelligenceSummary}&quot;</p>
                            </div>

                            <div className="space-y-4">
                                <p className="text-sm font-bold text-premium-white">What drives this pair</p>
                                <ul className="text-xs space-y-2 text-neutral-400 list-disc list-inside">
                                    {data.drivers.map((driver, idx) => (
                                        <li key={idx} className="leading-relaxed">{driver}</li>
                                    ))}
                                </ul>
                            </div>
                        </div>

                        {/* Session Timing */}
                        <div className="space-y-3">
                            <h4 className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest flex items-center gap-2">
                                <AlertCircle size={12} />
                                Session Timing
                            </h4>
                            <ul className="text-xs space-y-2 text-neutral-400 border border-neutral-800 bg-neutral-900/50 p-3 rounded-xl">
                                <li className="flex items-start gap-2">
                                    <span className="text-green-500 shrink-0">✅</span>
                                    <span><strong className="text-neutral-300">Best:</strong> {data.bestSessions.join(', ')}</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-red-500 shrink-0">❌</span>
                                    <span><strong className="text-neutral-300">Avoid:</strong> {data.worstSessions.join(', ')}</span>
                                </li>
                                <li className="flex items-start gap-2 pt-2 mt-2 border-t border-neutral-800">
                                    <span className="text-blue-400 shrink-0">📍</span>
                                    <span>
                                        <strong className="text-neutral-300">Right now:</strong> {currentSession.status}
                                        {isIdeal && <span className="text-green-400 font-bold ml-1">— IDEAL</span>}
                                        {isWorst && <span className="text-amber-400 font-bold ml-1">— SUBOPTIMAL</span>}
                                    </span>
                                </li>
                            </ul>
                        </div>

                        {/* Drivers */}
                        <div className="space-y-3">
                            <h4 className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest">
                                What drives this pair
                            </h4>
                            <ul className="text-xs space-y-2 text-neutral-400 list-disc list-inside">
                                {data.drivers.map((driver, idx) => (
                                    <li key={idx} className="leading-relaxed">{driver}</li>
                                ))}
                            </ul>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 border-t border-neutral-800 pt-6">
                        {/* Warnings */}
                        <div className="space-y-3">
                            <h4 className="text-[10px] font-bold text-amber-500/80 uppercase tracking-widest">
                                Watch Out
                            </h4>
                            <ul className="text-xs space-y-2 text-amber-500/80">
                                {data.warnings.map((warning, idx) => (
                                    <li key={idx} className="flex items-start gap-2">
                                        <AlertTriangle size={14} className="shrink-0 mt-0.5" />
                                        <span className="leading-relaxed">{warning}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* Tips */}
                        <div className="space-y-3">
                            <h4 className="text-[10px] font-bold text-blue-500/80 uppercase tracking-widest">
                                Tips
                            </h4>
                            <ul className="text-xs space-y-2 text-blue-400/90 list-disc list-inside">
                                {data.tips.map((tip, idx) => (
                                    <li key={idx} className="leading-relaxed">{tip}</li>
                                ))}
                            </ul>
                        </div>
                    </div>

                    {/* Correlations */}
                    <div className="border border-neutral-800 bg-neutral-900/80 p-4 rounded-xl space-y-3">
                        <h4 className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest flex items-center gap-2">
                            <LinkIcon size={12} />
                            Correlations
                        </h4>

                        <div className="text-xs text-neutral-400 space-y-3">
                            {data.correlations.map((corr, idx) => (
                                <div key={idx} className="flex items-start gap-2">
                                    <span className="text-neutral-500 shrink-0 mt-0.5">🔗</span>
                                    <div className="flex-1">
                                        <strong className="text-neutral-300">{corr.pair}</strong>{' '}
                                        <span className={corr.type === 'positive' ? 'text-green-500 font-bold' : 'text-red-500 font-bold'}>
                                            ({corr.type === 'positive' ? '+' : '-'}) {corr.strength}
                                        </span>
                                        <p className="mt-0.5 text-neutral-500">{corr.explanation}</p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {correlatedPositions.length > 0 && (
                            <div className="mt-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-xs space-y-2">
                                <div className="font-bold text-red-400 flex items-center gap-2">
                                    <AlertTriangle size={14} />
                                    Correlated Exposure Warning
                                </div>
                                {correlatedPositions.map((pos, idx) => (
                                    <p key={idx} className="text-red-400">
                                        → You have an open <strong className="font-bold">{pos.instrument}</strong> position.
                                        This pair is {pos.correlation?.strength}ly {pos.correlation?.type}ly correlated.
                                        Your risk exposure is amplified.
                                    </p>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    )
}
