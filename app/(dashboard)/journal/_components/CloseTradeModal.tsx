'use client'

import React, { useState, useEffect } from 'react'
import { X, Loader2, Calculator } from 'lucide-react'
import { calculatePips, estimatePnL } from '@/lib/utils/forex'
import { closeTradeAction } from '@/lib/actions/trades'

interface CloseTradeModalProps {
    trade: any
    onClose: () => void
}

export function CloseTradeModal({ trade, onClose }: CloseTradeModalProps) {
    const [loading, setLoading] = useState(false)
    const [exitPrice, setExitPrice] = useState('')
    const [pnlAmount, setPnlAmount] = useState('')
    const [pips, setPips] = useState('')
    const [fees, setFees] = useState('0')
    const [notes, setNotes] = useState('')

    // Auto-calculate values when exit price changes
    useEffect(() => {
        if (exitPrice && trade.entry_price) {
            const calculatedPips = calculatePips(
                Number(trade.entry_price),
                Number(exitPrice),
                trade.direction,
                trade.pair
            )
            const estimatedPnl = estimatePnL(calculatedPips, Number(trade.lot_size), trade.pair)

            setPips(calculatedPips.toFixed(1))
            setPnlAmount(estimatedPnl.toString())
        }
    }, [exitPrice, trade])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        try {
            await closeTradeAction(trade.id, Number(exitPrice), {
                pnl_amount: Number(pnlAmount),
                pnl_pips: Number(pips),
                fees: Number(fees),
                notes: notes
            })
            onClose()
        } catch (err) {
            console.error(err)
            setLoading(false)
        }
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <div className="bg-neutral-900 border border-neutral-800 rounded-[2.5rem] w-full max-w-lg overflow-hidden shadow-2xl">
                <div className="p-8 border-b border-neutral-800 flex items-center justify-between bg-neutral-900/50">
                    <div>
                        <h2 className="text-2xl font-bold">Close Trade</h2>
                        <p className="text-neutral-500 text-sm mt-1">{trade.pair} • {trade.direction.toUpperCase()}</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-neutral-800 rounded-xl transition-colors text-neutral-500 hover:text-white">
                        <X size={24} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-8 space-y-6">
                    <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-neutral-500 uppercase tracking-widest">Exit Price</label>
                            <input
                                type="number"
                                step="0.00001"
                                required
                                value={exitPrice}
                                onChange={(e) => setExitPrice(e.target.value)}
                                className="w-full bg-neutral-800 border border-neutral-700 rounded-2xl px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                placeholder="0.00000"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-neutral-500 uppercase tracking-widest">Fees / Comm.</label>
                            <input
                                type="number"
                                step="0.01"
                                value={fees}
                                onChange={(e) => setFees(e.target.value)}
                                className="w-full bg-neutral-800 border border-neutral-700 rounded-2xl px-4 py-3 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                placeholder="0.00"
                            />
                        </div>
                    </div>

                    <div className="p-6 bg-blue-500/5 border border-blue-500/20 rounded-3xl space-y-4">
                        <div className="flex items-center gap-2 mb-2">
                            <Calculator size={14} className="text-blue-400" />
                            <span className="text-[10px] font-bold text-blue-400 uppercase tracking-widest">P&L Calculation (Estimate)</span>
                        </div>
                        <div className="grid grid-cols-2 gap-8">
                            <div>
                                <label className="text-xs font-medium text-neutral-500 block mb-1">Profit/Loss (Amt)</label>
                                <input
                                    type="number"
                                    step="0.01"
                                    value={pnlAmount}
                                    onChange={(e) => setPnlAmount(e.target.value)}
                                    className="w-full bg-transparent border-none text-2xl font-bold p-0 focus:ring-0 outline-none text-white"
                                />
                            </div>
                            <div>
                                <label className="text-xs font-medium text-neutral-500 block mb-1">Movement (Pips)</label>
                                <input
                                    type="number"
                                    step="0.1"
                                    value={pips}
                                    onChange={(e) => setPips(e.target.value)}
                                    className="w-full bg-transparent border-none text-2xl font-bold p-0 focus:ring-0 outline-none text-white"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-bold text-neutral-500 uppercase tracking-widest">Trade Notes (Lessons)</label>
                        <textarea
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            className="w-full bg-neutral-800 border border-neutral-700 rounded-2xl p-4 h-24 focus:ring-2 focus:ring-blue-500 outline-none transition-all resize-none text-sm"
                            placeholder="What went well? What could be improved?"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-4 bg-blue-600 hover:bg-blue-500 disabled:bg-blue-800 text-white font-bold rounded-2xl transition-all shadow-lg shadow-blue-900/20 flex items-center justify-center gap-2"
                    >
                        {loading ? <Loader2 className="animate-spin" size={20} /> : 'Confirm & Close Trade'}
                    </button>
                </form>
            </div>
        </div>
    )
}
