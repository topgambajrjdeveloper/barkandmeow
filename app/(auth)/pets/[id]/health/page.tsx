"use client"

import { useState, useEffect, useCallback } from "react"
import { useParams, useRouter } from "next/navigation"
import { toast } from "sonner"
import { ArrowLeft, Plus, Pencil, Trash2, Calendar, AlertCircle } from "lucide-react"
import Link from "next/link"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useUser } from "@/contexts/UserContext"
import { AddVaccinationDialog } from "@/components/(auth)/components/pets/add-vaccination-dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Badge } from "@/components/ui/badge"
import { VaccinationReminderInfo } from "@/components/(auth)/components/pets/vaccination-reminder-info"

interface Pet {
  id: string
  name: string
  userId: string
  healthCard: {
    id: string
    vaccinations: Vaccination[]
    medications: Medication[]
    medicalHistory: MedicalRecord[]
  } | null
}

// Actualizar la interfaz Vaccination para reflejar la estructura real de la base de datos
// Alrededor de la línea 30-40:
interface Vaccination {
  id: string
  name: string
  date: string
  // Eliminar nextDueDate ya que no existe en la base de datos
  expiryDate: string | null // Solo usar expiryDate
  veterinarianName: string | null
  batchNumber: string | null
  notes: string | null
}

interface Medication {
  id: string
  name: string
  dosage: string
  frequency: string
  startDate: string
  endDate: string | null
  notes: string | null
}

interface MedicalRecord {
  id: string
  date: string
  description: string
  veterinarian: string | null
  notes: string | null
}

