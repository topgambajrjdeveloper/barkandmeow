import { NextResponse } from "next/server"
import { auth } from "@/auth"
import prisma from "@/lib/prismadb"

// GET - Obtener un veterinario específico
export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = params

    if (!id) {
      return NextResponse.json({ error: "ID no proporcionado" }, { status: 400 })
    }

    const vet = await prisma.service.findUnique({
      where: { id },
    })

    if (!vet) {
      return NextResponse.json({ error: "Veterinario no encontrado" }, { status: 404 })
    }

    if (vet.category !== "vets") {
      return NextResponse.json({ error: "El servicio no es un veterinario" }, { status: 400 })
    }

    return NextResponse.json(vet)
  } catch (error) {
    console.error("[VET_GET_BY_ID]", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}

// PATCH - Actualizar un veterinario (solo admin)
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

    // Verificar si el veterinario existe y es de tipo vets
    const existingVet = await prisma.service.findUnique({
      where: { id },
    })

    if (!existingVet) {
      return NextResponse.json({ error: "Veterinario no encontrado" }, { status: 404 })
    }

    if (existingVet.category !== "vets") {
      return NextResponse.json({ error: "El servicio no es un veterinario" }, { status: 400 })
    }

    // Preparar etiquetas
    let tags = body.tags || existingVet.tags || []

    // Añadir especialidades a las etiquetas si existen
    if (body.specialties && Array.isArray(body.specialties)) {
      tags = [...new Set([...tags, ...body.specialties])]
    }

    // Gestionar etiqueta de urgencias
    if (body.isEmergency !== undefined) {
      if (body.isEmergency) {
        // Añadir etiqueta si no existe
        if (!tags.includes("Urgencias 24h")) {
          tags.push("Urgencias 24h")
        }
      } else {
        // Eliminar etiqueta si existe
        tags = tags.filter((tag) => tag !== "Urgencias 24h")
      }
    }

    // Preparar metadatos
    const metadata = {
      ...(existingVet.metadata || {}),
      bookingUrl: body.bookingUrl !== undefined ? body.bookingUrl : existingVet.metadata?.bookingUrl,
    }

    // Actualizar el veterinario
    const updatedVet = await prisma.service.update({
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
        subCategory: body.subCategory,
        tags,
        rating: body.rating,
        featured: body.featured,
        isActive: body.isActive,
        isOnline: false, // Los veterinarios no son servicios online
        metadata,
        updatedAt: new Date(),
      },
    })

    return NextResponse.json(updatedVet)
  } catch (error) {
    console.error("[VET_PATCH]", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}

// DELETE - Eliminar un veterinario (solo admin)
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

    // Verificar si el veterinario existe y es de tipo vets
    const existingVet = await prisma.service.findUnique({
      where: { id },
    })

    if (!existingVet) {
      return NextResponse.json({ error: "Veterinario no encontrado" }, { status: 404 })
    }

    if (existingVet.category !== "vets") {
      return NextResponse.json({ error: "El servicio no es un veterinario" }, { status: 400 })
    }

    // Eliminar el veterinario
    await prisma.service.delete({
      where: { id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[VET_DELETE]", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}

