'use client'

import { useState, useEffect, useCallback } from 'react'

interface UsePushNotificationsReturn {
    isSupported: boolean
    permission: NotificationPermission | 'unsupported'
    isSubscribed: boolean
    loading: boolean
    subscribe: () => Promise<boolean>
    unsubscribe: () => Promise<void>
}

export function usePushNotifications(): UsePushNotificationsReturn {
    const [isSupported, setIsSupported] = useState(false)
    const [permission, setPermission] = useState<NotificationPermission | 'unsupported'>('unsupported')
    const [isSubscribed, setIsSubscribed] = useState(false)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const supported = 'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window
        setIsSupported(supported)

        if (supported) {
            setPermission(Notification.permission)
            checkExistingSubscription()
        } else {
            setLoading(false)
        }
    }, [])

    async function checkExistingSubscription() {
        try {
            const registration = await navigator.serviceWorker.getRegistration('/sw.js')
            if (registration) {
                const subscription = await registration.pushManager.getSubscription()
                setIsSubscribed(!!subscription)
            }
        } catch {
            // ignore
        } finally {
            setLoading(false)
        }
    }

    const subscribe = useCallback(async (): Promise<boolean> => {
        if (!isSupported) return false

        try {
            setLoading(true)

            // Request notification permission
            const perm = await Notification.requestPermission()
            setPermission(perm)
            if (perm !== 'granted') return false

            // Register service worker
            const registration = await navigator.serviceWorker.register('/sw.js')
            await navigator.serviceWorker.ready

            // Get VAPID public key from server
            const keyRes = await fetch('/api/notifications/subscribe', { method: 'GET' })
            const { vapidPublicKey } = await keyRes.json()

            if (!vapidPublicKey) {
                console.error('VAPID public key not available')
                return false
            }

            // Subscribe to push
            const subscription = await registration.pushManager.subscribe({
                userVisibleOnly: true,
                applicationServerKey: vapidPublicKey
            })

            // Save to server
            const res = await fetch('/api/notifications/subscribe', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    subscription: subscription.toJSON(),
                    userAgent: navigator.userAgent
                })
            })

            if (res.ok) {
                setIsSubscribed(true)
                return true
            }

            return false
        } catch (err) {
            console.error('Push subscription error:', err)
            return false
        } finally {
            setLoading(false)
        }
    }, [isSupported])

    const unsubscribe = useCallback(async () => {
        try {
            setLoading(true)
            const registration = await navigator.serviceWorker.getRegistration('/sw.js')
            if (registration) {
                const subscription = await registration.pushManager.getSubscription()
                if (subscription) {
                    await subscription.unsubscribe()
                }
            }
            setIsSubscribed(false)
        } catch (err) {
            console.error('Push unsubscribe error:', err)
        } finally {
            setLoading(false)
        }
    }, [])

    return { isSupported, permission, isSubscribed, loading, subscribe, unsubscribe }
}
