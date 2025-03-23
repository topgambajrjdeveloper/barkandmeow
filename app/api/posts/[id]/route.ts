import { NextResponse } from "next/server"
import { auth } from "@/auth"
import prisma from "@/lib/prismadb"

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    // Acceder a params.id de forma asíncrona
    const { id: postId } = await params

    // Obtener sesión para verificar si el usuario ha dado like
    const session = await auth()
    const userId = session?.user?.id

    const post = await prisma.post.findUnique({
      where: { id: postId },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            profileImage: true,
          },
        },
        pet: {
          select: {
            id: true,
            name: true,
            type: true,
            image: true,
          },
        },
        hashtags: true,
        taggedUsers: {
          include: {
            user: {
              select: {
                id: true,
                username: true,
              },
            },
          },
        },
        taggedPets: {
          include: {
            pet: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
        comments: {
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
        },
        _count: {
          select: {
            likes: true,
            comments: true,
          },
        },
      },
    })

    if (!post) {
      return NextResponse.json({ error: "Publicación no encontrada" }, { status: 404 })
    }

    // Verificar si el usuario ha dado like
    let hasLiked = false
    if (userId) {
      const like = await prisma.postLike.findUnique({
        where: {
          userId_postId: {
            userId,
            postId,
          },
        },
      })
      hasLiked = !!like
    }

    return NextResponse.json({
      ...post,
      hasLiked,
    })
  } catch (error) {
    console.error("Error al obtener la publicación:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const session = await auth()

    if (!session || !session.user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const userId = session.user.id
    // Acceder a params.id de forma asíncrona
    const { id: postId } = await params

    // Verificar que la publicación existe y pertenece al usuario
    const post = await prisma.post.findUnique({
      where: { id: postId },
    })

    if (!post) {
      return NextResponse.json({ error: "Publicación no encontrada" }, { status: 404 })
    }

    if (post.userId !== userId) {
      return NextResponse.json({ error: "No tienes permiso para eliminar esta publicación" }, { status: 403 })
    }

    // Eliminar la publicación
    await prisma.post.delete({
      where: { id: postId },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error al eliminar la publicación:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}

