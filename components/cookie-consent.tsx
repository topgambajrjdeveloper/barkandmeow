"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

type CookieConsent = {
  necessary: boolean
  analytics: boolean
  marketing: boolean
  preferences: boolean
}

const defaultConsent: CookieConsent = {
  necessary: true, // Las cookies necesarias siempre están activadas
  analytics: false,
  marketing: false,
  preferences: false,
}

export function CookieConsent() {
  const [open, setOpen] = useState(false)
  const [showBanner, setShowBanner] = useState(false)
  const [consent, setConsent] = useState<CookieConsent>(defaultConsent)
  const [showDetails, setShowDetails] = useState(false)

  // Cargar el estado de consentimiento al montar el componente
  useEffect(() => {
    // Solo ejecutar en el cliente
    const storedConsent = localStorage.getItem("cookieConsent")

    if (!storedConsent) {
      // Si no hay consentimiento almacenado, mostrar el banner
      setShowBanner(true)
    } else {
      // Si hay consentimiento almacenado, cargarlo
      setConsent(JSON.parse(storedConsent))
    }
  }, [])

  // Guardar el consentimiento en localStorage
  const saveConsent = (newConsent: CookieConsent) => {
    localStorage.setItem("cookieConsent", JSON.stringify(newConsent))
    setConsent(newConsent)
    setShowBanner(false)
    setOpen(false)
  }

  // Aceptar todas las cookies
  const acceptAll = () => {
    const fullConsent: CookieConsent = {
      necessary: true,
      analytics: true,
      marketing: true,
      preferences: true,
    }
    saveConsent(fullConsent)
  }

  // Rechazar cookies no esenciales
  const rejectNonEssential = () => {
    saveConsent(defaultConsent)
  }

  // Guardar preferencias personalizadas
  const savePreferences = () => {
    saveConsent(consent)
  }

  // Abrir el diálogo de configuración
  const openSettings = () => {
    setOpen(true)
  }

  // Manejar cambios en las preferencias
  const handleConsentChange = (key: keyof CookieConsent) => {
    if (key === "necessary") return // No permitir cambiar las cookies necesarias

    setConsent((prev) => ({
      ...prev,
      [key]: !prev[key],
    }))
  }

  if (!showBanner && !open) return null

  return (
    <>
      {/* Banner principal de cookies */}
      {showBanner && (
        <div className="fixed bottom-0 left-0 right-0 z-50 p-4 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 shadow-lg">
          <div className="container mx-auto max-w-7xl">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="flex-1">
                <h3 className="text-lg font-semibold mb-2">Política de Cookies</h3>
                <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
                  Utilizamos cookies propias y de terceros para mejorar nuestros servicios y mostrarle publicidad
                  relacionada con sus preferencias mediante el análisis de sus hábitos de navegación. Puede aceptar
                  todas las cookies pulsando el botón "Aceptar todas", rechazar su uso pulsando el botón "Rechazar" o
                  configurar sus preferencias pulsando el botón "Configurar".
                </p>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  <Link href="/politica-cookies" className="underline hover:text-primary">
                    Más información
                  </Link>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row gap-2 mt-4 md:mt-0">
                <Button variant="outline" onClick={rejectNonEssential}>
                  Rechazar
                </Button>
                <Button variant="outline" onClick={openSettings}>
                  Configurar
                </Button>
                <Button onClick={acceptAll}>Aceptar todas</Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Diálogo de configuración detallada */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Configuración de Cookies</DialogTitle>
            <DialogDescription>
              Personaliza tus preferencias de cookies. Las cookies necesarias son esenciales para el funcionamiento del
              sitio y no pueden desactivarse.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 my-4">
            {/* Cookies necesarias */}
            <div className="flex items-start justify-between">
              <div>
                <h4 className="font-medium">Cookies necesarias</h4>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Esenciales para el funcionamiento básico del sitio web.
                </p>
              </div>
              <div className="flex items-center h-5">
                <input
                  type="checkbox"
                  checked={consent.necessary}
                  disabled
                  className="h-4 w-4 rounded border-gray-300"
                />
              </div>
            </div>

            {/* Cookies analíticas */}
            <div className="flex items-start justify-between">
              <div>
                <h4 className="font-medium">Cookies analíticas</h4>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Nos ayudan a entender cómo interactúas con el sitio web.
                </p>
              </div>
              <div className="flex items-center h-5">
                <input
                  type="checkbox"
                  checked={consent.analytics}
                  onChange={() => handleConsentChange("analytics")}
                  className="h-4 w-4 rounded border-gray-300"
                />
              </div>
            </div>

            {/* Cookies de marketing */}
            <div className="flex items-start justify-between">
              <div>
                <h4 className="font-medium">Cookies de marketing</h4>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Utilizadas para rastrear a los visitantes en los sitios web.
                </p>
              </div>
              <div className="flex items-center h-5">
                <input
                  type="checkbox"
                  checked={consent.marketing}
                  onChange={() => handleConsentChange("marketing")}
                  className="h-4 w-4 rounded border-gray-300"
                />
              </div>
            </div>

            {/* Cookies de preferencias */}
            <div className="flex items-start justify-between">
              <div>
                <h4 className="font-medium">Cookies de preferencias</h4>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Permiten recordar información que cambia el comportamiento o el aspecto del sitio.
                </p>
              </div>
              <div className="flex items-center h-5">
                <input
                  type="checkbox"
                  checked={consent.preferences}
                  onChange={() => handleConsentChange("preferences")}
                  className="h-4 w-4 rounded border-gray-300"
                />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={rejectNonEssential}>
              Solo necesarias
            </Button>
            <Button onClick={savePreferences}>Guardar preferencias</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

