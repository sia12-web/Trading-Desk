'use client'

import React, { useState } from 'react'
import { CheckCircle2, Award, Brain, Zap, Loader2, AlertCircle, Trash2, Edit } from 'lucide-react'
import { CloseTradeModal } from '@/app/(dashboard)/journal/_components/CloseTradeModal'
import { TradeStrategyModal } from '@/app/(dashboard)/journal/_components/TradeStrategyModal'
import { deleteTradeAction } from '@/lib/actions/trades'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

interface TradeDetailActionsProps {
    trade: any
}

export function TradeDetailActions({ trade }: TradeDetailActionsProps) {
    const router = useRouter()
    const [showCloseModal, setShowCloseModal] = useState(false)
    const [showStrategyModal, setShowStrategyModal] = useState(false)
    const [showExecuteConfirm, setShowExecuteConfirm] = useState(false)
    const [isExecuting, setIsExecuting] = useState(false)
    const [executeError, setExecuteError] = useState<string | null>(null)
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
    const [isDeleting, setIsDeleting] = useState(false)

    const isClosed = trade.status === 'closed' || trade.status === 'cancelled'
    const isPlanned = trade.status === 'planned' && !trade.oanda_trade_id

    const handleExecutePlanned = async () => {
        setIsExecuting(true)
        setExecuteError(null)
        try {
            const res = await fetch('/api/trade/execute-planned', {
                method: 'POST',
                body: JSON.stringify({ tradeId: trade.id }),
                headers: { 'Content-Type': 'application/json' }
            })

            if (!res.ok) {
                const errorData = await res.json().catch(() => ({ error: 'Execution failed' }))
                setExecuteError(errorData.error || errorData.checks?.[0]?.message || 'Execution failed')
                return
            }

            setShowExecuteConfirm(false)
            router.refresh()
        } catch (err) {
            setExecuteError('Network error during execution')
        } finally {
            setIsExecuting(false)
        }
    }

    const handleDelete = async () => {
        setIsDeleting(true)
        try {
            await deleteTradeAction(trade.id)
        } catch {
            setIsDeleting(false)
        }
    }

    const pairParam = trade.pair?.replace('/', '_')?.replace('_', '/')

    return (
        <>
            <div className="flex flex-wrap items-center gap-3">
                <button
                    onClick={() => setShowStrategyModal(true)}
                    className="flex items-center gap-2 px-6 py-3.5 bg-neutral-900 border border-neutral-800 hover:bg-neutral-800 text-neutral-300 font-bold rounded-2xl transition-all shadow-lg active:scale-95"
                >
                    <Award size={18} />
                    Strategy
                </button>

                {isPlanned && (
                    <>
                        <Link
                            href={`/journal/${trade.id}/edit`}
                            className="flex items-center gap-2 px-6 py-3.5 bg-neutral-900 border border-neutral-800 hover:bg-neutral-800 text-neutral-300 font-bold rounded-2xl transition-all shadow-lg active:scale-95"
                        >
                            <Edit size={18} />
                            Edit Plan
                        </Link>
                        <button
                            onClick={() => setShowExecuteConfirm(true)}
                            className="flex items-center gap-2 px-6 py-3.5 bg-green-600 hover:bg-green-500 text-white font-bold rounded-2xl transition-all shadow-lg shadow-green-900/20 active:scale-95"
                        >
                            <Zap size={18} />
                            Execute Now
                        </button>
                    </>
                )}

                {!isClosed && !isPlanned && (
                    <button
                        onClick={() => setShowCloseModal(true)}
                        className="flex items-center gap-2 px-6 py-3.5 bg-green-600 hover:bg-green-500 text-white font-bold rounded-2xl transition-all shadow-lg shadow-green-900/20 active:scale-95"
                    >
                        <CheckCircle2 size={18} />
                        Close Trade
                    </button>
                )}

                <button
                    onClick={() => setShowDeleteConfirm(true)}
                    className="flex items-center gap-2 px-4 py-3.5 bg-red-500/10 border border-red-500/20 hover:bg-red-500/20 text-red-400 font-bold rounded-2xl transition-all active:scale-95"
                    title="Delete trade"
                >
                    <Trash2 size={18} />
                </button>
            </div>

            {/* Execute Planned Trade Confirmation Modal */}
            {showExecuteConfirm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-neutral-950/90 backdrop-blur-sm" onClick={() => !isExecuting && setShowExecuteConfirm(false)} />
                    <div className="relative bg-neutral-900 border border-neutral-800 rounded-[3rem] p-10 max-w-lg w-full shadow-2xl space-y-6">
                        <div className="flex items-center gap-4">
                            <div className="w-14 h-14 rounded-2xl bg-green-500/20 border border-green-500/30 flex items-center justify-center">
                                <Zap className="text-green-400" size={28} />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-white">Execute Planned Trade</h3>
                                <p className="text-sm text-neutral-400">This will send a market order to OANDA</p>
                            </div>
                        </div>

                        <div className="bg-neutral-800 rounded-2xl p-5 space-y-2">
                            <div className="flex justify-between text-sm"><span className="text-neutral-400">Pair</span><span className="font-bold">{trade.pair}</span></div>
                            <div className="flex justify-between text-sm"><span className="text-neutral-400">Direction</span><span className={`font-bold ${trade.direction === 'long' ? 'text-green-400' : 'text-red-400'}`}>{trade.direction?.toUpperCase()}</span></div>
                            <div className="flex justify-between text-sm"><span className="text-neutral-400">Lot Size</span><span className="font-bold">{trade.lot_size}</span></div>
                            <div className="border-t border-neutral-700 my-2" />
                            <div className="flex justify-between text-sm"><span className="text-neutral-400">Planned Entry</span><span className="font-bold font-mono">{trade.entry_price}</span></div>
                            <div className="flex justify-between text-sm"><span className="text-neutral-400">Stop Loss</span><span className="font-bold font-mono text-red-400">{trade.stop_loss}</span></div>
                            <div className="flex justify-between text-sm"><span className="text-neutral-400">Take Profit</span><span className="font-bold font-mono text-green-400">{trade.take_profit || '—'}</span></div>
                        </div>

                        <p className="text-xs text-amber-400 bg-amber-500/10 border border-amber-500/20 rounded-xl p-3">
                            The actual fill price may differ from the planned entry. Risk validation will run before execution.
                        </p>

                        {executeError && (
                            <div className="flex items-start gap-3 p-4 bg-red-500/10 border border-red-500/20 rounded-xl">
                                <AlertCircle className="text-red-400 mt-0.5 flex-shrink-0" size={16} />
                                <p className="text-sm text-red-300">{executeError}</p>
                            </div>
                        )}

                        <div className="flex gap-3">
                            <button
                                onClick={() => setShowExecuteConfirm(false)}
                                disabled={isExecuting}
                                className="flex-1 py-4 bg-neutral-800 text-white font-bold rounded-2xl transition-all disabled:opacity-50"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleExecutePlanned}
                                disabled={isExecuting}
                                className="flex-1 py-4 bg-green-600 hover:bg-green-500 text-white font-bold rounded-2xl transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                            >
                                {isExecuting ? <Loader2 size={16} className="animate-spin" /> : <Zap size={16} />}
                                {isExecuting ? 'Executing...' : 'Confirm Execute'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {showCloseModal && (
                <CloseTradeModal trade={trade} onClose={() => setShowCloseModal(false)} />
            )}

            {showStrategyModal && (
                <TradeStrategyModal trade={trade} onClose={() => setShowStrategyModal(false)} />
            )}

            {/* Delete Confirmation Modal */}
            {showDeleteConfirm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-neutral-950/90 backdrop-blur-sm" onClick={() => !isDeleting && setShowDeleteConfirm(false)} />
                    <div className="relative bg-neutral-900 border border-neutral-800 rounded-[3rem] p-10 max-w-md w-full shadow-2xl space-y-6">
                        <div className="flex items-center gap-4">
                            <div className="w-14 h-14 rounded-2xl bg-red-500/20 border border-red-500/30 flex items-center justify-center">
                                <Trash2 className="text-red-400" size={28} />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-white">Delete Trade</h3>
                                <p className="text-sm text-neutral-400">This action cannot be undone</p>
                            </div>
                        </div>

                        <div className="bg-neutral-800 rounded-2xl p-5 space-y-2">
                            <div className="flex justify-between text-sm">
                                <span className="text-neutral-400">Trade</span>
                                <span className="font-bold">{trade.name || trade.pair}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-neutral-400">Direction</span>
                                <span className={`font-bold ${trade.direction === 'long' ? 'text-green-400' : 'text-red-400'}`}>
                                    {trade.direction?.toUpperCase()}
                                </span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-neutral-400">Status</span>
                                <span className="font-bold capitalize">{trade.status}</span>
                            </div>
                        </div>

                        <p className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl p-3">
                            This will permanently delete the trade, all screenshots, execution logs, and coaching sessions associated with it.
                        </p>

                        <div className="flex gap-3">
                            <button
                                onClick={() => setShowDeleteConfirm(false)}
                                disabled={isDeleting}
                                className="flex-1 py-4 bg-neutral-800 text-white font-bold rounded-2xl transition-all disabled:opacity-50"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleDelete}
                                disabled={isDeleting}
                                className="flex-1 py-4 bg-red-600 hover:bg-red-500 text-white font-bold rounded-2xl transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                            >
                                {isDeleting ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
                                {isDeleting ? 'Deleting...' : 'Delete Forever'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    )
}
