import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { updateCalendarEvent, deleteCalendarEvent, completeEvent } from '@/lib/data/calendar'

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    try {
        const { id } = await params
        const body = await req.json()

        // Handle completion separately
        if (body.action === 'complete') {
            const event = await completeEvent(id, user.id, body.note)
            if (!event) {
                return NextResponse.json({ error: 'Failed to complete event' }, { status: 500 })
            }
            return NextResponse.json({ event })
        }

        // Regular update
        const event = await updateCalendarEvent(id, user.id, body)
        if (!event) {
            return NextResponse.json({ error: 'Failed to update event' }, { status: 500 })
        }

        return NextResponse.json({ event })
    } catch (error: any) {
        console.error('Error updating calendar event:', error)
        return NextResponse.json({ error: 'Failed to update event' }, { status: 500 })
    }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    try {
        const { id } = await params
        const success = await deleteCalendarEvent(id, user.id)

        if (!success) {
            return NextResponse.json({ error: 'Failed to delete event' }, { status: 500 })
        }

        return NextResponse.json({ success: true })
    } catch (error: any) {
        console.error('Error deleting calendar event:', error)
        return NextResponse.json({ error: 'Failed to delete event' }, { status: 500 })
    }
}
