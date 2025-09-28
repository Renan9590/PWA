'use client'

import { useState, useEffect } from 'react'
import {subscribeUser, unsubscribeUser, sendNotification} from './actions'

function urlBase64ToUint8Array(base64String: string){
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
        outputArray[i] = rawData.charCodeAt(i);
    }

    return outputArray;
}

function PushNotificationManager(){
    const [isSupported, setIsSupported] = useState(false);
    const [subscription, setSubscription] = useState<PushSubscription | null>(null);
    const [message, setMessage] = useState('')

    useEffect(() => {
        if('serviceWorker' in navigator && 'PushManager' in window){
            setIsSupported(true)
            registerServiceWorker()
        }
    }, [])

    async function registerServiceWorker(){
        const registration = await navigator.serviceWorker.register('/sw.js', {
            scope: '/', 
            updateViaCache: 'none',
        })

        const sub = await registration.pushManager.getSubscription()
        setSubscription(sub)
    }

    async function subscribeToPush(){
        const registration = await navigator.serviceWorker.ready
        const sub = await registration.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: urlBase64ToUint8Array(process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!),
        })

        setSubscription(sub)
        const serializedSub = JSON.parse(JSON.stringify(sub))
        await subscribeUser(serializedSub)
    }

    async function unsubscribeFromPush(){
        await subscription?.unsubscribe()
        setSubscription(null)
        await unsubscribeUser()
    }

    async function sendTestNotification(){
        if(subscription){
            await sendNotification(message)
            setMessage('')
        }
    }

        if(!isSupported){
            return <p>Push notifications are not supported in your browser.</p>
        }
    
        return(
            <div>
                <h3>Push Notifications</h3>
                {subscription ? (
                    <>
                        <p>You are subscribed to push notifications.</p>
                        <button onClick={unsubscribeFromPush}>Unsubscribe</button>
                        <input
                            type="text"
                            placeholder="Enter Notification Message"
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                        />
                        <button onClick={sendTestNotification}>Send Test</button>
                    </>
                ) : (
                    <>
                        <p>You are not subscribed to push notifications.</p>
                        <button onClick={subscribeToPush}>Subscribe</button>
                    </>
                )}
            </div>
        )
    }

function InstallPrompt(){
    const [isOS, setIsOS] = useState(false)
    const [isStandalone, setIsStandalone] = useState(false)

    useEffect(() => {
        setIsOS(/iPhone|iPad|iPod/.test(navigator.userAgent) && !(window as any).MSStream)
        setIsStandalone(window.matchMedia('(display-mode: standalone)').matches)
    }, [])

    if (isStandalone){
        return null //Não mostra botão de instalação se já estiver em modo standalone
    }

    return(
        <div>
            <h3>Install App</h3>
            <button>Add to Home Screen</button>
            {isOS && (
                <p>To install this app on your iOS devicePixelRatio, tap the share button
                <span role = "img" aria-label = "share icon">
                {' '}
                📤{' '}
                </span>
                and then select "Add to Home Screen"
                <span role = "img" aria-label = "plus icon">
                {' '}
                ➕{' '}
                </span>)
            </p>
            )}
        </div>
    )
}

export default function Page(){
    return (
        <div>
            <PushNotificationManager />
            <InstallPrompt />
        </div>
    )
}