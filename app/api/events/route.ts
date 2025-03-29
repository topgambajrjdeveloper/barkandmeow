import { NextResponse } from "next/server"
import { auth } from "@/auth"
import prisma from "@/lib/prismadb"

// GET - Obtener todos los eventos
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const upcoming = searchParams.get("upcoming") === "true"
    const limit = Number.parseInt(searchParams.get("limit") || "10")
    const page = Number.parseInt(searchParams.get("page") || "1")
    const skip = (page - 1) * limit

    // Filtros para eventos próximos
    const where = upcoming
      ? {
          date: { gte: new Date() },
          isPublished: true,
        }
      : { isPublished: true }

    const events = await prisma.event.findMany({
      where,
      orderBy: { date: "asc" },
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

    const total = await prisma.event.count({ where })

    return NextResponse.json({
      events,
      pagination: {
        total,
        pages: Math.ceil(total / limit),
        page,
        limit,
      },
    })
  } catch (error) {
    console.error("[EVENTS_GET]", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}

// POST - Crear un nuevo evento
export async function POST(request: Request) {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const body = await request.json()
    const { title, description, location, date, endDate, imageUrl, latitude, longitude, isPublished } = body

    // Validaciones básicas
    if (!title || !description || !location || !date) {
      return NextResponse.json({ error: "Faltan campos requeridos" }, { status: 400 })
    }

    const event = await prisma.event.create({
      data: {
        title,
        description,
        location,
        date: new Date(date),
        endDate: endDate ? new Date(endDate) : null,
        imageUrl,
        latitude,
        longitude,
        isPublished: isPublished || false,
        userId: session.user.id,
      },
    })

    return NextResponse.json(event)
  } catch (error) {
    console.error("[EVENTS_POST]", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}

