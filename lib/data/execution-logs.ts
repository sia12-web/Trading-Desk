import { createClient } from '@/lib/supabase/server'
import { getActiveAccountId } from '@/lib/oanda/account'

export interface ExecutionLogEntry {
    user_id: string
    action: 'place_order' | 'modify_trade' | 'close_trade' | 'cancel_order' | 'sync_import' | 'sync_close'
    trade_id?: string
    oanda_trade_id?: string
    request_payload: any
    response_payload?: any
    risk_validation?: any
    status: 'success' | 'failed' | 'blocked'
    error_message?: string
}

export async function logExecution(entry: ExecutionLogEntry) {
    const supabase = await createClient()
    const accountId = await getActiveAccountId()
    const { error } = await supabase
        .from('execution_log')
        .insert([{ ...entry, oanda_account_id: accountId }])

    if (error) {
        console.error('Error logging execution:', error)
    }
}
