"use client"

import { useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Hash } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"

export default function HashtagError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  const router = useRouter()

  useEffect(() => {
    // Registrar el error en un servicio de análisis de errores
    console.error("Error en la página de hashtag:", error)
  }, [error])

  // Extraer el hashtag de la URL si es posible
  const getHashtagFromUrl = () => {
    if (typeof window !== "undefined") {
      const path = window.location.pathname
      const parts = path.split("/")
      if (parts.length > 2) {
        return parts[2]
      }
    }
    return null
  }

  const hashtag = getHashtagFromUrl()

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] px-4">
      <Card className="w-full max-w-md p-6 text-center">
        <div className="mb-6 flex justify-center">
          <div className="bg-red-100 p-3 rounded-full">
            <Hash className="h-8 w-8 text-red-500" />
          </div>
        </div>

        <h1 className="text-2xl font-bold mb-2">Error en la búsqueda de hashtag</h1>

        <p className="text-gray-500 mb-6">
          La URL del hashtag que intentas acceder no es válida. Los hashtags solo pueden contener letras, números y
          guiones bajos.
        </p>

        {hashtag && (
          <div className="bg-gray-100 p-3 rounded-md mb-6">
            <p className="text-sm text-gray-600">
              URL incorrecta: <span className="font-mono">/hashtag/{hashtag}</span>
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Posiblemente contiene caracteres especiales o múltiples hashtags.
            </p>
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button onClick={() => router.push("/feed")} variant="default">
            Ir al feed
          </Button>

          <Button onClick={() => reset()} variant="outline">
            Intentar de nuevo
          </Button>
        </div>

        <div className="mt-8 border-t pt-4">
          <p className="text-sm text-gray-500 mb-3">Ejemplos de hashtags válidos:</p>
          <div className="flex flex-wrap gap-2 justify-center">
            <Link href="/hashtag/mascotas">
              <Button variant="ghost" size="sm" className="gap-1">
                <Hash className="h-3 w-3" />
                mascotas
              </Button>
            </Link>
            <Link href="/hashtag/perros">
              <Button variant="ghost" size="sm" className="gap-1">
                <Hash className="h-3 w-3" />
                perros
              </Button>
            </Link>
            <Link href="/hashtag/gatos">
              <Button variant="ghost" size="sm" className="gap-1">
                <Hash className="h-3 w-3" />
                gatos
              </Button>
            </Link>
          </div>
        </div>
      </Card>
    </div>
  )
}

