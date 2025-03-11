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

    // Obtener usuarios con más seguidores
    const users = await prisma.user.findMany({
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
            followers: {
              select: {
                followerId: true,
              },
            },
          },
        },
        _count: {
          select: {
            followers: true,
          },
        },
      },
      orderBy: {
        followers: {
          _count: "desc",
        },
      },
      take: 9, // Limitar a 9 usuarios populares
    })

    const formattedUsers = users.map((user) => ({
      id: user.id,
      username: user.username,
      profileImage: user.profileImage,
      distance: 0, // No aplica para usuarios populares
      isFollowing: user.followers.some((f) => f.followerId === session.user.id),
      followersCount: user._count.followers,
      pets: user.pets.map((pet) => ({
        id: pet.id,
        name: pet.name,
        type: pet.type,
        breed: pet.breed,
        age: pet.age,
        image: pet.image,
        isFollowing: pet.followers.some((f) => f.followerId === session.user.id),
      })),
    }))

    return NextResponse.json(formattedUsers)
  } catch (error) {
    console.error("Error fetching popular users:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}

