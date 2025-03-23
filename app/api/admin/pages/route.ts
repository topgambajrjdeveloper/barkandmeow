import { NextResponse } from "next/server"
import { auth } from "@/auth"
import prisma from "@/lib/prismadb"

export async function GET(request: Request) {
  try {
    const session = await auth()

    // Verificar si el usuario está autenticado y es administrador
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 })
    }

    // Obtener parámetros de consulta
    const { searchParams } = new URL(request.url)
    const search = searchParams.get("search") || ""

    // Construir condiciones de búsqueda
    let where = {}

    if (search) {
      where = {
        OR: [{ title: { contains: search, mode: "insensitive" } }, { slug: { contains: search, mode: "insensitive" } }],
      }
    }

    // Obtener páginas
    const pages = await prisma.page.findMany({
      where,
      orderBy: { updatedAt: "desc" },
      select: {
        id: true,
        title: true,
        slug: true,
        content: true,
        isPublished: true,
        createdAt: true,
        updatedAt: true,
        authorId: true,
        author: {
          select: {
            username: true,
          },
        },
      },
    })

    return NextResponse.json(pages)
  } catch (error) {
    console.error("Error en API de páginas:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth()

    // Verificar si el usuario está autenticado y es administrador
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 })
    }

    const data = await request.json()

    // Validar datos
    if (!data.title || !data.slug || !data.content) {
      return NextResponse.json({ error: "Faltan campos requeridos" }, { status: 400 })
    }

    // Crear nueva página
    const newPage = await prisma.page.create({
      data: {
        title: data.title,
        slug: data.slug,
        content: data.content,
        isPublished: data.isPublished || false,
        metaTitle: data.metaTitle || data.title,
        metaDescription: data.metaDescription || "",
        authorId: session?.user?.id,
      },
    })

    return NextResponse.json(newPage, { status: 201 })
  } catch (error) {
    console.error("Error al crear página:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}

