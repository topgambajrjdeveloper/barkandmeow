import { NextResponse } from "next/server"
import { auth } from "@/auth"
import prisma from "@/lib/prismadb"

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
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
    const { action } = await request.json()

    // Validar la acción
    if (!["hide", "show"].includes(action)) {
      return NextResponse.json({ error: "Acción no válida" }, { status: 400 })
    }

    // Verificar que la publicación existe
    const post = await prisma.post.findUnique({
      where: { id: postId },
    })

    if (!post) {
      return NextResponse.json({ error: "Publicación no encontrada" }, { status: 404 })
    }

    // Nota: Como no hay campos isHidden o isReported en el esquema,
    // podríamos implementar esta funcionalidad de varias maneras:
    // 1. Añadir estos campos al esquema de Prisma (recomendado a largo plazo)
    // 2. Usar metadatos o una tabla separada para moderar contenido
    // 3. Implementar una solución temporal como "soft delete"

    // Para este ejemplo, usaremos una solución temporal:
    // Si la acción es "hide", establecemos el contenido a null y guardamos el contenido original
    // en un campo de metadatos (que tendríamos que añadir al esquema)

    // Simulación de la acción de moderación
    if (action === "hide") {
      // En una implementación real, guardaríamos el contenido original
      // y marcaríamos la publicación como oculta
      await prisma.post.update({
        where: { id: postId },
        data: {
          // Aquí simularíamos ocultar la publicación
          // Por ejemplo, podríamos añadir un prefijo "[OCULTO]" al contenido
          content: post.content ? "[OCULTO] " + post.content : null,
        },
      })
    } else {
      // Mostrar la publicación nuevamente
      // En una implementación real, restauraríamos el contenido original
      await prisma.post.update({
        where: { id: postId },
        data: {
          // Aquí simularíamos mostrar la publicación nuevamente
          // Por ejemplo, podríamos quitar el prefijo "[OCULTO]"
          content: post.content?.replace("[OCULTO] ", "") || null,
        },
      })
    }

    // Obtener la publicación actualizada
    const updatedPost = await prisma.post.findUnique({
      where: { id: postId },
      include: {
        _count: {
          select: {
            likes: true,
            comments: true,
          },
        },
      },
    })

    // Transformar para incluir los campos simulados isHidden e isReported
    const formattedPost = {
      ...updatedPost,
      isHidden: updatedPost?.content?.startsWith("[OCULTO]") || false,
      isReported: false, // Simulado
    }

    return NextResponse.json(formattedPost)
  } catch (error) {
    console.error("Error al moderar la publicación:", error)
    return NextResponse.json(
      {
        error: "Error interno del servidor",
        details: error instanceof Error ? error.message : "Error desconocido",
      },
      { status: 500 },
    )
  }
}

