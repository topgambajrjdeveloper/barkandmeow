"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"
import type { RegisterInput } from "@/lib/validations"
import { getUserLocation, type LocationData } from "@/lib/location"
import { Checkbox } from "@/components/ui/checkbox"

export function RegisterForm() {
  const router = useRouter()
  const [formData, setFormData] = useState<RegisterInput>({
    username: "",
    email: "",
    password: "",
    profileImage: null,
    petName: "",
    petType: "",
    petImage: null,
    isPublicProfile: true,
    location: "",
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isLoading, setIsLoading] = useState(false)
  const [locationData, setLocationData] = useState<LocationData | null>(null)
  const [isLocating, setIsLocating] = useState(false)
  const [locationError, setLocationError] = useState<string | null>(null)

  const fetchLocation = async () => {
    setIsLocating(true)
    setLocationError(null)
    try {
      const location = await getUserLocation()
      setLocationData(location)
      if (location.city && location.country) {
        setFormData((prev) => ({
          ...prev,
          location: `${location.city}, ${location.country}`,
        }))
      } else {
        setLocationError("No se pudo determinar la ubicación exacta. Por favor, ingresa tu ubicación manualmente.")
      }
    } catch (error) {
      console.error("Error fetching location:", error)
      setLocationError("Hubo un problema al obtener tu ubicación. Por favor, ingresa tu ubicación manualmente.")
    } finally {
      setIsLocating(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked, files } = e.target
    if (type === "file" && files) {
      setFormData((prev) => ({
        ...prev,
        [name]: files[0],
      }))
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: type === "checkbox" ? checked : value,
      }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setErrors({})

    try {
      const formDataToSend = new FormData()
      Object.entries(formData).forEach(([key, value]) => {
        if (value instanceof File) {
          formDataToSend.append(key, value)
        } else if (typeof value === "boolean") {
          formDataToSend.append(key, value.toString())
        } else if (value !== null) {
          formDataToSend.append(key, value)
        }
      })

      if (locationData) {
        formDataToSend.append("latitude", locationData.latitude?.toString() || "")
        formDataToSend.append("longitude", locationData.longitude?.toString() || "")
      }

      const response = await fetch("/api/register", {
        method: "POST",
        body: formDataToSend,
      })

      const data = await response.json()

      if (!response.ok) {
        if (data.errors) {
          const fieldErrors: Record<string, string> = {}
          data.errors.forEach((error: { field: string; message: string }) => {
            fieldErrors[error.field] = error.message
          })
          setErrors(fieldErrors)
        } else {
          throw new Error(data.error || "Failed to register")
        }
        setIsLoading(false)
        return
      }

      router.push("/login?registered=true")
    } catch (error) {
      if (error instanceof Error) {
        setErrors({ form: error.message })
      } else {
        setErrors({ form: "An unexpected error occurred" })
      }
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {errors.form && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{errors.form}</AlertDescription>
        </Alert>
      )}

      <div className="space-y-2">
        <Label htmlFor="username">Nombre de usuario</Label>
        <Input id="username" name="username" value={formData.username} onChange={handleChange} required />
        {errors.username && <p className="text-red-500 text-sm">{errors.username}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input id="email" name="email" type="email" value={formData.email} onChange={handleChange} required />
        {errors.email && <p className="text-red-500 text-sm">{errors.email}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="password">Contraseña</Label>
        <Input
          id="password"
          name="password"
          type="password"
          value={formData.password}
          onChange={handleChange}
          required
        />
        {errors.password && <p className="text-red-500 text-sm">{errors.password}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="profileImage">Imagen de perfil</Label>
        <Input id="profileImage" name="profileImage" type="file" accept="image/*" onChange={handleChange} />
        {errors.profileImage && <p className="text-red-500 text-sm">{errors.profileImage}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="petName">Nombre de la mascota</Label>
        <Input id="petName" name="petName" value={formData.petName} onChange={handleChange} required />
        {errors.petName && <p className="text-red-500 text-sm">{errors.petName}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="petType">Tipo de mascota</Label>
        <Input id="petType" name="petType" value={formData.petType} onChange={handleChange} required />
        {errors.petType && <p className="text-red-500 text-sm">{errors.petType}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="petImage">Imagen de mascota</Label>
        <Input id="petImage" name="petImage" type="file" accept="image/*" onChange={handleChange} />
        {errors.petImage && <p className="text-red-500 text-sm">{errors.petImage}</p>}
      </div>

      <div className="flex items-center space-x-2">
        <Checkbox
          id="isPublicProfile"
          name="isPublicProfile"
          checked={formData.isPublicProfile}
          onCheckedChange={(checked) => setFormData((prev) => ({ ...prev, isPublicProfile: checked as boolean }))}
        />
        <Label htmlFor="isPublicProfile">Perfil público</Label>
      </div>

      <div className="space-y-2">
        <Label htmlFor="location">Localización</Label>
        <div className="flex space-x-2">
          <Input
            id="location"
            name="location"
            value={formData.location}
            onChange={handleChange}
            placeholder="Ingresa tu ubicación"
          />
          <Button type="button" onClick={fetchLocation} disabled={isLocating}>
            {isLocating ? "Localizando..." : "Detectar ubicación"}
          </Button>
        </div>
        {locationError && <p className="text-amber-500 text-sm">{locationError}</p>}
        {errors.location && <p className="text-red-500 text-sm">{errors.location}</p>}
      </div>

      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? "Registrando..." : "Registrarse"}
      </Button>

      <div className="text-center text-sm">
        ¿Ya tienes una cuenta?{" "}
        <Link href="/login" className="underline">
          Iniciar sesión
        </Link>
      </div>
    </form>
  )
}

