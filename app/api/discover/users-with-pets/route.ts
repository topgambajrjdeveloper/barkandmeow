import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function GET(request: Request) {
  try {
    const session = await auth()

    if (!session || !session.user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const users = await prisma.user.findMany({
      where: {
        id: { not: session.user.id },
      },
      select: {
        id: true,
        username: true,
        profileImage: true,
        followers: {
          select: {
            followerId: true,
          },
        },
        pets: {
          select: {
            id: true,
            name: true,
            type: true,
            breed: true,
            age: true,
            image: true,
          },
        },
      },
      take: 20, // Limitar a 20 usuarios para rendimiento
    })

    const formattedUsers = users.map((user) => ({
      id: user.id,
      username: user.username,
      profileImage: user.profileImage,
      followersCount: user.followers.length,
      isFollowing: user.followers.some((f) => f.followerId === session?.user?.id),
      pets: user.pets,
    }))

    return NextResponse.json(formattedUsers)
  } catch (error) {
    console.error("Error fetching users with pets:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}

