import { NextResponse } from "next/server"
import { auth } from "@/auth"
import prisma from "@/lib/prismadb"

// GET - Obtener todos los veterinarios
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = Number.parseInt(searchParams.get("limit") || "20")
    const page = Number.parseInt(searchParams.get("page") || "1")
    const skip = (page - 1) * limit
    const lat = searchParams.get("lat") ? Number.parseFloat(searchParams.get("lat")!) : null
    const lng = searchParams.get("lng") ? Number.parseFloat(searchParams.get("lng")!) : null
    const radius = Number.parseInt(searchParams.get("radius") || "10") // Radio en km
    const specialty = searchParams.get("specialty") || null
    const emergency = searchParams.get("emergency") === "true"

    // Construir la consulta base
    const where: any = {
      category: "vets",
      isActive: true,
    }

    // Filtrar por especialidad si se especifica
    if (specialty) {
      where.tags = {
        has: specialty,
      }
    }

    // Filtrar por servicios de emergencia si se especifica
    if (emergency) {
      where.tags = {
        has: "Urgencias 24h",
      }
    }

    // Obtener veterinarios
    const vets = await prisma.service.findMany({
      where,
      orderBy: [{ featured: "desc" }, { rating: "desc" }],
      take: limit,
      skip,
    })

    // Si se proporcionaron coordenadas, calcular la distancia para cada veterinario
    if (lat && lng) {
      // Calcular la distancia para cada veterinario usando la fórmula de Haversine
      const vetsWithDistance = vets.map((vet) => {
        if (vet.latitude && vet.longitude) {
          const distance = calculateDistance(lat, lng, vet.latitude, vet.longitude)
          return { ...vet, distance }
        }
        return { ...vet, distance: null }
      })

      // Filtrar por radio si se especificó
      const filteredVets = radius
        ? vetsWithDistance.filter((vet) => vet.distance !== null && vet.distance <= radius)
        : vetsWithDistance

      // Ordenar por distancia
      filteredVets.sort((a, b) => {
        // Priorizar veterinarios de emergencia si se solicitó
        if (emergency) {
          const aIsEmergency = a.tags?.includes("Urgencias 24h") || false
          const bIsEmergency = b.tags?.includes("Urgencias 24h") || false
          if (aIsEmergency && !bIsEmergency) return -1
          if (!aIsEmergency && bIsEmergency) return 1
        }

        if (a.distance === null) return 1
        if (b.distance === null) return -1
        return a.distance - b.distance
      })

      return NextResponse.json(filteredVets)
    }

    // Si no hay coordenadas, devolver los veterinarios sin distancia
    const total = await prisma.service.count({ where })

    return NextResponse.json({
      vets,
      pagination: {
        total,
        pages: Math.ceil(total / limit),
        page,
        limit,
      },
    })
  } catch (error) {
    console.error("[VETS_GET]", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}

// POST - Crear un nuevo veterinario (solo admin)
export async function POST(request: Request) {
  try {
    const session = await auth()

    // Verificar si el usuario está autenticado y es administrador
    if (!session?.user?.id || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const body = await request.json()

    // Validar campos requeridos
    const { title, description, address, specialties, isEmergency, bookingUrl } = body

    if (!title || !description || !address) {
      return NextResponse.json({ error: "Faltan campos requeridos (título, descripción y dirección)" }, { status: 400 })
    }

    // Preparar etiquetas
    let tags = body.tags || []

    // Añadir especialidades a las etiquetas si existen
    if (specialties && Array.isArray(specialties)) {
      tags = [...new Set([...tags, ...specialties])]
    }

    // Añadir etiqueta de urgencias si corresponde
    if (isEmergency) {
      tags = [...new Set([...tags, "Urgencias 24h"])]
    }

    // Crear el veterinario
    const vet = await prisma.service.create({
      data: {
        title,
        description,
        address,
        latitude: body.latitude,
        longitude: body.longitude,
        imageUrl: body.imageUrl,
        openingHours: body.openingHours,
        phone: body.phone,
        website: body.website,
        category: "vets",
        subCategory: body.subCategory || null,
        tags,
        rating: body.rating || null,
        featured: body.featured || false,
        isActive: body.isActive !== undefined ? body.isActive : true,
        isOnline: false, // Los veterinarios no son servicios online
        createdBy: session.user.id,
        // Guardar bookingUrl en los metadatos
        metadata: {
          bookingUrl: bookingUrl || null,
        },
      },
    })

    return NextResponse.json(vet)
  } catch (error) {
    console.error("[VETS_POST]", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}

// Función para calcular la distancia entre dos puntos geográficos (fórmula de Haversine)
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
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

