import { NextResponse } from "next/server"
import { auth } from "@/auth"
import prisma from "@/lib/prismadb"

export async function POST(request: Request) {
  try {
    const session = await auth()

    if (!session || !session.user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const { targetId, type } = await request.json()

    if (!targetId) {
      return NextResponse.json({ error: "ID de objetivo no proporcionado" }, { status: 400 })
    }

    if (!["user", "pet"].includes(type)) {
      return NextResponse.json({ error: "Tipo de objetivo inválido" }, { status: 400 })
    }

    // Asegurarnos de que userId es una cadena
    const userId = session.user.id as string

    if (type === "user") {
      // Verificar si el usuario ya sigue al objetivo
      const existingFollow = await prisma.follows.findUnique({
        where: {
          followerId_followingId: {
            followerId: userId,
            followingId: targetId,
          },
        },
      })

      if (existingFollow) {
        // Si ya lo sigue, dejar de seguir
        await prisma.follows.delete({
          where: {
            followerId_followingId: {
              followerId: userId,
              followingId: targetId,
            },
          },
        })

        return NextResponse.json({ message: "Usuario dejado de seguir" })
      } else {
        // Si no lo sigue, seguir
        await prisma.follows.create({
          data: {
            followerId: userId,
            followingId: targetId,
          },
        })

        return NextResponse.json({ message: "Usuario seguido" })
      }
    } else if (type === "pet") {
      // Verificar si el usuario ya sigue a la mascota
      const existingFollow = await prisma.petFollows.findUnique({
        where: {
          userId_petId: {
            // Usar userId_petId en lugar de followerId_petId
            userId: userId, // Ahora TypeScript sabe que userId es string
            petId: targetId,
          },
        },
      })

      if (existingFollow) {
        // Si ya la sigue, dejar de seguir
        await prisma.petFollows.delete({
          where: {
            userId_petId: {
              // Usar userId_petId en lugar de followerId_petId
              userId: userId,
              petId: targetId,
            },
          },
        })

        return NextResponse.json({ message: "Mascota dejada de seguir" })
      } else {
        // Si no la sigue, seguir
        await prisma.petFollows.create({
          data: {
            userId: userId,
            petId: targetId,
          },
        })

        return NextResponse.json({ message: "Mascota seguida" })
      }
    }
  } catch (error) {
    console.error("Error en la acción de seguir:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}

