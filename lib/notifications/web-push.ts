// @ts-ignore - no type declarations for web-push
import webpush from 'web-push'

const VAPID_PUBLIC_KEY = process.env.VAPID_PUBLIC_KEY || ''
const VAPID_PRIVATE_KEY = process.env.VAPID_PRIVATE_KEY || ''
const VAPID_SUBJECT = process.env.VAPID_SUBJECT || 'mailto:admin@tradedesk.app'

if (VAPID_PUBLIC_KEY && VAPID_PRIVATE_KEY) {
    webpush.setVapidDetails(VAPID_SUBJECT, VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY)
}

export interface PushPayload {
    title: string
    body: string
    url?: string
    tag?: string
    requireInteraction?: boolean
}

export interface PushSubscriptionData {
    endpoint: string
    p256dh_key: string
    auth_key: string
}

export async function sendPushNotification(
    subscription: PushSubscriptionData,
    payload: PushPayload
): Promise<{ success: boolean; expired?: boolean }> {
    if (!VAPID_PUBLIC_KEY || !VAPID_PRIVATE_KEY) {
        console.warn('VAPID keys not configured, skipping push notification')
        return { success: false }
    }

    const pushSubscription = {
        endpoint: subscription.endpoint,
        keys: {
            p256dh: subscription.p256dh_key,
            auth: subscription.auth_key
        }
    }

    try {
        await webpush.sendNotification(
            pushSubscription,
            JSON.stringify(payload),
            { TTL: 3600 }
        )
        return { success: true }
    } catch (error: any) {
        if (error.statusCode === 410 || error.statusCode === 404) {
            // Subscription expired or invalid
            return { success: false, expired: true }
        }
        console.error('Push notification error:', error.message)
        return { success: false }
    }
}

export function getVapidPublicKey(): string {
    return VAPID_PUBLIC_KEY
}

export function isWebPushConfigured(): boolean {
    return Boolean(VAPID_PUBLIC_KEY && VAPID_PRIVATE_KEY)
}
