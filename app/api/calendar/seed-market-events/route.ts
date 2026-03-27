import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { isDST } from '@/lib/utils/market-sessions'
import { createCalendarEvent } from '@/lib/data/calendar'

export async function POST() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    try {
        let created = 0
        const now = new Date()

        // Generate events for next 7 weekdays
        let day = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()))
        let weekdaysAdded = 0

        while (weekdaysAdded < 7) {
            day = new Date(day.getTime() + 24 * 60 * 60 * 1000)
            const dayOfWeek = day.getUTCDay()
            if (dayOfWeek === 0 || dayOfWeek === 6) continue // Skip weekends

            weekdaysAdded++

            const euDst = isDST(day, 'eu')
            const usDst = isDST(day, 'us')

            const sessions = [
                {
                    name: 'Tokyo Session',
                    openH: 0, closeH: 9,
                    pairs: ['USD/JPY', 'AUD/USD', 'NZD/USD']
                },
                {
                    name: 'London Session',
                    openH: euDst ? 6 : 7, closeH: euDst ? 15 : 16,
                    pairs: ['EUR/USD', 'GBP/USD', 'EUR/GBP']
                },
                {
                    name: 'New York Session',
                    openH: usDst ? 12 : 13, closeH: usDst ? 21 : 22,
                    pairs: ['EUR/USD', 'GBP/USD', 'USD/CAD']
                }
            ]

            // Check for existing market events on this day
            const dayStart = new Date(Date.UTC(day.getUTCFullYear(), day.getUTCMonth(), day.getUTCDate(), 0, 0, 0))
            const dayEnd = new Date(Date.UTC(day.getUTCFullYear(), day.getUTCMonth(), day.getUTCDate(), 23, 59, 59))

            const { data: existing } = await supabase
                .from('calendar_events')
                .select('title')
                .eq('user_id', user.id)
                .eq('event_type', 'market_event')
                .gte('start_time', dayStart.toISOString())
                .lte('start_time', dayEnd.toISOString())

            const existingTitles = new Set((existing || []).map(e => e.title))

            for (const session of sessions) {
                if (existingTitles.has(session.name)) continue

                const startTime = new Date(Date.UTC(
                    day.getUTCFullYear(), day.getUTCMonth(), day.getUTCDate(),
                    session.openH, 0, 0
                ))
                const endTime = new Date(Date.UTC(
                    day.getUTCFullYear(), day.getUTCMonth(), day.getUTCDate(),
                    session.closeH, 0, 0
                ))

                await createCalendarEvent(user.id, {
                    title: session.name,
                    description: `${session.name} open hours (UTC)`,
                    event_type: 'market_event',
                    start_time: startTime.toISOString(),
                    end_time: endTime.toISOString(),
                    all_day: false,
                    is_recurring: false,
                    market_session: session.name.replace(' Session', ''),
                    currency_pairs: session.pairs,
                    notify_before_minutes: 15,
                    priority: 'normal',
                    status: 'pending'
                })
                created++
            }
        }

        return NextResponse.json({ created })
    } catch (error: any) {
        console.error('Error seeding market events:', error)
        return NextResponse.json({ error: 'Failed to seed events' }, { status: 500 })
    }
}
