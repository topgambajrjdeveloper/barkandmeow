"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { MapPin, ExternalLink, Phone, Clock } from "lucide-react"
import { toast } from "sonner"
import Image from "next/image"
import Link from "next/link"
import type { Service } from "@/types"
import { getUserLocation } from "@/lib/location"

interface ShopsTabContentProps {
  initialShops?: Service[]
}

export default function ShopsTabContent({ initialShops = [] }: ShopsTabContentProps) {
  const [shops, setShops] = useState<Service[]>(initialShops)
  const [isLoading, setIsLoading] = useState(initialShops.length === 0)
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

  const fetchShops = async () => {
    if (!isLoading) setIsRefreshing(true)
    try {
      let url = "/api/services?category=shop"

      // Add location parameters if available
      if (userLocation?.latitude && userLocation?.longitude) {
        url = `/api/services/nearby?category=shop&lat=${userLocation.latitude}&lng=${userLocation.longitude}&radius=10`
      }

      const response = await fetch(url)

      if (!response.ok) {
        throw new Error(`Error fetching shops: ${response.status}`)
      }

      const data = await response.json()
      setShops(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error("Error fetching shops:", error)
      if (shops.length === 0) {
        toast.error("No se pudieron cargar las tiendas")
      }
    } finally {
      setIsLoading(false)
      setIsRefreshing(false)
    }
  }

  useEffect(() => {
    fetchShops()
  }, [userLocation])

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

  if (shops.length === 0) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold mb-2">No hay tiendas cercanas</h2>
        <p className="text-muted-foreground mb-6">No se encontraron tiendas de mascotas en tu zona.</p>
        <Button asChild>
          <Link href="/contact">Sugerir una tienda</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Tiendas de Mascotas</h2>
        <div className="flex gap-2">
          {isRefreshing ? (
            <Button variant="outline" disabled>
              <Skeleton className="h-4 w-4 mr-2 rounded-full" />
              Actualizando...
            </Button>
          ) : (
            <Button variant="outline" onClick={fetchShops}>
              Actualizar
            </Button>
          )}
          <Button variant="outline" asChild>
            <Link href="/map?category=shop">Ver en mapa</Link>
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {shops.map((shop) => (
          <Card key={shop.id} className="overflow-hidden">
            <div className="h-48 relative">
              <Image
                src={shop.imageUrl || "/placeholder.svg?height=200&width=400"}
                alt={shop.title}
                fill
                className="object-cover"
              />
              {shop.tags && shop.tags.length > 0 && (
                <div className="absolute bottom-2 left-2 bg-background/80 backdrop-blur-sm px-2 py-1 rounded text-xs">
                  {shop.tags.join(" • ")}
                </div>
              )}
            </div>
            <CardHeader>
              <CardTitle className="flex justify-between items-start">
                <span>{shop.title}</span>
                {shop.rating && (
                  <span className="bg-primary/10 text-primary px-2 py-1 rounded text-sm">
                    ★ {shop.rating.toFixed(1)}
                  </span>
                )}
              </CardTitle>
              <p className="text-sm text-muted-foreground flex items-center">
                <MapPin className="h-3 w-3 mr-1" />
                {shop.address || "Dirección no disponible"}
                {shop.distance && <span className="ml-1">• a {shop.distance.toFixed(1)} km</span>}
              </p>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm line-clamp-2">{shop.description}</p>

              {shop.openingHours && (
                <p className="text-sm flex items-center text-muted-foreground">
                  <Clock className="h-3 w-3 mr-1" />
                  {shop.openingHours}
                </p>
              )}

              <div className="flex justify-between pt-2">
                {shop.phone && (
                  <Button variant="outline" size="sm" asChild>
                    <a href={`tel:${shop.phone}`}>
                      <Phone className="h-4 w-4 mr-1" />
                      Llamar
                    </a>
                  </Button>
                )}

                {shop.website && (
                  <Button variant="outline" size="sm" asChild>
                    <a href={shop.website} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="h-4 w-4 mr-1" />
                      Sitio web
                    </a>
                  </Button>
                )}

                {shop.latitude && shop.longitude && (
                  <Button variant="outline" size="sm" asChild>
                    <a
                      href={`https://www.openstreetmap.org/directions?from=&to=${shop.latitude}%2C${shop.longitude}`}
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

