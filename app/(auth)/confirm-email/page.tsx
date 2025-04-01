"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Loader2, CheckCircle, XCircle } from "lucide-react"

export default function ConfirmEmailPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get("token")

  const [status, setStatus] = useState<"loading" | "success" | "error">("loading")
  const [message, setMessage] = useState<string>("")

  useEffect(() => {
    if (!token) {
      setStatus("error")
      setMessage("Token de confirmación no válido o faltante.")
      return
    }

    const confirmEmail = async () => {
      try {
        const response = await fetch(`/api/confirm-email?token=${token}`)

        if (response.ok) {
          setStatus("success")
          setMessage("¡Tu correo electrónico ha sido confirmado correctamente!")
          // Redirigir al login después de 3 segundos
          setTimeout(() => {
            router.push("/login?confirmed=true")
          }, 3000)
        } else {
          const data = await response.json()
          setStatus("error")
          setMessage(data.error || "Error al confirmar el correo electrónico.")
        }
      } catch (error) {
        setStatus("error")
        setMessage("Error al procesar la confirmación. Por favor, inténtalo de nuevo.")
      }
    }

    confirmEmail()
  }, [token, router])

  return (
    <div className="container flex items-center justify-center min-h-screen py-12">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Confirmación de Correo</CardTitle>
          <CardDescription>Verificando tu dirección de correo electrónico</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center space-y-4">
          {status === "loading" && (
            <>
              <Loader2 className="h-16 w-16 text-primary animate-spin" />
              <p>Verificando tu correo electrónico...</p>
            </>
          )}

          {status === "success" && (
            <>
              <CheckCircle className="h-16 w-16 text-green-500" />
              <p className="text-center">{message}</p>
              <p className="text-sm text-muted-foreground">
                Serás redirigido a la página de inicio de sesión en unos segundos...
              </p>
              <Button onClick={() => router.push("/login?confirmed=true")}>Ir a iniciar sesión</Button>
            </>
          )}

          {status === "error" && (
            <>
              <XCircle className="h-16 w-16 text-red-500" />
              <p className="text-center text-red-500">{message}</p>
              <Button onClick={() => router.push("/login")}>Volver a iniciar sesión</Button>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

