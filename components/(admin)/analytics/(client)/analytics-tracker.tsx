"use client"

import { useEffect } from "react"
import { usePathname } from "next/navigation"
import Cookies from "js-cookie"

export default function AnalyticsTracker() {
  const pathname = usePathname()

  useEffect(() => {
    // Función para registrar la visita
    const logVisit = async () => {
      try {
        const response = await fetch("/api/analytics/visitor-log", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            path: pathname,
            referrer: document.referrer,
          }),
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
        console.error("Error tracking analytics:", error)
      }
    }

    // Registrar la visita después de que la página se haya cargado completamente
    if (typeof window !== "undefined") {
      // Usar requestIdleCallback o setTimeout para no bloquear la carga de la página
      if ("requestIdleCallback" in window) {
        ;(window as any).requestIdleCallback(() => logVisit())
      } else {
        setTimeout(logVisit, 1000)
      }
    }
  }, [pathname])

  // Este componente no renderiza nada visible
  return null
}

