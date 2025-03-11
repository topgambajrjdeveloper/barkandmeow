"use client"

import type React from "react"
import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { newPasswordSchema } from "@/lib/validations"
import { Notification } from "@/components/notification"
import { ZodError } from "zod"

interface ResetPasswordState {
  newPassword: string
  isLoading: boolean
  error: string | null
  success: boolean
}

export default function ResetPasswordPage() {
  const [state, setState] = useState<ResetPasswordState>({
    newPassword: "",
    isLoading: false,
    error: null,
    success: false,
  })
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get("token")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setState((prev) => ({ ...prev, isLoading: true, error: null }))

    if (!token) {
      setState((prev) => ({ ...prev, isLoading: false, error: "Token de restablecimiento no válido" }))
      return
    }

    try {
      const validatedData = newPasswordSchema.parse({ token, newPassword: state.newPassword })

      const response = await fetch("/api/reset-password", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(validatedData),
      })

      if (response.ok) {
        setState((prev) => ({ ...prev, success: true }))
      } else {
        const data = await response.json()
        setState((prev) => ({ ...prev, error: data.error || "Ocurrió un error al restablecer tu contraseña" }))
      }
    } catch (error) {
      let errorMessage = "Ocurrió un error inesperado"
      if (error instanceof ZodError) {
        errorMessage = error.errors.map((err) => err.message).join(". ")
      } else if (error instanceof Error) {
        errorMessage = error.message
      }
      setState((prev) => ({ ...prev, error: errorMessage }))
    } finally {
      setState((prev) => ({ ...prev, isLoading: false }))
    }
  }

  if (state.success) {
    return (
      <div className="max-w-md mx-auto mt-8">
        <Notification
          type="success"
          title="Contraseña restablecida"
          message="Tu contraseña ha sido restablecida exitosamente. Ya puedes iniciar sesión con tu nueva contraseña."
        />
        <Button className="mt-4 w-full" onClick={() => router.push("/login")}>
          Ir a Iniciar Sesión
        </Button>
      </div>
    )
  }

  return (
    <div className="max-w-md mx-auto mt-8">
      <h1 className="text-2xl font-bold mb-4">Establecer nueva contraseña</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        {state.error && <Notification type="error" title="Error al restablecer la contraseña" message={state.error} />}
        <div className="space-y-2">
          <Label htmlFor="newPassword">Nueva contraseña</Label>
          <Input
            id="newPassword"
            type="password"
            value={state.newPassword}
            onChange={(e) => setState((prev) => ({ ...prev, newPassword: e.target.value }))}
            required
            minLength={8}
          />
        </div>
        <Button type="submit" className="w-full" disabled={state.isLoading}>
          {state.isLoading ? "Restableciendo..." : "Restablecer contraseña"}
        </Button>
      </form>
    </div>
  )
}

