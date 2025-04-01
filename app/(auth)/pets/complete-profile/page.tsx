"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { useUser } from "@/contexts/UserContext"

export default function CompletePetProfilePage() {
  const router = useRouter()
  const { user, loading } = useUser()
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [previewImage, setPreviewImage] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [petData, setPetData] = useState({
    name: "",
    type: "",
    breed: "",
    age: "",
    description: "",
    image: null as File | null,
  })

  useEffect(() => {
    const fetchBasicPetInfo = async () => {
      if (loading) return

      if (!user) {
        toast.error("Debes iniciar sesión para acceder a esta página")
        router.push("/login")
        return
      }

      try {
        const response = await fetch(`/api/profile/me`)

        if (!response.ok) {
          throw new Error("Error al cargar la información del perfil")
        }

        const profileData = await response.json()
        console.log("Datos del perfil cargados:", profileData)

        if (profileData.petName) {
          // Mostrar los datos que se están cargando
          console.log("Datos de mascota encontrados:", {
            nombre: profileData.petName,
            tipo: profileData.petType,
            imagen: profileData.petImage,
          })

          setPetData({
            name: profileData.petName || "",
            type: profileData.petType || "",
            breed: "",
            age: "",
            description: "",
            image: null,
          })

          // Si hay una imagen de mascota, establecerla como vista previa
          if (profileData.petImage) {
            console.log("Estableciendo imagen previa:", profileData.petImage)
            setPreviewImage(profileData.petImage)
          }
        } else {
          console.log("No se encontró información de mascota en el perfil")
          toast.error("No se encontró información básica de mascota en tu perfil")
          router.push("/pets/add")
        }
      } catch (error) {
        console.error("Error al cargar la información de la mascota:", error)
        toast.error("Error al cargar la información de la mascota")
      } finally {
        setIsLoading(false)
      }
    }

    fetchBasicPetInfo()
  }, [user, loading, router])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setPetData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSelectChange = (name: string, value: string) => {
    setPetData((prev) => ({ ...prev, [name]: value }))
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null

    if (file) {
      setPetData((prev) => ({ ...prev, image: file }))

      // Crear una URL para la vista previa de la imagen
      const reader = new FileReader()
      reader.onloadend = () => {
        setPreviewImage(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      // Validar datos
      if (!petData.name || !petData.type) {
        toast.error("Por favor completa los campos obligatorios")
        setIsSubmitting(false)
        return
      }

      // Crear FormData para enviar los datos, incluyendo la imagen
      const formData = new FormData()
      formData.append("name", petData.name)
      formData.append("type", petData.type)

      if (petData.breed) formData.append("breed", petData.breed)
      if (petData.age) formData.append("age", petData.age)
      if (petData.description) formData.append("description", petData.description)
      if (petData.image) formData.append("image", petData.image)

      // Añadir un campo para indicar que es una conversión de mascota básica
      formData.append("isBasicPetConversion", "true")

      // Enviar los datos al endpoint existente
      const response = await fetch("/api/pets", {
        method: "POST",
        body: formData,
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Error al guardar la mascota")
      }

      const result = await response.json()

      toast.success("Perfil de mascota completado con éxito")
      router.push(`/pets/${result.id}`)
    } catch (error) {
      console.error("Error al completar el perfil de la mascota:", error)
      toast.error("Error al guardar la información de la mascota")
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return <div className="container py-8">Cargando información de la mascota...</div>
  }

  return (
    <div className="container py-8">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Completar perfil de mascota</CardTitle>
          <CardDescription>Completa la información de tu mascota para crear un perfil completo</CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nombre de la mascota *</Label>
              <Input id="name" name="name" value={petData.name} onChange={handleChange} required />
            </div>

            <div className="space-y-2">
              <Label htmlFor="type">Tipo de mascota *</Label>
              <Select value={petData.type} onValueChange={(value) => handleSelectChange("type", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona un tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Perro">Perro</SelectItem>
                  <SelectItem value="Gato">Gato</SelectItem>
                  <SelectItem value="Ave">Ave</SelectItem>
                  <SelectItem value="Pez">Pez</SelectItem>
                  <SelectItem value="Reptil">Reptil</SelectItem>
                  <SelectItem value="Otro">Otro</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="breed">Raza</Label>
              <Input id="breed" name="breed" value={petData.breed} onChange={handleChange} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="age">Edad (años)</Label>
              <Input id="age" name="age" type="number" min="0" max="100" value={petData.age} onChange={handleChange} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Descripción</Label>
              <Textarea
                id="description"
                name="description"
                value={petData.description}
                onChange={handleChange}
                rows={4}
                placeholder="Cuéntanos sobre tu mascota..."
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="image">Imagen de la mascota</Label>
              <div className="flex flex-col items-center gap-4">
                {previewImage && (
                  <div className="relative w-full h-48 mb-2 border rounded-md overflow-hidden">
                    <Image
                      src={previewImage || "/placeholder.svg"}
                      alt="Vista previa de la mascota"
                      fill
                      className="object-cover"
                      onError={() => {
                        console.error("Error al cargar la imagen:", previewImage)
                        setPreviewImage("/placeholder.svg?height=300&width=300")
                      }}
                    />
                  </div>
                )}
                <Input
                  id="image"
                  name="image"
                  type="file"
                  accept="image/*"
                  ref={fileInputRef}
                  onChange={handleImageChange}
                  className="cursor-pointer"
                />
                <p className="text-sm text-muted-foreground">
                  {previewImage
                    ? "Ya tienes una imagen. Puedes seleccionar una nueva o mantener la actual."
                    : "Selecciona una imagen para tu mascota"}
                </p>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button type="button" variant="outline" onClick={() => router.back()} disabled={isSubmitting}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Guardando..." : "Guardar mascota"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}

