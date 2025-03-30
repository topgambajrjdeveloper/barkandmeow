import { NextResponse } from "next/server"
import { auth } from "@/auth"
import prisma from "@/lib/prismadb"

// POST - Asistir a un evento
export async function POST(request: Request, { params }: { params: { eventId: string } }) {
  try {
    const session = await auth()
    const eventId = params.eventId

    if (!session?.user?.id) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    // Verificar si el evento existe
    const event = await prisma.event.findUnique({
      where: { id: eventId },
    })

    if (!event) {
      return NextResponse.json({ error: "Evento no encontrado" }, { status: 404 })
    }

    // Verificar si el usuario ya está asistiendo
    const existingAttendance = await prisma.event.findFirst({
      where: {
        id: eventId,
        attendees: {
          some: {
            id: session.user.id,
          },
        },
      },
    })

    if (existingAttendance) {
      return NextResponse.json({ error: "Ya estás asistiendo a este evento" }, { status: 400 })
    }

    // Añadir al usuario como asistente
    await prisma.event.update({
      where: { id: eventId },
      data: {
        attendees: {
          connect: {
            id: session.user.id,
          },
        },
      },
    })

    return NextResponse.json({ message: "Asistencia confirmada" })
  } catch (error) {
    console.error("[EVENT_ATTEND_POST]", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}

// DELETE - Cancelar asistencia a un evento
export async function DELETE(request: Request, { params }: { params: { eventId: string } }) {
  try {
    const session = await auth()
    const eventId = params.eventId

    if (!session?.user?.id) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    // Verificar si el evento existe
    const event = await prisma.event.findUnique({
      where: { id: eventId },
    })

    if (!event) {
      return NextResponse.json({ error: "Evento no encontrado" }, { status: 404 })
    }

    // Verificar si el usuario está asistiendo
    const existingAttendance = await prisma.event.findFirst({
      where: {
        id: eventId,
        attendees: {
          some: {
            id: session.user.id,
          },
        },
      },
    })

    if (!existingAttendance) {
      return NextResponse.json({ error: "No estás asistiendo a este evento" }, { status: 400 })
    }

    // Eliminar al usuario como asistente
    await prisma.event.update({
      where: { id: eventId },
      data: {
        attendees: {
          disconnect: {
            id: session.user.id,
          },
        },
      },
    })

    return NextResponse.json({ message: "Asistencia cancelada" })
  } catch (error) {
    console.error("[EVENT_ATTEND_DELETE]", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}

