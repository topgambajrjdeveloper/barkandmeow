import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

export async function GET() {
  try {
    const session = await auth()

    if (!session || !session.user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        username: true,
        email: true,
        profileImage: true,
        petName: true,
        petType: true,
        petImage: true,
        isPublicProfile: true,
        location: true,
        createdAt: true,
      },
    })

    if (!user) {
      return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 })
    }

    // Aquí puedes agregar lógica para contar posts, seguidores y seguidos
    // Por ahora, usaremos valores de ejemplo
    const userProfile = {
      ...user,
      postsCount: 0,
      followersCount: 0,
      followingCount: 0,
      createdAt: user.createdAt.toISOString(),
    }

    return NextResponse.json(userProfile)
  } catch (error) {
    console.error("Error fetching user profile:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}