export default function PetHealthPage() {
  const { user } = useUser()
  const params = useParams()
  const router = useRouter()
  const [pet, setPet] = useState<Pet | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("vaccinations")

  // Diálogos
  const [isVaccinationDialogOpen, setIsVaccinationDialogOpen] = useState(false)
  const [selectedVaccination, setSelectedVaccination] = useState<Vaccination | null>(null)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [itemToDelete, setItemToDelete] = useState<{ id: string; type: string } | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const fetchPet = useCallback(async () => {
    try {
      setIsLoading(true)
      const petId = params.id
      const response = await fetch(`/api/pets/${petId}`)

      if (response.ok) {
        const data = await response.json()
        setPet(data)
      } else {
        let errorMessage = `Error ${response.status}`
        try {
          const errorData = await response.json()
          if (errorData && errorData.error) {
            errorMessage = errorData.error
          }
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        } catch (e) {
          // Si no podemos analizar la respuesta como JSON, usar el mensaje de error genérico
        }
        toast.error(`Error al cargar la mascota: ${errorMessage}`)
        router.push(`/pets/${params.id}`)
      }
    } catch (error) {
      console.error("Error fetching pet:", error)
      toast.error("Error al cargar la mascota")
      router.push(`/pets/${params.id}`)
    } finally {
      setIsLoading(false)
    }
  }, [params.id, router])

  useEffect(() => {
    fetchPet()
  }, [fetchPet])

  useEffect(() => {
    if (!isLoading && pet && user) {
      if (pet.userId !== user.id) {
        toast.error("No tienes permiso para ver la cartilla sanitaria de esta mascota")
        router.push(`/pets/${params.id}`)
      }
    }
  }, [pet, user, isLoading, router, params.id])

  const handleAddVaccination = () => {
    setSelectedVaccination(null)
    setIsVaccinationDialogOpen(true)
  }

  const handleEditVaccination = (vaccination: Vaccination) => {
    setSelectedVaccination(vaccination)
    setIsVaccinationDialogOpen(true)
  }

  const handleDeleteItem = async () => {
    if (!itemToDelete || !pet) return

    setIsDeleting(true)
    try {
      let endpoint = ""

      if (itemToDelete.type === "vaccination") {
        endpoint = `/api/pets/${pet.id}/vaccinations?vaccinationId=${itemToDelete.id}`
      } else if (itemToDelete.type === "medication") {
        endpoint = `/api/pets/${pet.id}/medications?medicationId=${itemToDelete.id}`
      } else if (itemToDelete.type === "medicalRecord") {
        endpoint = `/api/pets/${pet.id}/medical-records?recordId=${itemToDelete.id}`
      }

      const response = await fetch(endpoint, {
        method: "DELETE",
      })

      if (response.ok) {
        toast.success(
          `${itemToDelete.type === "vaccination" ? "Vacuna" : itemToDelete.type === "medication" ? "Medicación" : "Registro médico"} eliminado correctamente`,
        )

        // Actualizar el estado local
        setPet((prev) => {
          if (!prev || !prev.healthCard) return prev

          const updatedHealthCard = { ...prev.healthCard }

          if (itemToDelete.type === "vaccination") {
            updatedHealthCard.vaccinations = updatedHealthCard.vaccinations.filter((v) => v.id !== itemToDelete.id)
          } else if (itemToDelete.type === "medication") {
            updatedHealthCard.medications = updatedHealthCard.medications.filter((m) => m.id !== itemToDelete.id)
          } else if (itemToDelete.type === "medicalRecord") {
            updatedHealthCard.medicalHistory = updatedHealthCard.medicalHistory.filter((r) => r.id !== itemToDelete.id)
          }

          return {
            ...prev,
            healthCard: updatedHealthCard,
          }
        })

        setIsDeleteDialogOpen(false)
      } else {
        const errorData = await response.json()
        throw new Error(
          errorData.error ||
            `Error al eliminar ${itemToDelete.type === "vaccination" ? "la vacuna" : itemToDelete.type === "medication" ? "la medicación" : "el registro médico"}`,
        )
      }
    } catch (error) {
      console.error(`Error deleting ${itemToDelete.type}:`, error)
      toast.error(
        error instanceof Error
          ? error.message
          : `Error al eliminar ${itemToDelete.type === "vaccination" ? "la vacuna" : itemToDelete.type === "medication" ? "la medicación" : "el registro médico"}`,
      )
    } finally {
      setIsDeleting(false)
    }
  }

  const confirmDelete = (id: string, type: string) => {
    setItemToDelete({ id, type })
    setIsDeleteDialogOpen(true)
  }

  if (isLoading) {
    return (
      <div className="container py-8 max-w-3xl">
        <div className="flex justify-center items-center min-h-[60vh]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p>Cargando...</p>
          </div>
        </div>
      </div>
    )
  }

  if (!pet) {
    return (
      <div className="container py-8 max-w-3xl">
        <div className="flex justify-center items-center min-h-[60vh]">
          <div className="text-center">
            <p className="text-xl font-semibold mb-4">No se pudo cargar la información de la mascota</p>
            <Button onClick={() => router.push(`/pets/${params.id}`)}>Volver al perfil</Button>
          </div>
        </div>
      </div>
    )
  }

  const hasUpcomingVaccinations =
    pet.healthCard?.vaccinations.some((v) => v.expiryDate && new Date(v.expiryDate) > new Date()) || false

  return (
    <div className="container py-8 max-w-3xl">
      <div className="flex items-center mb-6">
        <Link href={`/pets/${pet.id}`} className="mr-4">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <h1 className="text-2xl font-bold">Cartilla Sanitaria de {pet.name}</h1>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Calendar className="h-5 w-5 mr-2" />
            Resumen de Salud
          </CardTitle>
          <CardDescription>Información general sobre la salud de {pet.name}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex flex-wrap gap-2">
              <Badge variant={hasUpcomingVaccinations ? "default" : "outline"} className="flex items-center gap-1">
                {hasUpcomingVaccinations ? (
                  <>
                    <AlertCircle className="h-3 w-3" />
                    Vacunas pendientes
                  </>
                ) : (
                  "Vacunas al día"
                )}
              </Badge>
              <Badge variant="outline">{pet.healthCard?.vaccinations?.length || 0} vacunas registradas</Badge>
              <Badge variant="outline">{pet.healthCard?.medications?.length || 0} medicaciones</Badge>
              <Badge variant="outline">{pet.healthCard?.medicalHistory?.length || 0} registros médicos</Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Añadir el componente VaccinationReminderInfo */}
      <VaccinationReminderInfo petId={pet.id} petName={pet.name} hasUpcomingVaccinations={hasUpcomingVaccinations} />

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-3 mb-6">
          <TabsTrigger value="vaccinations">Vacunas</TabsTrigger>
          <TabsTrigger value="medications">Medicaciones</TabsTrigger>
          <TabsTrigger value="medicalHistory">Historial Médico</TabsTrigger>
        </TabsList>

        {/* Pestaña de Vacunas */}
        <TabsContent value="vaccinations" className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Vacunas</h2>
            <Button onClick={handleAddVaccination} className="flex items-center gap-1">
              <Plus className="h-4 w-4" />
              Añadir Vacuna
            </Button>
          </div>

          {!pet.healthCard || pet.healthCard.vaccinations.length === 0 ? (
            <Card>
              <CardContent className="pt-6 text-center">
                <p className="text-muted-foreground">No hay vacunas registradas para {pet.name}.</p>
                <p className="text-muted-foreground">Añade la primera vacuna para comenzar a llevar un registro.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {pet.healthCard.vaccinations
                .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                .map((vaccination) => (
                  <Card key={vaccination.id}>
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle>{vaccination.name}</CardTitle>
                          {/* Actualizar la visualización de las vacunas para usar expiryDate en lugar de nextDueDate
                          // Alrededor de la línea 220-230: */}
                          <CardDescription>
                            Fecha: {new Date(vaccination.date).toLocaleDateString()}
                            {vaccination.expiryDate && (
                              <span className="ml-2">
                                Próxima dosis: {new Date(vaccination.expiryDate).toLocaleDateString()}
                              </span>
                            )}
                          </CardDescription>
                        </div>
                        <div className="flex gap-2">
                          <Button variant="ghost" size="icon" onClick={() => handleEditVaccination(vaccination)}>
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-destructive"
                            onClick={() => confirmDelete(vaccination.id, "vaccination")}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      {/* Y también actualizar la referencia a veterinarian */}
                      {vaccination.veterinarianName && (
                        <p className="text-sm">
                          <span className="font-medium">Veterinario:</span> {vaccination.veterinarianName}
                        </p>
                      )}
                      {vaccination.notes && (
                        <p className="text-sm mt-2">
                          <span className="font-medium">Notas:</span> {vaccination.notes}
                        </p>
                      )}
                    </CardContent>
                  </Card>
                ))}
            </div>
          )}
        </TabsContent>

        {/* Pestaña de Medicaciones */}
        <TabsContent value="medications" className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Medicaciones</h2>
            <Button className="flex items-center gap-1">
              <Plus className="h-4 w-4" />
              Añadir Medicación
            </Button>
          </div>

          {!pet.healthCard || pet.healthCard.medications.length === 0 ? (
            <Card>
              <CardContent className="pt-6 text-center">
                <p className="text-muted-foreground">No hay medicaciones registradas para {pet.name}.</p>
                <p className="text-muted-foreground">Añade la primera medicación para comenzar a llevar un registro.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {/* Aquí irían las medicaciones cuando se implementen */}
              <p>Funcionalidad de medicaciones en desarrollo.</p>
            </div>
          )}
        </TabsContent>

        {/* Pestaña de Historial Médico */}
        <TabsContent value="medicalHistory" className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Historial Médico</h2>
            <Button className="flex items-center gap-1">
              <Plus className="h-4 w-4" />
              Añadir Registro
            </Button>
          </div>

          {!pet.healthCard || pet.healthCard.medicalHistory.length === 0 ? (
            <Card>
              <CardContent className="pt-6 text-center">
                <p className="text-muted-foreground">No hay registros médicos para {pet.name}.</p>
                <p className="text-muted-foreground">Añade el primer registro para comenzar a llevar un historial.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {/* Aquí irían los registros médicos cuando se implementen */}
              <p>Funcionalidad de historial médico en desarrollo.</p>
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Diálogo para añadir/editar vacuna */}
      <AddVaccinationDialog
        open={isVaccinationDialogOpen}
        onOpenChange={setIsVaccinationDialogOpen}
        petId={pet.id}
        petName={pet.name}
        existingVaccination={selectedVaccination}
      />

      {/* Diálogo de confirmación para eliminar */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción eliminará permanentemente{" "}
              {itemToDelete?.type === "vaccination"
                ? "la vacuna"
                : itemToDelete?.type === "medication"
                  ? "la medicación"
                  : "el registro médico"}
              y no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteItem}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={isDeleting}
            >
              {isDeleting ? "Eliminando..." : "Eliminar"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

