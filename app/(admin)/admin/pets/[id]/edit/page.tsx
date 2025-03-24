"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { ArrowLeft, Save } from "lucide-react"
import { toast } from "sonner"

// Actualizar la interfaz PetFormData para incluir más campos
interface PetFormData {
  name: string
  type: string
  breed: string
  age: string
  description: string
  image: string
  // No incluimos los campos del pasaporte aquí ya que eso sería mejor
  // manejarlo en una página separada debido a su complejidad
}

export default function EditPetPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [formData, setFormData] = useState<PetFormData>({
    name: "",
    type: "",
    breed: "",
    age: "",
    description: "",
    image: "",
  })

  // Actualizar el useEffect para manejar los datos adicionales
  useEffect(() => {
    const fetchPet = async () => {
      setIsLoading(true)
      setError(null)
      try {
        console.log(`Fetching pet with ID: ${params.id}`)
        const response = await fetch(`/api/admin/pets/${params.id}`)

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}))
          const errorMessage = errorData.error || `Error: ${response.status}`
          console.error(`API error: ${errorMessage}`)
          setError(errorMessage)
          throw new Error(errorMessage)
        }

        const petData = await response.json()
        console.log("Pet data received:", petData)
        setFormData({
          name: petData.name,
          type: petData.type,
          breed: petData.breed || "",
          age: petData.age ? String(petData.age) : "",
          description: petData.description || "",
          image: petData.image || "",
        })
      } catch (error) {
        console.error("Error fetching pet:", error)
        toast.error("Error al cargar los datos de la mascota")
        setError(error instanceof Error ? error.message : "Error desconocido")
      } finally {
        setIsLoading(false)
      }
    }

    if (params.id) {
      fetchPet()
    }
  }, [params.id])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleTypeChange = (value: string) => {
    setFormData((prev) => ({ ...prev, type: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)

    try {
      // Validaciones básicas
      if (!formData.name.trim()) {
        toast.error("El nombre de la mascota es obligatorio")
        setIsSaving(false)
        return
      }

      if (!formData.type) {
        toast.error("El tipo de mascota es obligatorio")
        setIsSaving(false)
        return
      }

      const response = await fetch(`/api/admin/pets/${params.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          age: formData.age ? Number.parseInt(formData.age) : null,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || `Error: ${response.status}`)
      }

      toast.success("Mascota actualizada correctamente")
      router.push(`/admin/pets/${params.id}`)
    } catch (error) {
      console.error("Error updating pet:", error)
      toast.error("Error al actualizar la mascota")
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <p>Cargando datos de la mascota...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Button variant="outline" size="icon" onClick={() => router.push("/admin/pets")}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Error al cargar la mascota</CardTitle>
            <CardDescription>{error}</CardDescription>
          </CardHeader>
          <CardFooter>
            <Button onClick={() => router.push("/admin/pets")}>Volver a la lista de mascotas</Button>
          </CardFooter>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={() => router.push(`/admin/pets/${params.id}`)}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-3xl font-bold tracking-tight">Editar Mascota</h1>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>Información de la Mascota</CardTitle>
            <CardDescription>Edita los datos básicos de la mascota</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nombre</Label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="Nombre de la mascota"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="type">Tipo</Label>
              <Select value={formData.type} onValueChange={handleTypeChange}>
                <SelectTrigger id="type">
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
              <Input
                id="breed"
                name="breed"
                value={formData.breed}
                onChange={handleInputChange}
                placeholder="Raza de la mascota"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="age">Edad (años)</Label>
              <Input
                id="age"
                name="age"
                type="number"
                value={formData.age}
                onChange={handleInputChange}
                placeholder="Edad de la mascota"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="image">URL de la imagen</Label>
              <Input
                id="image"
                name="image"
                value={formData.image}
                onChange={handleInputChange}
                placeholder="URL de la imagen de la mascota"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Descripción</Label>
              <Textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Descripción de la mascota"
                rows={4}
              />
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="outline" type="button" onClick={() => router.push(`/admin/pets/${params.id}`)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isSaving}>
              <Save className="mr-2 h-4 w-4" />
              {isSaving ? "Guardando..." : "Guardar cambios"}
            </Button>
          </CardFooter>
        </Card>
      </form>
    </div>
  )
}

