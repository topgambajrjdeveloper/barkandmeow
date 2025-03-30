import { NextResponse } from "next/server"
import prisma from "@/lib/prismadb"
import { auth } from "@/auth"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get("category")

    if (!category) {
      return NextResponse.json({ error: "Se requiere el parámetro 'category'" }, { status: 400 })
    }

    const services = await prisma.service.findMany({
      where: {
        subCategory: category,
        isActive: true,
      },
      orderBy: {
        rating: "desc",
      },
      select: {
        id: true,
        title: true,
        description: true,
        address: true,
        latitude: true,
        longitude: true,
        phone: true,
        website: true,
        imageUrl: true,
        subCategory: true,
        tags: true,
        openingHours: true,
        rating: true,
      },
    })

    return NextResponse.json(services)
  } catch (error) {
    console.error("Error al obtener servicios:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const userId = session.user.id
    const data = await request.json()

    // Validar datos requeridos
    if (!data.title || !data.subCategory) {
      return NextResponse.json({ error: "Se requieren título y categoría" }, { status: 400 })
    }

    // Crear el servicio
    const service = await prisma.service.create({
      data: {
        ...data,
        createdBy: userId,
        isActive: false, // Los servicios nuevos requieren aprobación
      },
    })

    return NextResponse.json(service)
  } catch (error) {
    console.error("Error al crear servicio:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}

