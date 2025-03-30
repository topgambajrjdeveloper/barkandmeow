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

// Modificar la función GET para asegurar que devuelve todos los lugares cuando all=true
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get("category")
    const latStr = searchParams.get("lat")
    const lngStr = searchParams.get("lng")
    const radiusStr = searchParams.get("radius") || "10" // Default 10km
    const ignoreDistance = searchParams.get("all") === "true" // Nuevo parámetro para ignorar la distancia

    if (!category) {
      return NextResponse.json({ error: "Se requiere el parámetro 'category'" }, { status: 400 })
    }

    console.log(`API: Buscando servicios para category=${category}, ignoreDistance=${ignoreDistance}`)

    // Obtener todos los servicios de la categoría especificada
    const services = await prisma.service.findMany({
      where: {
        category: category,
        isActive: true,
        // No filtrar por coordenadas cuando ignoreDistance es true
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
        subCategory: true,
        tags: true,
        openingHours: true,
        latitude: true,
        longitude: true,
        rating: true,
        isActive: true,
      },
    })

    console.log(`API: Encontrados ${services.length} servicios para category=${category}`)

    // Log para depuración
    if (services.length > 0) {
      console.log(
        "Primer servicio:",
        JSON.stringify(
          {
            title: services[0].title,
            latitude: services[0].latitude,
            longitude: services[0].longitude,
          },
          null,
          2,
        ),
      )
    }

    // Si estamos ignorando la distancia o no tenemos coordenadas, devolver todos los servicios
    if (ignoreDistance || !latStr || !lngStr) {
      return NextResponse.json(services)
    }

    const lat = Number.parseFloat(latStr)
    const lng = Number.parseFloat(lngStr)
    const radius = Number.parseFloat(radiusStr)

    if (isNaN(lat) || isNaN(lng) || isNaN(radius)) {
      // Si hay un problema con las coordenadas, devolver todos los servicios
      return NextResponse.json(services)
    }

    // Filtrar y calcular la distancia para cada servicio
    const servicesWithDistance = services.map((service) => {
      if (service.latitude && service.longitude) {
        const distance = calculateDistance(lat, lng, service.latitude, service.longitude)
        return {
          ...service,
          distance, // Añadir la propiedad distance explícitamente
        }
      }
      return {
        ...service,
        distance: null, // Asignar null para servicios sin coordenadas
      }
    })

    // Ordenar por distancia si corresponde
    const sortedServices = ignoreDistance
      ? servicesWithDistance
      : servicesWithDistance
          .filter((service) => service.distance !== null && service.distance <= radius)
          .sort((a, b) => (a.distance || Number.POSITIVE_INFINITY) - (b.distance || Number.POSITIVE_INFINITY))

    console.log(`API: Devolviendo ${sortedServices.length} servicios después de procesar distancias`)

    return NextResponse.json(sortedServices)
  } catch (error) {
    console.error("Error al obtener servicios cercanos:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}

