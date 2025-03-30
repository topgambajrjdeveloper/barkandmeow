"use client"

import { useEffect, useState } from "react"
import { usePathname } from "next/navigation"
import Cookies from "js-cookie"

export default function AnalyticsTracker() {
  const pathname = usePathname()
  const [isTracking, setIsTracking] = useState(false)

  useEffect(() => {
    // Evitar múltiples llamadas simultáneas
    if (isTracking) return

    // Función para registrar la visita
    const logVisit = async () => {
      // Marcar que estamos en proceso de tracking
      setIsTracking(true)

      try {
        const response = await fetch("/api/admin/analytics/visitor-log", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            path: pathname,
            referrer: document.referrer,
          }),
          // Añadir signal para poder abortar la petición si es necesario
          signal: AbortSignal.timeout(5000), // 5 segundos de timeout
        })

        if (response.ok) {
          const data = await response.json()

          // Guardar ID de visitante en cookie si no existe
          if (data.visitorId && !Cookies.get("visitor_id")) {
            Cookies.set("visitor_id", data.visitorId, {
              expires: 365, // 1 año
              sameSite: "strict",
              secure: window.location.protocol === "https:",
            })
          }
        }
      } catch (error) {
        // Silenciar errores para no afectar la experiencia del usuario
        // Solo loguear si no es un error de abort
        if (!(error instanceof DOMException && error.name === "AbortError")) {
          console.error("Error tracking analytics (non-critical):", error)
        }
      } finally {
        // Desmarcar el tracking después de un tiempo para permitir futuras llamadas
        setTimeout(() => setIsTracking(false), 10000) // 10 segundos de cooldown
      }
    }

    // Registrar la visita después de que la página se haya cargado completamente
    if (typeof window !== "undefined") {
      // Usar requestIdleCallback o setTimeout para no bloquear la carga de la página
      // y darle menor prioridad que otras peticiones críticas
      const trackVisit = () => {
        // Solo trackear si la página ha estado visible por al menos 3 segundos
        if (document.visibilityState === "visible") {
          logVisit()
        }
      }

      const timer = setTimeout(trackVisit, 3000)
      return () => clearTimeout(timer)
    }
  }, [pathname, isTracking])

  // Este componente no renderiza nada visible
  return null
}

