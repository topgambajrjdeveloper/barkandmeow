import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

export async function GET(request: Request) {
  try {
    const session = await auth()

    if (!session || !session.user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const query = searchParams.get("q")

    if (!query || query.length < 1) {
      return NextResponse.json({ pets: [] })
    }

    console.log(`Buscando mascotas con query: "${query}"`)

    // Mejorar la búsqueda para que sea más flexible
    const pets = await prisma.pet.findMany({
      where: {
        OR: [
          { name: { startsWith: query, mode: "insensitive" } },
          { type: { startsWith: query, mode: "insensitive" } },
          { breed: { contains: query, mode: "insensitive" } },
        ],
      },
      select: {
        id: true,
        name: true,
        type: true,
        image: true,
        user: {
          select: {
            username: true,
          },
        },
      },
      take: 10,
    })

    console.log(
      `Encontradas ${pets.length} mascotas:`,
      pets.map((p) => p.name),
    )

    return NextResponse.json({ pets })
  } catch (error) {
    console.error("Error al buscar mascotas:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}

