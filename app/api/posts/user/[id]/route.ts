import { NextResponse } from "next/server"
import { auth } from "@/auth"
import prisma from "@/lib/prismadb"

// Modificar la función GET para hacer await de params
export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    // Hacer await de params antes de acceder a sus propiedades
    const { id } = await params

    // Si el ID es "me", usar el ID del usuario autenticado
    const targetUserId = id === "me" ? session.user.id : id

    // Obtener publicaciones del usuario con información relacionada
    const posts = await prisma.post.findMany({
      where: {
        userId: targetUserId,
      },
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
        pet: {
          select: {
            id: true,
            name: true,
            type: true,
            image: true,
          },
        },
        hashtags: {
          select: {
            id: true,
            name: true,
          },
        },
        taggedUsers: {
          select: {
            user: {
              select: {
                id: true,
                username: true,
              },
            },
          },
        },
        taggedPets: {
          select: {
            pet: {
              select: {
                id: true,
                name: true,
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

    // Verificar si el usuario autenticado ha dado like a cada publicación
    const postsWithLikeStatus = await Promise.all(
      posts.map(async (post) => {
        const like = await prisma.postLike.findFirst({
          where: {
            postId: post.id,
            userId: session.user.id,
          },
        })

        return {
          ...post,
          hasLiked: !!like,
          // Asegurar que imageUrl esté disponible (tu componente usa imageUrl en lugar de image)
          imageUrl: post.image,
        }
      }),
    )

    return NextResponse.json(postsWithLikeStatus)
  } catch (error) {
    console.error("Error al obtener publicaciones del usuario:", error)
    return NextResponse.json({ error: "Error al obtener publicaciones" }, { status: 500 })
  }
}

