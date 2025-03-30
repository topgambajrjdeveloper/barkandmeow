"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { MapPin, ExternalLink, Phone, Clock } from "lucide-react"
import { toast } from "sonner"
import Image from "next/image"
import Link from "next/link"
import type { Service } from "@/types"
import { getUserLocation } from "@/lib/location"

// Actualizar la interfaz PetFriendlyTabContentProps para aceptar cualquier tipo de servicio

interface PetFriendlyTabContentProps {
  initialPlaces?: any[] // Cambiar a any[] para evitar problemas de tipo
}

// Alternativamente, puedes usar una conversión de tipo al recibir los props:
// export default function PetFriendlyTabContent({ initialPlaces = [] as Service[] }: PetFriendlyTabContentProps) {

export default function PetFriendlyTabContent({ initialPlaces = [] }: PetFriendlyTabContentProps) {
  const [petFriendlyPlaces, setPetFriendlyPlaces] = useState<Service[]>(initialPlaces)
  const [isLoading, setIsLoading] = useState(initialPlaces.length === 0)
  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null)
  const [isRefreshing, setIsRefreshing] = useState(false)

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

  const fetchPetFriendlyPlaces = useCallback(async () => {
    if (!isLoading) setIsRefreshing(true)
    try {
      let url = "/api/services?category=pet-friendly"

      // Add location parameters if available
      if (userLocation?.latitude && userLocation?.longitude) {
        url = `/api/services/nearby?category=pet-friendly&lat=${userLocation.latitude}&lng=${userLocation.longitude}&radius=10`
      }

      const response = await fetch(url)

      if (!response.ok) {
        throw new Error(`Error fetching pet-friendly places: ${response.status}`)
      }

      const data = await response.json()
      setPetFriendlyPlaces(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error("Error fetching pet-friendly places:", error)
      if (petFriendlyPlaces.length === 0) {
        toast.error("No se pudieron cargar los lugares pet-friendly")
      }
    } finally {
      setIsLoading(false)
      setIsRefreshing(false)
    }
  }, [userLocation, setIsLoading, setPetFriendlyPlaces, petFriendlyPlaces.length, isLoading])

  useEffect(() => {
    fetchPetFriendlyPlaces()
  }, [userLocation, fetchPetFriendlyPlaces])

  if (isLoading) {
    return (
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <Card key={i} className="overflow-hidden">
            <div className="h-48 relative">
              <Skeleton className="h-full w-full" />
            </div>
            <CardHeader>
              <Skeleton className="h-6 w-3/4" />
              <Skeleton className="h-4 w-1/2 mt-2" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-3/4" />
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (petFriendlyPlaces.length === 0) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold mb-2">No hay lugares pet-friendly cercanos</h2>
        <p className="text-muted-foreground mb-6">
          No se encontraron cafeterías, restaurantes u otros lugares pet-friendly en tu zona.
        </p>
        <Button asChild>
          <Link href="/contact">Sugerir un lugar</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Lugares Pet-Friendly</h2>
        <div className="flex gap-2">
          {isRefreshing ? (
            <Button variant="outline" disabled>
              <Skeleton className="h-4 w-4 mr-2 rounded-full" />
              Actualizando...
            </Button>
          ) : (
            <Button variant="outline" onClick={fetchPetFriendlyPlaces}>
              Actualizar
            </Button>
          )}
          <Button variant="outline" asChild>
            <Link href="/map/pet-friendly">Ver en mapa</Link>
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {petFriendlyPlaces.map((place) => (
          <Card key={place.id} className="overflow-hidden">
            <div className="h-48 relative">
              <Image
                src={place.imageUrl || "/placeholder.svg?height=200&width=400"}
                alt={place.title}
                fill
                className="object-cover"
              />
              {place.tags && place.tags.length > 0 && (
                <div className="absolute bottom-2 left-2 bg-background/80 backdrop-blur-sm px-2 py-1 rounded text-xs">
                  {place.tags.join(" • ")}
                </div>
              )}
            </div>
            <CardHeader>
              <CardTitle className="flex justify-between items-start">
                <span>{place.title}</span>
                {place.rating && (
                  <span className="bg-primary/10 text-primary px-2 py-1 rounded text-sm">
                    ★ {place.rating.toFixed(1)}
                  </span>
                )}
              </CardTitle>
              <p className="text-sm text-muted-foreground flex items-center">
                <MapPin className="h-3 w-3 mr-1" />
                {place.address || "Dirección no disponible"}
                {place.distance != null && <span className="ml-1">• a {place.distance.toFixed(1)} km</span>}
              </p>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm line-clamp-2">{place.description}</p>

              {place.openingHours && (
                <p className="text-sm flex items-center text-muted-foreground">
                  <Clock className="h-3 w-3 mr-1" />
                  {place.openingHours}
                </p>
              )}

              <div className="flex justify-between pt-2">
                {place.phone && (
                  <Button variant="outline" size="sm" asChild>
                    <a href={`tel:${place.phone}`}>
                      <Phone className="h-4 w-4 mr-1" />
                      Llamar
                    </a>
                  </Button>
                )}

                {place.website && (
                  <Button variant="outline" size="sm" asChild>
                    <a href={place.website} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="h-4 w-4 mr-1" />
                      Sitio web
                    </a>
                  </Button>
                )}

                {place.latitude && place.longitude && (
                  <Button variant="outline" size="sm" asChild>
                    <a
                      href={`https://www.openstreetmap.org/directions?from=&to=${place.latitude}%2C${place.longitude}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <MapPin className="h-4 w-4 mr-1" />
                      Cómo llegar
                    </a>
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

