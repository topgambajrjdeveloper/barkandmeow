import { NextResponse } from "next/server"
import prisma from "@/lib/prismadb"

// Función para calcular la distancia entre dos puntos usando la fórmula de Haversine
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371 // Radio de la Tierra en km
  const dLat = (lat2 - lat1) * (Math.PI / 180)
  const dLon = (lon2 - lon1) * (Math.PI / 180)
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) * Math.sin(dLon / 2) * Math.sin(dLon / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  const distance = R * c // Distancia en km
  return distance
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get("category")
    const latStr = searchParams.get("lat")
    const lngStr = searchParams.get("lng")
    const radiusStr = searchParams.get("radius") || "10" // Default 10km

    if (!category || !latStr || !lngStr) {
      return NextResponse.json({ error: "Se requieren los parámetros 'category', 'lat' y 'lng'" }, { status: 400 })
    }

    const lat = Number.parseFloat(latStr)
    const lng = Number.parseFloat(lngStr)
    const radius = Number.parseFloat(radiusStr)

    if (isNaN(lat) || isNaN(lng) || isNaN(radius)) {
      return NextResponse.json(
        { error: "Los parámetros 'lat', 'lng' y 'radius' deben ser números válidos" },
        { status: 400 },
      )
    }

    // Obtener todos los servicios de la categoría especificada
    const services = await prisma.service.findMany({
      where: {
        subCategory: category,
        isActive: true,
        // Solo incluir servicios que tengan coordenadas
        latitude: { not: null },
        longitude: { not: null },
      },
      select: {
        id: true,
        title: true,
        description: true,
        address: true,
        phone: true,
        website: true,
        imageUrl: true,
        subCategory: true,
        tags: true,
        openingHours: true,
        latitude: true,
        longitude: true,
        rating: true,
      },
    })

    // Filtrar y calcular la distancia para cada servicio
    const nearbyServices = services
      .filter((service) => {
        if (!service.latitude || !service.longitude) return false

        const distance = calculateDistance(lat, lng, service.latitude, service.longitude)

        // Añadir la distancia al objeto de servicio
        ;(service as any).distance = distance

        // Filtrar por radio
        return distance <= radius
      })
      .sort((a, b) => (a as any).distance - (b as any).distance)

    return NextResponse.json(nearbyServices)
  } catch (error) {
    console.error("Error al obtener servicios cercanos:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}

