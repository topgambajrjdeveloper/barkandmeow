import { NextResponse } from "next/server"
import { auth } from "@/auth"
import prisma from "@/lib/prismadb"

export async function GET(request: Request) {
  try {
    const session = await auth()

    if (!session || !session.user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const query = searchParams.get("q")

    if (!query || query.length < 1) {
      return NextResponse.json({ users: [] })
    }

    console.log(`Buscando usuarios con query: "${query}"`)

    // Mejorar la búsqueda para que sea más flexible
    const users = await prisma.user.findMany({
      where: {
        OR: [
          { username: { startsWith: query, mode: "insensitive" } },
          { email: { startsWith: query, mode: "insensitive" } },
          { petName: { contains: query, mode: "insensitive" } },
        ],
        // Excluir al usuario actual de los resultados
        NOT: { id: session.user.id },
      },
      select: {
        id: true,
        username: true,
        profileImage: true,
      },
      take: 10,
    })

    console.log(
      `Encontrados ${users.length} usuarios:`,
      users.map((u) => u.username),
    )

    return NextResponse.json({ users })
  } catch (error) {
    console.error("Error al buscar usuarios:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}

