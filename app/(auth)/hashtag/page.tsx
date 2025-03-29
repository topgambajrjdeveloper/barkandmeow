/* eslint-disable @typescript-eslint/no-unused-vars */
"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Hash, AlertCircle } from "lucide-react"
import Link from "next/link"
import { MobileNavigation } from "@/components/(root)/ui/MobileNavigation"

export default function HashtagPage() {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [originalTag, setOriginalTag] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function processHashtag() {
      try {
        // Capturar el fragmento de la URL (lo que viene después del #)
        const hashFragment = window.location.hash

        if (hashFragment) {
          // Intentar procesar el hashtag a través de nuestro route handler
          const response = await fetch(`/hashtag?tag=${encodeURIComponent(hashFragment.substring(1))}`)

          if (response.ok) {
            // Si la respuesta es exitosa, debería ser una redirección
            // El navegador ya debería haber seguido la redirección
            return
          }

          // Si hay un error, mostrar el mensaje
          const data = await response.json()
          setError(data.message || "Hashtag inválido")
          setOriginalTag(data.originalTag || hashFragment)
        } else {
          // Si no hay fragmento, redirigir al feed después de un breve retraso
          setTimeout(() => {
            router.push("/feed")
          }, 1000)
        }
      } catch (err) {
        setError("Error al procesar el hashtag")
      } finally {
        setIsLoading(false)
      }
    }

    processHashtag()
  }, [router])

  // Si está cargando, mostrar un loader
  if (isLoading) {
    return <div className="flex justify-center items-center min-h-[70vh]">Cargando...</div>
  }

  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 max-w-screen-sm mx-auto md:max-w-none md:mx-1 pb-20 md:pb-0">
      <div className="md:col-span-2 space-y-4">
      <Card className="border-background/1 border-4 p-6 mt-4 text-center space-y-6">
        <div className="mb-6 flex justify-center ">
          <div className="bg-red-100 p-3 rounded-full">
            <AlertCircle className="h-8 w-8 text-red-500" />
          </div>
        </div>

        <h1 className="text-2xl font-bold mb-2">URL de hashtag incorrecta</h1>

        <p className="text-gray-500 mb-6">
          {error || "La URL que estás intentando acceder no tiene el formato correcto."}
        </p>

        {originalTag && (
          <div className="bg-gray-100 p-3 rounded-md mb-6">
            <p className="text-sm text-gray-600">
              Hashtag proporcionado: <span className="font-mono">{originalTag}</span>
            </p>
            <p className="text-xs text-gray-500 mt-1">
              El formato correcto es: <span className="font-mono">/hashtag/nombre_del_hashtag</span>
            </p>
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button onClick={() => router.push("/feed")} variant="default">
            Ir al feed
          </Button>

          <Button onClick={() => router.back()} variant="outline">
            Volver atrás
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

      <MobileNavigation />
    </div>
  )
}

