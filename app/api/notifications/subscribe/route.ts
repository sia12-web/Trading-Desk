import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { saveSubscription } from '@/lib/data/push-subscriptions'
import { getVapidPublicKey } from '@/lib/notifications/web-push'

// GET - return VAPID public key
export async function GET() {
    return NextResponse.json({ vapidPublicKey: getVapidPublicKey() })
}

// POST - save push subscription
export async function POST(req: Request) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    try {
        const body = await req.json()
        const { subscription, userAgent } = body

        if (!subscription?.endpoint || !subscription?.keys?.p256dh || !subscription?.keys?.auth) {
            return NextResponse.json(
                { error: 'Invalid subscription object' },
                { status: 400 }
            )
        }

        const saved = await saveSubscription(user.id, subscription, userAgent)

        if (!saved) {
            return NextResponse.json(
                { error: 'Failed to save subscription' },
                { status: 500 }
            )
        }

        return NextResponse.json({ success: true })
    } catch (error: any) {
        console.error('Error saving push subscription:', error)
        return NextResponse.json(
            { error: 'Failed to save subscription' },
            { status: 500 }
        )
    }
}
