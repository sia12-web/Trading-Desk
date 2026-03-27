'use client'

import { useEffect, useRef } from 'react'

const SYNC_COOLDOWN_MS = 5 * 60 * 1000 // 5 minutes

export function AutoSync() {
    const hasSynced = useRef(false)

    useEffect(() => {
        if (hasSynced.current) return
        hasSynced.current = true

        const lastSync = localStorage.getItem('lastTradeSync')
        const now = Date.now()

        if (lastSync && now - parseInt(lastSync) < SYNC_COOLDOWN_MS) {
            return
        }

        fetch('/api/trades/sync', { method: 'POST' })
            .then(() => {
                localStorage.setItem('lastTradeSync', now.toString())
            })
            .catch(() => {})
    }, [])

    return null
}
