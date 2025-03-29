import { NextResponse } from "next/server"
import { auth } from "@/auth"
import prisma from "@/lib/prismadb"

// POST - Asistir a un evento
export async function POST(request: Request, { params }: { params: { eventId: string } }) {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    // Esperar a que params esté disponible y luego acceder a eventId
    const { eventId } = await params

    // Verificar si el evento existe
    const event = await prisma.event.findUnique({
      where: { id: eventId },
    })

    if (!event) {
      return NextResponse.json({ error: "Evento no encontrado" }, { status: 404 })
    }

    // Verificar si el usuario ya está asistiendo
    const isAttending = await prisma.event.findFirst({
      where: {
        id: eventId,
        attendees: {
          some: {
            id: session.user.id,
          },
        },
      },
    })

    if (isAttending) {
      // Si ya está asistiendo, eliminar la asistencia
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

      return NextResponse.json({ attending: false })
    } else {
      // Si no está asistiendo, agregar la asistencia
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

      return NextResponse.json({ attending: true })
    }
  } catch (error) {
    console.error("[EVENT_ATTEND]", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}

// GET - Verificar si el usuario está asistiendo
export async function GET(request: Request, { params }: { params: { eventId: string } }) {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    // Esperar a que params esté disponible y luego acceder a eventId
    const { eventId } = await params

    // Verificar si el usuario está asistiendo
    const isAttending = await prisma.event.findFirst({
      where: {
        id: eventId,
        attendees: {
          some: {
            id: session.user.id,
          },
        },
      },
    })

    return NextResponse.json({ attending: !!isAttending })
  } catch (error) {
    console.error("[EVENT_IS_ATTENDING]", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}

