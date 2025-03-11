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

    // Obtener mascotas con más seguidores
    const pets = await prisma.pet.findMany({
      select: {
        id: true,
        name: true,
        type: true,
        breed: true,
        image: true,
        user: {
          select: {
            id: true,
            username: true,
          },
        },
        followers: {
          select: {
            userId: true, // Usar userId en lugar de followerId
            user: {
              select: {
                id: true,
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
      take: 9, // Limitar a 9 mascotas populares
    })

    const formattedPets = pets.map((pet) => ({
      id: pet.id,
      name: pet.name,
      type: pet.type,
      breed: pet.breed,
      image: pet.image,
      userId: pet.user.id,
      username: pet.user.username,
      followersCount: pet._count.followers,
      isFollowing: pet.followers.some((f) => f.userId === session?.user?.id), // Usar userId en lugar de followerId
      distance: 0, // No aplica para mascotas populares
    }))

    return NextResponse.json(formattedPets)
  } catch (error) {
    console.error("Error fetching popular pets:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}

