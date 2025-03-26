"use client"

import React,{use} from "react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { ArrowLeft, Save } from "lucide-react"
import { toast } from "sonner"

interface TeamMemberFormData {
  name: string
  role: string
  bio: string
  image: string | null
  order: number
  isFounder: boolean
  twitter: string | null
  instagram: string | null
  facebook: string | null
  linkedin: string | null
  github: string | null
}

export default function EditTeamMemberPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Usar React.use() para desenvolver la promesa de params
  const { id } = use(params)

  const [formData, setFormData] = useState<TeamMemberFormData>({
    name: "",
    role: "",
    bio: "",
    image: null,
    order: 0,
    isFounder: false,
    twitter: null,
    instagram: null,
    facebook: null,
    linkedin: null,
    github: null,
  })

  useEffect(() => {
    const fetchTeamMember = async () => {
      setIsLoading(true)
      setError(null)
      try {
        console.log(`Fetching team member with ID: ${id}`)
        const response = await fetch(`/api/admin/team/${id}`)

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}))
          const errorMessage = errorData.error || `Error: ${response.status}`
          console.error(`API error: ${errorMessage}`)
          setError(errorMessage)
          throw new Error(errorMessage)
        }

        const teamMemberData = await response.json()
        console.log("Team member data received:", teamMemberData)

        // Asegurarse de que los campos nulos se conviertan a strings vacíos
        setFormData({
          name: teamMemberData.name || "",
          role: teamMemberData.role || "",
          bio: teamMemberData.bio || "",
          image: teamMemberData.image || null,
          order: teamMemberData.order || 0,
          isFounder: teamMemberData.isFounder || false,
          twitter: teamMemberData.twitter || null,
          instagram: teamMemberData.instagram || null,
          facebook: teamMemberData.facebook || null,
          linkedin: teamMemberData.linkedin || null,
          github: teamMemberData.github || null,
        })
      } catch (error) {
        console.error("Error fetching team member:", error)
        toast.error("Error al cargar los datos del miembro del equipo")
        setError(error instanceof Error ? error.message : "Error desconocido")
      } finally {
        setIsLoading(false)
      }
    }

    if (id) {
      fetchTeamMember()
    }
  }, [id])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: Number.parseInt(value) || 0 }))
  }

  const handleSwitchChange = (checked: boolean) => {
    setFormData((prev) => ({ ...prev, isFounder: checked }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)

    try {
      // Crear una copia de formData para procesar
      const dataToSubmit = { ...formData }

      // Convertir strings vacíos de redes sociales a null para pasar la validación
      if (!dataToSubmit.twitter) dataToSubmit.twitter = null
      if (!dataToSubmit.instagram) dataToSubmit.instagram = null
      if (!dataToSubmit.facebook) dataToSubmit.facebook = null
      if (!dataToSubmit.linkedin) dataToSubmit.linkedin = null
      if (!dataToSubmit.github) dataToSubmit.github = null

      // Convertir imagen vacía a null si es necesario
      if (!dataToSubmit.image) dataToSubmit.image = null

      const response = await fetch(`/api/admin/team/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dataToSubmit),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || `Error: ${response.status}`)
      }

      toast.success("Miembro del equipo actualizado correctamente")
      router.push("/admin/team")
    } catch (error) {
      console.error("Error updating team member:", error)
      toast.error("Error al actualizar el miembro del equipo")
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <p>Cargando datos del miembro del equipo...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Button variant="outline" size="icon" onClick={() => router.push("/admin/team")}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Error al cargar el miembro del equipo</CardTitle>
          </CardHeader>
          <CardContent>
            <p>{error}</p>
          </CardContent>
          <CardFooter>
            <Button onClick={() => router.push("/admin/team")}>Volver a la lista del equipo</Button>
          </CardFooter>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={() => router.push("/admin/team")}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-3xl font-bold tracking-tight">Editar Miembro del Equipo</h1>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>Información del Miembro</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nombre</Label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Nombre completo"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="role">Rol / Cargo</Label>
                <Input
                  id="role"
                  name="role"
                  value={formData.role}
                  onChange={handleInputChange}
                  placeholder="Ej: Desarrollador Full Stack"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="bio">Biografía</Label>
              <Textarea
                id="bio"
                name="bio"
                value={formData.bio}
                onChange={handleInputChange}
                placeholder="Breve descripción profesional"
                rows={4}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="image">URL de la imagen</Label>
              <Input
                id="image"
                name="image"
                value={formData.image || ""}
                onChange={handleInputChange}
                placeholder="https://ejemplo.com/imagen.jpg"
              />
              <p className="text-sm text-muted-foreground">Recomendado: imagen cuadrada de al menos 300x300 píxeles</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="order">Orden de aparición</Label>
              <Input
                id="order"
                name="order"
                type="number"
                value={formData.order.toString()}
                onChange={handleNumberChange}
                min="0"
              />
              <p className="text-sm text-muted-foreground">
                Los miembros se mostrarán ordenados de menor a mayor valor
              </p>
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="isFounder">¿Es fundador?</Label>
                <p className="text-sm text-muted-foreground">Marcar si este miembro es fundador de BarkAndMeow</p>
              </div>
              <Switch id="isFounder" checked={formData.isFounder} onCheckedChange={handleSwitchChange} />
            </div>
          </CardContent>

          <CardHeader>
            <CardTitle>Redes Sociales</CardTitle>
            <p className="text-sm text-muted-foreground">Todos los campos son opcionales</p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="twitter">Twitter</Label>
                <Input
                  id="twitter"
                  name="twitter"
                  value={formData.twitter || ""}
                  onChange={handleInputChange}
                  placeholder="https://twitter.com/username"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="instagram">Instagram</Label>
                <Input
                  id="instagram"
                  name="instagram"
                  value={formData.instagram || ""}
                  onChange={handleInputChange}
                  placeholder="https://instagram.com/username"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="facebook">Facebook</Label>
                <Input
                  id="facebook"
                  name="facebook"
                  value={formData.facebook || ""}
                  onChange={handleInputChange}
                  placeholder="https://facebook.com/username"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="linkedin">LinkedIn</Label>
                <Input
                  id="linkedin"
                  name="linkedin"
                  value={formData.linkedin || ""}
                  onChange={handleInputChange}
                  placeholder="https://linkedin.com/in/username"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="github">GitHub</Label>
              <Input
                id="github"
                name="github"
                value={formData.github || ""}
                onChange={handleInputChange}
                placeholder="https://github.com/username"
              />
            </div>
          </CardContent>

          <CardFooter className="flex justify-between">
            <Button variant="outline" type="button" onClick={() => router.push("/admin/team")}>
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

