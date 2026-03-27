import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function POST(req: Request) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { mode } = await req.json()

    if (mode !== 'demo' && mode !== 'live') {
        return NextResponse.json({ error: 'Invalid mode' }, { status: 400 })
    }

    // Check if live credentials are configured
    if (mode === 'live') {
        const liveAccountId = process.env.OANDA_LIVE_ACCOUNT_ID
        const liveApiKey = process.env.OANDA_LIVE_API_KEY
        if (!liveAccountId || !liveApiKey) {
            return NextResponse.json(
                { error: 'Live account credentials not configured' },
                { status: 400 }
            )
        }
    }

    const cookieStore = await cookies()
    cookieStore.set('oanda-mode', mode, {
        httpOnly: false,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        path: '/',
        maxAge: 60 * 60 * 24 * 365 // 1 year
    })

    const accountId = mode === 'live'
        ? process.env.OANDA_LIVE_ACCOUNT_ID
        : process.env.OANDA_DEMO_ACCOUNT_ID

    return NextResponse.json({ success: true, mode, accountId })
}
