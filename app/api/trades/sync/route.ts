import { createClient } from '@/lib/supabase/server'
import { syncOandaTrades } from '@/lib/sync/oanda-sync'
import { NextResponse } from 'next/server'

export async function POST() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    try {
        const result = await syncOandaTrades(user.id)
        return NextResponse.json({ success: true, ...result })
    } catch (error: any) {
        console.error('Trade sync failed:', error)
        return NextResponse.json(
            { error: 'Sync failed' },
            { status: 500 }
        )
    }
}
