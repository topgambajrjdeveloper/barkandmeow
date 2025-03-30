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

    // Añadir logs para depuración
    console.log(`Buscando servicios con category=${category}`)

    const services = await prisma.service.findMany({
      where: {
        category: category,
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
        category: true,
        subCategory: true,
        tags: true,
        openingHours: true,
        rating: true,
        isActive: true,
      },
    })

    // Log para depuración
    console.log(`Encontrados ${services.length} servicios para category=${category}`)
    if (services.length > 0) {
      console.log("Primer servicio:", JSON.stringify(services[0], null, 2))
    }

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
    if (!data.title || !data.category) {
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

