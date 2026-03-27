import { createClient } from '@/lib/supabase/server'

export interface CalendarEvent {
    id: string
    user_id: string
    oanda_account_id: string | null
    title: string
    description: string | null
    event_type: 'trading' | 'study' | 'homework' | 'research' | 'review' | 'market_event' | 'break' | 'other'
    start_time: string
    end_time: string | null
    all_day: boolean
    is_recurring: boolean
    recurrence_rule: any | null
    market_session: string | null
    currency_pairs: string[] | null
    notify_before_minutes: number
    notification_sent: boolean
    last_notified_at: string | null
    status: 'pending' | 'completed' | 'skipped' | 'cancelled'
    completed_at: string | null
    completion_note: string | null
    priority: 'high' | 'normal' | 'low'
    tags: string[] | null
    related_task_id: string | null
    related_trade_id: string | null
    created_at: string
    updated_at: string
}

export interface RecurrenceRule {
    frequency: 'daily' | 'weekday' | 'weekly' | 'monthly'
    until?: string
}

function expandRecurringEvents(
    event: CalendarEvent,
    rangeStart: Date,
    rangeEnd: Date
): CalendarEvent[] {
    const rule = event.recurrence_rule as RecurrenceRule | null
    if (!rule || !rule.frequency) return [event]

    const results: CalendarEvent[] = []
    const eventStart = new Date(event.start_time)
    const eventEnd = event.end_time ? new Date(event.end_time) : null
    const durationMs = eventEnd ? eventEnd.getTime() - eventStart.getTime() : 0

    const until = rule.until ? new Date(rule.until) : rangeEnd
    const effectiveEnd = until < rangeEnd ? until : rangeEnd

    let current = new Date(eventStart)

    while (current <= effectiveEnd) {
        if (current >= rangeStart && current <= rangeEnd) {
            const dayOfWeek = current.getUTCDay()
            const shouldInclude =
                rule.frequency === 'weekday' ? dayOfWeek >= 1 && dayOfWeek <= 5 : true

            if (shouldInclude) {
                const dateISO = current.toISOString().split('T')[0]
                const isOriginal = current.getTime() === eventStart.getTime()
                const virtualEnd = eventEnd ? new Date(current.getTime() + durationMs) : null

                results.push({
                    ...event,
                    id: isOriginal ? event.id : `${event.id}__${dateISO}`,
                    start_time: current.toISOString(),
                    end_time: virtualEnd?.toISOString() || null,
                })
            }
        }

        // Advance to next occurrence
        switch (rule.frequency) {
            case 'daily':
            case 'weekday':
                current = new Date(current.getTime() + 24 * 60 * 60 * 1000)
                break
            case 'weekly':
                current = new Date(current.getTime() + 7 * 24 * 60 * 60 * 1000)
                break
            case 'monthly': {
                const nextMonth = new Date(current)
                nextMonth.setUTCMonth(nextMonth.getUTCMonth() + 1)
                current = nextMonth
                break
            }
        }
    }

    return results
}

export async function getCalendarEvents(
    userId: string,
    startDate: Date,
    endDate: Date
): Promise<CalendarEvent[]> {
    const supabase = await createClient()

    // Fetch non-recurring events in range
    const { data: normalEvents, error: normalError } = await supabase
        .from('calendar_events')
        .select('*')
        .eq('user_id', userId)
        .eq('is_recurring', false)
        .gte('start_time', startDate.toISOString())
        .lte('start_time', endDate.toISOString())
        .order('start_time', { ascending: true })

    if (normalError) {
        console.error('Error fetching calendar events:', normalError)
        return []
    }

    // Fetch recurring templates that started before range end
    const { data: recurringTemplates, error: recurringError } = await supabase
        .from('calendar_events')
        .select('*')
        .eq('user_id', userId)
        .eq('is_recurring', true)
        .lte('start_time', endDate.toISOString())

    if (recurringError) {
        console.error('Error fetching recurring events:', recurringError)
        return normalEvents || []
    }

    // Expand recurring events
    const expandedRecurring = (recurringTemplates || []).flatMap(event =>
        expandRecurringEvents(event, startDate, endDate)
    )

    // Merge and sort
    const allEvents = [...(normalEvents || []), ...expandedRecurring]
    allEvents.sort((a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime())

    return allEvents
}

export async function createCalendarEvent(
    userId: string,
    event: Partial<Omit<CalendarEvent, 'id' | 'user_id' | 'created_at' | 'updated_at'>>
): Promise<CalendarEvent | null> {
    const supabase = await createClient()

    const { data, error } = await supabase
        .from('calendar_events')
        .insert({
            user_id: userId,
            ...event
        })
        .select()
        .single()

    if (error) {
        console.error('Error creating calendar event:', error)
        return null
    }

    return data
}

export async function updateCalendarEvent(
    eventId: string,
    userId: string,
    updates: Partial<CalendarEvent>
): Promise<CalendarEvent | null> {
    const supabase = await createClient()

    const { data, error } = await supabase
        .from('calendar_events')
        .update(updates)
        .eq('id', eventId)
        .eq('user_id', userId)
        .select()
        .single()

    if (error) {
        console.error('Error updating calendar event:', error)
        return null
    }

    return data
}

export async function deleteCalendarEvent(eventId: string, userId: string): Promise<boolean> {
    const supabase = await createClient()

    // Virtual recurring instance - delete the parent recurring event
    const realId = eventId.includes('__') ? eventId.split('__')[0] : eventId

    const { error } = await supabase
        .from('calendar_events')
        .delete()
        .eq('id', realId)
        .eq('user_id', userId)

    if (error) {
        console.error('Error deleting calendar event:', error)
        return false
    }

    return true
}

export async function getUpcomingEvents(
    userId: string,
    minutesAhead: number = 60
): Promise<CalendarEvent[]> {
    const supabase = await createClient()
    const now = new Date()
    const future = new Date(now.getTime() + minutesAhead * 60000)

    const { data, error } = await supabase
        .from('calendar_events')
        .select('*')
        .eq('user_id', userId)
        .eq('status', 'pending')
        .eq('notification_sent', false)
        .gte('start_time', now.toISOString())
        .lte('start_time', future.toISOString())
        .order('start_time', { ascending: true })

    if (error) {
        console.error('Error fetching upcoming events:', error)
        return []
    }

    return data || []
}

export async function markEventNotified(eventId: string): Promise<void> {
    const supabase = await createClient()

    await supabase
        .from('calendar_events')
        .update({
            notification_sent: true,
            last_notified_at: new Date().toISOString()
        })
        .eq('id', eventId)
}

export async function deleteAllCalendarEvents(userId: string): Promise<number> {
    const supabase = await createClient()

    const { data, error } = await supabase
        .from('calendar_events')
        .delete()
        .eq('user_id', userId)
        .select('id')

    if (error) {
        console.error('Error deleting all calendar events:', error)
        return 0
    }

    return data?.length || 0
}

export async function completeEvent(
    eventId: string,
    userId: string,
    note?: string
): Promise<CalendarEvent | null> {
    // Virtual recurring instances can't be completed individually
    if (eventId.includes('__')) {
        return null
    }

    const supabase = await createClient()

    const { data, error } = await supabase
        .from('calendar_events')
        .update({
            status: 'completed',
            completed_at: new Date().toISOString(),
            completion_note: note || null
        })
        .eq('id', eventId)
        .eq('user_id', userId)
        .select()
        .single()

    if (error) {
        console.error('Error completing event:', error)
        return null
    }

    return data
}
