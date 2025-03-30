import { NextResponse } from "next/server"
import prisma from "@/lib/prismadb"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const latStr = searchParams.get("lat")
    const lngStr = searchParams.get("lng")
    const radiusStr = searchParams.get("radius") || "10" // Default 10km

    // Obtener lugares pet-friendly
    const petFriendlyPlaces = await prisma.service.findMany({
      where: {
        category: "pet-friendly",
        isActive: true,
      },
      orderBy: {
        rating: "desc",
      },
      select: {
        id: true,
        title: true,
        description: true,
        address: true,
        phone: true,
        website: true,
        imageUrl: true,
        category: true,
        tags: true,
        openingHours: true,
        latitude: true,
        longitude: true,
        rating: true,
      },
    })

    // Si se proporcionan coordenadas, calcular la distancia
    if (latStr && lngStr) {
      const lat = Number.parseFloat(latStr)
      const lng = Number.parseFloat(lngStr)
      const radius = Number.parseFloat(radiusStr)

      if (!isNaN(lat) && !isNaN(lng) && !isNaN(radius)) {
        // Función para calcular la distancia entre dos puntos usando la fórmula de Haversine
        function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
          const R = 6371 // Radio de la Tierra en km
          const dLat = (lat2 - lat1) * (Math.PI / 180)
          const dLon = (lon2 - lon1) * (Math.PI / 180)
          const a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(lat1 * (Math.PI / 180)) *
              Math.cos(lat2 * (Math.PI / 180)) *
              Math.sin(dLon / 2) *
              Math.sin(dLon / 2)
          const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
          const distance = R * c // Distancia en km
          return distance
        }

        // Filtrar y calcular la distancia para cada lugar
        const nearbyPlaces = petFriendlyPlaces
          .filter((place) => {
            if (!place.latitude || !place.longitude) return false

            const distance = calculateDistance(lat, lng, place.latitude, place.longitude)

            // Añadir la distancia al objeto
            ;(place as any).distance = distance

            // Filtrar por radio
            return distance <= radius
          })
          .sort((a, b) => (a as any).distance - (b as any).distance)

        return NextResponse.json(nearbyPlaces)
      }
    }

    return NextResponse.json(petFriendlyPlaces)
  } catch (error) {
    console.error("Error al obtener lugares pet-friendly:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}

