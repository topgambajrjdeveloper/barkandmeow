"use client"

import { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { MapPin, Clock } from "lucide-react"
import { toast } from "sonner"
import dynamic from "next/dynamic"
import type { Service } from "@/types"
import { getUserLocation } from "@/lib/location"

// Cargar el componente de mapa dinámicamente para evitar problemas de SSR
const MapComponent = dynamic(() => import("@/components/map-component"), {
  ssr: false,
  loading: () => <div className="h-[500px] w-full bg-muted flex items-center justify-center">Cargando mapa...</div>,
})

export default function MapPage() {
  const searchParams = useSearchParams()
  const category = searchParams.get("category") || "pet-friendly"

  const [places, setPlaces] = useState<Service[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null)
  const [selectedPlace, setSelectedPlace] = useState<Service | null>(null)

  useEffect(() => {
    // Intentar obtener la ubicación del usuario
    const getLocation = async () => {
      try {
        const locationData = await getUserLocation()
        if (locationData.latitude && locationData.longitude) {
          setUserLocation({
            latitude: locationData.latitude,
            longitude: locationData.longitude,
          })
        }
      } catch (error) {
        console.error("Error obteniendo ubicación:", error)
      }
    }

    getLocation()
  }, [])

  useEffect(() => {
    const fetchPlaces = async () => {
      setIsLoading(true)
      try {
        let url = `/api/services?category=${category}`

        // Añadir parámetros de ubicación si están disponibles
        if (userLocation?.latitude && userLocation?.longitude) {
          url = `/api/services/nearby?category=${category}&lat=${userLocation.latitude}&lng=${userLocation.longitude}&radius=20`
        }

        const response = await fetch(url)

        if (!response.ok) {
          throw new Error(`Error fetching places: ${response.status}`)
        }

        const data = await response.json()
        setPlaces(Array.isArray(data) ? data : [])
      } catch (error) {
        console.error(`Error fetching ${category} places:`, error)
        toast.error(`No se pudieron cargar los lugares de ${category}`)
        setPlaces([])
      } finally {
        setIsLoading(false)
      }
    }

    fetchPlaces()
  }, [category, userLocation])

  return (
    <div className="container py-6 space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">{category === "pet-friendly" ? "Lugares Pet-Friendly" : "Servicios"}</h1>
          <p className="text-muted-foreground">
            {userLocation
              ? "Mostrando lugares cercanos a tu ubicación"
              : "Activa la ubicación para ver lugares cercanos"}
          </p>
        </div>
        <Button
          onClick={async () => {
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
          }}
          variant="outline"
        >
          Actualizar ubicación
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          {isLoading ? (
            <Skeleton className="h-[500px] w-full" />
          ) : (
            <MapComponent
              places={places}
              userLocation={userLocation}
              onMarkerClick={(place) => setSelectedPlace(place)}
            />
          )}
        </div>
        <div className="space-y-4 max-h-[500px] overflow-y-auto">
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
                onClick={() => setSelectedPlace(place)}
              >
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">{place.title}</CardTitle>
                  <p className="text-xs text-muted-foreground flex items-center">
                    <MapPin className="h-3 w-3 mr-1" />
                    {place.address || "Dirección no disponible"}
                    {place.distance && <span className="ml-1">• a {place.distance.toFixed(1)} km</span>}
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

