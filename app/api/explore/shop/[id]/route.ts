import { NextResponse } from "next/server"
import { auth } from "@/auth"
import prisma from "@/lib/prismadb"

// GET - Obtener una tienda específica
export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const { id } = params

    if (!id) {
      return NextResponse.json({ error: "ID no proporcionado" }, { status: 400 })
    }

    const shop = await prisma.service.findUnique({
      where: { id },
    })

    if (!shop) {
      return NextResponse.json({ error: "Tienda no encontrada" }, { status: 404 })
    }

    if (shop.category !== "shops") {
      return NextResponse.json({ error: "El servicio no es una tienda" }, { status: 400 })
    }

    return NextResponse.json(shop)
  } catch (error) {
    console.error("[SHOP_GET_BY_ID]", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}

// PATCH - Actualizar una tienda (solo admin)
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

    // Verificar si la tienda existe y es de tipo shops
    const existingShop = await prisma.service.findUnique({
      where: { id },
    })

    if (!existingShop) {
      return NextResponse.json({ error: "Tienda no encontrada" }, { status: 404 })
    }

    if (existingShop.category !== "shops") {
      return NextResponse.json({ error: "El servicio no es una tienda" }, { status: 400 })
    }

    // Si se está cambiando de tienda online a física, verificar que tenga dirección
    if (body.isOnline === false && !body.address && !existingShop.address) {
      return NextResponse.json({ error: "Las tiendas físicas requieren una dirección" }, { status: 400 })
    }

    // Actualizar la tienda
    const updatedShop = await prisma.service.update({
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
        tags: body.tags,
        rating: body.rating,
        featured: body.featured,
        isActive: body.isActive,
        isOnline: body.isOnline,
        updatedAt: new Date(),
      },
    })

    return NextResponse.json(updatedShop)
  } catch (error) {
    console.error("[SHOP_PATCH]", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}

// DELETE - Eliminar una tienda (solo admin)
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

    // Verificar si la tienda existe y es de tipo shops
    const existingShop = await prisma.service.findUnique({
      where: { id },
    })

    if (!existingShop) {
      return NextResponse.json({ error: "Tienda no encontrada" }, { status: 404 })
    }

    if (existingShop.category !== "shops") {
      return NextResponse.json({ error: "El servicio no es una tienda" }, { status: 400 })
    }

    // Eliminar la tienda
    await prisma.service.delete({
      where: { id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[SHOP_DELETE]", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}

