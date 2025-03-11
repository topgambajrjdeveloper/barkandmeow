"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle, CheckCircle } from "lucide-react"
import { resetPasswordSchema } from "@/lib/validations"

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      const validatedData = resetPasswordSchema.parse({ email })

      const response = await fetch("/api/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(validatedData),
      })

      if (response.ok) {
        setSuccess(true)
      } else {
        const data = await response.json()
        setError(data.error || "Ocurrió un error al procesar tu solicitud")
      }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      setError("Por favor, ingresa un email válido")
    } finally {
      setIsLoading(false)
    }
  }

  if (success) {
    return (
      <div className="max-w-md mx-auto mt-8">
        <Alert>
          <CheckCircle className="h-4 w-4" />
          <AlertDescription>
            Si existe una cuenta asociada a este correo electrónico, recibirás instrucciones para restablecer tu
            contraseña.
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className="max-w-md mx-auto mt-8">
      <h1 className="text-2xl font-bold mb-4">Restablecer contraseña</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder="tu@email.com"
          />
        </div>
        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? "Enviando..." : "Enviar enlace de restablecimiento"}
        </Button>
      </form>
    </div>
  )
}

