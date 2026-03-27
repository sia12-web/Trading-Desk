import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { getCalendarEvents, createCalendarEvent, deleteAllCalendarEvents } from '@/lib/data/calendar'

export async function GET(req: Request) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const startDate = searchParams.get('start') || new Date().toISOString()
    const endDate = searchParams.get('end') || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()

    const events = await getCalendarEvents(
        user.id,
        new Date(startDate),
        new Date(endDate)
    )

    return NextResponse.json({ events })
}

export async function POST(req: Request) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    try {
        const body = await req.json()

        const event = await createCalendarEvent(user.id, {
            oanda_account_id: body.oanda_account_id,
            title: body.title,
            description: body.description,
            event_type: body.event_type || 'other',
            start_time: body.start_time,
            end_time: body.end_time,
            all_day: body.all_day || false,
            is_recurring: body.is_recurring || false,
            recurrence_rule: body.recurrence_rule,
            market_session: body.market_session,
            currency_pairs: body.currency_pairs,
            notify_before_minutes: body.notify_before_minutes || 15,
            priority: body.priority || 'normal',
            tags: body.tags,
            related_task_id: body.related_task_id,
            related_trade_id: body.related_trade_id
        })

        if (!event) {
            return NextResponse.json({ error: 'Failed to create event' }, { status: 500 })
        }

        return NextResponse.json({ event })
    } catch (error: any) {
        console.error('Error creating calendar event:', error)
        return NextResponse.json({ error: 'Failed to fetch events' }, { status: 500 })
    }
}

export async function DELETE(req: Request) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    try {
        const deleted = await deleteAllCalendarEvents(user.id)
        return NextResponse.json({ deleted })
    } catch (error: any) {
        console.error('Error clearing calendar:', error)
        return NextResponse.json({ error: 'Failed to clear calendar' }, { status: 500 })
    }
}
