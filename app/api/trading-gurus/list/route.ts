import { NextRequest, NextResponse } from 'next/server'
import { getAuthUser } from '@/lib/supabase/server'
import { createClient } from '@/lib/supabase/server'

/**
 * GET /api/trading-gurus/list
 * Fetches unique gurus and their associated topics for the user.
 */
export async function GET(req: NextRequest) {
    const user = await getAuthUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const supabase = await createClient()
    const { data, error } = await supabase
        .from('trading_guru_notes')
        .select('guru_name, topic')
        .eq('user_id', user.id)

    if (error) {
        console.error('Fetch gurus list error:', error)
        return NextResponse.json({ error: 'Failed to fetch gurus' }, { status: 500 })
    }

    // Process data to group by guru
    const gurusMap: Record<string, string[]> = {}
    data?.forEach(note => {
        if (!gurusMap[note.guru_name]) {
            gurusMap[note.guru_name] = []
        }
        if (note.topic && !gurusMap[note.guru_name].includes(note.topic)) {
            gurusMap[note.guru_name].push(note.topic)
        }
    })

    const gurus = Object.entries(gurusMap).map(([name, topics]) => ({
        name,
        topics
    }))

    return NextResponse.json({ gurus })
}
