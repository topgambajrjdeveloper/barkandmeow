import { NextResponse } from "next/server"
import { auth } from "@/auth"
import prisma from "@/lib/prismadb"

export async function GET() {
  try {
    const session = await auth()

    // Verificar si el usuario es administrador
    if (!session?.user?.id || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    // Obtener estadísticas
    const [totalUsers, totalPets, totalPosts, totalEvents] = await Promise.all([
      prisma.user.count(),
      prisma.pet.count(),
      prisma.post.count(),
      prisma.event.count(),
    ])

    return NextResponse.json({
      totalUsers,
      totalPets,
      totalPosts,
      totalEvents,
    })
  } catch (error) {
    console.error("[ADMIN_STATS_GET]", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}

