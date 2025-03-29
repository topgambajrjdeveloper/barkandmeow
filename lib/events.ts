import prisma from "@/lib/prismadb"

// Obtener eventos próximos
export async function getUpcomingEvents(limit = 3) {
  try {
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

