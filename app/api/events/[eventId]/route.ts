import { NextResponse } from "next/server"
import { auth } from "@/auth"
import prisma from "@/lib/prismadb"

// GET - Obtener un evento específico
export async function GET(request: Request, { params }: { params: { eventId: string } }) {
  try {
    // Esperar a que params esté disponible y luego acceder a eventId
    const { eventId } = await params

    if (!eventId) {
      return NextResponse.json({ error: "ID de evento no proporcionado" }, { status: 400 })
    }

    const event = await prisma.event.findUnique({
      where: { id: eventId },
      include: {
        createdBy: {
          select: {
            id: true,
            username: true,
            profileImage: true,
          },
        },
        attendees: {
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

    if (!event) {
      return NextResponse.json({ error: "Evento no encontrado" }, { status: 404 })
    }

    return NextResponse.json(event)
  } catch (error) {
    console.error("[EVENT_GET]", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}

// PATCH - Actualizar un evento
export async function PATCH(request: Request, { params }: { params: { eventId: string } }) {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    // Esperar a que params esté disponible y luego acceder a eventId
    const { eventId } = await params
    const body = await request.json()

    // Verificar si el usuario es el creador del evento o un administrador
    const event = await prisma.event.findUnique({
      where: { id: eventId },
      select: { userId: true },
    })

    if (!event) {
      return NextResponse.json({ error: "Evento no encontrado" }, { status: 404 })
    }

    // Verificar si el usuario es el creador o un administrador
    const isAdmin = session.user.role === "ADMIN"
    if (event.userId !== session.user.id && !isAdmin) {
      return NextResponse.json({ error: "No autorizado para editar este evento" }, { status: 403 })
    }

    // Actualizar el evento
    const updatedEvent = await prisma.event.update({
      where: { id: eventId },
      data: {
        title: body.title,
        description: body.description,
        location: body.location,
        date: body.date ? new Date(body.date) : undefined,
        endDate: body.endDate ? new Date(body.endDate) : null,
        imageUrl: body.imageUrl,
        latitude: body.latitude,
        longitude: body.longitude,
        isPublished: body.isPublished,
      },
    })

    return NextResponse.json(updatedEvent)
  } catch (error) {
    console.error("[EVENT_PATCH]", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}

// DELETE - Eliminar un evento
export async function DELETE(request: Request, { params }: { params: { eventId: string } }) {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    // Esperar a que params esté disponible y luego acceder a eventId
    const { eventId } = await params

    // Verificar si el usuario es el creador del evento o un administrador
    const event = await prisma.event.findUnique({
      where: { id: eventId },
      select: { userId: true },
    })

    if (!event) {
      return NextResponse.json({ error: "Evento no encontrado" }, { status: 404 })
    }

    // Verificar si el usuario es el creador o un administrador
    const isAdmin = session.user.role === "ADMIN"
    if (event.userId !== session.user.id && !isAdmin) {
      return NextResponse.json({ error: "No autorizado para eliminar este evento" }, { status: 403 })
    }

    // Eliminar el evento
    await prisma.event.delete({
      where: { id: eventId },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[EVENT_DELETE]", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}

