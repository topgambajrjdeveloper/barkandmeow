"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  StoreIcon as Shop,
  Stethoscope,
  Coffee,
  Calendar,
  Users,
  PawPrint,
  MapPin,
  UserIcon,
  ArrowRight,
} from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { Skeleton } from "@/components/ui/skeleton"
import { getUserLocation, type LocationData } from "@/lib/location"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Slider } from "@/components/ui/slider"
import Image from "next/image"
import { formatNumber } from "@/lib/followerNumber"
import { Badge } from "@/components/ui/badge"
import { format } from "date-fns"
import { es } from "date-fns/locale"

// Importar las nuevas utilidades al principio del archivo
import { getActiveCategoryFromUrl } from "@/lib/explore-helpers"
import { Event, Pet, Service, UserWithPets } from "@/types"

// Categorías para la exploración
const categories = [
  {
    id: "users",
    title: "Usuarios",
    description: "Encuentra usuarios y sus mascotas cerca de ti",
    icon: <UserIcon className="h-6 w-6" />,
  },
  {
    id: "pets",
    title: "Mascotas",
    description: "Descubre mascotas en tu zona",
    icon: <PawPrint className="h-6 w-6" />,
  },
  {
    id: "events",
    title: "Eventos",
    description: "Próximos eventos para mascotas",
    icon: <Calendar className="h-6 w-6" />,
  },
  {
    id: "pet-friendly",
    title: "Pet-Friendly",
    description: "Lugares donde puedes ir con tu mascota",
    icon: <Coffee className="h-6 w-6" />,
  },
  {
    id: "meetups",
    title: "Quedadas",
    description: "Organiza paseos y encuentros con otras mascotas",
    icon: <Users className="h-6 w-6" />,
  },
  {
    id: "shops",
    title: "Tiendas",
    description: "Aromaterapia, ropa, juguetes y más",
    icon: <Shop className="h-6 w-6" />,
  },
  {
    id: "vets",
    title: "Veterinarios",
    description: "Descubre veterinarios en tu zona",
    icon: <Stethoscope className="h-6 w-6" />,
  },
]

