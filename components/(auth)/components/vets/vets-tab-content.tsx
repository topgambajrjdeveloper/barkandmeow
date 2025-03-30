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

interface VetsTabContentProps {
  initialVets?: any[] // Cambiar a any[] para evitar problemas de tipo
}

export default function VetsTabContent({ initialVets = [] }: VetsTabContentProps) {
  const [vets, setVets] = useState<Service[]>(initialVets)
  const [isLoading, setIsLoading] = useState(initialVets.length === 0)
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

  const fetchVets = useCallback(async () => {
    if (!isLoading) setIsRefreshing(true)
    try {
      // Modificar para obtener todos los datos independientemente de la ubicación
      let url = "/api/services?category=vet"

      // Si tenemos ubicación, podemos usarla para calcular distancias, pero no filtrar
      if (userLocation?.latitude && userLocation?.longitude) {
        url = `/api/services/nearby?category=vet&lat=${userLocation.latitude}&lng=${userLocation.longitude}&all=true`
      }

      console.log("Fetching vets from URL:", url)

      const response = await fetch(url)

      if (!response.ok) {
        throw new Error(`Error fetching vets: ${response.status}`)
      }

      const data = await response.json()
      console.log("Received vets data:", data.length, "items")
      setVets(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error("Error fetching vets:", error)
      if (vets.length === 0) {
        toast.error("No se pudieron cargar las veterinarias")
      }
    } finally {
      setIsLoading(false)
      setIsRefreshing(false)
    }
  }, [userLocation, setIsLoading, setVets, vets.length, isLoading])

  useEffect(() => {
    fetchVets()
  }, [userLocation, fetchVets])

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

  if (vets.length === 0) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold mb-2">No hay veterinarias disponibles</h2>
        <p className="text-muted-foreground mb-6">No se encontraron clínicas veterinarias en la base de datos.</p>
        <Button asChild>
          <Link href="/contact">Sugerir una veterinaria</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Veterinarias</h2>
        <div className="flex gap-2">
          {isRefreshing ? (
            <Button variant="outline" disabled>
              <Skeleton className="h-4 w-4 mr-2 rounded-full" />
              Actualizando...
            </Button>
          ) : (
            <Button variant="outline" onClick={fetchVets}>
              Actualizar
            </Button>
          )}
          <Button variant="outline" asChild>
            <Link href="/map/vet">Ver en mapa</Link>
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {vets.map((vet) => (
          <Card key={vet.id} className="overflow-hidden">
            <div className="h-48 relative">
              <Image
                src={vet.imageUrl || "/placeholder.svg?height=200&width=400"}
                alt={vet.title}
                fill
                className="object-cover"
              />
              {vet.tags && vet.tags.length > 0 && (
                <div className="absolute bottom-2 left-2 bg-background/80 backdrop-blur-sm px-2 py-1 rounded text-xs">
                  {vet.tags.join(" • ")}
                </div>
              )}
            </div>
            <CardHeader>
              <CardTitle className="flex justify-between items-start">
                <span>{vet.title}</span>
                {vet.rating && (
                  <span className="bg-primary/10 text-primary px-2 py-1 rounded text-sm">
                    ★ {vet.rating.toFixed(1)}
                  </span>
                )}
              </CardTitle>
              <p className="text-sm text-muted-foreground flex items-center">
                <MapPin className="h-3 w-3 mr-1" />
                {vet.address || "Dirección no disponible"}
                {vet.distance != null && <span className="ml-1">• a {vet.distance.toFixed(1)} km</span>}
              </p>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm line-clamp-2">{vet.description}</p>

              {vet.openingHours && (
                <p className="text-sm flex items-center text-muted-foreground">
                  <Clock className="h-3 w-3 mr-1" />
                  {vet.openingHours}
                </p>
              )}

              <div className="flex justify-between pt-2">
                {vet.phone && (
                  <Button variant="outline" size="sm" asChild>
                    <a href={`tel:${vet.phone}`}>
                      <Phone className="h-4 w-4 mr-1" />
                      Llamar
                    </a>
                  </Button>
                )}

                {vet.website && (
                  <Button variant="outline" size="sm" asChild>
                    <a href={vet.website} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="h-4 w-4 mr-1" />
                      Sitio web
                    </a>
                  </Button>
                )}

                {vet.latitude && vet.longitude && (
                  <Button variant="outline" size="sm" asChild>
                    <a
                      href={`https://www.openstreetmap.org/directions?from=&to=${vet.latitude}%2C${vet.longitude}`}
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

