import { NextResponse } from "next/server"
import { auth } from "@/auth"
import prisma from "@/lib/prismadb"

// GET - Obtener un lugar pet-friendly específico
export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = params

    if (!id) {
      return NextResponse.json({ error: "ID no proporcionado" }, { status: 400 })
    }

    const petFriendlyPlace = await prisma.service.findUnique({
      where: { id },
    })

    if (!petFriendlyPlace) {
      return NextResponse.json({ error: "Lugar no encontrado" }, { status: 404 })
    }

    if (petFriendlyPlace.category !== "pet-friendly") {
      return NextResponse.json({ error: "El servicio no es un lugar pet-friendly" }, { status: 400 })
    }

    return NextResponse.json(petFriendlyPlace)
  } catch (error) {
    console.error("[PET_FRIENDLY_GET_BY_ID]", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}

// PATCH - Actualizar un lugar pet-friendly (solo admin)
export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  try {
    const session = await auth()

    // Verificar si el usuario está autenticado y es administrador
    if (!session?.user?.id || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const { id } = params
    const body = await request.json()

    if (!id) {
      return NextResponse.json({ error: "ID no proporcionado" }, { status: 400 })
    }

    // Verificar si el lugar existe y es de tipo pet-friendly
    const existingPlace = await prisma.service.findUnique({
      where: { id },
    })

    if (!existingPlace) {
      return NextResponse.json({ error: "Lugar no encontrado" }, { status: 404 })
    }

    if (existingPlace.category !== "pet-friendly") {
      return NextResponse.json({ error: "El servicio no es un lugar pet-friendly" }, { status: 400 })
    }

    // Actualizar el lugar
    const updatedPlace = await prisma.service.update({
      where: { id },
      data: {
        title: body.title,
        description: body.description,
        address: body.address,
        latitude: body.latitude,
        longitude: body.longitude,
        imageUrl: body.imageUrl,
        openingHours: body.openingHours,
        phone: body.phone,
        website: body.website,
        tags: body.tags,
        rating: body.rating,
        featured: body.featured,
        isActive: body.isActive,
        updatedAt: new Date(),
      },
    })

    return NextResponse.json(updatedPlace)
  } catch (error) {
    console.error("[PET_FRIENDLY_PATCH]", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}

// DELETE - Eliminar un lugar pet-friendly (solo admin)
export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const session = await auth()

    // Verificar si el usuario está autenticado y es administrador
    if (!session?.user?.id || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const { id } = params

    if (!id) {
      return NextResponse.json({ error: "ID no proporcionado" }, { status: 400 })
    }

    // Verificar si el lugar existe y es de tipo pet-friendly
    const existingPlace = await prisma.service.findUnique({
      where: { id },
    })

    if (!existingPlace) {
      return NextResponse.json({ error: "Lugar no encontrado" }, { status: 404 })
    }

    if (existingPlace.category !== "pet-friendly") {
      return NextResponse.json({ error: "El servicio no es un lugar pet-friendly" }, { status: 400 })
    }

    // Eliminar el lugar
    await prisma.service.delete({
      where: { id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[PET_FRIENDLY_DELETE]", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}

