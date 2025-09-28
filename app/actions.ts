'use server'

import { title } from 'process'
import webpush from 'web-push'

webpush.setVapidDetails(
    '<mailto: your-email@example.com>',
    process.env.NEXT_VAPID_PUBLIC_KEY!,
    process.env.VAPID_PRIVATE_KEY!
)

let subscription: PushSubscription | null = null

export async function subscribeUser(sub: PushSubscription){
    subscription = sub
    return {success : true}
    return {success : true}
}

export async function unsubscribeUser(){
    subscription = null
    return {success : true}
}

export async function sendNotification(message: string){
    if(!subscription){
        throw new Error('No subscription available')
    }

    try{
        await webpush.sendNotification(
            subscription,
            JSON.stringfy({
                title: 'Test Notification',
                body: message,
                icon: '/icon.png',
            })
        )

        return {success: true}

    } catch (error){
        console.error('Error sending notification', error)
        return {success: false, error: 'Failed to send notification'}
    }
}