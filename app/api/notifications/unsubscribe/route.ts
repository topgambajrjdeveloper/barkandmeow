import { NextResponse } from "next/server"
import { auth } from "@/auth"
import prisma from "@/lib/prismadb"

export async function POST(request: Request) {
  try {
    const session = await auth()

    if (!session || !session.user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const userId = session.user.id
    const { endpoint } = await request.json()

    if (!endpoint) {
      return NextResponse.json({ error: "Endpoint no proporcionado" }, { status: 400 })
    }

    // Buscar y eliminar la suscripción
    const deletedSubscriptions = await prisma.pushSubscription.deleteMany({
      where: {
        userId,
        subscription: {
          contains: endpoint,
        },
      },
    })

    return NextResponse.json({
      success: true,
      deletedCount: deletedSubscriptions.count,
    })
  } catch (error) {
    console.error("Error unsubscribing from notifications:", error)
    return NextResponse.json({ error: error instanceof Error ? error.message : "Error desconocido" }, { status: 500 })
  }
}

