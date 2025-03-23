import { NextResponse } from "next/server"
import { auth } from "@/auth"
import prisma from "@/lib/prismadb"

export async function POST(request: Request, { params }: { params: { id: string } }) {
  try {
    const session = await auth()

    if (!session || !session.user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const userId = session.user.id
    // Acceder a params.id de forma asíncrona
    const { id: postId } = await params

    // Verificar si ya existe un like
    const existingLike = await prisma.postLike.findUnique({
      where: {
        userId_postId: {
          userId,
          postId,
        },
      },
    })

    if (existingLike) {
      // Si ya existe, eliminar el like
      await prisma.postLike.delete({
        where: {
          userId_postId: {
            userId,
            postId,
          },
        },
      })

      return NextResponse.json({ liked: false })
    } else {
      // Si no existe, crear el like
      await prisma.postLike.create({
        data: {
          userId,
          postId,
        },
      })

      return NextResponse.json({ liked: true })
    }
  } catch (error) {
    console.error("Error al gestionar el like:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}

