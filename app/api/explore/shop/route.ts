import { NextResponse } from "next/server"
import { auth } from "@/auth"
import prisma from "@/lib/prismadb"

// GET - Obtener todas las tiendas
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const limit = Number.parseInt(searchParams.get("limit") || "20")
    const page = Number.parseInt(searchParams.get("page") || "1")
    const skip = (page - 1) * limit
    const lat = searchParams.get("lat") ? Number.parseFloat(searchParams.get("lat")!) : null
    const lng = searchParams.get("lng") ? Number.parseFloat(searchParams.get("lng")!) : null
    const radius = Number.parseInt(searchParams.get("radius") || "10") // Radio en km
    const subCategory = searchParams.get("subCategory") || null
    const tag = searchParams.get("tag") || null
    const onlineOnly = searchParams.get("onlineOnly") === "true"

    // Construir la consulta base
    const where: any = {
      category: "shops",
      isActive: true,
    }

    // Filtrar por subcategoría si se especifica
    if (subCategory) {
      where.subCategory = subCategory
    }

    // Filtrar por etiqueta si se especifica
    if (tag) {
      where.tags = {
        has: tag,
      }
    }

    // Filtrar por tiendas online si se especifica
    if (onlineOnly) {
      where.isOnline = true
    }

    // Obtener tiendas
    const shops = await prisma.service.findMany({
      where,
      orderBy: [{ featured: "desc" }, { rating: "desc" }],
      take: limit,
      skip,
    })

    // Si se proporcionaron coordenadas, calcular la distancia para cada tienda
    if (lat && lng && !onlineOnly) {
      // Calcular la distancia para cada tienda usando la fórmula de Haversine
      const shopsWithDistance = shops.map((shop) => {
        if (shop.latitude && shop.longitude) {
          const distance = calculateDistance(lat, lng, shop.latitude, shop.longitude)
          return { ...shop, distance }
        }
        return { ...shop, distance: null }
      })

      // Filtrar por radio si se especificó
      const filteredShops = radius
        ? shopsWithDistance.filter((shop) => shop.isOnline || (shop.distance !== null && shop.distance <= radius))
        : shopsWithDistance

      // Ordenar por distancia (las tiendas online siempre al final)
      filteredShops.sort((a, b) => {
        if (a.isOnline && b.isOnline) return 0
        if (a.isOnline) return 1
        if (b.isOnline) return -1
        if (a.distance === null) return 1
        if (b.distance === null) return -1
        return a.distance - b.distance
      })

      return NextResponse.json(filteredShops)
    }

    // Si no hay coordenadas, devolver las tiendas sin distancia
    const total = await prisma.service.count({ where })

    return NextResponse.json({
      shops,
      pagination: {
        total,
        pages: Math.ceil(total / limit),
        page,
        limit,
      },
    })
  } catch (error) {
    console.error("[SHOPS_GET]", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}

// POST - Crear una nueva tienda (solo admin)
export async function POST(request: Request) {
  try {
    const session = await auth()

    // Verificar si el usuario está autenticado y es administrador
    if (!session?.user?.id || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const body = await request.json()

    // Validar campos requeridos
    const { title, description, subCategory, isOnline } = body

    if (!title || !description) {
      return NextResponse.json({ error: "Faltan campos requeridos" }, { status: 400 })
    }

    // Si no es una tienda online, verificar que tenga dirección
    if (!isOnline && !body.address) {
      return NextResponse.json({ error: "Las tiendas físicas requieren una dirección" }, { status: 400 })
    }

    // Crear la tienda
    const shop = await prisma.service.create({
      data: {
        title,
        description,
        address: body.address,
        latitude: body.latitude,
        longitude: body.longitude,
        imageUrl: body.imageUrl,
        openingHours: body.openingHours,
        phone: body.phone,
        website: body.website,
        category: "shops",
        subCategory: subCategory || null,
        tags: body.tags || [],
        rating: body.rating || null,
        featured: body.featured || false,
        isActive: body.isActive !== undefined ? body.isActive : true,
        isOnline: isOnline || false,
        createdBy: session.user.id,
      },
    })

    return NextResponse.json(shop)
  } catch (error) {
    console.error("[SHOPS_POST]", error)
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

