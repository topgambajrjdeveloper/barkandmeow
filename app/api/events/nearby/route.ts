import { NextResponse } from "next/server"
import prisma from "@/lib/prismadb"

// Función para calcular la distancia entre dos puntos geográficos (fórmula de Haversine)
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
    const lat = Number.parseFloat(searchParams.get("lat") || "0")
    const lng = Number.parseFloat(searchParams.get("lng") || "0")
    const radius = Number.parseFloat(searchParams.get("radius") || "10")

    if (!lat || !lng) {
      return NextResponse.json({ error: "Se requieren coordenadas válidas" }, { status: 400 })
    }

    // Obtener todos los eventos próximos
    const events = await prisma.event.findMany({
      where: {
        date: { gte: new Date() },
        isPublished: true,
      },
      include: {
        _count: {
          select: { attendees: true },
        },
      },
    })

    // Filtrar eventos por distancia y añadir la distancia a cada evento
    const nearbyEvents = events
      .map((event) => {
        // Si el evento no tiene coordenadas, asignar una distancia aleatoria (para desarrollo)
        if (!event.latitude || !event.longitude) {
          return {
            ...event,
            distance: Math.random() * radius, // Distancia aleatoria dentro del radio
          }
        }

        // Calcular la distancia real
        const distance = calculateDistance(lat, lng, event.latitude, event.longitude)
        return {
          ...event,
          distance,
        }
      })
      // Filtrar por radio
      .filter((event) => event.distance <= radius)
      // Ordenar por distancia
      .sort((a, b) => a.distance - b.distance)

    return NextResponse.json(nearbyEvents)
  } catch (error) {
    console.error("[EVENTS_NEARBY_GET]", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}

