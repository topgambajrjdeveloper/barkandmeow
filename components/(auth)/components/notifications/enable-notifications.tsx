"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { Bell } from "lucide-react"

export function EnableNotifications() {
  const [isSupported, setIsSupported] = useState(false)
  const [isSubscribed, setIsSubscribed] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    // Verificar si las notificaciones push son compatibles con este navegador
    const checkSupport = async () => {
      const supported = "serviceWorker" in navigator && "PushManager" in window
      setIsSupported(supported)

      if (supported) {
        try {
          // Registrar el service worker si no está registrado
          const registration = await navigator.serviceWorker.ready

          // Verificar si ya hay una suscripción activa
          const subscription = await registration.pushManager.getSubscription()
          setIsSubscribed(!!subscription)
        } catch (error) {
          console.error("Error checking push subscription:", error)
        }
      }
    }

    checkSupport()
  }, [])

  const handleSubscribe = async () => {
    if (!isSupported) {
      toast.error("Tu navegador no soporta notificaciones push")
      return
    }

    try {
      setIsLoading(true)

      // Solicitar permiso para notificaciones
      const permission = await Notification.requestPermission()
      if (permission !== "granted") {
        toast.error("Permiso de notificaciones denegado")
        return
      }

      // Registrar el service worker si no está registrado
      await navigator.serviceWorker.register("/service-worker.js")
      const registration = await navigator.serviceWorker.ready

      // Obtener la clave pública VAPID
      const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY

      if (!vapidPublicKey) {
        toast.error("Error de configuración del servidor")
        return
      }

      // Convertir la clave pública a Uint8Array
      const convertedVapidKey = urlBase64ToUint8Array(vapidPublicKey)

      // Crear una nueva suscripción
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: convertedVapidKey,
      })

      // Enviar la suscripción al servidor
      const response = await fetch("/api/notifications/subscribe", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(subscription.toJSON()),
      })

      if (!response.ok) {
        throw new Error("Error al guardar la suscripción")
      }

      setIsSubscribed(true)
      toast.success("Notificaciones activadas correctamente")
    } catch (error) {
      console.error("Error subscribing to push notifications:", error)
      toast.error("Error al activar las notificaciones")
    } finally {
      setIsLoading(false)
    }
  }

  const handleUnsubscribe = async () => {
    try {
      setIsLoading(true)

      // Obtener la suscripción actual
      const registration = await navigator.serviceWorker.ready
      const subscription = await registration.pushManager.getSubscription()

      if (subscription) {
        // Cancelar la suscripción
        await subscription.unsubscribe()

        // Informar al servidor
        await fetch("/api/notifications/unsubscribe", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ endpoint: subscription.endpoint }),
        })

        setIsSubscribed(false)
        toast.success("Notificaciones desactivadas correctamente")
      }
    } catch (error) {
      console.error("Error unsubscribing from push notifications:", error)
      toast.error("Error al desactivar las notificaciones")
    } finally {
      setIsLoading(false)
    }
  }

  if (!isSupported) {
    return <div className="text-sm text-muted-foreground">Tu navegador no soporta notificaciones push.</div>
  }

  return (
    <Button
      variant={isSubscribed ? "outline" : "default"}
      onClick={isSubscribed ? handleUnsubscribe : handleSubscribe}
      disabled={isLoading}
      className="flex items-center gap-2"
    >
      <Bell className="h-4 w-4" />
      {isLoading ? "Procesando..." : isSubscribed ? "Desactivar notificaciones" : "Activar notificaciones"}
    </Button>
  )
}

// Función auxiliar para convertir la clave VAPID
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

