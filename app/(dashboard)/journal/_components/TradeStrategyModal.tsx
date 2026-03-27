'use client'

import React, { useState } from 'react'
import { X, Save, Loader2, Award, Target, ShieldAlert, Trophy } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { updateTrade } from '@/lib/data/trades'

interface TradeStrategyModalProps {
    trade: any
    onClose: () => void
}

export function TradeStrategyModal({ trade, onClose }: TradeStrategyModalProps) {
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [name, setName] = useState(trade.name || '')
    const [explanation, setExplanation] = useState(trade.strategy_explanation || '')

    const reasoning = trade.trade_reasoning || {}
    const [entryReasoning, setEntryReasoning] = useState(reasoning.entry || '')
    const [slReasoning, setSlReasoning] = useState(reasoning.stop_loss || '')
    const [tpReasoning, setTpReasoning] = useState(reasoning.take_profit || '')

    const handleSave = async () => {
        setLoading(true)
        setError(null)
        try {
            await updateTrade(trade.id, {
                name: name || null,
                strategy_explanation: explanation || null,
                trade_reasoning: {
                    entry: entryReasoning || undefined,
                    stop_loss: slReasoning || undefined,
                    take_profit: tpReasoning || undefined,
                },
            })
            router.refresh()
            onClose()
        } catch (err: any) {
            setError(err.message || 'Failed to update strategy')
            setLoading(false)
        }
    }

    const entryPrice = trade.entry_price ? Number(trade.entry_price).toFixed(5) : null
    const slPrice = trade.stop_loss ? Number(trade.stop_loss).toFixed(5) : null
    const tpPrice = trade.take_profit ? Number(trade.take_profit).toFixed(5) : null

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-neutral-900 border border-neutral-800 w-full max-w-2xl rounded-[2.5rem] shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">
                <div className="p-8 border-b border-neutral-800 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-400">
                            <Award size={24} />
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold">Strategy & Reasoning</h2>
                            <p className="text-sm text-neutral-500">
                                {trade.pair} — Why did you choose these levels?
                            </p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-neutral-800 rounded-xl transition-colors">
                        <X size={20} />
                    </button>
                </div>

                <div className="p-8 space-y-6 overflow-y-auto">
                    {/* Trade Name */}
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-neutral-500 uppercase tracking-widest block">Trade Name</label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="e.g. Bullish Breakout on H4"
                            className="w-full bg-neutral-800 border border-neutral-700 rounded-2xl p-4 text-lg font-bold placeholder:text-neutral-700 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                        />
                    </div>

                    {/* Entry Reasoning */}
                    <div className="space-y-2">
                        <div className="flex items-center gap-2">
                            <Target size={14} className="text-blue-400" />
                            <label className="text-xs font-bold text-blue-400 uppercase tracking-widest">
                                Entry @ {entryPrice || '—'}
                            </label>
                        </div>
                        <textarea
                            value={entryReasoning}
                            onChange={(e) => setEntryReasoning(e.target.value)}
                            placeholder="Why this entry? What level, pattern, or signal triggered your entry at this price?"
                            className="w-full h-24 bg-neutral-800 border border-neutral-700 rounded-xl p-4 text-sm text-neutral-300 leading-relaxed placeholder:text-neutral-700 focus:ring-2 focus:ring-blue-500 outline-none resize-none transition-all"
                        />
                    </div>

                    {/* Stop Loss Reasoning */}
                    <div className="space-y-2">
                        <div className="flex items-center gap-2">
                            <ShieldAlert size={14} className="text-red-400" />
                            <label className="text-xs font-bold text-red-400 uppercase tracking-widest">
                                Stop Loss @ {slPrice || '—'}
                            </label>
                        </div>
                        <textarea
                            value={slReasoning}
                            onChange={(e) => setSlReasoning(e.target.value)}
                            placeholder="Why here? What invalidates your trade idea? What structure, level, or swing point protects you?"
                            className="w-full h-24 bg-neutral-800 border border-neutral-700 rounded-xl p-4 text-sm text-neutral-300 leading-relaxed placeholder:text-neutral-700 focus:ring-2 focus:ring-red-500/50 outline-none resize-none transition-all"
                        />
                    </div>

                    {/* Take Profit Reasoning */}
                    <div className="space-y-2">
                        <div className="flex items-center gap-2">
                            <Trophy size={14} className="text-green-400" />
                            <label className="text-xs font-bold text-green-400 uppercase tracking-widest">
                                Take Profit @ {tpPrice || '—'}
                            </label>
                        </div>
                        <textarea
                            value={tpReasoning}
                            onChange={(e) => setTpReasoning(e.target.value)}
                            placeholder="Why this target? What resistance, Fibonacci extension, or structure defines your exit?"
                            className="w-full h-24 bg-neutral-800 border border-neutral-700 rounded-xl p-4 text-sm text-neutral-300 leading-relaxed placeholder:text-neutral-700 focus:ring-2 focus:ring-green-500/50 outline-none resize-none transition-all"
                        />
                    </div>

                    {/* General Strategy */}
                    <div className="space-y-2">
                        <label className="text-xs font-bold text-neutral-500 uppercase tracking-widest block">Overall Strategy</label>
                        <textarea
                            value={explanation}
                            onChange={(e) => setExplanation(e.target.value)}
                            placeholder="Big picture: what's the thesis? Which timeframes align? What confluence do you see?"
                            className="w-full h-32 bg-neutral-800 border border-neutral-700 rounded-xl p-4 text-sm text-neutral-300 leading-relaxed placeholder:text-neutral-700 focus:ring-2 focus:ring-blue-500 outline-none resize-none transition-all"
                        />
                    </div>
                </div>

                {error && (
                    <div className="px-8 pb-4">
                        <div className="p-4 bg-red-900/20 border border-red-900/50 rounded-2xl text-red-400 text-sm">
                            {error}
                        </div>
                    </div>
                )}

                <div className="p-8 border-t border-neutral-800 flex justify-end gap-4">
                    <button
                        onClick={onClose}
                        className="px-6 py-3.5 text-sm font-bold text-neutral-400 hover:text-white transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={loading}
                        className="flex items-center gap-2 px-8 py-3.5 bg-blue-600 hover:bg-blue-500 disabled:bg-blue-800 text-white font-bold rounded-2xl transition-all shadow-lg shadow-blue-900/20 active:scale-95"
                    >
                        {loading ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
                        Save Strategy
                    </button>
                </div>
            </div>
        </div>
    )
}
