import prisma from "@/lib/prismadb"

// Obtener eventos próximos
export async function getUpcomingEvents(limit = 3) {
  try {
    console.log(`Fetching ${limit} upcoming events`)

    const events = await prisma.event.findMany({
      where: {
        date: { gte: new Date() },
        isPublished: true,
      },
      orderBy: { date: "asc" },
      take: limit,
      include: {
        _count: {
          select: { attendees: true },
        },
      },
    })

    console.log(`Found ${events.length} upcoming events`)
    return { events }
  } catch (error) {
    console.error("Error fetching upcoming events:", error)
    return { events: [] }
  }
}

// Obtener eventos creados por un usuario
export async function getUserEvents(userId: string) {
  try {
    const events = await prisma.event.findMany({
      where: { userId },
      orderBy: { date: "desc" },
      include: {
        _count: {
          select: { attendees: true },
        },
      },
    })

    return { events }
  } catch (error) {
    console.error("Error fetching user events:", error)
    return { events: [] }
  }
}

// Obtener eventos a los que asiste un usuario
export async function getUserAttendingEvents(userId: string) {
  try {
    const events = await prisma.event.findMany({
      where: {
        attendees: {
          some: {
            id: userId,
          },
        },
      },
      orderBy: { date: "asc" },
      include: {
        _count: {
          select: { attendees: true },
        },
      },
    })

    return { events }
  } catch (error) {
    console.error("Error fetching user attending events:", error)
    return { events: [] }
  }
}

// Verificar si un usuario está asistiendo a un evento
export async function isUserAttendingEvent(userId: string, eventId: string) {
  try {
    const event = await prisma.event.findFirst({
      where: {
        id: eventId,
        attendees: {
          some: {
            id: userId,
          },
        },
      },
    })

    return !!event
  } catch (error) {
    console.error("Error checking if user is attending event:", error)
    return false
  }
}

// Obtener todos los eventos (para administración)
export async function getAllEvents(page = 1, limit = 10) {
  try {
    const skip = (page - 1) * limit

    const events = await prisma.event.findMany({
      orderBy: { date: "desc" },
      take: limit,
      skip,
      include: {
        createdBy: {
          select: {
            id: true,
            username: true,
            profileImage: true,
          },
        },
        _count: {
          select: { attendees: true },
        },
      },
    })

    const total = await prisma.event.count()

    return {
      events,
      pagination: {
        total,
        pages: Math.ceil(total / limit),
        page,
        limit,
      },
    }
  } catch (error) {
    console.error("Error fetching all events:", error)
    return {
      events: [],
      pagination: {
        total: 0,
        pages: 0,
        page,
        limit,
      },
    }
  }
}

// Función para obtener la fecha actual sin la parte de tiempo (solo año, mes, día)
export function getStartOfToday() {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return today
}

// Obtener eventos filtrados (para la página de exploración)
export async function getFilteredEvents(searchParams: { [key: string]: string | string[] | undefined }) {
  try {
    // Obtener parámetros de búsqueda
    const lat = typeof searchParams.lat === "string" ? Number.parseFloat(searchParams.lat) : null
    const lng = typeof searchParams.lng === "string" ? Number.parseFloat(searchParams.lng) : null
    const radius = typeof searchParams.radius === "string" ? Number.parseFloat(searchParams.radius) : 10
    const filter = (searchParams.filter as string) || "all" // 'all', 'upcoming', 'past'

    const startOfToday = getStartOfToday()

    // Construir el objeto where basado en los filtros
    const where: any = {
      isPublished: true,
    }

    // Aplicar filtro de fecha si se solicita
    if (filter === "upcoming") {
      where.date = { gte: startOfToday }
    } else if (filter === "past") {
      where.date = { lt: startOfToday }
    }

    // Obtener todos los eventos publicados
    const events = await prisma.event.findMany({
      where,
      orderBy: filter === "past" ? { date: "desc" } : { date: "asc" },
      include: {
        createdBy: {
          select: {
            id: true,
            username: true,
            profileImage: true,
          },
        },
        _count: {
          select: { attendees: true },
        },
      },
    })

    console.log(`Total published events: ${events.length}`)
    console.log(`Filter applied: ${filter}`)

    // Si se proporcionan coordenadas, calcular la distancia y filtrar por radio
    if (lat && lng) {
      console.log(`Filtering by distance: ${radius}km from [${lat}, ${lng}]`)

      // Calcular distancia para cada evento y filtrar por radio
      const eventsWithDistance = events.map((event) => ({
        ...event,
        distance: calculateDistance(lat, lng, event.latitude, event.longitude),
      }))

      // Filtrar por radio y ordenar por distancia
      const nearbyEvents = eventsWithDistance
        .filter((event) => event.distance <= radius)
        .sort((a, b) => a.distance - b.distance)

      console.log(`Events within ${radius}km: ${nearbyEvents.length}`)
      return nearbyEvents
    }

    return events
  } catch (error) {
    console.error("Error fetching filtered events:", error)
    return []
  }
}

// Función para calcular la distancia entre dos puntos (fórmula de Haversine)
export function calculateDistance(lat1: number, lon1: number, lat2: number | null, lon2: number | null): number {
  if (lat2 === null || lon2 === null) return 999999 // Distancia muy grande si no hay coordenadas

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

