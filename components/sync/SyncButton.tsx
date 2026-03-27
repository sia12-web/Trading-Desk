'use client'

import { useState } from 'react'
import { RefreshCw, CheckCircle2, AlertTriangle, Loader2 } from 'lucide-react'

interface SyncResult {
    success: boolean
    openImported: number
    closedImported: number
    closedUpdated: number
    skipped: number
    errors: { tradeId: string; error: string }[]
}

export function SyncButton() {
    const [syncing, setSyncing] = useState(false)
    const [result, setResult] = useState<SyncResult | null>(null)

    const handleSync = async () => {
        setSyncing(true)
        setResult(null)
        try {
            const res = await fetch('/api/trades/sync', { method: 'POST' })
            const data = await res.json()
            setResult(data)
            if (data.success) {
                const totalImported = data.openImported + data.closedImported + data.closedUpdated
                if (totalImported > 0) {
                    setTimeout(() => window.location.reload(), 1500)
                }
            }
        } catch {
            setResult({
                success: false,
                openImported: 0,
                closedImported: 0,
                closedUpdated: 0,
                skipped: 0,
                errors: [{ tradeId: '', error: 'Network error' }]
            })
        } finally {
            setSyncing(false)
        }
    }

    const totalImported = result ? result.openImported + result.closedImported + result.closedUpdated : 0

    return (
        <div className="flex items-center gap-3">
            <button
                onClick={handleSync}
                disabled={syncing}
                className="flex items-center gap-2 px-4 py-2 bg-purple-600/10 border border-purple-500/20 hover:bg-purple-600/20 text-purple-400 text-xs font-bold uppercase tracking-widest rounded-xl transition-all disabled:opacity-50"
            >
                {syncing ? (
                    <Loader2 size={14} className="animate-spin" />
                ) : (
                    <RefreshCw size={14} />
                )}
                {syncing ? 'Syncing...' : 'Sync OANDA'}
            </button>
            {result && (
                <div className="flex items-center gap-2 text-xs">
                    {result.errors.length === 0 ? (
                        <CheckCircle2 size={14} className="text-green-400" />
                    ) : (
                        <AlertTriangle size={14} className="text-amber-400" />
                    )}
                    <span className="text-neutral-400">
                        {totalImported > 0 ? `${totalImported} synced` : 'All up to date'}
                        {result.errors.length > 0 && `, ${result.errors.length} errors`}
                    </span>
                </div>
            )}
        </div>
    )
}
