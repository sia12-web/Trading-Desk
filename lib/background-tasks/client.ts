import { createClient } from '@/lib/supabase/client'

interface TaskStatus {
    id: string
    status: 'pending' | 'processing' | 'completed' | 'failed'
    progress_percent: number
    progress_message: string | null
    result: Record<string, unknown> | null
    error: string | null
}

/**
 * Browser-only polling client for background tasks.
 * Polls every 2s and invokes callbacks on status changes.
 */
export function pollTask(
    taskId: string,
    onProgress: (percent: number, message: string | null) => void,
    onComplete: (result: Record<string, unknown>) => void,
    onError: (error: string) => void
): () => void {
    const supabase = createClient()
    let stopped = false

    const poll = async () => {
        if (stopped) return

        const { data, error } = await supabase
            .from('background_tasks')
            .select('id, status, progress_percent, progress_message, result, error')
            .eq('id', taskId)
            .single()

        if (error || !data) {
            onError(error?.message || 'Task not found')
            return
        }

        const task = data as TaskStatus

        if (task.status === 'completed' && task.result) {
            onComplete(task.result)
            return
        }

        if (task.status === 'failed') {
            onError(task.error || 'Task failed')
            return
        }

        onProgress(task.progress_percent, task.progress_message)

        if (!stopped) {
            setTimeout(poll, 2000)
        }
    }

    poll()

    return () => { stopped = true }
}
