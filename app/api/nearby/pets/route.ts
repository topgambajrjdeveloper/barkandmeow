import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

// Función para calcular la distancia entre dos puntos (fórmula de Haversine)
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371 // Radio de la Tierra en km
  const dLat = (lat2 - lat1) * (Math.PI / 180)
  const dLon = (lon2 - lon1) * (Math.PI / 180)
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) * Math.sin(dLon / 2) * Math.sin(dLon / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  const distance = R * c // Distancia en km
  return distance
}

export async function GET(request: Request) {
  try {
    const session = await auth()

    if (!session || !session.user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    // Obtener parámetros de la URL
    const url = new URL(request.url)
    const lat = Number.parseFloat(url.searchParams.get("lat") || "0")
    const lng = Number.parseFloat(url.searchParams.get("lng") || "0")
    const radius = Number.parseFloat(url.searchParams.get("radius") || "5")

    if (lat === 0 || lng === 0) {
      return NextResponse.json({ error: "Coordenadas inválidas" }, { status: 400 })
    }

    // Obtener todas las mascotas con sus dueños que tengan coordenadas
    const pets = await prisma.pet.findMany({
      where: {
        user: {
          id: { not: session.user.id },
          latitude: { not: null },
          longitude: { not: null },
          isPublicProfile: true,
        },
      },
      select: {
        id: true,
        name: true,
        type: true,
        breed: true,
        image: true,
        user: {
          select: {
            id: true,
            username: true,
            latitude: true,
            longitude: true,
          },
        },
        followers: {
          where: {
            userId: session.user.id,
          },
          select: {
            userId: true,
          },
        },
      },
    })

    // Filtrar mascotas por distancia y añadir la distancia a cada una
    const nearbyPets = pets
      .filter((pet) => pet.user.latitude !== null && pet.user.longitude !== null)
      .map((pet) => {
        const distance = calculateDistance(lat, lng, pet.user.latitude!, pet.user.longitude!)

        return {
          id: pet.id,
          name: pet.name,
          type: pet.type,
          breed: pet.breed,
          image: pet.image,
          userId: pet.user.id,
          username: pet.user.username,
          distance: distance,
          isFollowing: pet.followers.length > 0,
        }
      })
      .filter((pet) => pet.distance <= radius)
      .sort((a, b) => a.distance - b.distance)

    return NextResponse.json(nearbyPets)
  } catch (error) {
    console.error("Error fetching nearby pets:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}

