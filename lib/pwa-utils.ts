/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Checks if the app is being used as a PWA (installed on home screen)
 */
export function isPWA(): boolean {
    return window.matchMedia("(display-mode: standalone)").matches || (window.navigator as any).standalone === true
  }
  
  /**
   * Checks if the app can be installed as a PWA
   */
  export async function canInstallPWA(): Promise<boolean> {
    if (!window || !navigator || !navigator.serviceWorker) {
      return false
    }
  
    // Check if already installed
    if (isPWA()) {
      return false
    }
  
    // Check if the browser supports PWA installation
    const relatedApps = (await (navigator as any).getInstalledRelatedApps?.()) || []
    if (relatedApps.length > 0) {
      return false // Already installed as a related app
    }
  
    return true
  }
  
  /**
   * Registers the service worker
   */
  export async function registerServiceWorker(): Promise<ServiceWorkerRegistration | null> {
    if ("serviceWorker" in navigator) {
      try {
        const registration = await navigator.serviceWorker.register("/service-worker.js")
        console.log("Service Worker registered with scope:", registration.scope)
        return registration
      } catch (error) {
        console.error("Service Worker registration failed:", error)
        return null
      }
    }
    return null
  }
  
  /**
   * Subscribes to push notifications
   */
  export async function subscribeToPushNotifications(
    registration: ServiceWorkerRegistration,
    applicationServerKey: string,
  ): Promise<PushSubscription | null> {
    try {
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(applicationServerKey),
      })
  
      console.log("User is subscribed to push notifications")
      return subscription
    } catch (error) {
      console.error("Failed to subscribe to push notifications:", error)
      return null
    }
  }
  
  /**
   * Converts a base64 string to Uint8Array for push subscription
   */
  function urlBase64ToUint8Array(base64String: string): Uint8Array {
    const padding = "=".repeat((4 - (base64String.length % 4)) % 4)
    const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/")
  
    const rawData = window.atob(base64)
    const outputArray = new Uint8Array(rawData.length)
  
    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i)
    }
  
    return outputArray
  }
  
  