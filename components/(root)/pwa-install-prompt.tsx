"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Download } from "lucide-react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>
}

export function PWAInstallPrompt() {
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [showPrompt, setShowPrompt] = useState(false)

  useEffect(() => {
    // Register service worker
    if ("serviceWorker" in navigator) {
      window.addEventListener("load", () => {
        navigator.serviceWorker
          .register("/service-worker.js")
          .then((registration) => {
            console.log("Service Worker registered: ", registration)
          })
          .catch((error) => {
            console.log("Service Worker registration failed: ", error)
          })
      })
    }

    // Listen for beforeinstallprompt event
    const handleBeforeInstallPrompt = (e: Event) => {
      // Prevent Chrome 67 and earlier from automatically showing the prompt
      e.preventDefault()
      // Store the event for later use
      setInstallPrompt(e as BeforeInstallPromptEvent)

      // Check if we should show the install prompt
      const hasPromptBeenShown = localStorage.getItem("pwaPromptShown")
      if (!hasPromptBeenShown) {
        setShowPrompt(true)
      }
    }

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt)

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt)
    }
  }, [])

  const handleInstallClick = () => {
    if (!installPrompt) return

    // Show the install prompt
    installPrompt.prompt()

    // Wait for the user to respond to the prompt
    installPrompt.userChoice.then((choiceResult) => {
      if (choiceResult.outcome === "accepted") {
        console.log("User accepted the install prompt")
      } else {
        console.log("User dismissed the install prompt")
      }
      // Clear the saved prompt since it can't be used again
      setInstallPrompt(null)
      setShowPrompt(false)

      // Mark that we've shown the prompt
      localStorage.setItem("pwaPromptShown", "true")
    })
  }

  const handleDismiss = () => {
    setShowPrompt(false)
    // Don't show again for a week
    localStorage.setItem("pwaPromptShown", "true")
    // Set a timeout to clear this after a week
    setTimeout(
      () => {
        localStorage.removeItem("pwaPromptShown")
      },
      7 * 24 * 60 * 60 * 1000,
    )
  }

  if (!showPrompt) return null

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 md:left-auto md:right-4 md:bottom-4 md:w-80">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Instalar BarkAndMeow</CardTitle>
          <CardDescription>Instala nuestra app para una mejor experiencia</CardDescription>
        </CardHeader>
        <CardContent className="pb-2">
          <p className="text-sm text-muted-foreground">
            Accede rápidamente y disfruta de todas las funciones incluso sin conexión.
          </p>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="outline" onClick={handleDismiss}>
            Ahora no
          </Button>
          <Button onClick={handleInstallClick}>
            <Download className="mr-2 h-4 w-4" />
            Instalar
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}

