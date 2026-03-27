import { NextRequest, NextResponse } from 'next/server'
import { getAuthUser } from '@/lib/supabase/server'
import { unsubscribePair } from '@/lib/data/stories'

export async function DELETE(
    _req: NextRequest,
    { params }: { params: Promise<{ pair: string }> }
) {
    const user = await getAuthUser()
    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { pair: rawPair } = await params
    const pair = decodeURIComponent(rawPair).replace('_', '/')

    await unsubscribePair(user.id, pair)
    return NextResponse.json({ success: true })
}
