import { NextRequest, NextResponse } from 'next/server'
import { getAuthUser } from '@/lib/supabase/server'
import { createClient } from '@/lib/supabase/server'

/**
 * GET /api/trading-gurus?guru=Mark%20Douglas&topic=Psychology%20of%20Trading
 * Fetches the user's private note for a specific guru and topic.
 */
export async function GET(req: NextRequest) {
    const user = await getAuthUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const guru = req.nextUrl.searchParams.get('guru')
    const topic = req.nextUrl.searchParams.get('topic')
    
    if (!guru || !topic) {
        return NextResponse.json({ error: 'Missing guru or topic' }, { status: 400 })
    }

    const supabase = await createClient()
    const { data, error } = await supabase
        .from('trading_guru_notes')
        .select('content')
        .eq('user_id', user.id)
        .eq('guru_name', guru)
        .eq('topic', topic)
        .single()

    if (error && error.code !== 'PGRST116') { // PGRST116 = No rows found
        console.error('Fetch guru note error:', error)
        return NextResponse.json({ error: 'Failed to fetch note' }, { status: 500 })
    }

    return NextResponse.json({ content: data?.content || '' })
}

/**
 * POST /api/trading-gurus
 * Upserts the user's private note for a specific guru and topic.
 */
export async function POST(req: NextRequest) {
    const user = await getAuthUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await req.json()
    const { guru, topic, content } = body

    if (!guru || !topic) {
        return NextResponse.json({ error: 'Missing guru or topic' }, { status: 400 })
    }

    const supabase = await createClient()
    const { error } = await supabase
        .from('trading_guru_notes')
        .upsert({
            user_id: user.id,
            guru_name: guru,
            topic,
            content: content || '',
            updated_at: new Date().toISOString(),
        }, { onConflict: 'user_id, guru_name, topic' })

    if (error) {
        console.error('Upsert guru note error:', error)
        return NextResponse.json({ error: 'Failed to save note' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
}
