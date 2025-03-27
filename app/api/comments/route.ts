import { NextResponse } from "next/server"
import { auth } from "@/auth"
import  prisma  from "@/lib/prismadb"



export async function POST(request: Request) {
  try {
    const session = await auth()

    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const { postId, content } = await request.json()

    if (!postId || !content.trim()) {
      return NextResponse.json({ error: "Se requiere postId y content" }, { status: 400 })
    }

    // Verificar que el post existe
    const post = await prisma.post.findUnique({
      where: { id: postId },
    })

    if (!post) {
      return NextResponse.json({ error: "Post no encontrado" }, { status: 404 })
    }

    // Crear el comentario
    const comment = await prisma.comment.create({
      data: {
        content,
        postId,
        userId: session.user.id,
      },
    })

    return NextResponse.json({ success: true, comment })
  } catch (error) {
    console.error("Error al crear comentario:", error)
    return NextResponse.json({ error: "Error al crear comentario" }, { status: 500 })
  }
}

