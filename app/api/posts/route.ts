import { NextResponse } from "next/server"
import { auth } from "@/auth"
import prisma from "@/lib/prismadb"

export async function POST(request: Request) {
  try {
    const session = await auth()

    if (!session || !session.user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const userId = session.user.id
    const { content, imageUrl, petId, hashtags, taggedUsers, taggedPets } = await request.json()

    if (!content && !imageUrl) {
      return NextResponse.json({ error: "La publicación debe tener contenido o una imagen" }, { status: 400 })
    }

    // Crear la publicación
    const post = await prisma.post.create({
      data: {
        content,
        imageUrl,
        userId,
        petId,
        // Procesar hashtags
        hashtags: {
          connectOrCreate:
            hashtags?.map((tag: string) => ({
              where: { name: tag.toLowerCase().trim() },
              create: { name: tag.toLowerCase().trim() },
            })) || [],
        },
        // Procesar usuarios etiquetados
        taggedUsers: {
          create:
            taggedUsers?.map((userId: string) => ({
              userId,
            })) || [],
        },
        // Procesar mascotas etiquetadas
        taggedPets: {
          create:
            taggedPets?.map((petId: string) => ({
              petId,
            })) || [],
        },
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
      },
    })

    return NextResponse.json({ success: true, post })
  } catch (error) {
    console.error("Error al crear la publicación:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = Number.parseInt(searchParams.get("limit") || "10")
    const cursor = searchParams.get("cursor")

    // Obtener sesión para verificar si el usuario está siguiendo a otros
    const session = await auth()
    const userId = session?.user?.id

    // Construir la consulta con paginación
    const posts = await prisma.post.findMany({
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
        _count: {
          select: {
            likes: true,
            comments: true,
          },
        },
      },
    })

    // Verificar si el usuario ha dado like a cada publicación
    const postsWithLikeStatus = await Promise.all(
      posts.map(async (post) => {
        let hasLiked = false

        if (userId) {
          const like = await prisma.postLike.findUnique({
            where: {
              userId_postId: {
                userId,
                postId: post.id,
              },
            },
          })
          hasLiked = !!like
        }

        return {
          ...post,
          hasLiked,
        }
      }),
    )

    // Obtener el siguiente cursor para paginación
    const nextCursor = posts.length === limit ? posts[posts.length - 1].id : null

    return NextResponse.json({
      posts: postsWithLikeStatus,
      nextCursor,
    })
  } catch (error) {
    console.error("Error al obtener publicaciones:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}

