"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowLeft, Edit, Trash, Eye, EyeOff } from "lucide-react"
import { toast } from "sonner"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Pet } from "@/types"



export default function PetDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [pet, setPet] = useState<Pet | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

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

        // Añadir el campo status si no existe
        const petWithStatus = {
          ...petData,
          status: petData.status || "active", // Por defecto activo
        }

        setPet(petWithStatus)
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

  const handleStatusChange = async (newStatus: "active" | "hidden" | "reported") => {
    try {
      const response = await fetch(`/api/admin/pets/${params.id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || `Error: ${response.status}`)
      }

      // Actualizar la mascota localmente
      if (pet) {
        setPet({
          ...pet,
          status: newStatus,
        })
      }

      toast.success(
        `Mascota ${newStatus === "active" ? "activada" : newStatus === "hidden" ? "ocultada" : "reportada"} correctamente`,
      )
    } catch (error) {
      console.error("Error updating pet status:", error)
      toast.error("Error al actualizar el estado de la mascota")
    }
  }

  const handleDeletePet = async () => {
    if (!confirm("¿Estás seguro de que quieres eliminar esta mascota? Esta acción no se puede deshacer.")) {
      return
    }

    try {
      const response = await fetch(`/api/admin/pets/${params.id}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        const errorMessage = errorData.error || `Error: ${response.status}`
        console.error("Error details:", errorData)
        throw new Error(errorMessage)
      }

      toast.success("Mascota eliminada correctamente")
      router.push("/admin/pets")
    } catch (error) {
      console.error("Error deleting pet:", error)
      toast.error(`Error al eliminar la mascota: ${error instanceof Error ? error.message : "Error desconocido"}`)
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

  if (!pet) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Button variant="outline" size="icon" onClick={() => router.push("/admin/pets")}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Mascota no encontrada</CardTitle>
            <CardDescription>La mascota solicitada no existe o ha sido eliminada</CardDescription>
          </CardHeader>
          <CardFooter>
            <Button onClick={() => router.push("/admin/pets")}>Volver a la lista de mascotas</Button>
          </CardFooter>
        </Card>
      </div>
    )
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge variant="default">Activa</Badge>
      case "hidden":
        return <Badge variant="secondary">Oculta</Badge>
      case "reported":
        return <Badge variant="destructive">Reportada</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={() => router.push("/admin/pets")}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-3xl font-bold tracking-tight">Detalles de la Mascota</h1>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => router.push(`/admin/pets/${params.id}/edit`)}>
            <Edit className="mr-2 h-4 w-4" />
            Editar
          </Button>
          {pet.status === "active" ? (
            <Button variant="outline" onClick={() => handleStatusChange("hidden")}>
              <EyeOff className="mr-2 h-4 w-4" />
              Ocultar
            </Button>
          ) : pet.status === "hidden" ? (
            <Button variant="outline" onClick={() => handleStatusChange("active")}>
              <Eye className="mr-2 h-4 w-4" />
              Activar
            </Button>
          ) : (
            <Button variant="outline" onClick={() => handleStatusChange("active")}>
              <Eye className="mr-2 h-4 w-4" />
              Aprobar
            </Button>
          )}
          <Button variant="destructive" onClick={handleDeletePet}>
            <Trash className="mr-2 h-4 w-4" />
            Eliminar
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Información de la Mascota</CardTitle>
            <CardDescription>Datos básicos de la mascota</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex flex-col items-center gap-4 sm:flex-row">
              <Avatar className="h-20 w-20">
                <AvatarImage src={pet.image || undefined} alt={pet.name} />
                <AvatarFallback>{pet.name.substring(0, 2).toUpperCase()}</AvatarFallback>
              </Avatar>
              <div>
                <h3 className="text-xl font-semibold">{pet.name}</h3>
                <p className="text-sm text-muted-foreground">
                  {pet.type} - {pet.breed || "Sin raza especificada"}
                </p>
                <div className="flex items-center gap-2 mt-2">
                  {getStatusBadge(pet.status || "active")}
                  {pet.age && <Badge variant="outline">{pet.age} años</Badge>}
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">ID:</span>
                <span className="text-sm font-mono">{pet.id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Fecha de registro:</span>
                <span className="text-sm">{new Date(pet.createdAt).toLocaleDateString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Seguidores:</span>
                <span className="text-sm">{pet._count?.followers || 0}</span>
              </div>
            </div>

            {pet.description && (
              <div className="space-y-2">
                <span className="text-sm font-medium">Descripción:</span>
                <p className="text-sm">{pet.description}</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Información del Dueño</CardTitle>
            <CardDescription>Datos del propietario de la mascota</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center gap-4">
              <Avatar>
                <AvatarImage src={pet.user?.profileImage || undefined} alt={pet.user?.username} />
                <AvatarFallback>
                  {pet.user?.username ? pet.user.username.substring(0, 2).toUpperCase() : "??"}
                </AvatarFallback>
              </Avatar>
              <div>
                <h3 className="font-semibold">{pet.user?.username}</h3>
                <p className="text-sm text-muted-foreground">{pet.user?.email}</p>
              </div>
            </div>

            <Button variant="outline" className="w-full" onClick={() => router.push(`/admin/users/${pet.userId}`)}>
              Ver perfil del dueño
            </Button>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="followers">
        <TabsList>
          <TabsTrigger value="followers">Seguidores</TabsTrigger>
          <TabsTrigger value="posts">Publicaciones</TabsTrigger>
          <TabsTrigger value="health">Salud</TabsTrigger>
          <TabsTrigger value="passport">Pasaporte</TabsTrigger>
        </TabsList>
        <TabsContent value="followers" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Seguidores de la Mascota</CardTitle>
              <CardDescription>Usuarios que siguen a esta mascota</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-center py-8 text-muted-foreground">Funcionalidad en desarrollo</p>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="posts">
          <Card>
            <CardHeader>
              <CardTitle>Publicaciones de la Mascota</CardTitle>
              <CardDescription>Publicaciones relacionadas con esta mascota</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-center py-8 text-muted-foreground">Funcionalidad en desarrollo</p>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="health">
          <Card>
            <CardHeader>
              <CardTitle>Información de Salud</CardTitle>
              <CardDescription>Registros médicos y de salud de la mascota</CardDescription>
            </CardHeader>
            <CardContent>
              {pet.healthCard ? (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-medium mb-2">Vacunaciones</h3>
                    {pet.healthCard.vaccinations && pet.healthCard.vaccinations.length > 0 ? (
                      <div className="rounded-md border">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Nombre</TableHead>
                              <TableHead>Fecha</TableHead>
                              <TableHead>Próxima fecha</TableHead>
                              <TableHead>Veterinario</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {pet.healthCard.vaccinations.map((vaccination) => (
                              <TableRow key={vaccination.id}>
                                <TableCell>{vaccination.name}</TableCell>
                                <TableCell>{new Date(vaccination.date).toLocaleDateString()}</TableCell>
                                <TableCell>
                                  {vaccination.nextDueDate
                                    ? new Date(vaccination.nextDueDate).toLocaleDateString()
                                    : "N/A"}
                                </TableCell>
                                <TableCell>{vaccination.veterinarian || "N/A"}</TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground">No hay vacunaciones registradas</p>
                    )}
                  </div>

                  <div>
                    <h3 className="text-lg font-medium mb-2">Medicamentos</h3>
                    {pet.healthCard.medications && pet.healthCard.medications.length > 0 ? (
                      <div className="rounded-md border">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Nombre</TableHead>
                              <TableHead>Dosis</TableHead>
                              <TableHead>Frecuencia</TableHead>
                              <TableHead>Fecha inicio</TableHead>
                              <TableHead>Fecha fin</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {pet.healthCard.medications.map((medication) => (
                              <TableRow key={medication.id}>
                                <TableCell>{medication.name}</TableCell>
                                <TableCell>{medication.dosage}</TableCell>
                                <TableCell>{medication.frequency}</TableCell>
                                <TableCell>{new Date(medication.startDate).toLocaleDateString()}</TableCell>
                                <TableCell>
                                  {medication.endDate ? new Date(medication.endDate).toLocaleDateString() : "En curso"}
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground">No hay medicamentos registrados</p>
                    )}
                  </div>

                  <div>
                    <h3 className="text-lg font-medium mb-2">Historial médico</h3>
                    {pet.healthCard.medicalHistory && pet.healthCard.medicalHistory.length > 0 ? (
                      <div className="space-y-4">
                        {pet.healthCard.medicalHistory.map((record) => (
                          <Card key={record.id}>
                            <CardHeader className="pb-2">
                              <div className="flex justify-between items-center">
                                <CardTitle className="text-base">
                                  {new Date(record.date).toLocaleDateString()}
                                </CardTitle>
                                {record.veterinarian && <Badge variant="outline">Dr. {record.veterinarian}</Badge>}
                              </div>
                            </CardHeader>
                            <CardContent>
                              <p className="text-sm">{record.description}</p>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground">No hay registros médicos</p>
                    )}
                  </div>
                </div>
              ) : (
                <p className="text-center py-8 text-muted-foreground">
                  Esta mascota no tiene tarjeta de salud registrada
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="passport">
          <Card>
            <CardHeader>
              <CardTitle>Pasaporte de la Mascota</CardTitle>
              <CardDescription>Información del pasaporte oficial</CardDescription>
            </CardHeader>
            <CardContent>
              {pet.passport ? (
                <div className="grid gap-6 md:grid-cols-2">
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground">Información básica</h3>
                      <div className="grid grid-cols-2 gap-2 mt-2">
                        <div>
                          <p className="text-xs text-muted-foreground">Número de pasaporte</p>
                          <p className="text-sm font-medium">{pet.passport.passportNumber}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Fecha de emisión</p>
                          <p className="text-sm font-medium">
                            {new Date(pet.passport.issuedDate).toLocaleDateString()}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Fecha de expiración</p>
                          <p className="text-sm font-medium">
                            {pet.passport.expiryDate ? new Date(pet.passport.expiryDate).toLocaleDateString() : "N/A"}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">País emisor</p>
                          <p className="text-sm font-medium">{pet.passport.issuingCountry}</p>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground">Información del animal</h3>
                      <div className="grid grid-cols-2 gap-2 mt-2">
                        <div>
                          <p className="text-xs text-muted-foreground">Especie</p>
                          <p className="text-sm font-medium">{pet.passport.species}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Raza</p>
                          <p className="text-sm font-medium">{pet.passport.breed}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Sexo</p>
                          <p className="text-sm font-medium">{pet.passport.sex}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Fecha de nacimiento</p>
                          <p className="text-sm font-medium">
                            {new Date(pet.passport.dateOfBirth).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground">Identificación</h3>
                      <div className="grid grid-cols-2 gap-2 mt-2">
                        <div>
                          <p className="text-xs text-muted-foreground">Número de microchip</p>
                          <p className="text-sm font-medium">{pet.passport.microchipNumber || "N/A"}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Código del transpondedor</p>
                          <p className="text-sm font-medium">{pet.passport.transponderCode || "N/A"}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Fecha de lectura</p>
                          <p className="text-sm font-medium">
                            {pet.passport.transponderReadDate
                              ? new Date(pet.passport.transponderReadDate).toLocaleDateString()
                              : "N/A"}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Ubicación del transpondedor</p>
                          <p className="text-sm font-medium">{pet.passport.transponderLocation || "N/A"}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground">Tatuaje</h3>
                      <div className="grid grid-cols-2 gap-2 mt-2">
                        <div>
                          <p className="text-xs text-muted-foreground">Código del tatuaje</p>
                          <p className="text-sm font-medium">{pet.passport.tattooCode || "N/A"}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Fecha del tatuaje</p>
                          <p className="text-sm font-medium">
                            {pet.passport.tattooDate ? new Date(pet.passport.tattooDate).toLocaleDateString() : "N/A"}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Ubicación del tatuaje</p>
                          <p className="text-sm font-medium">{pet.passport.tattooLocation || "N/A"}</p>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground">Información del veterinario</h3>
                      <div className="space-y-2 mt-2">
                        <div>
                          <p className="text-xs text-muted-foreground">Nombre del veterinario</p>
                          <p className="text-sm font-medium">{pet.passport.veterinarianName}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Dirección de la clínica</p>
                          <p className="text-sm font-medium">{pet.passport.clinicAddress}</p>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <p className="text-xs text-muted-foreground">Código postal</p>
                            <p className="text-sm font-medium">{pet.passport.clinicPostalCode}</p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">Ciudad</p>
                            <p className="text-sm font-medium">{pet.passport.clinicCity}</p>
                          </div>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">País</p>
                          <p className="text-sm font-medium">{pet.passport.clinicCountry}</p>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <p className="text-xs text-muted-foreground">Teléfono</p>
                            <p className="text-sm font-medium">{pet.passport.clinicPhone}</p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">Email</p>
                            <p className="text-sm font-medium">{pet.passport.clinicEmail}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-center py-8 text-muted-foreground">Esta mascota no tiene pasaporte registrado</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

