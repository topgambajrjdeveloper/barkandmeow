"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { toast } from "sonner"
import Link from "next/link"
import Image from "next/image"
import { formatNumber } from "@/lib/followerNumber"
import { useUser } from "@/contexts/UserContext"
import { PawPrint, Heart, MessageCircle, Share2, Pencil, Trash2 } from "lucide-react"
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

interface PetOwner {
  id: string
  username: string
  profileImage: string | null
}

interface Follower {
  id: string
  username: string
  profileImage: string | null
}

interface Passport {
  passportNumber: string
  issuedDate: string
  expiryDate: string | null
  issuingCountry: string
  microchipNumber: string | null
}

// Actualizar la interfaz Pet para incluir healthCard
interface Pet {
  id: string
  name: string
  type: string
  breed: string | null
  age: number | null
  image: string | null
  description: string | null
  owner: PetOwner
  isFollowing: boolean
  followersCount: number
  followers: Follower[]
  passport: Passport | null
  healthCard?: {
    id: string
    vaccinations: {
      id: string
      name: string
      date: string
      expiryDate: string | null
    }[]
  } | null
  createdAt: string
  updatedAt: string
}

export default function PetProfilePage() {
  const { user } = useUser()
  const params = useParams()
  const router = useRouter()
  const [pet, setPet] = useState<Pet | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isDeletePassportDialogOpen, setIsDeletePassportDialogOpen] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  useEffect(() => {
    const fetchPet = async () => {
      try {
        setIsLoading(true)
        const petId = params.id
        const response = await fetch(`/api/pets/${petId}`)

        if (response.ok) {
          const data = await response.json()
          setPet(data)
        } else {
          // Usar un enfoque más seguro para manejar errores
          let errorMessage = `Error ${response.status}`
          try {
            const errorData = await response.text()
            if (errorData) {
              errorMessage += `: ${errorData}`
            }
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          } catch (parseError) {
            // Si no podemos analizar la respuesta, simplemente usamos el código de estado
          }

          // Registrar el error de forma segura
          console.error("Error al cargar el perfil de la mascota:", errorMessage)
          toast.error("Error al cargar el perfil de la mascota")
        }
      } catch (error) {
        // Manejar errores de red o excepciones inesperadas
        console.error(
          "Error al cargar el perfil de la mascota:",
          error instanceof Error ? error.message : "Error desconocido",
        )
        toast.error("Error al cargar el perfil de la mascota")
      } finally {
        setIsLoading(false)
      }
    }

    fetchPet()
  }, [params.id])

  const handleFollow = async () => {
    if (!pet) return

    try {
      const response = await fetch("/api/follow", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ targetId: pet.id, type: "pet" }),
      })

      if (response.ok) {
        setPet((prev) =>
          prev
            ? {
                ...prev,
                isFollowing: !prev.isFollowing,
                followersCount: prev.isFollowing ? prev.followersCount - 1 : prev.followersCount + 1,
              }
            : null,
        )

        toast.success(pet.isFollowing ? "Mascota dejada de seguir" : "Mascota seguida")
      } else {
        toast.error("Error al realizar la acción de seguir")
      }
    } catch (error) {
      console.error("Error al seguir/dejar de seguir:", error)
      toast.error("Error al realizar la acción de seguir")
    }
  }

  const handleDeletePassport = async () => {
    if (!pet) return

    setIsDeleting(true)
    try {
      const response = await fetch(`/api/pets/${pet.id}/passport`, {
        method: "DELETE",
      })

      if (response.ok) {
        toast.success("Pasaporte eliminado correctamente")
        // Actualizar el estado local
        setPet((prev) => (prev ? { ...prev, passport: null } : null))
        setIsDeletePassportDialogOpen(false)
      } else {
        const errorData = await response.json()
        throw new Error(errorData.error || "Error al eliminar el pasaporte")
      }
    } catch (error) {
      console.error("Error deleting passport:", error)
      toast.error(error instanceof Error ? error.message : "Error al eliminar el pasaporte")
    } finally {
      setIsDeleting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Cargando perfil de mascota...</p>
        </div>
      </div>
    )
  }

  if (!pet) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="text-center">
          <p className="text-xl font-semibold mb-4">No se pudo cargar el perfil de la mascota.</p>
          <Button onClick={() => router.push("/feed")}>Volver al feed</Button>
        </div>
      </div>
    )
  }

  const isOwner = user?.id === pet.owner.id

  return (
    <div className="container py-8">
      {/* Encabezado del perfil de mascota */}
      <div className="mb-8 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1">
          <div className="aspect-square relative rounded-lg overflow-hidden">
            <Image
              src={pet.image || "/placeholder.svg?height=400&width=400"}
              alt={pet.name}
              fill
              className="object-cover"
            />
          </div>
        </div>

        <div className="md:col-span-2 space-y-4">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold">{pet.name}</h1>
              <p className="text-lg text-muted-foreground">
                {pet.type} • {pet.breed || "Sin raza especificada"}
                {pet.age && ` • ${pet.age} años`}
              </p>
            </div>

            <div className="flex gap-2">
              {isOwner ? (
                <Button variant="outline">Editar perfil</Button>
              ) : (
                <Button variant={pet.isFollowing ? "outline" : "default"} onClick={handleFollow}>
                  {pet.isFollowing ? "Siguiendo" : "Seguir"}
                </Button>
              )}
            </div>
          </div>

          <div className="flex gap-4">
            <div>
              <p className="text-lg font-semibold">{formatNumber(pet.followersCount)}</p>
              <p className="text-sm text-muted-foreground">Seguidores</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Avatar className="h-8 w-8">
              <AvatarImage
                src={pet.owner.profileImage || "/placeholder.svg?height=32&width=32"}
                alt={pet.owner.username}
              />
              <AvatarFallback>{pet.owner.username[0]}</AvatarFallback>
            </Avatar>
            <Link href={`/profile/${pet.owner.id}`} className="text-sm hover:underline">
              Dueño: <span className="font-medium">{pet.owner.username}</span>
            </Link>
          </div>

          {pet.description && (
            <div>
              <h3 className="text-lg font-medium">Sobre {pet.name}</h3>
              <p>{pet.description}</p>
            </div>
          )}
        </div>
      </div>

      {/* Pestañas */}
      <Tabs defaultValue="posts" className="w-full">
        <div className="overflow-x-auto pb-3 mb-3 scrollbar-hide">
          <TabsList className="lg:w-full md:w-max inline-flex">
            <TabsTrigger value="posts">Publicaciones</TabsTrigger>
            <TabsTrigger value="health">Cartilla Sanitaria</TabsTrigger>
            <TabsTrigger value="passport">Pasaporte</TabsTrigger>
            <TabsTrigger value="followers">Seguidores</TabsTrigger>
          </TabsList>
        </div>

        {/* Posts Tab */}
        <TabsContent value="posts" className="mt-6">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <Card>
              <CardHeader className="pb-3">
                <div className="flex justify-between">
                  <div className="flex items-center space-x-4">
                    <Avatar>
                      <AvatarImage src={pet.image || "/placeholder.svg?height=40&width=40"} alt={pet.name} />
                      <AvatarFallback>{pet.name[0]}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-medium leading-none">{pet.name}</p>
                      <p className="text-xs text-muted-foreground">Hace 2 horas</p>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p>¡Disfrutando del sol en el parque hoy!</p>
                <Image
                  src="/placeholder.svg?height=400&width=600"
                  alt="Publicación"
                  width={600}
                  height={400}
                  className="rounded-md object-cover w-full"
                />
              </CardContent>
              <CardFooter className="border-t pt-3">
                <div className="flex w-full items-center justify-between">
                  <Button variant="ghost" size="sm" className="gap-1">
                    <Heart className="h-4 w-4" />
                    <span>42</span>
                  </Button>
                  <Button variant="ghost" size="sm" className="gap-1">
                    <MessageCircle className="h-4 w-4" />
                    <span>12</span>
                  </Button>
                  <Button variant="ghost" size="sm" className="gap-1">
                    <Share2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardFooter>
            </Card>

            {isOwner && (
              <Card className="border-dashed border-2 flex items-center justify-center">
                <CardContent className="py-8 text-center">
                  <PawPrint className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-lg font-medium mb-2">Crear nueva publicación</h3>
                  <p className="text-sm text-muted-foreground mb-4">Comparte momentos especiales de {pet.name}</p>
                  <Button>Crear publicación</Button>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        {/* Passport Tab */}
        <TabsContent value="passport" className="mt-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Pasaporte de {pet.name}</CardTitle>
              {isOwner && pet.passport && (
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex items-center gap-1"
                    onClick={() => router.push(`/pets/${pet.id}/passport`)}
                  >
                    <Pencil className="h-4 w-4" />
                    <span>Editar</span>
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex items-center gap-1 text-destructive hover:text-destructive"
                    onClick={() => setIsDeletePassportDialogOpen(true)}
                  >
                    <Trash2 className="h-4 w-4" />
                    <span>Eliminar</span>
                  </Button>
                </div>
              )}
            </CardHeader>
            <CardContent>
              {pet.passport ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground">Número de Pasaporte</h3>
                      <p>{pet.passport.passportNumber}</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground">País Emisor</h3>
                      <p>{pet.passport.issuingCountry}</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground">Fecha de Emisión</h3>
                      <p>{new Date(pet.passport.issuedDate).toLocaleDateString()}</p>
                    </div>
                    {pet.passport.expiryDate && (
                      <div>
                        <h3 className="text-sm font-medium text-muted-foreground">Fecha de Expiración</h3>
                        <p>{new Date(pet.passport.expiryDate).toLocaleDateString()}</p>
                      </div>
                    )}
                    {pet.passport.microchipNumber && (
                      <div>
                        <h3 className="text-sm font-medium text-muted-foreground">Número de Microchip</h3>
                        <p>{pet.passport.microchipNumber}</p>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <p>No hay información de pasaporte disponible para {pet.name}.</p>
              )}
            </CardContent>
            {isOwner && !pet.passport && (
              <CardFooter>
                <Button onClick={() => router.push(`/pets/${pet.id}/passport`)}>Añadir Pasaporte</Button>
              </CardFooter>
            )}
          </Card>
        </TabsContent>

        {/* Health Card Tab */}
        <TabsContent value="health" className="mt-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Cartilla Sanitaria de {pet.name}</CardTitle>
              {isOwner && pet.healthCard && (
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex items-center gap-1"
                    onClick={() => router.push(`/pets/${pet.id}/health`)}
                  >
                    <Pencil className="h-4 w-4" />
                    <span>Gestionar</span>
                  </Button>
                </div>
              )}
            </CardHeader>
            <CardContent>
              {pet.healthCard ? (
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-medium mb-2">Vacunas registradas</h3>
                    {pet.healthCard.vaccinations?.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {pet.healthCard.vaccinations.slice(0, 4).map((vaccination) => (
                          <div key={vaccination.id} className="border rounded-md p-3">
                            <p className="font-medium">{vaccination.name}</p>
                            <p className="text-sm text-muted-foreground">
                              Fecha: {new Date(vaccination.date).toLocaleDateString()}
                            </p>
                            {vaccination.expiryDate && (
                              <p className="text-sm text-muted-foreground">
                                Próxima dosis: {new Date(vaccination.expiryDate).toLocaleDateString()}
                              </p>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-muted-foreground">No hay vacunas registradas.</p>
                    )}

                    {pet.healthCard.vaccinations?.length > 4 && (
                      <div className="mt-2 text-right">
                        <Button
                          variant="link"
                          onClick={() => router.push(`/pets/${pet.id}/health`)}
                          className="p-0 h-auto"
                        >
                          Ver todas las vacunas
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <p>No hay información sanitaria disponible para {pet.name}.</p>
              )}
            </CardContent>
            {isOwner && (
              <CardFooter>
                <Button onClick={() => router.push(`/pets/${pet.id}/health`)}>
                  {pet.healthCard ? "Gestionar Cartilla Sanitaria" : "Añadir Información Sanitaria"}
                </Button>
              </CardFooter>
            )}
          </Card>
        </TabsContent>

        {/* Followers Tab */}
        <TabsContent value="followers" className="mt-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {pet.followers.length > 0 ? (
              pet.followers.map((follower) => (
                <Card key={follower.id}>
                  <CardHeader className="p-4">
                    <div className="flex items-center space-x-4">
                      <Avatar className="h-12 w-12">
                        <AvatarImage
                          src={follower.profileImage || "/placeholder.svg?height=48&width=48"}
                          alt={follower.username}
                        />
                        <AvatarFallback>{follower.username[0]}</AvatarFallback>
                      </Avatar>
                      <div>
                        <CardTitle className="text-lg">{follower.username}</CardTitle>
                      </div>
                    </div>
                  </CardHeader>
                  <CardFooter className="p-4 pt-0">
                    <Link href={`/profile/${follower.id}`} className="w-full">
                      <Button variant="outline" className="w-full">
                        Ver perfil
                      </Button>
                    </Link>
                  </CardFooter>
                </Card>
              ))
            ) : (
              <div className="col-span-full text-center py-8">
                <p>{pet.name} aún no tiene seguidores.</p>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>

      {/* Diálogo de confirmación para eliminar pasaporte */}
      <AlertDialog open={isDeletePassportDialogOpen} onOpenChange={setIsDeletePassportDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción eliminará permanentemente el pasaporte de {pet.name} y no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeletePassport}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={isDeleting}
            >
              {isDeleting ? "Eliminando..." : "Eliminar pasaporte"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

