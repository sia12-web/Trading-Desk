import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { getActiveSubscriptions, deactivateSubscription } from '@/lib/data/push-subscriptions'
import { sendPushNotification } from '@/lib/notifications/web-push'

export async function POST(req: Request) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    try {
        const body = await req.json()
        const { title, body: notifBody, url, tag } = body

        if (!title || !notifBody) {
            return NextResponse.json(
                { error: 'title and body are required' },
                { status: 400 }
            )
        }

        const subscriptions = await getActiveSubscriptions(user.id)

        if (subscriptions.length === 0) {
            return NextResponse.json({ sent: 0, message: 'No active subscriptions' })
        }

        let sent = 0
        for (const sub of subscriptions) {
            const result = await sendPushNotification(sub, {
                title,
                body: notifBody,
                url: url || '/calendar',
                tag: tag || 'general'
            })

            if (result.success) {
                sent++
            } else if (result.expired) {
                await deactivateSubscription(user.id, sub.endpoint)
            }
        }

        return NextResponse.json({ sent, total: subscriptions.length })
    } catch (error: any) {
        console.error('Error sending notification:', error)
        return NextResponse.json(
            { error: 'Failed to send notification' },
            { status: 500 }
        )
    }
}
