"use client"

import { useState, useEffect, useCallback } from "react"
import { useParams, useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { toast } from "sonner"
import type { z } from "zod"
import { Loader2, ArrowLeft, Plus, Pencil, Trash2, Calendar, Syringe, AlertCircle } from "lucide-react"
import Link from "next/link"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { useUser } from "@/contexts/UserContext"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { healthCardSchema } from "@/lib/validations"
import { Textarea } from "@/components/ui/textarea"

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
import { AddVaccinationDialog } from "@/components/(auth)/components/pets/add-vaccination-dialog"

type HealthCardFormValues = z.infer<typeof healthCardSchema>

interface Pet {
  id: string
  name: string
  userId: string
  type: string
  breed: string | null
  healthCard: {
    id: string
    veterinarianName: string
    clinicName: string
    clinicAddress: string
    clinicPhone: string
    clinicEmail: string
    lastCheckupDate: string | null
    nextCheckupDate: string | null
    notes: string | null
    vaccinations: Vaccination[]
  } | null
  passport?: {
    veterinarianName: string
    clinicAddress: string
    clinicPhone: string
    clinicEmail: string
  } | null
}

interface Vaccination {
  id: string
  name: string
  date: string
  expiryDate: string | null
  batchNumber: string | null
  veterinarianName: string | null
  notes: string | null
}

export default function PetHealthCardPage() {
  const { user } = useUser()
  const params = useParams()
  const router = useRouter()
  const [pet, setPet] = useState<Pet | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [activeTab, setActiveTab] = useState("general")
  const [isAddVaccinationDialogOpen, setIsAddVaccinationDialogOpen] = useState(false)
  const [selectedVaccination, setSelectedVaccination] = useState<Vaccination | null>(null)
  const [isDeleteVaccinationDialogOpen, setIsDeleteVaccinationDialogOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const form = useForm<HealthCardFormValues>({
    resolver: zodResolver(healthCardSchema),
    defaultValues: {
      veterinarianName: "",
      clinicName: "",
      clinicAddress: "",
      clinicPhone: "",
      clinicEmail: "",
      lastCheckupDate: null,
      nextCheckupDate: null,
      notes: "",
    },
  })

  const fetchPet = useCallback(async () => {
    try {
      setIsLoading(true)
      const petId = params.id
      const response = await fetch(`/api/pets/${petId}`)

      if (response.ok) {
        const data = await response.json()
        console.log("Datos de mascota recibidos:", {
          id: data.id,
          name: data.name,
          userId: data.owner?.id,
          currentUserId: user?.id,
        })

        setPet({
          ...data,
          userId: data.owner?.id,
        })

        // Si la mascota tiene una cartilla sanitaria, cargar los datos en el formulario
        if (data.healthCard) {
          form.reset({
            veterinarianName: data.healthCard.veterinarianName,
            clinicName: data.healthCard.clinicName,
            clinicAddress: data.healthCard.clinicAddress,
            clinicPhone: data.healthCard.clinicPhone,
            clinicEmail: data.healthCard.clinicEmail,
            lastCheckupDate: data.healthCard.lastCheckupDate ? data.healthCard.lastCheckupDate.split("T")[0] : null,
            nextCheckupDate: data.healthCard.nextCheckupDate ? data.healthCard.nextCheckupDate.split("T")[0] : null,
            notes: data.healthCard.notes || "",
          })
        }
        // Si la mascota tiene pasaporte pero no cartilla, usar los datos del veterinario del pasaporte
        else if (data.passport) {
          form.reset({
            veterinarianName: data.passport.veterinarianName,
            clinicName: "",
            clinicAddress: data.passport.clinicAddress,
            clinicPhone: data.passport.clinicPhone,
            clinicEmail: data.passport.clinicEmail,
            lastCheckupDate: null,
            nextCheckupDate: null,
            notes: "",
          })
        }
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
  }, [params.id, router, form, user])

  useEffect(() => {
    fetchPet()
  }, [fetchPet])

  useEffect(() => {
    if (!isLoading && pet && user) {
      console.log("Verificando permisos:", {
        petUserId: pet.userId,
        currentUserId: user.id,
        isMatch: pet.userId === user.id,
      })

      if (pet.userId !== user.id) {
        toast.error("No tienes permiso para editar la cartilla sanitaria de esta mascota")
        router.push(`/pets/${params.id}`)
      }
    }
  }, [pet, user, isLoading, router, params.id])

  const onSubmit = async (data: HealthCardFormValues) => {
    if (!pet) return

    setIsSubmitting(true)
    try {
      const method = pet.healthCard ? "PUT" : "POST"
      const response = await fetch(`/api/pets/${pet.id}/health-card`, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        let errorMessage = `Error al ${pet.healthCard ? "actualizar" : "crear"} la cartilla sanitaria`

        try {
          const errorData = await response.json()
          if (errorData && errorData.error) {
            errorMessage = errorData.error
          }
        } catch (parseError) {
          console.error("Error parsing error response:", parseError)
        }

        toast.error(errorMessage)
        setIsSubmitting(false)
        return
      }

      toast.success(
        pet.healthCard ? "Cartilla sanitaria actualizada correctamente" : "Cartilla sanitaria creada correctamente",
      )

      // Refrescar los datos
      fetchPet()

      // Cambiar a la pestaña de vacunas si es una nueva cartilla
      if (!pet.healthCard) {
        setActiveTab("vaccinations")
      }
    } catch (error) {
      console.error("Error saving health card:", error)
      toast.error(error instanceof Error ? error.message : "Error al guardar la cartilla sanitaria")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleAddVaccination = () => {
    setSelectedVaccination(null)
    setIsAddVaccinationDialogOpen(true)
  }

  const handleEditVaccination = (vaccination: Vaccination) => {
    setSelectedVaccination(vaccination)
    setIsAddVaccinationDialogOpen(true)
  }

  const handleDeleteVaccination = (vaccination: Vaccination) => {
    setSelectedVaccination(vaccination)
    setIsDeleteVaccinationDialogOpen(true)
  }

  const confirmDeleteVaccination = async () => {
    if (!pet || !pet.healthCard || !selectedVaccination) return

    setIsDeleting(true)
    try {
      const response = await fetch(`/api/pets/${pet.id}/health-card/vaccinations/${selectedVaccination.id}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Error al eliminar la vacuna")
      }

      toast.success("Vacuna eliminada correctamente")
      setIsDeleteVaccinationDialogOpen(false)

      // Refrescar los datos
      fetchPet()
    } catch (error) {
      console.error("Error deleting vaccination:", error)
      toast.error(error instanceof Error ? error.message : "Error al eliminar la vacuna")
    } finally {
      setIsDeleting(false)
    }
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

  const hasExpiredVaccinations = pet.healthCard?.vaccinations.some(
    (v) => v.expiryDate && new Date(v.expiryDate) < new Date(),
  )

  const hasUpcomingVaccinations = pet.healthCard?.vaccinations.some(
    (v) =>
      v.expiryDate &&
      new Date(v.expiryDate) > new Date() &&
      new Date(v.expiryDate) < new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
  )

  return (
    <div className="container py-8 max-w-3xl">
      <div className="flex items-center mb-6">
        <Link href={`/pets/${pet.id}`} className="mr-4">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <h1 className="text-2xl font-bold">
          {pet.healthCard ? "Editar" : "Añadir"} cartilla sanitaria para {pet.name}
        </h1>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-2 mb-6">
          <TabsTrigger value="general">Información General</TabsTrigger>
          <TabsTrigger value="vaccinations" disabled={!pet.healthCard}>
            Vacunas
            {hasExpiredVaccinations && (
              <Badge variant="destructive" className="ml-2">
                <AlertCircle className="h-3 w-3 mr-1" />
                Caducadas
              </Badge>
            )}
            {!hasExpiredVaccinations && hasUpcomingVaccinations && (
              <Badge variant="outline" className="ml-2">
                <Calendar className="h-3 w-3 mr-1" />
                Próximas
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="general">
          <Card>
            <CardHeader>
              <CardTitle>{pet.healthCard ? "Editar" : "Añadir"} cartilla sanitaria</CardTitle>
              <CardDescription>
                Introduce la información general de la cartilla sanitaria de tu mascota. Esta información es importante
                para el seguimiento veterinario.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="veterinarianName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nombre del veterinario*</FormLabel>
                          <FormControl>
                            <Input placeholder="Ej: Dr. Juan Pérez" {...field} />
                          </FormControl>
                          <FormDescription>El nombre del veterinario principal</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="clinicName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nombre de la clínica*</FormLabel>
                          <FormControl>
                            <Input placeholder="Ej: Clínica Veterinaria Central" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="clinicAddress"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Dirección de la clínica*</FormLabel>
                        <FormControl>
                          <Input placeholder="Ej: Calle Principal 123" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="clinicPhone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Teléfono de la clínica*</FormLabel>
                          <FormControl>
                            <Input placeholder="Ej: +34 912345678" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="clinicEmail"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email de la clínica*</FormLabel>
                          <FormControl>
                            <Input placeholder="Ej: clinica@ejemplo.com" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="lastCheckupDate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Fecha del último chequeo</FormLabel>
                          <FormControl>
                            <Input
                              type="date"
                              {...field}
                              value={field.value || ""}
                              onChange={(e) => field.onChange(e.target.value || null)}
                            />
                          </FormControl>
                          <FormDescription>La fecha del último chequeo veterinario</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="nextCheckupDate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Fecha del próximo chequeo</FormLabel>
                          <FormControl>
                            <Input
                              type="date"
                              {...field}
                              value={field.value || ""}
                              onChange={(e) => field.onChange(e.target.value || null)}
                            />
                          </FormControl>
                          <FormDescription>La fecha programada para el próximo chequeo</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="notes"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Notas adicionales</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Información adicional relevante sobre la salud de tu mascota"
                            className="resize-none"
                            {...field}
                            value={field.value || ""}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="flex justify-end">
                    <Button type="submit" disabled={isSubmitting}>
                      {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      {pet.healthCard ? "Actualizar" : "Guardar"} cartilla sanitaria
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="vaccinations">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Vacunas de {pet.name}</h2>
            <Button onClick={handleAddVaccination}>
              <Plus className="h-4 w-4 mr-2" />
              Añadir vacuna
            </Button>
          </div>

          {pet.healthCard?.vaccinations && pet.healthCard.vaccinations.length > 0 ? (
            <div className="space-y-4">
              {pet.healthCard.vaccinations.map((vaccination) => {
                const isExpired = vaccination.expiryDate && new Date(vaccination.expiryDate) < new Date()
                const isExpiringSoon =
                  vaccination.expiryDate &&
                  new Date(vaccination.expiryDate) > new Date() &&
                  new Date(vaccination.expiryDate) < new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)

                return (
                  <Card
                    key={vaccination.id}
                    className={isExpired ? "border-destructive" : isExpiringSoon ? "border-yellow-500" : ""}
                  >
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-start">
                        <div className="flex items-center">
                          <Syringe className="h-5 w-5 mr-2 text-primary" />
                          <CardTitle className="text-lg">{vaccination.name}</CardTitle>
                          {isExpired && (
                            <Badge variant="destructive" className="ml-2">
                              Caducada
                            </Badge>
                          )}
                          {isExpiringSoon && (
                            <Badge variant="outline" className="ml-2 border-yellow-500 text-yellow-500">
                              Próxima a caducar
                            </Badge>
                          )}
                        </div>
                        <div className="flex gap-2">
                          <Button variant="ghost" size="sm" onClick={() => handleEditVaccination(vaccination)}>
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => handleDeleteVaccination(vaccination)}>
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </div>
                      <CardDescription>
                        Administrada el {new Date(vaccination.date).toLocaleDateString()}
                        {vaccination.veterinarianName && ` por ${vaccination.veterinarianName}`}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="pb-2">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                        {vaccination.expiryDate && (
                          <div>
                            <span className="font-medium">Fecha de expiración:</span>{" "}
                            {new Date(vaccination.expiryDate).toLocaleDateString()}
                          </div>
                        )}
                        {vaccination.batchNumber && (
                          <div>
                            <span className="font-medium">Número de lote:</span> {vaccination.batchNumber}
                          </div>
                        )}
                      </div>
                      {vaccination.notes && (
                        <div className="mt-2 text-sm">
                          <span className="font-medium">Notas:</span> {vaccination.notes}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-8">
                <Syringe className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-lg font-medium mb-2">No hay vacunas registradas</p>
                <p className="text-sm text-muted-foreground mb-4">
                  Añade las vacunas de tu mascota para llevar un control de su historial sanitario
                </p>
                <Button onClick={handleAddVaccination}>
                  <Plus className="h-4 w-4 mr-2" />
                  Añadir primera vacuna
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {/* Diálogo para añadir/editar vacuna */}
      <AddVaccinationDialog
        open={isAddVaccinationDialogOpen}
        onOpenChange={setIsAddVaccinationDialogOpen}
        petId={pet.id}
        petName={pet.name}
        existingVaccination={selectedVaccination}
      />

      {/* Diálogo de confirmación para eliminar vacuna */}
      <AlertDialog open={isDeleteVaccinationDialogOpen} onOpenChange={setIsDeleteVaccinationDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción eliminará permanentemente la vacuna {selectedVaccination?.name} y no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDeleteVaccination}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={isDeleting}
            >
              {isDeleting ? "Eliminando..." : "Eliminar vacuna"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

