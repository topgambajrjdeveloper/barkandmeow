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

    const pets = await prisma.pet.findMany({
      where: {
        userId: { not: session.user.id },
      },
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
      },
      take: 20, // Limit to 20 pets for performance
    })

    const formattedPets = pets.map((pet) => ({
      id: pet.id,
      name: pet.name,
      type: pet.type,
      breed: pet.breed,
      image: pet.image,
      ownerId: pet.user.id,
      ownerName: pet.user.username,
    }))

    return NextResponse.json(formattedPets)
  } catch (error) {
    console.error("Error fetching pets:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}

