import { createClient } from '@/lib/supabase/server'
import { validateTrade } from '@/lib/risk/validator'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    try {
        const body = await req.json()
        const result = await validateTrade(body, user.id)
        return NextResponse.json(result)
    } catch (error: any) {
        console.error('Risk Validation Error:', error)
        return NextResponse.json({ error: 'Validation failed' }, { status: 500 })
    }
}
