"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { RefreshCw } from "lucide-react"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

export function PWAUpdatePrompt() {
  const [showUpdatePrompt, setShowUpdatePrompt] = useState(false)
  const [waitingWorker, setWaitingWorker] = useState<ServiceWorker | null>(null)

  useEffect(() => {
    if ("serviceWorker" in navigator) {
      // Check for service worker updates
      navigator.serviceWorker.ready.then((registration) => {
        registration.addEventListener("updatefound", () => {
          const newWorker = registration.installing

          if (newWorker) {
            newWorker.addEventListener("statechange", () => {
              if (newWorker.state === "installed" && navigator.serviceWorker.controller) {
                // New content is available, show update prompt
                setShowUpdatePrompt(true)
                setWaitingWorker(newWorker)
              }
            })
          }
        })
      })
    }
  }, [])

  const handleUpdate = () => {
    if (waitingWorker) {
      // Send message to service worker to skip waiting
      waitingWorker.postMessage({ type: "SKIP_WAITING" })

      // Reload the page to load the new version
      window.location.reload()
      setShowUpdatePrompt(false)
    }
  }

  if (!showUpdatePrompt) return null

  return (
    <div className="fixed top-4 right-4 z-50 w-80">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Nueva versión disponible</CardTitle>
        </CardHeader>
        <CardContent className="pb-2">
          <p className="text-sm text-muted-foreground">
            Hay una nueva versión de BarkAndMeow disponible. Actualiza para obtener las últimas mejoras.
          </p>
        </CardContent>
        <CardFooter className="flex justify-end">
          <Button onClick={handleUpdate}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Actualizar
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}

