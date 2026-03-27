'use client'

import { useState, useCallback, useRef, useEffect } from 'react'
import { pollTask } from '@/lib/background-tasks/client'

interface BackgroundTaskState {
    status: 'idle' | 'running' | 'completed' | 'failed'
    progress: number
    message: string | null
    result: Record<string, unknown> | null
    error: string | null
    taskId: string | null
}

export function useBackgroundTask(taskType: string) {
    const [state, setState] = useState<BackgroundTaskState>({
        status: 'idle',
        progress: 0,
        message: null,
        result: null,
        error: null,
        taskId: null,
    })

    const cleanupRef = useRef<(() => void) | null>(null)

    // Cleanup polling on unmount
    useEffect(() => {
        return () => {
            cleanupRef.current?.()
        }
    }, [])

    const startTask = useCallback(
        async (apiUrl: string, body: Record<string, unknown> = {}) => {
            // Reset state
            setState({
                status: 'running',
                progress: 0,
                message: 'Starting...',
                result: null,
                error: null,
                taskId: null,
            })

            try {
                const res = await fetch(apiUrl, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(body),
                })

                if (!res.ok) {
                    const err = await res.json().catch(() => ({ error: 'Request failed' }))
                    setState(s => ({ ...s, status: 'failed', error: err.error || 'Request failed' }))
                    return
                }

                const { taskId } = await res.json()
                setState(s => ({ ...s, taskId }))

                // Start polling
                cleanupRef.current?.()
                cleanupRef.current = pollTask(
                    taskId,
                    (progress, message) => {
                        setState(s => ({ ...s, progress, message }))
                    },
                    (result) => {
                        setState(s => ({ ...s, status: 'completed', progress: 100, result }))
                    },
                    (error) => {
                        setState(s => ({ ...s, status: 'failed', error }))
                    }
                )
            } catch (err) {
                setState(s => ({
                    ...s,
                    status: 'failed',
                    error: err instanceof Error ? err.message : 'Unknown error',
                }))
            }
        },
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [taskType]
    )

    const reset = useCallback(() => {
        cleanupRef.current?.()
        cleanupRef.current = null
        setState({
            status: 'idle',
            progress: 0,
            message: null,
            result: null,
            error: null,
            taskId: null,
        })
    }, [])

    return { ...state, startTask, reset }
}
