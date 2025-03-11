"use client"

import { useState, useEffect, useCallback } from "react"
import { useParams, useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { toast } from "sonner"
import type { z } from "zod"
import { Loader2, ArrowLeft } from "lucide-react"
import Link from "next/link"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { useUser } from "@/contexts/UserContext"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { passportSchema } from "@/lib/validations"

type PassportFormValues = z.infer<typeof passportSchema>

interface Pet {
  id: string
  name: string
  userId: string
  type: string
  breed: string | null
  passport: {
    passportNumber: string
    issuedDate: string
    expiryDate?: string | null
    issuingCountry: string
    microchipNumber?: string | null
    species: string
    breed: string
    sex: string
    dateOfBirth: string
    transponderCode?: string | null
    transponderReadDate?: string | null
    transponderLocation?: string | null
    tattooCode?: string | null
    tattooDate?: string | null
    tattooLocation?: string | null
    veterinarianName: string
    clinicAddress: string
    clinicPostalCode: string
    clinicCity: string
    clinicCountry: string
    clinicPhone: string
    clinicEmail: string
  } | null
}

export default function PetPassportPage() {
  const { user } = useUser()
  const params = useParams()
  const router = useRouter()
  const [pet, setPet] = useState<Pet | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [activeTab, setActiveTab] = useState("general")

  const form = useForm<PassportFormValues>({
    resolver: zodResolver(passportSchema),
    defaultValues: {
      passportNumber: "",
      issuedDate: new Date().toISOString().split("T")[0],
      expiryDate: null,
      issuingCountry: "",
      microchipNumber: null,
      species: "",
      breed: "",
      sex: "male",
      dateOfBirth: new Date().toISOString().split("T")[0],
      transponderCode: null,
      transponderReadDate: null,
      transponderLocation: null,
      tattooCode: null,
      tattooDate: null,
      tattooLocation: null,
      veterinarianName: "",
      clinicAddress: "",
      clinicPostalCode: "",
      clinicCity: "",
      clinicCountry: "",
      clinicPhone: "",
      clinicEmail: "",
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

        if (data.passport) {
          form.reset({
            passportNumber: data.passport.passportNumber,
            issuedDate: data.passport.issuedDate.split("T")[0],
            expiryDate: data.passport.expiryDate ? data.passport.expiryDate.split("T")[0] : null,
            issuingCountry: data.passport.issuingCountry,
            microchipNumber: data.passport.microchipNumber || null,
            species: data.passport.species,
            breed: data.passport.breed,
            sex: data.passport.sex,
            dateOfBirth: data.passport.dateOfBirth.split("T")[0],
            transponderCode: data.passport.transponderCode || null,
            transponderReadDate: data.passport.transponderReadDate
              ? data.passport.transponderReadDate.split("T")[0]
              : null,
            transponderLocation: data.passport.transponderLocation || null,
            tattooCode: data.passport.tattooCode || null,
            tattooDate: data.passport.tattooDate ? data.passport.tattooDate.split("T")[0] : null,
            tattooLocation: data.passport.tattooLocation || null,
            veterinarianName: data.passport.veterinarianName,
            clinicAddress: data.passport.clinicAddress,
            clinicPostalCode: data.passport.clinicPostalCode,
            clinicCity: data.passport.clinicCity,
            clinicCountry: data.passport.clinicCountry,
            clinicPhone: data.passport.clinicPhone,
            clinicEmail: data.passport.clinicEmail,
          })
        } else {
          form.setValue("species", data.type || "")
          form.setValue("breed", data.breed || "")
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
        toast.error("No tienes permiso para editar el pasaporte de esta mascota")
        router.push(`/pets/${params.id}`)
      }
    }
  }, [pet, user, isLoading, router, params.id])

  const onSubmit = async (data: PassportFormValues) => {
    if (!pet) return

    setIsSubmitting(true)
    try {
      const method = pet.passport ? "PUT" : "POST"
      const response = await fetch(`/api/pets/${pet.id}/passport`, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        let errorMessage = `Error al ${pet.passport ? "actualizar" : "crear"} el pasaporte`

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

      toast.success(pet.passport ? "Pasaporte actualizado correctamente" : "Pasaporte añadido correctamente")
      router.push(`/pets/${pet.id}`)
    } catch (error) {
      console.error("Error saving passport:", error)
      toast.error(error instanceof Error ? error.message : "Error al guardar el pasaporte")
    } finally {
      setIsSubmitting(false)
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

  return (
    <div className="container py-8 max-w-3xl">
      <div className="flex items-center mb-6">
        <Link href={`/pets/${pet.id}`} className="mr-4">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <h1 className="text-2xl font-bold">
          {pet.passport ? "Editar" : "Añadir"} pasaporte para {pet.name}
        </h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{pet.passport ? "Editar" : "Añadir"} pasaporte</CardTitle>
          <CardDescription>
            Introduce la información del pasaporte de tu mascota. Esta información es importante para viajes y trámites
            oficiales.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid grid-cols-4 mb-6">
                  <TabsTrigger value="general">General</TabsTrigger>
                  <TabsTrigger value="animal">Animal</TabsTrigger>
                  <TabsTrigger value="identification">Identificación</TabsTrigger>
                  <TabsTrigger value="veterinarian">Veterinario</TabsTrigger>
                </TabsList>

                {/* Pestaña General */}
                <TabsContent value="general" className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="passportNumber"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Número de pasaporte*</FormLabel>
                          <FormControl>
                            <Input placeholder="Ej: ES123456789" {...field} />
                          </FormControl>
                          <FormDescription>El número único que identifica el pasaporte</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="issuingCountry"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>País emisor*</FormLabel>
                          <FormControl>
                            <Input placeholder="Ej: España" {...field} />
                          </FormControl>
                          <FormDescription>El país que emitió el pasaporte</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="issuedDate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Fecha de emisión*</FormLabel>
                          <FormControl>
                            <Input type="date" {...field} />
                          </FormControl>
                          <FormDescription>La fecha en que se emitió el pasaporte</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="expiryDate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Fecha de expiración (opcional)</FormLabel>
                          <FormControl>
                            <Input
                              type="date"
                              {...field}
                              value={field.value || ""}
                              onChange={(e) => field.onChange(e.target.value || null)}
                            />
                          </FormControl>
                          <FormDescription>La fecha en que expira el pasaporte (si aplica)</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="flex justify-end">
                    <Button type="button" onClick={() => setActiveTab("animal")}>
                      Siguiente: Información del animal
                    </Button>
                  </div>
                </TabsContent>

                {/* Pestaña Animal */}
                <TabsContent value="animal" className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="species"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Especie*</FormLabel>
                          <FormControl>
                            <Input placeholder="Ej: Canino, Felino" {...field} />
                          </FormControl>
                          <FormDescription>La especie del animal</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="breed"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Raza*</FormLabel>
                          <FormControl>
                            <Input placeholder="Ej: Labrador, Siamés" {...field} />
                          </FormControl>
                          <FormDescription>La raza del animal</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="sex"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Sexo*</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Selecciona el sexo" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="male">Macho</SelectItem>
                              <SelectItem value="female">Hembra</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormDescription>El sexo del animal</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="dateOfBirth"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Fecha de nacimiento*</FormLabel>
                          <FormControl>
                            <Input type="date" {...field} />
                          </FormControl>
                          <FormDescription>La fecha de nacimiento del animal</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="flex justify-between">
                    <Button type="button" variant="outline" onClick={() => setActiveTab("general")}>
                      Anterior
                    </Button>
                    <Button type="button" onClick={() => setActiveTab("identification")}>
                      Siguiente: Identificación
                    </Button>
                  </div>
                </TabsContent>

                {/* Pestaña Identificación */}
                <TabsContent value="identification" className="space-y-6">
                  <div>
                    <h3 className="text-lg font-medium mb-4">Información del microchip/transpondedor</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <FormField
                        control={form.control}
                        name="microchipNumber"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Número de microchip</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="Ej: 123456789012345"
                                {...field}
                                value={field.value || ""}
                                onChange={(e) => field.onChange(e.target.value || null)}
                              />
                            </FormControl>
                            <FormDescription>El número de identificación del microchip</FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="transponderCode"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Código del transpondedor</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="Ej: ABC123"
                                {...field}
                                value={field.value || ""}
                                onChange={(e) => field.onChange(e.target.value || null)}
                              />
                            </FormControl>
                            <FormDescription>
                              El código del transpondedor (si es diferente del microchip)
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                      <FormField
                        control={form.control}
                        name="transponderReadDate"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Fecha de lectura del transpondedor</FormLabel>
                            <FormControl>
                              <Input
                                type="date"
                                {...field}
                                value={field.value || ""}
                                onChange={(e) => field.onChange(e.target.value || null)}
                              />
                            </FormControl>
                            <FormDescription>La fecha en que se leyó el transpondedor</FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="transponderLocation"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Ubicación del transpondedor</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="Ej: Cuello, dorso"
                                {...field}
                                value={field.value || ""}
                                onChange={(e) => field.onChange(e.target.value || null)}
                              />
                            </FormControl>
                            <FormDescription>La ubicación del transpondedor en el cuerpo del animal</FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>

                  <Separator />

                  <div>
                    <h3 className="text-lg font-medium mb-4">Información del tatuaje (si aplica)</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <FormField
                        control={form.control}
                        name="tattooCode"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Código del tatuaje</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="Ej: XYZ789"
                                {...field}
                                value={field.value || ""}
                                onChange={(e) => field.onChange(e.target.value || null)}
                              />
                            </FormControl>
                            <FormDescription>El código del tatuaje de identificación</FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="tattooDate"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Fecha del tatuaje</FormLabel>
                            <FormControl>
                              <Input
                                type="date"
                                {...field}
                                value={field.value || ""}
                                onChange={(e) => field.onChange(e.target.value || null)}
                              />
                            </FormControl>
                            <FormDescription>La fecha en que se realizó el tatuaje</FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="mt-4">
                      <FormField
                        control={form.control}
                        name="tattooLocation"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Ubicación del tatuaje</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="Ej: Oreja, muslo"
                                {...field}
                                value={field.value || ""}
                                onChange={(e) => field.onChange(e.target.value || null)}
                              />
                            </FormControl>
                            <FormDescription>La ubicación del tatuaje en el cuerpo del animal</FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>

                  <div className="flex justify-between">
                    <Button type="button" variant="outline" onClick={() => setActiveTab("animal")}>
                      Anterior
                    </Button>
                    <Button type="button" onClick={() => setActiveTab("veterinarian")}>
                      Siguiente: Información del veterinario
                    </Button>
                  </div>
                </TabsContent>

                {/* Pestaña Veterinario */}
                <TabsContent value="veterinarian" className="space-y-6">
                  <div>
                    <h3 className="text-lg font-medium mb-4">Información del veterinario y la clínica</h3>
                    <div className="grid grid-cols-1 gap-6">
                      <FormField
                        control={form.control}
                        name="veterinarianName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Nombre del veterinario*</FormLabel>
                            <FormControl>
                              <Input placeholder="Ej: Dr. Juan Pérez" {...field} />
                            </FormControl>
                            <FormDescription>El nombre completo del veterinario responsable</FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

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
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                      <FormField
                        control={form.control}
                        name="clinicPostalCode"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Código postal*</FormLabel>
                            <FormControl>
                              <Input placeholder="Ej: 28001" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="clinicCity"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Ciudad*</FormLabel>
                            <FormControl>
                              <Input placeholder="Ej: Madrid" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                      <FormField
                        control={form.control}
                        name="clinicCountry"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>País*</FormLabel>
                            <FormControl>
                              <Input placeholder="Ej: España" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="clinicPhone"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Teléfono*</FormLabel>
                            <FormControl>
                              <Input placeholder="Ej: +34 912345678" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="mt-4">
                      <FormField
                        control={form.control}
                        name="clinicEmail"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email de la clínica*</FormLabel>
                            <FormControl>
                              <Input placeholder="Ej: clinica@ejemplo.com" {...field} />
                            </FormControl>
                            <FormDescription>El correo electrónico de contacto de la clínica</FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>

                  <div className="flex justify-between">
                    <Button type="button" variant="outline" onClick={() => setActiveTab("identification")}>
                      Anterior
                    </Button>
                    <Button type="submit" disabled={isSubmitting}>
                      {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      {pet.passport ? "Actualizar" : "Guardar"} pasaporte
                    </Button>
                  </div>
                </TabsContent>
              </Tabs>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  )
}

