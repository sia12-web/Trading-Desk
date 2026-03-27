'use client'

import React, { useState } from 'react'
import { Edit2, XCircle, MoreVertical, ShieldAlert, CheckCircle2, Loader2, Save, X } from 'lucide-react'
import { OandaTrade } from '@/lib/types/oanda'

interface TradeActionsProps {
    trade: OandaTrade
    localTradeId?: string
    instrumentDetails?: any
}

export function TradeActions({ trade, localTradeId, instrumentDetails }: TradeActionsProps) {
    const [showModify, setShowModify] = useState(false)
    const [showClose, setShowClose] = useState(false)
    const [loading, setLoading] = useState(false)

    const [newSL, setNewSL] = useState(trade.stopLossOrder?.price || '')
    const [newTP, setNewTP] = useState(trade.takeProfitOrder?.price || '')

    const handleModify = async () => {
        setLoading(true)
        try {
            const res = await fetch('/api/trade/modify', {
                method: 'PUT',
                body: JSON.stringify({
                    oandaTradeId: trade.id,
                    stopLoss: newSL,
                    takeProfit: newTP,
                    localTradeId
                }),
                headers: { 'Content-Type': 'application/json' }
            })
            if (res.ok) {
                setShowModify(false)
                window.location.reload()
            } else {
                const data = await res.json()
                alert(data.error || 'Modification failed')
            }
        } catch (err) {
            alert('Network error')
        } finally {
            setLoading(false)
        }
    }

    const handleClose = async (units: string | 'ALL' = 'ALL') => {
        setLoading(true)
        try {
            const res = await fetch('/api/trade/close', {
                method: 'POST',
                body: JSON.stringify({
                    oandaTradeId: trade.id,
                    units,
                    localTradeId
                }),
                headers: { 'Content-Type': 'application/json' }
            })
            if (res.ok) {
                setShowClose(false)
                window.location.reload()
            } else {
                const data = await res.json()
                alert(data.error || 'Close failed')
            }
        } catch (err) {
            alert('Network error')
        } finally {
            setLoading(false)
        }
    }

    return (
        <>
            <div className="flex items-center gap-2">
                <button
                    onClick={() => setShowModify(true)}
                    className="p-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-400 hover:text-white rounded-xl transition-all"
                    title="Modify SL/TP"
                >
                    <Edit2 size={16} />
                </button>
                <button
                    onClick={() => setShowClose(true)}
                    className="p-2 bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white rounded-xl transition-all"
                    title="Close Position"
                >
                    <XCircle size={16} />
                </button>
            </div>

            {/* Modify Modal */}
            {showModify && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-neutral-950/80 backdrop-blur-sm" onClick={() => setShowModify(false)} />
                    <div className="relative bg-neutral-900 border border-neutral-800 rounded-[2.5rem] p-8 max-w-sm w-full shadow-2xl space-y-6">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-blue-500/10 text-blue-500 rounded-2xl">
                                <Edit2 size={24} />
                            </div>
                            <h3 className="text-xl font-bold">Modify Trade</h3>
                        </div>

                        <div className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest block">Stop Loss</label>
                                <input
                                    type="number"
                                    step="0.00001"
                                    value={newSL}
                                    onChange={(e) => setNewSL(e.target.value)}
                                    className="w-full bg-neutral-800 border border-neutral-700 rounded-xl px-4 py-3 text-white font-mono outline-none focus:border-blue-500"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest block">Take Profit</label>
                                <input
                                    type="number"
                                    step="0.00001"
                                    value={newTP}
                                    onChange={(e) => setNewTP(e.target.value)}
                                    className="w-full bg-neutral-800 border border-neutral-700 rounded-xl px-4 py-3 text-white font-mono outline-none focus:border-blue-500"
                                />
                            </div>
                        </div>

                        <div className="flex gap-3">
                            <button onClick={() => setShowModify(false)} className="flex-1 py-3 bg-neutral-800 text-white font-bold rounded-xl">Cancel</button>
                            <button
                                onClick={handleModify}
                                disabled={loading}
                                className="flex-1 py-3 bg-blue-600 text-white font-bold rounded-xl flex items-center justify-center gap-2"
                            >
                                {loading ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />}
                                Update
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Close Modal */}
            {showClose && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-neutral-950/80 backdrop-blur-sm" onClick={() => setShowClose(false)} />
                    <div className="relative bg-neutral-900 border border-neutral-800 rounded-[2.5rem] p-8 max-w-sm w-full shadow-2xl space-y-6">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-red-500/10 text-red-500 rounded-2xl">
                                <ShieldAlert size={24} />
                            </div>
                            <h3 className="text-xl font-bold">Close Position</h3>
                        </div>

                        <div className="p-6 bg-neutral-800/50 rounded-2xl border border-neutral-700/50 space-y-2">
                            <p className="text-sm text-neutral-400">You are about to close the entire position for {trade.instrument}.</p>
                            <p className={`text-xl font-bold ${parseFloat(trade.unrealizedPL || '0') >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                Current P&L: ${trade.unrealizedPL}
                            </p>
                        </div>

                        <div className="flex gap-3">
                            <button onClick={() => setShowClose(false)} className="flex-1 py-3 bg-neutral-800 text-white font-bold rounded-xl">Hold</button>
                            <button
                                onClick={() => handleClose('ALL')}
                                disabled={loading}
                                className="flex-1 py-3 bg-red-600 text-white font-bold rounded-xl flex items-center justify-center gap-2"
                            >
                                {loading ? <Loader2 className="animate-spin" size={16} /> : <XCircle size={16} />}
                                Close All
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    )
}
