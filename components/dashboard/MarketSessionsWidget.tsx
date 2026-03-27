'use client'

import React, { useState, useEffect } from 'react'
import { Clock, Info, ShieldCheck } from 'lucide-react'
import { getMarketSessions, SessionSnapshot } from '@/lib/utils/market-sessions'
import { SESSION_RELATIONSHIPS } from '@/lib/utils/session-relationships'

export function MarketSessionsWidget() {
    const [snapshot, setSnapshot] = useState<SessionSnapshot | null>(null)
    const [tipIndex, setTipIndex] = useState(0)

    useEffect(() => {
        setSnapshot(getMarketSessions())

        const timer = setInterval(() => {
            setSnapshot(getMarketSessions())
        }, 60000)

        const tipTimer = setInterval(() => {
            setTipIndex(prev => (prev + 1) % SESSION_RELATIONSHIPS.length)
        }, 60000)

        return () => {
            clearInterval(timer)
            clearInterval(tipTimer)
        }
    }, [])

    if (!snapshot) return <div className="animate-pulse bg-neutral-900 border border-neutral-800 rounded-3xl p-6 h-[250px]" />

    const tip = SESSION_RELATIONSHIPS[tipIndex]

    return (
        <div className="bg-neutral-900 p-5 rounded-3xl relative overflow-hidden group h-full flex flex-col">
            {/* Header - Compact */}
            <div className="flex items-center justify-between mb-5 relative z-10">
                <h3 className="text-xs font-black text-neutral-500 uppercase tracking-[0.2em] flex items-center gap-2">
                    <Clock className="text-blue-500" size={14} />
                    Active Pipeline
                </h3>
                <div className="text-[10px] font-bold text-neutral-500 bg-neutral-800/50 px-3 py-1 rounded-lg border border-neutral-700/30">
                    {snapshot.currentTime.getUTCHours().toString().padStart(2, '0')}:{snapshot.currentTime.getUTCMinutes().toString().padStart(2, '0')} UTC
                </div>
            </div>

            {/* Session Timeline Bars - Slimmer */}
            <div className="space-y-3 relative z-10 flex-1">
                {snapshot.sessions.map((session, i) => {
                    const isOpen = session.status === 'open' || session.status === 'closing_soon'
                    const percentage = Math.min(Math.max((session.progressMs / session.durationMs) * 100, 0), 100)

                    return (
                        <div key={i} className="flex items-center gap-3">
                            <span className={`font-bold text-[10px] w-14 shrink-0 uppercase tracking-wider ${isOpen ? 'text-white' : 'text-neutral-600'}`}>{session.name}</span>

                            <div className="flex-1 h-1.5 bg-neutral-800 rounded-full overflow-hidden relative">
                                {isOpen && (
                                    <div
                                        className="absolute top-0 left-0 h-full bg-blue-500 rounded-full transition-all duration-1000 shadow-[0_0_10px_rgba(59,130,246,0.5)]"
                                        style={{ width: `${percentage}%` }}
                                    />
                                )}
                            </div>

                            <div className="w-24 text-right shrink-0">
                                {isOpen ? (
                                    <span className="text-[9px] font-black text-emerald-400 uppercase tracking-tighter">Live <span className="text-neutral-600 lowercase ml-1">-{session.closesIn}</span></span>
                                ) : (
                                    <span className="text-[9px] font-black text-neutral-700 uppercase tracking-tighter">Inactive <span className="lowercase ml-1">{session.opensIn !== 'Weekend' ? `+${session.opensIn}` : ''}</span></span>
                                )}
                            </div>
                        </div>
                    )
                })}
            </div>

            {/* Status / Tip Area - Compact */}
            <div className="mt-5 space-y-2 relative z-10">
                {snapshot.currentOverlap ? (
                    <div className="flex items-center gap-2 bg-emerald-500/5 border border-emerald-500/10 px-3 py-2 rounded-xl">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shrink-0" />
                        <p className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">{snapshot.currentOverlap} OVERLAP — PEAK VOLUME</p>
                    </div>
                ) : (
                    <div className="flex items-center gap-2 bg-neutral-800/30 border border-neutral-700/20 px-3 py-2 rounded-xl">
                        <div className={`w-1.5 h-1.5 rounded-full ${snapshot.marketPhase === 'weekend' ? 'bg-neutral-600' : 'bg-blue-500'} shrink-0`} />
                        <p className="text-[10px] font-black text-neutral-500 uppercase tracking-widest">{snapshot.marketPhase.replace('_', ' ')} phase active</p>
                    </div>
                )}

                <div className="bg-neutral-950/50 border border-neutral-800/50 rounded-xl p-3 flex gap-3 items-start group/tip">
                    <ShieldCheck size={12} className="text-neutral-600 mt-0.5 shrink-0 group-hover/tip:text-blue-500 transition-colors" />
                    <p className="text-[11px] text-neutral-500 leading-tight">
                        <span className="font-bold text-neutral-400 mr-1">{tip.title}:</span>
                        {tip.description.split('.')[0]}.
                    </p>
                </div>
            </div>
        </div>
    )
}
