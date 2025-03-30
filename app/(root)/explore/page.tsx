"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { StoreIcon as Shop, Stethoscope, Coffee, Calendar, MapPin } from "lucide-react"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { Skeleton } from "@/components/ui/skeleton"
import { getUserLocation, type LocationData } from "@/lib/location"
import { Slider } from "@/components/ui/slider"

import type { Event, Service } from "@/types"
import { getActiveCategoryFromUrl } from "@/lib/explore-helpers"
import EventsTabContent from "@/components/(auth)/components/events/events-tab-content"

// Categories for the explore page
const categories = [
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
  const [services, setServices] = useState<Service[]>([])
  const [events, setEvents] = useState<Event[]>([])
  const [totalEvents, setTotalEvents] = useState<number>(0)
  const [isLoading, setIsLoading] = useState(true)
  // Inicializar con "all" para evitar problemas de hidratación
  const [activeCategory, setActiveCategory] = useState("all")
  const [radius, setRadius] = useState(5) // Radio de búsqueda en km

  // Sincronizar la categoría activa con la URL al cargar la página (solo en el cliente)
  useEffect(() => {
    const categoryFromUrl = getActiveCategoryFromUrl()
    if (categoryFromUrl) {
      setActiveCategory(categoryFromUrl)
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

  // Obtener el número total de eventos
  const fetchTotalEvents = useCallback(async () => {
    try {
      const response = await fetch("/api/events")
      if (response.ok) {
        const data = await response.json()
        setTotalEvents(data.pagination?.total || data.events.length || 0)
      }
    } catch (error) {
      console.error("Error fetching total events:", error)
    }
  }, [])

  // Obtener datos cercanos (servicios y eventos)
  const fetchNearbyData = useCallback(
    async (location: LocationData) => {
      if (!location.latitude || !location.longitude) return

      setIsLoading(true)
      try {
        // Obtener servicios cercanos
        const servicesResponse = await fetch(
          `/api/services/nearby?lat=${location.latitude}&lng=${location.longitude}&radius=${radius}`,
        )

        // Obtener eventos cercanos
        const eventsResponse = await fetch(
          `/api/events/nearby?lat=${location.latitude}&lng=${location.longitude}&radius=${radius}`,
        )

        // Procesar respuestas
        let servicesData: Service[] = []
        let eventsData: Event[] = []

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
              eventsData = data.events.map((event: Event) => ({
                ...event,
                distance: Math.random() * radius, // Distancia aleatoria dentro del radio
              }))
            }
          } catch (error) {
            console.error("Error fetching all events:", error)
          }
        }

        setServices(servicesData)
        setEvents(eventsData)
      } catch (error) {
        console.error("Error fetching nearby data:", error)
        toast.error("Error al obtener datos cercanos")
      } finally {
        setIsLoading(false)
      }
    },
    [radius],
  )

  // Obtener la ubicación del usuario
  const getLocation = useCallback(async () => {
    setIsLocating(true)
    try {
      // Usar tu implementación existente
      const locationData = await getUserLocation(true) // Solicitar con alta precisión

      // Verificar si se obtuvo una ubicación válida
      if (locationData && locationData.latitude && locationData.longitude) {
        setUserLocation(locationData)
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

  // Solicitar ubicación al cargar la página y obtener el total de eventos
  useEffect(() => {
    fetchTotalEvents()
    getLocation()
  }, [getLocation, fetchTotalEvents])

  // Actualizar datos cuando cambia el radio
  useEffect(() => {
    if (userLocation?.latitude && userLocation?.longitude) {
      fetchNearbyData(userLocation)
    }
  }, [fetchNearbyData, userLocation])

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

      {userLocation && userLocation.latitude && (
        <div className="mb-6 space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Radio de búsqueda: <span className="font-medium">{radius} km</span>
            </p>
            {userLocation.source && (
              <p className="text-xs text-muted-foreground">
                Fuente: {userLocation.source === "gps" ? "GPS" : userLocation.source === "ip" ? "IP" : "Desconocida"}
                {userLocation.accuracy && ` (precisión: ~${(userLocation.accuracy / 1000).toFixed(1)} km)`}
              </p>
            )}
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

      <Tabs defaultValue="all" value={activeCategory} className="w-full" onValueChange={handleCategoryChange}>
        <div className="overflow-x-auto pb-3 mb-3 scrollbar-hide">
          <TabsList className="lg:w-full md:w-max inline-flex">
            <TabsTrigger value="all">Todos</TabsTrigger>
            {categories.map((category) => (
              <TabsTrigger key={category.id} value={category.id}>
                {category.title}
              </TabsTrigger>
            ))}
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
              {[1, 2, 3, 4].map((i) => (
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
                <Card key={category.id} className="h-full">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      {category.icon}
                      {category.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription>{category.description}</CardDescription>
                    {category.id === "events" && (
                      <p className="text-sm mt-2">
                        {totalEvents} eventos en total
                        {events.length > 0 && (
                          <span className="ml-1">
                            ({events.length} {events.length === 1 ? "cercano" : "cercanos"})
                          </span>
                        )}
                      </p>
                    )}
                    {category.id !== "events" && (
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
            </div>
          )}
        </TabsContent>

        <TabsContent value="events">
          <EventsTabContent totalEvents={totalEvents} />
        </TabsContent>

        {categories
          .filter((c) => c.id !== "events")
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
                    <Card key={`skeleton-${i}`} className="overflow-hidden">
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

