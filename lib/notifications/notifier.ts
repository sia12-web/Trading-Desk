import { createServiceClient } from '@/lib/supabase/service'
import { sendTelegramMessage } from './telegram'
import type { SupabaseClient } from '@supabase/supabase-js'

export interface NotificationPayload {
    title: string
    body: string
    url?: string
}

/**
 * Universal notification dispatcher.
 * Checks user preferences and sends via enabled channels (Telegram, etc.)
 */
export async function notifyUser(
    userId: string,
    payload: NotificationPayload,
    sbClient?: SupabaseClient
): Promise<{ telegram: boolean; status: string }> {
    const client = sbClient || createServiceClient()
    const globalChatId = process.env.TELEGRAM_CHAT_ID
    
    // 1. Fetch preferences
    const { data: prefs, error } = await client
        .from('notification_preferences')
        .select('telegram_enabled, telegram_chat_id')
        .eq('user_id', userId)
        .single()

    if ((error || !prefs) && !globalChatId) {
        console.warn(`[Notifier] No preferences or global fallback for user ${userId}`)
        return { telegram: false, status: 'no_prefs' }
    }

    const results = {
        telegram: false,
        status: 'ok'
    }

    // 2. Telegram (Priority: DB preference → Global Fallback)
    const chatId = (prefs?.telegram_enabled && prefs?.telegram_chat_id) 
        ? prefs.telegram_chat_id 
        : globalChatId

    if (chatId) {
        const telRes = await sendTelegramMessage(
            chatId,
            payload.title,
            payload.body,
            payload.url
        )
        results.telegram = telRes.success
        if (!telRes.success) {
            console.error(`[Notifier] Telegram failed for ${userId}:`, telRes.error)
        }
    }

    return results
}
