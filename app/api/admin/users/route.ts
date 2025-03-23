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
          { username: { contains: search, mode: "insensitive" } },
          { email: { contains: search, mode: "insensitive" } },
        ],
      }
    }

    // Obtener usuarios con paginación
    const users = await prisma.user.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        username: true,
        email: true,
        profileImage: true,
        role: true,
        isEmailConfirmed: true,
        createdAt: true,
        _count: {
          select: {
            pets: true,
          },
        },
      },
    })

    // Contar total de usuarios para la paginación
    const total = await prisma.user.count({ where })

    return NextResponse.json({
      users,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error("Error en API de usuarios:", error)
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

    // Aquí deberías validar los datos antes de crear el usuario

    // Crear nuevo usuario
    const newUser = await prisma.user.create({
      data: {
        username: data.username,
        email: data.email,
        password: data.password, // Deberías hashear esta contraseña
        petName: data.petName || "",
        petType: data.petType || "",
        role: data.role || "USER",
      },
    })

    return NextResponse.json(newUser, { status: 201 })
  } catch (error) {
    console.error("Error al crear usuario:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}

