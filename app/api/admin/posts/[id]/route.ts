import { NextResponse } from "next/server"
import { auth } from "@/auth"
import prisma from "@/lib/prismadb"

// Obtener una publicación específica
export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const session = await auth()

    // Verificar si el usuario está autenticado y es administrador
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 })
    }

    // Asegurarse de que params.id existe
    if (!params || !params.id) {
      return NextResponse.json({ error: "ID de publicación no proporcionado" }, { status: 400 })
    }

    const postId = params.id

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
            image: true,
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

    // Transformar para incluir los campos simulados isHidden e isReported
    const formattedPost = {
      ...post,
      image: post.imageUrl, // Mapear imageUrl a image para mantener compatibilidad
      isHidden: post.content?.startsWith("[OCULTO]") || false, // Simulado
      isReported: false, // Simulado
    }

    return NextResponse.json(formattedPost)
  } catch (error) {
    console.error("Error al obtener la publicación:", error)
    return NextResponse.json(
      {
        error: "Error interno del servidor",
        details: error instanceof Error ? error.message : "Error desconocido",
      },
      { status: 500 },
    )
  }
}

// Eliminar una publicación
export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const session = await auth()

    // Verificar si el usuario está autenticado y es administrador
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 })
    }

    // Asegurarse de que params.id existe
    if (!params || !params.id) {
      return NextResponse.json({ error: "ID de publicación no proporcionado" }, { status: 400 })
    }

    const postId = params.id

    // Verificar que la publicación existe
    const post = await prisma.post.findUnique({
      where: { id: postId },
    })

    if (!post) {
      return NextResponse.json({ error: "Publicación no encontrada" }, { status: 404 })
    }

    // Eliminar registros relacionados primero
    // 1. Eliminar likes de la publicación
    await prisma.postLike.deleteMany({
      where: { postId: postId },
    })

    // 2. Eliminar comentarios de la publicación
    await prisma.comment.deleteMany({
      where: { postId: postId },
    })

    // 3. Eliminar etiquetas de usuarios en la publicación
    await prisma.taggedUser.deleteMany({
      where: { postId: postId },
    })

    // 4. Eliminar etiquetas de mascotas en la publicación
    await prisma.taggedPet.deleteMany({
      where: { postId: postId },
    })

    // 5. Eliminar relaciones con hashtags
    // Nota: Esto depende de cómo esté implementada la relación en tu base de datos
    // Si es una tabla de unión implícita, Prisma la manejará automáticamente

    // Finalmente, eliminar la publicación
    await prisma.post.delete({
      where: { id: postId },
    })

    return NextResponse.json({ message: "Publicación eliminada correctamente" })
  } catch (error) {
    console.error("Error al eliminar la publicación:", error)
    return NextResponse.json(
      {
        error: "Error interno del servidor",
        details: error instanceof Error ? error.message : "Error desconocido",
      },
      { status: 500 },
    )
  }
}

