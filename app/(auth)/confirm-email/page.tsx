"use client"

import { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle, CheckCircle, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

export default function ConfirmEmailPage() {
  const [isConfirming, setIsConfirming] = useState(true)
  const [isSuccess, setIsSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const searchParams = useSearchParams()
  const token = searchParams.get("token")

  useEffect(() => {
    const confirmEmail = async () => {
      if (!token) {
        setError("Token no proporcionado")
        setIsConfirming(false)
        return
      }

      try {
        const response = await fetch(`/api/confirm-email?token=${token}`)
        if (response.ok) {
          setIsSuccess(true)
        } else {
          const data = await response.json()
          setError(data.error || "No se pudo confirmar el correo electrónico")
        }
      } catch (error) {
        console.error("Error confirming email:", error)
        setError("Ocurrió un error al confirmar el correo electrónico")
      } finally {
        setIsConfirming(false)
      }
    }

    confirmEmail()
  }, [token])

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">Confirmación de Correo Electrónico</CardTitle>
        </CardHeader>
        <CardContent>
          {isConfirming ? (
            <div className="flex flex-col items-center space-y-4">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p>Confirmando tu correo electrónico...</p>
            </div>
          ) : isSuccess ? (
            <Alert className="bg-green-50 border-green-200">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <AlertDescription className="text-green-800">
                Tu correo electrónico ha sido confirmado exitosamente.
              </AlertDescription>
            </Alert>
          ) : (
            <Alert variant="destructive">
              <AlertCircle className="h-5 w-5" />
              <AlertDescription>
                {error ||
                  "No se pudo confirmar tu correo electrónico. Por favor, intenta nuevamente o contacta a soporte."}
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
        <CardFooter className="flex justify-center">
          <Button asChild>
            <Link href="/">Volver al Inicio</Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}

