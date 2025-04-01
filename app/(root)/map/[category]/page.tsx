"use client"

import { useEffect, useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { toast } from "sonner"
import dynamic from "next/dynamic"
import type { Service } from "@/types"
import { getUserLocation } from "@/lib/location"
import { use } from "react"
import { ArrowLeft, MapPin, Store, Stethoscope, Coffee } from "lucide-react"
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"

// Cargar el componente de mapa dinámicamente para evitar problemas de SSR
const MapComponent = dynamic(() => import("@/components/(auth)/components/map/map-component"), {
  ssr: false,
  loading: () => <div className="h-screen w-full bg-muted flex items-center justify-center">Cargando mapa...</div>,
})

// Categorías disponibles
const categories = [
  {
    id: "pet-friendly",
    title: "Pet-Friendly",
    description: "Lugares donde puedes ir con tu mascota",
    icon: <Coffee className="h-5 w-5" />,
    color: "bg-black text-white",
  },
  {
    id: "shop",
    title: "Tiendas",
    description: "Tiendas de mascotas y accesorios",
    icon: <Store className="h-5 w-5" />,
    color: "bg-orange-500 text-white",
  },
  {
    id: "vet",
    title: "Veterinarias",
    description: "Clínicas y hospitales veterinarios",
    icon: <Stethoscope className="h-5 w-5" />,
    color: "bg-green-500 text-white",
  },
]

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

  // Función para manejar el clic en un marcador
  const handleMarkerClick = (place: Service) => {
    setSelectedPlace(place)
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

  // Obtener el icono según la categoría
  const getCategoryIcon = () => {
    const categoryInfo = categories.find((c) => c.id === category)
    return categoryInfo?.icon || <MapPin className="h-5 w-5" />
  }

  // Función para cambiar de categoría
  const handleCategoryChange = (categoryId: string) => {
    // Navegar a la nueva categoría
    window.location.href = `/map/${categoryId}`
  }

  return (
    <div className="h-screen w-full flex flex-col">
      {/* Header con título y botones */}
      <div className="p-4 bg-background/80 backdrop-blur-sm z-10 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" asChild>
            <Link
              href={`/map?category=${category === "pet-friendly" ? "shop" : category === "shop" ? "vet" : "pet-friendly"}`}
            >
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div className="flex items-center gap-2">
            <div className={`p-1.5 rounded-full ${categories.find((c) => c.id === category)?.color || "bg-primary"}`}>
              {getCategoryIcon()}
            </div>
            <h1 className="text-xl font-bold">{getTitle()}</h1>
          </div>
        </div>
        <Button onClick={updateLocation} variant="outline" size="sm">
          Actualizar ubicación
        </Button>
      </div>

      {/* Contenedor del mapa a pantalla completa */}
      <div className="flex-1 relative">
        {isLoading ? (
          <div className="h-full w-full flex items-center justify-center bg-muted">
            <Skeleton className="h-20 w-20 rounded-full" />
          </div>
        ) : (
          <div className="relative h-full">
            <MapComponent
              places={places}
              userLocation={userLocation}
              onMarkerClick={handleMarkerClick}
              height="100%"
              ref={mapRef}
            />

            {/* Categorías en la parte inferior con scroll horizontal - ahora dentro del mapa */}
            <div className="absolute bottom-4 left-0 right-0 z-[500] px-4 overflow-x-auto scrollbar-hide">
              <div className="flex space-x-4 pb-2">
                {categories.map((cat) => (
                  <Card
                    key={cat.id}
                    className={`flex-shrink-0 w-64 cursor-pointer ${cat.id === category ? "ring-2 ring-primary" : ""}`}
                    onClick={() => handleCategoryChange(cat.id)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-full ${cat.color}`}>{cat.icon}</div>
                        <div>
                          <h3 className="font-medium">{cat.title}</h3>
                          <p className="text-xs text-muted-foreground">{cat.description}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

