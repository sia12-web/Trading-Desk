import { createClient } from '@/lib/supabase/server'
import { getCurrentPrices } from '@/lib/oanda/client'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const instruments = searchParams.get('instruments')

    if (!instruments) {
        return NextResponse.json({ error: 'Missing instruments parameter' }, { status: 400 })
    }

    const { data: prices, error: pricesError } = await getCurrentPrices(instruments.split(','))

    if (pricesError) {
        return NextResponse.json({ error: pricesError }, { status: 500 })
    }

    return NextResponse.json({ prices })
}
