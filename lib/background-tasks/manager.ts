import { createClient } from '@/lib/supabase/server'
import type { SupabaseClient } from '@supabase/supabase-js'

/**
 * Server-only background task manager.
 * NEVER import this from client components.
 */

async function getDefaultClient(): Promise<SupabaseClient> {
    return createClient()
}

export async function createTask(
    userId: string,
    taskType: string,
    context?: Record<string, unknown>,
    client?: SupabaseClient
): Promise<string> {
    const supabase = client || await getDefaultClient()
    const { data, error } = await supabase
        .from('background_tasks')
        .insert({
            user_id: userId,
            task_type: taskType,
            status: 'pending',
            context: context || {},
            progress_percent: 0,
        })
        .select('id')
        .single()

    if (error) throw new Error(`Failed to create task: ${error.message}`)
    return data.id
}

export async function updateProgress(
    taskId: string,
    percent: number,
    message?: string,
    client?: SupabaseClient
): Promise<void> {
    const supabase = client || await getDefaultClient()
    const { error } = await supabase
        .from('background_tasks')
        .update({
            status: 'processing',
            progress_percent: Math.min(100, Math.max(0, percent)),
            ...(message ? { progress_message: message } : {}),
        })
        .eq('id', taskId)

    if (error) console.error(`Failed to update task progress: ${error.message}`)
}

export async function completeTask(
    taskId: string,
    result: Record<string, unknown>,
    client?: SupabaseClient
): Promise<void> {
    const supabase = client || await getDefaultClient()
    const { error } = await supabase
        .from('background_tasks')
        .update({
            status: 'completed',
            progress_percent: 100,
            result,
            completed_at: new Date().toISOString(),
        })
        .eq('id', taskId)

    if (error) console.error(`Failed to complete task: ${error.message}`)
}

export async function failTask(
    taskId: string,
    errorMessage: string,
    client?: SupabaseClient
): Promise<void> {
    const supabase = client || await getDefaultClient()
    const { error } = await supabase
        .from('background_tasks')
        .update({
            status: 'failed',
            error: errorMessage,
            completed_at: new Date().toISOString(),
        })
        .eq('id', taskId)

    if (error) console.error(`Failed to mark task as failed: ${error.message}`)
}

export async function getTask(taskId: string) {
    const supabase = await getDefaultClient()
    const { data, error } = await supabase
        .from('background_tasks')
        .select('*')
        .eq('id', taskId)
        .single()

    if (error) return null
    return data
}
