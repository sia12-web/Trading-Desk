import { createClient } from '@/lib/supabase/server'
import { getAccountSummary } from '@/lib/oanda/client'
import { NextResponse } from 'next/server'

export async function GET() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check configuration status
    const config = {
        demo: {
            configured: !!(process.env.OANDA_DEMO_ACCOUNT_ID && process.env.OANDA_DEMO_API_KEY),
            accountId: process.env.OANDA_DEMO_ACCOUNT_ID
        },
        live: {
            configured: !!(process.env.OANDA_LIVE_ACCOUNT_ID && process.env.OANDA_LIVE_API_KEY),
            accountId: process.env.OANDA_LIVE_ACCOUNT_ID
        }
    }

    const { data, error } = await getAccountSummary()

    if (error) {
        return NextResponse.json({ connected: false, error, config }, { status: 200 })
    }

    return NextResponse.json({ 
        connected: true, 
        accountId: data?.id,
        config 
    })
}
