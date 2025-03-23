import { NextResponse } from "next/server"
import { auth } from "@/auth"
import prisma from "@/lib/prismadb"

export async function GET() {
  try {
    const session = await auth()

    // Verificar si el usuario está autenticado y es administrador
    if (!session || session?.user?.role !== "ADMIN") {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 })
    }

    // Obtener estadísticas básicas
    const [
      usersCount,
      petsCount,
      postsCount,
      commentsCount,
      followsCount,
      petFollowsCount,
      healthCardsCount,
      passportsCount,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.pet.count(),
      prisma.post.count(),
      prisma.comment.count(),
      prisma.follows.count(),
      prisma.petFollows.count(),
      prisma.healthCard.count(),
      prisma.passport.count(),
    ])

    // Obtener usuarios nuevos en los últimos 7 días
    const oneWeekAgo = new Date()
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7)

    const newUsersCount = await prisma.user.count({
      where: {
        createdAt: {
          gte: oneWeekAgo,
        },
      },
    })

    // Obtener publicaciones nuevas en los últimos 7 días
    const newPostsCount = await prisma.post.count({
      where: {
        createdAt: {
          gte: oneWeekAgo,
        },
      },
    })

    return NextResponse.json({
      usersCount,
      petsCount,
      postsCount,
      commentsCount,
      followsCount,
      petFollowsCount,
      healthCardsCount,
      passportsCount,
      newUsersCount,
      newPostsCount,
    })
  } catch (error) {
    console.error("Error en API de estadísticas:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}

