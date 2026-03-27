import { NextRequest, NextResponse } from 'next/server'
import { getAuthUser } from '@/lib/supabase/server'
import { getSubscribedPairs, subscribeToPair } from '@/lib/data/stories'

const VALID_PAIRS = [
    'EUR/USD', 'GBP/USD', 'USD/JPY', 'EUR/GBP', 'AUD/USD',
    'USD/CAD', 'NZD/USD', 'EUR/JPY', 'USD/CHF', 'GBP/JPY',
]

export async function GET() {
    const user = await getAuthUser()
    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const pairs = await getSubscribedPairs(user.id)
    return NextResponse.json({ pairs })
}

export async function POST(req: NextRequest) {
    const user = await getAuthUser()
    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const pair = body.pair as string

    if (!pair || !VALID_PAIRS.includes(pair)) {
        return NextResponse.json({ error: 'Invalid pair' }, { status: 400 })
    }

    const subscription = await subscribeToPair(user.id, pair, body.notes)
    return NextResponse.json({ subscription })
}