export default function ExplorePage() {
  const [userLocation, setUserLocation] = useState<LocationData | null>(null)
  const [isLocating, setIsLocating] = useState(false)
  const [usersWithPets, setUsersWithPets] = useState<UserWithPets[]>([])
  const [popularUsers, setPopularUsers] = useState<UserWithPets[]>([])
  const [services, setServices] = useState<Service[]>([])
  const [events, setEvents] = useState<Event[]>([])
  const [isLoading, setIsLoading] = useState(true)
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [activeCategory, setActiveCategory] = useState(() => {
    // Solo ejecutar en el cliente
    if (typeof window !== "undefined") {
      return getActiveCategoryFromUrl()
    }
    return "all"
  })
  const [radius, setRadius] = useState(5) // Radio de búsqueda en km
  const [currentUserId, setCurrentUserId] = useState<string | null>(null)

  // Verificar si hay un parámetro de categoría en la URL
  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search)
    const categoryParam = searchParams.get("category")
    if ((categoryParam && categories.some((cat) => cat.id === categoryParam)) || categoryParam === "popular") {
      setActiveCategory(categoryParam)
    }
  }, [])

  // Función para cambiar la categoría activa y actualizar la URL
  const handleCategoryChange = (categoryId: string) => {
    setActiveCategory(categoryId)

    // Actualizar la URL con el parámetro de categoría
    const url = new URL(window.location.href)
    url.searchParams.set("category", categoryId)
    window.history.pushState({}, "", url)
  }

  // Obtener el ID del usuario actual
  useEffect(() => {
    // Aquí deberías obtener el ID del usuario actual de tu sistema de autenticación
    // Por ejemplo, si usas NextAuth.js podrías usar useSession()
    // Este es un ejemplo simplificado:
    const fetchCurrentUser = async () => {
      try {
        const response = await fetch("/api/auth/me")
        if (response.ok) {
          const data = await response.json()
          setCurrentUserId(data.id)
        }
      } catch (error) {
        console.error("Error fetching current user:", error)
      }
    }

    fetchCurrentUser()
  }, [])

  // Obtener datos cercanos (usuarios con sus mascotas y servicios)
  const fetchNearbyData = useCallback(
    async (location: LocationData) => {
      if (!location.latitude || !location.longitude) return

      setIsLoading(true)
      try {
        // Obtener usuarios con sus mascotas (usando la API existente para compatibilidad)
        const usersResponse = await fetch(
          `/api/nearby/users?lat=${location.latitude}&lng=${location.longitude}&radius=${radius}`,
        )

        // Obtener servicios cercanos
        const servicesResponse = await fetch(
          `/api/services/nearby?lat=${location.latitude}&lng=${location.longitude}&radius=${radius}`,
        )

        // Obtener eventos cercanos
        const eventsResponse = await fetch(
          `/api/events/nearby?lat=${location.latitude}&lng=${location.longitude}&radius=${radius}`,
        )

        // Obtener mascotas populares (usando la API existente para compatibilidad)
        const petsResponse = await fetch("/api/pets/popular")

        // Procesar respuestas
        let usersData: UserWithPets[] = []
        let servicesData: Service[] = []
        let eventsData: Event[] = []
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        let petsData: any[] = []

        if (usersResponse.ok) {
          const nearbyUsers = await usersResponse.json()
          // Transformar los datos de usuarios para adaptarlos a nuestro nuevo formato
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          usersData = nearbyUsers.map((user: any) => ({
            id: user.id,
            username: user.username,
            profileImage: user.profileImage,
            followersCount: user.followersCount || 0,
            isFollowing: user.isFollowing || false,
            distance: user.distance || 0,
            isCurrentUser: user.id === currentUserId, // Marcar si es el usuario actual
            pets: [
              {
                id: `pet-${user.id}`,
                name: user.petName || "Mascota",
                type: user.petType || "No especificado",
                breed: null,
                age: null,
                image: null,
                isFollowing: false,
                isOwner: user.id === currentUserId, // Marcar si la mascota pertenece al usuario actual
              },
            ].filter((pet) => pet.name !== ""),
          }))
        } else {
          console.error("Error fetching nearby users:", await usersResponse.text())
        }

        if (servicesResponse.ok) {
          servicesData = await servicesResponse.json()
        } else {
          console.error("Error fetching services:", await servicesResponse.text())
        }

        if (eventsResponse.ok) {
          eventsData = await eventsResponse.json()
        } else {
          // Si la API de eventos cercanos no existe aún, obtener todos los eventos
          try {
            const allEventsResponse = await fetch("/api/events?upcoming=true")
            if (allEventsResponse.ok) {
              const data = await allEventsResponse.json()
              // Añadir una distancia simulada para cada evento
              eventsData = data.events.map((event: any) => ({
                ...event,
                distance: Math.random() * radius, // Distancia aleatoria dentro del radio
              }))
            }
          } catch (error) {
            console.error("Error fetching all events:", error)
          }
        }

        if (petsResponse.ok) {
          petsData = await petsResponse.json()

          // Usar los datos de mascotas populares para crear usuarios populares
          const popularUsersMap = new Map<string, UserWithPets>()
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          petsData.forEach((pet: any) => {
            if (!popularUsersMap.has(pet.userId)) {
              popularUsersMap.set(pet.userId, {
                id: pet.userId,
                username: pet.username || "Usuario",
                profileImage: null,
                followersCount: 0,
                isFollowing: false,
                distance: 0,
                isCurrentUser: pet.userId === currentUserId, // Marcar si es el usuario actual
                pets: [],
              })
            }

            const user = popularUsersMap.get(pet.userId)!
            user.pets.push({
              id: pet.id,
              name: pet.name,
              type: pet.type,
              breed: pet.breed,
              age: null,
              image: pet.image,
              isFollowing: pet.isFollowing || false,
              isOwner: pet.userId === currentUserId, // Marcar si la mascota pertenece al usuario actual
            })
          })

          setPopularUsers(Array.from(popularUsersMap.values()))
        } else {
          console.error("Error fetching popular pets:", await petsResponse.text())
        }

        setUsersWithPets(usersData)
        setServices(servicesData)
        setEvents(eventsData)
      } catch (error) {
        console.error("Error fetching nearby data:", error)
        toast.error("Error al obtener datos cercanos")
      } finally {
        setIsLoading(false)
      }
    },
    [radius, currentUserId],
  )

  // Obtener la ubicación del usuario
  const getLocation = useCallback(async () => {
    setIsLocating(true)
    try {
      const locationData = await getUserLocation()
      setUserLocation(locationData)

      if (locationData.latitude && locationData.longitude) {
        fetchNearbyData(locationData)
      } else {
        toast.error("No pudimos determinar tu ubicación exacta")
        setIsLoading(false)
      }
    } catch (error) {
      console.error("Error obteniendo ubicación:", error)
      toast.error("Error al obtener tu ubicación")
      setIsLoading(false)
    } finally {
      setIsLocating(false)
    }
  }, [fetchNearbyData])

  // Seguir a un usuario
  const handleFollowUser = async (userId: string, isCurrentUser = false) => {
    // Verificar si es el usuario actual
    if (isCurrentUser) {
      toast.error("No puedes seguirte a ti mismo")
      return
    }

    try {
      const response = await fetch("/api/follow", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ targetId: userId, type: "user" }),
      })

      if (response.ok) {
        // Actualizar estado de usuarios cercanos
        setUsersWithPets((prev) =>
          prev.map((user) => (user.id === userId ? { ...user, isFollowing: !user.isFollowing } : user)),
        )

        // Actualizar estado de usuarios populares
        setPopularUsers((prev) =>
          prev.map((user) => (user.id === userId ? { ...user, isFollowing: !user.isFollowing } : user)),
        )

        toast.success("Acción realizada con éxito")
      } else {
        toast.error("Error al realizar la acción")
      }
    } catch (error) {
      console.error("Error:", error)
      toast.error("Error al realizar la acción")
    }
  }

  // Seguir a una mascota
  const handleFollowPet = async (petId: string, userId: string) => {
    // Verificar si la mascota pertenece al usuario actual
    const isPetOwner = userId === currentUserId

    if (isPetOwner) {
      toast.error("No puedes seguir a tu propia mascota")
      return
    }

    try {
      const response = await fetch("/api/follow", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ targetId: petId, type: "pet" }),
      })

      if (response.ok) {
        // Actualizar el estado de seguimiento de la mascota en usuarios cercanos
        setUsersWithPets((prev) =>
          prev.map((user) => {
            if (user.id === userId) {
              return {
                ...user,
                pets: user.pets.map((pet) => (pet.id === petId ? { ...pet, isFollowing: !pet.isFollowing } : pet)),
              }
            }
            return user
          }),
        )

        // Actualizar el estado de seguimiento de la mascota en usuarios populares
        setPopularUsers((prev) =>
          prev.map((user) => {
            if (user.id === userId) {
              return {
                ...user,
                pets: user.pets.map((pet) => (pet.id === petId ? { ...pet, isFollowing: !pet.isFollowing } : pet)),
              }
            }
            return user
          }),
        )

        toast.success("Acción realizada con éxito")
      } else {
        toast.error("Error al realizar la acción")
      }
    } catch (error) {
      console.error("Error:", error)
      toast.error("Error al realizar la acción")
    }
  }

  // Solicitar ubicación al cargar la página
  useEffect(() => {
    getLocation()
  }, [getLocation])

  // Actualizar datos cuando cambia el radio
  useEffect(() => {
    if (userLocation?.latitude && userLocation?.longitude) {
      fetchNearbyData(userLocation)
    }
  }, [fetchNearbyData, userLocation])

  // Obtener todas las mascotas de todos los usuarios
  const getAllPets = () => {
    return usersWithPets.flatMap((user) =>
      user.pets.map((pet) => ({
        ...pet,
        userId: user.id,
        username: user.username,
        isOwner: user.id === currentUserId, // Marcar si la mascota pertenece al usuario actual
      })),
    )
  }

  // Añadir un efecto para escuchar el evento personalizado
  useEffect(() => {
    const handleCategoryChange = (event: CustomEvent) => {
      setActiveCategory(event.detail)
    }

    // Añadir el event listener
    window.addEventListener("exploreCategoryChange", handleCategoryChange as EventListener)

    // Limpiar el event listener
    return () => {
      window.removeEventListener("exploreCategoryChange", handleCategoryChange as EventListener)
    }
  }, [])

  // Renderizar botón de seguir para mascotas
  const renderPetFollowButton = (pet: Pet & { userId: string }) => {
    // Si la mascota pertenece al usuario actual, mostrar botón deshabilitado
    if (pet.userId === currentUserId) {
      return (
        <Button
          size="icon"
          variant="outline"
          className="absolute -bottom-2 -right-2 h-6 w-6 rounded-full"
          disabled
          title="No puedes seguir a tu propia mascota"
        >
          <PawPrint className="h-3 w-3" />
        </Button>
      )
    }

    // Si no, mostrar botón normal
    return (
      <Button
        size="icon"
        variant={pet.isFollowing ? "outline" : "default"}
        className="absolute -bottom-2 -right-2 h-6 w-6 rounded-full"
        onClick={() => handleFollowPet(pet.id, pet.userId)}
      >
        <PawPrint className="h-3 w-3" />
      </Button>
    )
  }

  return (
    <div className="pb-20 md:pb-0">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Explora</h1>
        <div className="flex flex-col sm:flex-row items-start sm:items-center mt-2 sm:mt-0 gap-2">
          <Button onClick={getLocation} variant="outline" className="flex items-center gap-2" disabled={isLocating}>
            <MapPin className="h-4 w-4" />
            {isLocating ? "Localizando..." : userLocation ? "Actualizar ubicación" : "Usar mi ubicación"}
          </Button>
          {userLocation && userLocation.city && (
            <div className="text-sm text-muted-foreground">
              <span className="font-medium">{userLocation.city}</span>
              {userLocation.country && <span>, {userLocation.country}</span>}
            </div>
          )}
        </div>
      </div>

      {userLocation && (
        <div className="mb-6 space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Radio de búsqueda: <span className="font-medium">{radius} km</span>
            </p>
          </div>
          <Slider
            value={[radius]}
            min={1}
            max={50}
            step={1}
            onValueChange={(value) => setRadius(value[0])}
            className="w-full"
          />
        </div>
      )}

      <Tabs value={activeCategory} defaultValue="all" className="w-full" onValueChange={handleCategoryChange}>
        <div className="overflow-x-auto pb-3 mb-3 scrollbar-hide">
          <TabsList className="lg:w-full md:w-max inline-flex">
            <TabsTrigger value="all">Todos</TabsTrigger>
            {categories.map((category) => (
              <TabsTrigger key={category.id} value={category.id}>
                {category.title}
              </TabsTrigger>
            ))}
            <TabsTrigger value="popular">Populares</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="all">
          {!userLocation || !userLocation.latitude ? (
            <div className="text-center py-8">
              <p className="mb-4">Necesitamos tu ubicación para mostrarte contenido cercano</p>
              <Button onClick={getLocation} disabled={isLocating}>
                {isLocating ? "Obteniendo ubicación..." : "Compartir mi ubicación"}
              </Button>
            </div>
          ) : isLoading ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <Card key={i} className="overflow-hidden">
                  <CardHeader>
                    <Skeleton className="h-6 w-40" />
                  </CardHeader>
                  <CardContent>
                    <Skeleton className="h-4 w-full mb-2" />
                    <Skeleton className="h-4 w-3/4" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {categories.map((category) => (
                <Card key={category.id} className="hover:bg-accent transition-colors h-full">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      {category.icon}
                      {category.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription>{category.description}</CardDescription>
                    {category.id === "users" && (
                      <p className="text-sm mt-2">{usersWithPets.length} usuarios cercanos</p>
                    )}
                    {category.id === "pets" && <p className="text-sm mt-2">{getAllPets().length} mascotas cercanas</p>}
                    {category.id === "events" && <p className="text-sm mt-2">{events.length} eventos próximos</p>}
                    {category.id !== "users" && category.id !== "pets" && category.id !== "events" && (
                      <p className="text-sm mt-2">
                        {services.filter((s) => s.category === category.id).length} servicios cercanos
                      </p>
                    )}
                  </CardContent>
                  <CardFooter>
                    <Button variant="outline" className="w-full" onClick={() => handleCategoryChange(category.id)}>
                      Ver {category.title.toLowerCase()}
                    </Button>
                  </CardFooter>
                </Card>
              ))}
              <Card className="hover:bg-accent transition-colors h-full">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <UserIcon className="h-6 w-6" />
                    Usuarios Populares
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>Descubre los usuarios más populares y sus mascotas</CardDescription>
                  <p className="text-sm mt-2">{popularUsers.length} usuarios populares</p>
                </CardContent>
                <CardFooter>
                  <Button variant="outline" className="w-full" onClick={() => handleCategoryChange("popular")}>
                    Ver usuarios populares
                  </Button>
                </CardFooter>
              </Card>
            </div>
          )}
        </TabsContent>

        <TabsContent value="users">
          {!userLocation || !userLocation.latitude ? (
            <div className="text-center py-8">
              <p className="mb-4">Necesitamos tu ubicación para mostrarte usuarios cercanos</p>
              <Button onClick={getLocation} disabled={isLocating}>
                {isLocating ? "Obteniendo ubicación..." : "Compartir mi ubicación"}
              </Button>
            </div>
          ) : isLoading ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3].map((i) => (
                <Card key={i} className="overflow-hidden">
                  <CardHeader className="flex flex-row items-center gap-4">
                    <Skeleton className="h-12 w-12 rounded-full" />
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-3 w-32" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <Skeleton className="h-4 w-full mb-2" />
                    <div className="flex gap-2 mt-4">
                      {[1, 2, 3].map((j) => (
                        <Skeleton key={j} className="h-16 w-16 rounded-full" />
                      ))}
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Skeleton className="h-9 w-full" />
                  </CardFooter>
                </Card>
              ))}
            </div>
          ) : usersWithPets.length === 0 ? (
            <div className="text-center py-8">
              <p>No se encontraron usuarios cercanos. Intenta aumentar el radio de búsqueda.</p>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {usersWithPets.map((user) => (
                <Card key={user.id} className="overflow-hidden">
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <Avatar>
                          <AvatarImage
                            src={user.profileImage || "/placeholder.svg?height=40&width=40"}
                            alt={user.username}
                          />
                          <AvatarFallback>{user.username[0]}</AvatarFallback>
                        </Avatar>
                        <div>
                          <CardTitle className="text-lg">
                            {user.username}
                            {user.isCurrentUser && " (Tú)"}
                          </CardTitle>
                          <p className="text-sm text-muted-foreground">
                            {formatNumber(user.followersCount)} seguidores
                          </p>
                          <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                            <MapPin className="h-3 w-3" />A {user.distance.toFixed(1)} km de ti
                          </p>
                        </div>
                      </div>
                      {user.isCurrentUser ? (
                        <Button size="sm" variant="outline" disabled title="No puedes seguirte a ti mismo">
                          Tú
                        </Button>
                      ) : (
                        <Button
                          size="sm"
                          variant={user.isFollowing ? "outline" : "default"}
                          onClick={() => handleFollowUser(user.id, user.isCurrentUser)}
                        >
                          {user.isFollowing ? "Siguiendo" : "Seguir"}
                        </Button>
                      )}
                    </div>
                  </CardHeader>

                  <CardContent className="pb-2">
                    <h3 className="text-sm font-medium mb-2">
                      {user.pets.length > 0 ? `Sus mascotas (${user.pets.length}):` : "No tiene mascotas registradas"}
                    </h3>
                    {user.pets.length > 0 && (
                      <div className="grid grid-cols-3 gap-2">
                        {user.pets.map((pet) => (
                          <div key={pet.id} className="flex flex-col items-center">
                            <div className="relative">
                              <Avatar className="w-16 h-16">
                                <AvatarImage
                                  src={pet.image || "/placeholder.svg?height=64&width=64"}
                                  alt={pet.name}
                                  className="object-cover"
                                />
                                <AvatarFallback>{pet.name[0]}</AvatarFallback>
                              </Avatar>
                              {renderPetFollowButton({ ...pet, userId: user.id })}
                            </div>
                            <Link href={`/pets/${pet.id}`} className="mt-1">
                              <p className="text-xs font-medium text-center truncate w-16">{pet.name}</p>
                              <p className="text-xs text-muted-foreground text-center truncate w-16">{pet.type}</p>
                            </Link>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>

                  <CardFooter className="pt-2">
                    <Link href={`/profile/${user.id}`} className="w-full">
                      <Button variant="outline" size="sm" className="w-full">
                        Ver perfil completo
                      </Button>
                    </Link>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="pets">
          {!userLocation || !userLocation.latitude ? (
            <div className="text-center py-8">
              <p className="mb-4">Necesitamos tu ubicación para mostrarte mascotas cercanas</p>
              <Button onClick={getLocation} disabled={isLocating}>
                {isLocating ? "Obteniendo ubicación..." : "Compartir mi ubicación"}
              </Button>
            </div>
          ) : isLoading ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3].map((i) => (
                <Card key={i} className="overflow-hidden">
                  <div className="aspect-square">
                    <Skeleton className="h-full w-full" />
                  </div>
                  <CardHeader>
                    <Skeleton className="h-6 w-40" />
                    <Skeleton className="h-4 w-24 mt-2" />
                  </CardHeader>
                  <CardFooter>
                    <Skeleton className="h-9 w-full" />
                  </CardFooter>
                </Card>
              ))}
            </div>
          ) : getAllPets().length === 0 ? (
            <div className="text-center py-8">
              <p>No se encontraron mascotas cercanas. Intenta aumentar el radio de búsqueda.</p>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {getAllPets().map((pet) => (
                <Card key={pet.id} className="overflow-hidden">
                  <div className="aspect-square relative">
                    <Image
                      src={pet.image || "/placeholder.svg?height=300&width=300"}
                      alt={pet.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-lg">{pet.name}</CardTitle>
                        <p className="text-sm text-muted-foreground">
                          {pet.type} • {pet.breed || "Sin raza especificada"}
                        </p>
                        <Link href={`/profile/${pet.userId}`} className="text-xs text-primary hover:underline">
                          Dueño: {pet.username}
                          {pet.isOwner && " (Tú)"}
                        </Link>
                      </div>
                      {pet.isOwner ? (
                        <Button size="sm" variant="outline" disabled title="No puedes seguir a tu propia mascota">
                          Tu mascota
                        </Button>
                      ) : (
                        <Button
                          size="sm"
                          variant={pet.isFollowing ? "outline" : "default"}
                          onClick={() => handleFollowPet(pet.id, pet.userId)}
                        >
                          {pet.isFollowing ? "Siguiendo" : "Seguir"}
                        </Button>
                      )}
                    </div>
                  </CardHeader>
                  <CardFooter>
                    <Link href={`/pets/${pet.id}`} className="w-full">
                      <Button variant="outline" size="sm" className="w-full">
                        Ver perfil completo
                      </Button>
                    </Link>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="events">
          {!userLocation || !userLocation.latitude ? (
            <div className="text-center py-8">
              <p className="mb-4">Necesitamos tu ubicación para mostrarte eventos cercanos</p>
              <Button onClick={getLocation} disabled={isLocating}>
                {isLocating ? "Obteniendo ubicación..." : "Compartir mi ubicación"}
              </Button>
            </div>
          ) : isLoading ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3].map((i) => (
                <Card key={i} className="overflow-hidden">
                  <div className="aspect-video">
                    <Skeleton className="h-full w-full" />
                  </div>
                  <CardHeader>
                    <Skeleton className="h-6 w-40" />
                    <div className="space-y-2 mt-2">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-4 w-24" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <Skeleton className="h-4 w-full mb-2" />
                    <Skeleton className="h-4 w-3/4" />
                  </CardContent>
                  <CardFooter>
                    <Skeleton className="h-9 w-full" />
                  </CardFooter>
                </Card>
              ))}
            </div>
          ) : events.length === 0 ? (
            <div className="text-center py-8">
              <p>No se encontraron eventos cercanos. Intenta aumentar el radio de búsqueda.</p>
              <Button asChild className="mt-4">
                <Link href="/explore/events">Ver todos los eventos</Link>
              </Button>
            </div>
          ) : (
            <>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold">Eventos cercanos</h2>
                <Button asChild variant="outline">
                  <Link href="/explore/events">
                    Ver todos los eventos
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {events.map((event) => {
                  const eventDate = new Date(event.date)
                  const isToday = new Date().toDateString() === eventDate.toDateString()
                  const isTomorrow =
                    new Date(new Date().setDate(new Date().getDate() + 1)).toDateString() === eventDate.toDateString()

                  let dateLabel = format(eventDate, "PPP", { locale: es })
                  if (isToday) dateLabel = "Hoy, " + format(eventDate, "p", { locale: es })
                  if (isTomorrow) dateLabel = "Mañana, " + format(eventDate, "p", { locale: es })

                  return (
                    <Card key={event.id} className="overflow-hidden flex flex-col h-full">
                      <div className="relative h-48 w-full">
                        <Image
                          src={event.imageUrl || "/placeholder.svg?height=200&width=400"}
                          alt={event.title}
                          fill
                          className="object-cover"
                        />
                        {isToday && (
                          <Badge className="absolute top-2 right-2 bg-secondary text-secondary-foreground">Hoy</Badge>
                        )}
                      </div>
                      <CardHeader>
                        <CardTitle className="line-clamp-2">{event.title}</CardTitle>
                      </CardHeader>
                      <CardContent className="flex-grow">
                        <div className="space-y-3">
                          <div className="flex items-center text-sm">
                            <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                            <span>{dateLabel}</span>
                          </div>
                          <div className="flex items-center text-sm">
                            <MapPin className="h-4 w-4 mr-2 text-muted-foreground" />
                            <span className="line-clamp-1">{event.location}</span>
                          </div>
                          <div className="flex items-center text-sm">
                            <Users className="h-4 w-4 mr-2 text-muted-foreground" />
                            <span>{event._count.attendees} asistentes</span>
                          </div>
                          <div className="flex items-center text-sm">
                            <MapPin className="h-4 w-4 mr-2 text-muted-foreground" />
                            <span>A {event.distance.toFixed(1)} km de ti</span>
                          </div>
                          <p className="text-sm text-muted-foreground line-clamp-3 mt-2">{event.description}</p>
                        </div>
                      </CardContent>
                      <CardFooter className="pt-0">
                        <Button asChild variant="outline" className="w-full">
                          <Link href={`/events/${event.id}`}>
                            Ver detalles
                            <ArrowRight className="ml-2 h-4 w-4" />
                          </Link>
                        </Button>
                      </CardFooter>
                    </Card>
                  )
                })}
              </div>
            </>
          )}
        </TabsContent>

        <TabsContent value="popular">
          {isLoading ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3].map((i) => (
                <Card key={i} className="overflow-hidden">
                  <CardHeader className="flex flex-row items-center gap-4">
                    <Skeleton className="h-12 w-12 rounded-full" />
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-3 w-32" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <Skeleton className="h-4 w-full mb-2" />
                    <div className="flex gap-2 mt-4">
                      {[1, 2, 3].map((j) => (
                        <Skeleton key={j} className="h-16 w-16 rounded-full" />
                      ))}
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Skeleton className="h-9 w-full" />
                  </CardFooter>
                </Card>
              ))}
            </div>
          ) : popularUsers.length === 0 ? (
            <div className="text-center py-8">
              <p>No se encontraron usuarios populares.</p>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {popularUsers.map((user) => (
                <Card key={user.id} className="overflow-hidden">
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <Avatar>
                          <AvatarImage
                            src={user.profileImage || "/placeholder.svg?height=40&width=40"}
                            alt={user.username}
                          />
                          <AvatarFallback>{user.username[0]}</AvatarFallback>
                        </Avatar>
                        <div>
                          <CardTitle className="text-lg">
                            {user.username}
                            {user.isCurrentUser && " (Tú)"}
                          </CardTitle>
                          <p className="text-sm text-muted-foreground">
                            {formatNumber(user.followersCount)} seguidores
                          </p>
                        </div>
                      </div>
                      {user.isCurrentUser ? (
                        <Button size="sm" variant="outline" disabled title="No puedes seguirte a ti mismo">
                          Tú
                        </Button>
                      ) : (
                        <Button
                          size="sm"
                          variant={user.isFollowing ? "outline" : "default"}
                          onClick={() => handleFollowUser(user.id, user.isCurrentUser)}
                        >
                          {user.isFollowing ? "Siguiendo" : "Seguir"}
                        </Button>
                      )}
                    </div>
                  </CardHeader>

                  <CardContent className="pb-2">
                    <h3 className="text-sm font-medium mb-2">
                      {user.pets.length > 0 ? `Sus mascotas (${user.pets.length}):` : "No tiene mascotas registradas"}
                    </h3>
                    {user.pets.length > 0 && (
                      <div className="grid grid-cols-3 gap-2">
                        {user.pets.map((pet) => (
                          <div key={pet.id} className="flex flex-col items-center">
                            <div className="relative">
                              <Avatar className="w-16 h-16">
                                <AvatarImage
                                  src={pet.image || "/placeholder.svg?height=64&width=64"}
                                  alt={pet.name}
                                  className="object-cover"
                                />
                                <AvatarFallback>{pet.name[0]}</AvatarFallback>
                              </Avatar>
                              {renderPetFollowButton({ ...pet, userId: user.id })}
                            </div>
                            <Link href={`/pets/${pet.id}`} className="mt-1">
                              <p className="text-xs font-medium text-center truncate w-16">{pet.name}</p>
                              <p className="text-xs text-muted-foreground text-center truncate w-16">{pet.type}</p>
                            </Link>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>

                  <CardFooter className="pt-2">
                    <Link href={`/profile/${user.id}`} className="w-full">
                      <Button variant="outline" size="sm" className="w-full">
                        Ver perfil completo
                      </Button>
                    </Link>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {categories
          .filter((c) => c.id !== "users" && c.id !== "pets" && c.id !== "events")
          .map((category) => (
            <TabsContent key={category.id} value={category.id}>
              {!userLocation || !userLocation.latitude ? (
                <div className="text-center py-8">
                  <p className="mb-4">Necesitamos tu ubicación para mostrarte servicios cercanos</p>
                  <Button onClick={getLocation} disabled={isLocating}>
                    {isLocating ? "Obteniendo ubicación..." : "Compartir mi ubicación"}
                  </Button>
                </div>
              ) : isLoading ? (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {[1, 2, 3].map((i) => (
                    <Card key={i} className="overflow-hidden">
                      <CardHeader>
                        <Skeleton className="h-6 w-40" />
                      </CardHeader>
                      <CardContent>
                        <Skeleton className="h-4 w-full mb-2" />
                        <Skeleton className="h-4 w-3/4" />
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : services.filter((s) => s.category === category.id).length === 0 ? (
                <div className="text-center py-8">
                  <p>No se encontraron {category.title.toLowerCase()} cercanos.</p>
                </div>
              ) : (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {services
                    .filter((service) => service.category === category.id)
                    .map((service) => (
                      <Card key={service.id}>
                        <CardHeader>
                          <CardTitle>{service.title}</CardTitle>
                          <p className="text-sm text-muted-foreground flex items-center gap-1">
                            <MapPin className="h-3 w-3" />A {service.distance.toFixed(1)} km de ti
                          </p>
                        </CardHeader>
                        <CardContent>
                          <p>{service.description}</p>
                        </CardContent>
                      </Card>
                    ))}
                </div>
              )}
            </TabsContent>
          ))}
      </Tabs>
    </div>
  )
}

