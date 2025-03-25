import { NextResponse } from "next/server"
import { auth } from "@/auth"
import prisma from "@/lib/prismadb"

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const session = await auth()

    // Verificar si el usuario está autenticado y es administrador
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 })
    }

    // Asegurarse de que params.id existe
    if (!params || !params.id) {
      return NextResponse.json({ error: "ID de usuario no proporcionado" }, { status: 400 })
    }

    const userId = params.id

    // Verificar que el usuario existe
    const userExists = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true },
    })

    if (!userExists) {
      return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 })
    }

    // Obtener actividad reciente del usuario
    // Aquí construimos una actividad combinada de diferentes acciones

    // 1. Publicaciones creadas
    const posts = await prisma.post.findMany({
      where: { userId: userId },
      orderBy: { createdAt: "desc" },
      take: 10,
      select: {
        id: true,
        content: true,
        createdAt: true,
        pet: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    })

    // 2. Comentarios realizados
    const comments = await prisma.comment.findMany({
      where: { userId: userId },
      orderBy: { createdAt: "desc" },
      take: 10,
      select: {
        id: true,
        content: true,
        createdAt: true,
        post: {
          select: {
            id: true,
            content: true,
          },
        },
      },
    })

    // 3. Seguimientos a usuarios
    const follows = await prisma.follows.findMany({
      where: { followerId: userId },
      orderBy: { createdAt: "desc" },
      take: 10,
      select: {
        followingId: true,
        createdAt: true,
        following: {
          select: {
            id: true,
            username: true,
          },
        },
      },
    })

    // 4. Seguimientos a mascotas
    const petFollows = await prisma.petFollows.findMany({
      where: { userId: userId },
      orderBy: { createdAt: "desc" },
      take: 10,
      select: {
        petId: true,
        createdAt: true,
        pet: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    })

    // 5. Likes a publicaciones
    const likes = await prisma.postLike.findMany({
      where: { userId: userId },
      orderBy: { createdAt: "desc" },
      take: 10,
      select: {
        postId: true,
        createdAt: true,
        post: {
          select: {
            id: true,
            content: true,
          },
        },
      },
    })

    // Combinar todas las actividades en un solo array
    const activity = [
      ...posts.map((post) => ({
        id: `post-${post.id}`,
        action: "Publicó",
        target: post.content
          ? post.content.length > 50
            ? `${post.content.substring(0, 50)}...`
            : post.content
          : post.pet
            ? `una foto de ${post.pet.name}`
            : "una publicación",
        targetType: "post" as const,
        timestamp: post.createdAt.toISOString(),
      })),

      ...comments.map((comment) => ({
        id: `comment-${comment.id}`,
        action: "Comentó",
        target: comment.content.length > 50 ? `${comment.content.substring(0, 50)}...` : comment.content,
        targetType: "comment" as const,
        timestamp: comment.createdAt.toISOString(),
        details: comment.post.content
          ? `En: "${comment.post.content.substring(0, 30)}..."`
          : `En la publicación #${comment.post.id}`,
      })),

      ...follows.map((follow) => ({
        id: `follow-${follow.followingId}`,
        action: "Siguió a",
        target: follow.following.username,
        targetType: "follow" as const,
        timestamp: follow.createdAt.toISOString(),
      })),

      ...petFollows.map((petFollow) => ({
        id: `pet-follow-${petFollow.petId}`,
        action: "Siguió a la mascota",
        target: petFollow.pet.name,
        targetType: "pet" as const,
        timestamp: petFollow.createdAt.toISOString(),
      })),

      ...likes.map((like) => ({
        id: `like-${like.postId}`,
        action: "Le gustó",
        target: like.post.content
          ? like.post.content.length > 50
            ? `${like.post.content.substring(0, 50)}...`
            : like.post.content
          : `la publicación #${like.post.id}`,
        targetType: "like" as const,
        timestamp: like.createdAt.toISOString(),
      })),
    ]

    // Ordenar por fecha más reciente
    activity.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())

    // Limitar a 30 actividades
    const limitedActivity = activity.slice(0, 30)

    return NextResponse.json({ activity: limitedActivity })
  } catch (error) {
    console.error("Error al obtener la actividad del usuario:", error)
    return NextResponse.json(
      {
        error: "Error interno del servidor",
        details: error instanceof Error ? error.message : "Error desconocido",
      },
      { status: 500 },
    )
  }
}

