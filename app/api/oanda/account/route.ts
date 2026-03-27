import { createClient } from '@/lib/supabase/server'
import { getAccountSummary } from '@/lib/oanda/client'
import { NextResponse } from 'next/server'

export async function GET() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data, error } = await getAccountSummary()

    if (error) {
        return NextResponse.json({ error }, { status: 500 })
    }

    return NextResponse.json(data)
}
