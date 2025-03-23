import { NextResponse } from "next/server"
import { auth } from "@/auth"
import prisma from "@/lib/prismadb"

export async function GET(request: Request) {
  try {
    const session = await auth()

    // Verificar si el usuario está autenticado y es administrador
    if (!session || session?.user?.role !== "ADMIN") {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 })
    }

    // Obtener parámetros de consulta
    const { searchParams } = new URL(request.url)
    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = Number.parseInt(searchParams.get("limit") || "10")
    const search = searchParams.get("search") || ""

    // Calcular offset para paginación
    const skip = (page - 1) * limit

    // Construir condiciones de búsqueda
    let where = {}

    if (search) {
      where = {
        OR: [
          { name: { contains: search, mode: "insensitive" } },
          { type: { contains: search, mode: "insensitive" } },
          { breed: { contains: search, mode: "insensitive" } },
          { user: { username: { contains: search, mode: "insensitive" } } },
        ],
      }
    }

    // Obtener mascotas con paginación
    const pets = await prisma.pet.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        type: true,
        breed: true,
        age: true,
        image: true,
        description: true,
        createdAt: true,
        userId: true,
        user: {
          select: {
            username: true,
          },
        },
        _count: {
          select: {
            followers: true,
          },
        },
      },
    })

    // Contar total de mascotas para la paginación
    const total = await prisma.pet.count({ where })

    return NextResponse.json({
      pets,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error("Error en API de mascotas:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth()

    // Verificar si el usuario está autenticado y es administrador
    if (!session || session?.user?.role !== "ADMIN") {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 })
    }

    const data = await request.json()

    // Validar datos
    if (!data.name || !data.type || !data.userId) {
      return NextResponse.json({ error: "Faltan campos requeridos" }, { status: 400 })
    }

    // Verificar que el usuario existe
    const userExists = await prisma.user.findUnique({
      where: { id: data.userId },
    })

    if (!userExists) {
      return NextResponse.json({ error: "El usuario no existe" }, { status: 400 })
    }

    // Crear nueva mascota
    const newPet = await prisma.pet.create({
      data: {
        name: data.name,
        type: data.type,
        breed: data.breed,
        age: data.age ? Number.parseInt(data.age) : null,
        image: data.image,
        description: data.description,
        userId: data.userId,
      },
    })

    return NextResponse.json(newPet, { status: 201 })
  } catch (error) {
    console.error("Error al crear mascota:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}

