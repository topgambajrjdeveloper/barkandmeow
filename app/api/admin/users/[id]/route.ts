/* eslint-disable @typescript-eslint/no-unused-vars */
import { NextResponse } from "next/server"
import { auth } from "@/auth"
import prisma from "@/lib/prismadb"

// Obtener un usuario específico
export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const session = await auth()

    // Verificar si el usuario está autenticado y es administrador
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 })
    }

    const userId = params.id

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        pets: true,
        _count: {
          select: {
            pets: true,
            posts: true,
            followers: true,
            following: true,
          },
        },
      },
    })

    if (!user) {
      return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 })
    }

    // Eliminar la contraseña del resultado
    const { password, ...userWithoutPassword } = user

    return NextResponse.json(userWithoutPassword)
  } catch (error) {
    console.error("Error al obtener el usuario:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}

// Actualizar un usuario
export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const session = await auth()

    // Verificar si el usuario está autenticado y es administrador
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 })
    }

    const userId = params.id
    const data = await request.json()

    // Verificar que el usuario existe
    const user = await prisma.user.findUnique({
      where: { id: userId },
    })

    if (!user) {
      return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 })
    }

    // Actualizar el usuario
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        username: data.username,
        email: data.email,
        role: data.role,
        isEmailConfirmed: data.isEmailConfirmed,
        // No actualizar la contraseña aquí, debería tener un endpoint separado
      },
    })

    // Eliminar la contraseña del resultado
    const { password, ...userWithoutPassword } = updatedUser

    return NextResponse.json(userWithoutPassword)
  } catch (error) {
    console.error("Error al actualizar el usuario:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}

// Eliminar un usuario
export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const session = await auth()

    // Verificar si el usuario está autenticado y es administrador
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 })
    }

    const userId = params.id

    // Verificar que el usuario existe
    const user = await prisma.user.findUnique({
      where: { id: userId },
    })

    if (!user) {
      return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 })
    }

    // No permitir eliminar al propio administrador
    if (user.id === session.user.id) {
      return NextResponse.json({ error: "No puedes eliminar tu propia cuenta de administrador" }, { status: 400 })
    }

    // Eliminar registros relacionados primero
    // Esto depende de tu modelo de datos específico

    // 1. Eliminar mascotas del usuario
    await prisma.pet.deleteMany({
      where: { userId: userId },
    })

    // 2. Eliminar publicaciones del usuario
    await prisma.post.deleteMany({
      where: { userId: userId },
    })

    // 3. Eliminar comentarios del usuario
    await prisma.comment.deleteMany({
      where: { userId: userId },
    })

    // 4. Eliminar likes de publicaciones
    await prisma.postLike.deleteMany({
      where: { userId: userId },
    })

    // 5. Eliminar relaciones de seguimiento donde el usuario es seguidor o seguido
    await prisma.follows.deleteMany({
      where: {
        OR: [{ followerId: userId }, { followingId: userId }],
      },
    })

    // 6. Eliminar seguimientos de mascotas
    await prisma.petFollows.deleteMany({
      where: { userId: userId },
    })

    // 7. Eliminar suscripciones push
    await prisma.pushSubscription.deleteMany({
      where: { userId: userId },
    })

    // 8. Eliminar etiquetas en publicaciones
    await prisma.taggedUser.deleteMany({
      where: { userId: userId },
    })

    // 9. Eliminar páginas creadas por el usuario
    await prisma.page.deleteMany({
      where: { authorId: userId },
    })

    // Finalmente, eliminar el usuario
    await prisma.user.delete({
      where: { id: userId },
    })

    return NextResponse.json({ message: "Usuario eliminado correctamente" })
  } catch (error) {
    console.error("Error al eliminar el usuario:", error)
    return NextResponse.json(
      {
        error: "Error interno del servidor",
        details: error instanceof Error ? error.message : "Error desconocido",
      },
      { status: 500 },
    )
  }
}

