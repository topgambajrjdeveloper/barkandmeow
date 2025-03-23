import { NextResponse } from "next/server"
import { auth } from "@/auth"
import prisma from "@/lib/prismadb"

export async function GET(request: Request) {
  try {
    const session = await auth()

    if (!session || !session.user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    // Obtener parámetros de la URL
    const { searchParams } = new URL(request.url)
    const lat = Number.parseFloat(searchParams.get("lat") || "0")
    const lng = Number.parseFloat(searchParams.get("lng") || "0")
    const radius = Number.parseFloat(searchParams.get("radius") || "5")

    if (!lat || !lng) {
      return NextResponse.json({ error: "Parámetros de ubicación inválidos" }, { status: 400 })
    }

    // Obtener usuarios con sus mascotas
    const users = await prisma.user.findMany({
      where: {
        id: { not: session.user.id },
        // Aquí se podría implementar una búsqueda por distancia si se tiene la ubicación de los usuarios
      },
      select: {
        id: true,
        username: true,
        profileImage: true,
        location: true,
        followers: {
          select: {
            followerId: true,
          },
        },
        pets: {
          select: {
            id: true,
            name: true,
            type: true,
            breed: true,
            age: true,
            image: true,
          },
        },
        _count: {
          select: {
            followers: true,
          },
        },
      },
      take: 20, // Limitar a 20 usuarios para rendimiento
    })

    // Calcular distancia (simulada para este ejemplo)
    // En una implementación real, se usaría la fórmula de Haversine con las coordenadas reales
    const formattedUsers = users.map((user) => ({
      id: user.id,
      username: user.username,
      profileImage: user.profileImage,
      petName: user.pets[0]?.name || "",
      petType: user.pets[0]?.type || "",
      distance: Math.random() * radius, // Distancia simulada
      isFollowing: user.followers.some((f) => f.followerId === session.user.id),
      followersCount: user._count.followers,
      pets: user.pets,
    }))

    return NextResponse.json(formattedUsers)
  } catch (error) {
    console.error("Error fetching nearby users:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}

