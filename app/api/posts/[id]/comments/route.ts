import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

export async function POST(request: Request, { params }: { params: { id: string } }) {
  try {
    const session = await auth()

    if (!session || !session.user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const userId = session.user.id
    // Acceder a params.id de forma asíncrona
    const { id: postId } = await params
    const { content } = await request.json()

    if (!content || content.trim() === "") {
      return NextResponse.json({ error: "El comentario no puede estar vacío" }, { status: 400 })
    }

    // Verificar que la publicación existe
    const post = await prisma.post.findUnique({
      where: { id: postId },
    })

    if (!post) {
      return NextResponse.json({ error: "Publicación no encontrada" }, { status: 404 })
    }

    // Crear el comentario
    const comment = await prisma.comment.create({
      data: {
        content,
        userId,
        postId,
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            profileImage: true,
          },
        },
      },
    })

    return NextResponse.json({ success: true, comment })
  } catch (error) {
    console.error("Error al crear el comentario:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    // Acceder a params.id de forma asíncrona
    const { id: postId } = await params
    const { searchParams } = new URL(request.url)
    const limit = Number.parseInt(searchParams.get("limit") || "20")
    const cursor = searchParams.get("cursor")

    // Verificar que la publicación existe
    const post = await prisma.post.findUnique({
      where: { id: postId },
    })

    if (!post) {
      return NextResponse.json({ error: "Publicación no encontrada" }, { status: 404 })
    }

    // Obtener comentarios con paginación
    const comments = await prisma.comment.findMany({
      where: { postId },
      take: limit,
      ...(cursor ? { skip: 1, cursor: { id: cursor } } : {}),
      orderBy: {
        createdAt: "desc",
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            profileImage: true,
          },
        },
      },
    })

    // Obtener el siguiente cursor para paginación
    const nextCursor = comments.length === limit ? comments[comments.length - 1].id : null

    return NextResponse.json({
      comments,
      nextCursor,
    })
  } catch (error) {
    console.error("Error al obtener comentarios:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}

