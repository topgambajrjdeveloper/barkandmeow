"use client"

import { useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

export default function MapError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error("Map page error:", error)
  }, [error])

  return (
    <div className="container py-10 flex items-center justify-center">
      <Card className="max-w-md">
        <CardHeader>
          <CardTitle>Algo salió mal</CardTitle>
          <CardDescription>Ha ocurrido un error al cargar el mapa o los datos de ubicaciones.</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            Detalles del error: {error.message || "Error desconocido"}
          </p>
          <p className="text-sm">Puedes intentar recargar la página o volver a la página anterior.</p>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="outline" onClick={() => window.history.back()}>
            Volver
          </Button>
          <Button onClick={reset}>Intentar de nuevo</Button>
        </CardFooter>
      </Card>
    </div>
  )
}

