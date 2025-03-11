"use client"

import type React from "react"
import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { signIn } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Notification } from "@/components/notification"
import { loginSchema, type LoginInput } from "@/lib/validations"
import { useUser } from "@/contexts/UserContext"
import { toast } from "sonner"

export function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [formData, setFormData] = useState<LoginInput>({
    email: "",
    password: "",
  })
  const [rememberMe, setRememberMe] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const { setUser, refreshUser } = useUser() // Usar setUser del contexto actualizado

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      const validatedData = loginSchema.parse(formData)

      const result = await signIn("credentials", {
        email: validatedData.email,
        password: validatedData.password,
        redirect: false,
        callbackUrl: "/feed",
      })

      if (result?.error) {
        setError("Email o contraseña inválidos")
        toast.error("Email o contraseña inválidos")
        setIsLoading(false)
        return
      }

      if (result?.ok) {
        try {
          // Intentar refrescar los datos del usuario usando la función existente
          await refreshUser()
          toast.success("Inicio de sesión exitoso")
        } catch (refreshError) {
          console.error("Error al refrescar datos del usuario:", refreshError)
          // Si falla el refresh, intentar obtener los datos básicos de la sesión
          const userResponse = await fetch("/api/auth/session")
          if (userResponse.ok) {
            const sessionData = await userResponse.json()
            if (sessionData.user) {
              // Actualiza el contexto del usuario con datos básicos
              setUser({
                id: sessionData.user.id,
                name: sessionData.user.name,
                email: sessionData.user.email,
                profileImage: sessionData.user.image,
              })
            }
          }
        }

        // Redirige al usuario
        router.push("/feed")
        router.refresh()
      }
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message)
        toast.error(error.message)
      } else {
        setError("Ocurrió un error inesperado")
        toast.error("Ocurrió un error inesperado")
      }
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && <Notification type="error" title="Error de inicio de sesión" message={error} />}

      {searchParams.get("registered") === "true" && (
        <Notification
          type="success"
          title="Registro exitoso"
          message="Tu cuenta ha sido creada. Por favor, inicia sesión."
        />
      )}

      <div className="space-y-2">
        <Label htmlFor="email">Correo electrónico</Label>
        <Input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          value={formData.email}
          onChange={handleChange}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="password">Contraseña</Label>
        <Input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          value={formData.password}
          onChange={handleChange}
        />
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Checkbox
            id="remember-me"
            name="remember-me"
            checked={rememberMe}
            onCheckedChange={(checked) => setRememberMe(checked as boolean)}
          />
          <Label htmlFor="remember-me" className="text-sm">
            Recordarme
          </Label>
        </div>

        <Link href="/forgot-password" className="text-sm font-medium text-primary hover:underline">
          ¿Olvidaste tu contraseña?
        </Link>
      </div>

      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? "Iniciando sesión..." : "Iniciar sesión"}
      </Button>
    </form>
  )
}

