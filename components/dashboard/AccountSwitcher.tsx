'use client'

import { useState, useEffect } from 'react'
import { Monitor, Wallet, Loader2 } from 'lucide-react'

type AccountMode = 'demo' | 'live'

export function AccountSwitcher() {
    const [mode, setMode] = useState<AccountMode>('demo')
    const [switching, setSwitching] = useState(false)

    useEffect(() => {
        // Read initial mode from cookie
        const cookies = document.cookie.split(';').reduce((acc, c) => {
            const [key, val] = c.trim().split('=')
            acc[key] = val
            return acc
        }, {} as Record<string, string>)
        setMode((cookies['oanda-mode'] as AccountMode) || 'demo')
    }, [])

    const handleSwitch = async () => {
        const newMode = mode === 'demo' ? 'live' : 'demo'
        setSwitching(true)

        try {
            const res = await fetch('/api/oanda/switch-mode', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ mode: newMode })
            })

            const data = await res.json()

            if (!res.ok) {
                alert(data.error || 'Failed to switch account')
                return
            }

            setMode(newMode)
            // Full reload to refresh all server-rendered data
            window.location.reload()
        } catch {
            alert('Failed to switch account')
        } finally {
            setSwitching(false)
        }
    }

    const isDemo = mode === 'demo'

    return (
        <button
            onClick={handleSwitch}
            disabled={switching}
            className={`flex items-center gap-2 px-3 py-1 rounded-full border text-[10px] font-bold uppercase tracking-widest transition-all disabled:opacity-50 ${
                isDemo
                    ? 'bg-amber-500/10 border-amber-500/20 text-amber-500 hover:bg-amber-500/20'
                    : 'bg-green-500/10 border-green-500/20 text-green-500 hover:bg-green-500/20'
            }`}
            title={`Switch to ${isDemo ? 'Live' : 'Demo'} account`}
        >
            {switching ? (
                <Loader2 size={12} className="animate-spin" />
            ) : isDemo ? (
                <Monitor size={12} />
            ) : (
                <Wallet size={12} />
            )}
            {isDemo ? 'Demo' : 'Live'}
        </button>
    )
}
