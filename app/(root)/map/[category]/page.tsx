"use client"

import { useEffect, useState, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { MapPin, Clock } from "lucide-react"
import { toast } from "sonner"
import dynamic from "next/dynamic"
import type { Service } from "@/types"
import { getUserLocation } from "@/lib/location"
import { use } from "react"

// Cargar el componente de mapa dinámicamente para evitar problemas de SSR
const MapComponent = dynamic(() => import("@/components/(auth)/components/map/map-component"), {
  ssr: false,
  loading: () => <div className="h-[700px] w-full bg-muted flex items-center justify-center">Cargando mapa...</div>,
})

export default function MapCategoryPage({ params }: { params: Promise<{ category: string }> }) {
  // Obtener la categoría de los parámetros de la ruta usando React.use()
  const resolvedParams = use(params)
  const category = resolvedParams.category || "pet-friendly"

  console.log("Renderizando página de mapa para categoría:", category)

  const [places, setPlaces] = useState<Service[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null)
  const [selectedPlace, setSelectedPlace] = useState<Service | null>(null)
  const mapRef = useRef(null)

  // Efecto para obtener la ubicación del usuario (solo una vez)
  useEffect(() => {
    let isMounted = true

    const getLocation = async () => {
      try {
        console.log("Obteniendo ubicación del usuario...")
        const locationData = await getUserLocation()

        if (isMounted && locationData.latitude && locationData.longitude) {
          console.log("Ubicación obtenida:", locationData)
          setUserLocation({
            latitude: locationData.latitude,
            longitude: locationData.longitude,
          })
        } else if (isMounted) {
          console.log("No se pudo obtener la ubicación precisa")
        }
      } catch (error) {
        if (isMounted) {
          console.error("Error obteniendo ubicación:", error)
        }
      }
    }

    getLocation()

    // Limpieza para evitar actualizar estado en componentes desmontados
    return () => {
      isMounted = false
    }
  }, []) // Solo ejecutar al montar el componente

  // Efecto para cargar los lugares
  useEffect(() => {
    let isMounted = true

    const fetchPlaces = async () => {
      if (!isMounted) return

      setIsLoading(true)
      try {
        // Siempre usar el endpoint nearby con all=true para obtener todos los lugares
        // independientemente de la ubicación del usuario
        let url = `/api/services/nearby?category=${category}&all=true`

        // Añadir parámetros de ubicación si están disponibles
        if (userLocation?.latitude && userLocation?.longitude) {
          url = `/api/services/nearby?category=${category}&lat=${userLocation.latitude}&lng=${userLocation.longitude}&all=true`
        }

        console.log("Fetching places from URL:", url)
        const response = await fetch(url)

        if (!response.ok) {
          throw new Error(`Error fetching places: ${response.status}`)
        }

        const data = await response.json()
        console.log("Received data:", Array.isArray(data) ? data.length : 0, "places")

        // Añadir log detallado para verificar las coordenadas
        if (Array.isArray(data) && data.length > 0) {
          console.log("Sample place data:", {
            title: data[0].title,
            category: data[0].category,
            subCategory: data[0].subCategory,
            latitude: data[0].latitude,
            longitude: data[0].longitude,
          })
        }

        if (isMounted) {
          setPlaces(Array.isArray(data) ? data : [])
        }
      } catch (error) {
        console.error(`Error fetching ${category} places:`, error)
        if (isMounted) {
          toast.error(`No se pudieron cargar los lugares de ${category}`)
          setPlaces([])
        }
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    fetchPlaces()

    // Limpieza para evitar actualizar estado en componentes desmontados
    return () => {
      isMounted = false
    }
  }, [category, userLocation])

  // Función para actualizar la ubicación del usuario
  const updateLocation = async () => {
    try {
      const locationData = await getUserLocation(true)
      if (locationData.latitude && locationData.longitude) {
        setUserLocation({
          latitude: locationData.latitude,
          longitude: locationData.longitude,
        })
        toast.success("Ubicación actualizada")
      } else {
        toast.error("No se pudo obtener tu ubicación precisa")
      }
    } catch (error) {
      console.error("Error obteniendo ubicación:", error)
      toast.error("No se pudo obtener tu ubicación")
    }
  }

  // Función para manejar el clic en una tarjeta
  const handlePlaceClick = (place: Service) => {
    setSelectedPlace(place)

    // Centrar el mapa en la ubicación del lugar seleccionado
    if (mapRef.current && place.latitude && place.longitude) {
      mapRef.current.flyToLocation(place.latitude, place.longitude, place)
    }
  }

  // Determinar el título según la categoría
  const getTitle = () => {
    switch (category) {
      case "pet-friendly":
        return "Lugares Pet-Friendly"
      case "vet":
        return "Veterinarias"
      case "shop":
        return "Tiendas de Mascotas"
      default:
        return "Servicios"
    }
  }

  return (
    <div className="container py-6 space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">{getTitle()}</h1>
          <p className="text-muted-foreground">
            {userLocation
              ? "Mostrando lugares cercanos a tu ubicación"
              : "Activa la ubicación para ver lugares cercanos"}
          </p>
        </div>
        <Button onClick={updateLocation} variant="outline">
          Actualizar ubicación
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 h-[700px]">
          {isLoading ? (
            <Skeleton className="h-full w-full" />
          ) : (
            <div className="h-full w-full">
              <MapComponent
                places={places}
                userLocation={userLocation}
                onMarkerClick={(place) => setSelectedPlace(place)}
                height="700px"
                ref={mapRef}
              />
            </div>
          )}
        </div>
        <div className="space-y-4 max-h-[700px] overflow-y-auto">
          {isLoading ? (
            Array.from({ length: 3 }).map((_, i) => (
              <Card key={i}>
                <CardHeader>
                  <Skeleton className="h-6 w-3/4" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-4 w-full mb-2" />
                  <Skeleton className="h-4 w-3/4" />
                </CardContent>
              </Card>
            ))
          ) : places.length === 0 ? (
            <Card>
              <CardContent className="pt-6">
                <p className="text-center">No hay lugares disponibles en esta categoría</p>
              </CardContent>
            </Card>
          ) : (
            places.map((place) => (
              <Card
                key={place.id}
                className={`cursor-pointer transition-all ${selectedPlace?.id === place.id ? "border-primary" : ""}`}
                onClick={() => handlePlaceClick(place)}
              >
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">{place.title}</CardTitle>
                  <p className="text-xs text-muted-foreground flex items-center">
                    <MapPin className="h-3 w-3 mr-1" />
                    {place.address || "Dirección no disponible"}
                    {place.distance != null && <span className="ml-1">• a {place.distance.toFixed(1)} km</span>}
                  </p>
                </CardHeader>
                <CardContent className="pt-0">
                  {place.openingHours && (
                    <p className="text-xs flex items-center text-muted-foreground mb-2">
                      <Clock className="h-3 w-3 mr-1" />
                      {place.openingHours}
                    </p>
                  )}
                  <div className="flex gap-2 mt-2">
                    {place.latitude && place.longitude && (
                      <Button variant="outline" size="sm" asChild className="text-xs">
                        <a
                          href={`https://www.openstreetmap.org/directions?from=&to=${place.latitude}%2C${place.longitude}`}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <MapPin className="h-3 w-3 mr-1" />
                          Cómo llegar
                        </a>
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  )
}

