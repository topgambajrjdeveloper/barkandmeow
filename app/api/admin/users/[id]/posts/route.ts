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

    // Obtener las publicaciones del usuario
    // Ajustado según el esquema de Prisma proporcionado
    const posts = await prisma.post.findMany({
      where: { userId: userId },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        content: true,
        imageUrl: true, // Cambiado de 'image' a 'imageUrl' según el esquema
        createdAt: true,
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

    // Transformar los datos para incluir isHidden e isReported
    // (estos campos no existen en el esquema, así que los simulamos)
    const formattedPosts = posts.map((post) => ({
      id: post.id,
      content: post.content || "",
      image: post.imageUrl, // Mapeamos imageUrl a image para mantener compatibilidad
      createdAt: post.createdAt.toISOString(),
      petInfo: post.pet,
      isHidden: false, // Simulado, puedes implementar esta lógica según tus necesidades
      isReported: false, // Simulado, puedes implementar esta lógica según tus necesidades
      _count: post._count,
    }))

    return NextResponse.json({ posts: formattedPosts })
  } catch (error) {
    console.error("Error al obtener las publicaciones del usuario:", error)
    return NextResponse.json(
      {
        error: "Error interno del servidor",
        details: error instanceof Error ? error.message : "Error desconocido",
      },
      { status: 500 },
    )
  }
}

