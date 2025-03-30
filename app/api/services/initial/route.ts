import { NextResponse } from "next/server"
import prisma from "@/lib/prismadb"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const categories = searchParams.get("categories")?.split(",") || ["pet-friendly", "shop", "vet"]
    const limit = Number.parseInt(searchParams.get("limit") || "6")

    // Obtener servicios para cada categoría
    const servicesPromises = categories.map((category) =>
      prisma.service.findMany({
        where: {
          category: category,
          isActive: true,
        },
        take: limit,
        orderBy: {
          rating: "desc",
        },
        select: {
          id: true,
          title: true,
          description: true,
          address: true,
          phone: true,
          website: true,
          imageUrl: true,
          category: true,
          tags: true,
          openingHours: true,
          latitude: true,
          longitude: true,
          rating: true,
        },
      }),
    )

    const results = await Promise.all(servicesPromises)

    // Crear un objeto con los servicios por categoría
    const servicesByCategory = categories.reduce(
      (acc, category, index) => {
        acc[category] = results[index]
        return acc
      },
      {} as Record<string, any[]>,
    )

    return NextResponse.json(servicesByCategory)
  } catch (error) {
    console.error("Error al obtener servicios iniciales:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}

