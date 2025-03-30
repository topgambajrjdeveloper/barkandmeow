import { NextResponse } from "next/server"
import prisma from "@/lib/prismadb"
import { auth } from "@/auth"

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const id = params.id

    if (!id) {
      return NextResponse.json({ error: "Se requiere un ID válido" }, { status: 400 })
    }

    const service = await prisma.service.findUnique({
      where: { id },
    })

    if (!service) {
      return NextResponse.json({ error: "Servicio no encontrado" }, { status: 404 })
    }

    return NextResponse.json(service)
  } catch (error) {
    console.error("Error al obtener servicio:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const userId = session.user.id
    const id = params.id
    const data = await request.json()

    // Verificar si el servicio existe y pertenece al usuario
    const existingService = await prisma.service.findUnique({
      where: { id },
    })

    if (!existingService) {
      return NextResponse.json({ error: "Servicio no encontrado" }, { status: 404 })
    }

    // Solo permitir actualización si el usuario es el propietario o es administrador
    const isAdmin = session.user.role === "ADMIN" // Asumiendo que tienes un campo role en el modelo User
    if (existingService.createdBy !== userId && !isAdmin) {
      return NextResponse.json({ error: "No autorizado para editar este servicio" }, { status: 403 })
    }

    // Actualizar el servicio
    const updatedService = await prisma.service.update({
      where: { id },
      data: {
        ...data,
        // Si no es admin, marcar como no activo para revisión
        isActive: isAdmin ? data.isActive : false,
      },
    })

    return NextResponse.json(updatedService)
  } catch (error) {
    console.error("Error al actualizar servicio:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const userId = session.user.id
    const id = params.id

    // Verificar si el servicio existe y pertenece al usuario
    const existingService = await prisma.service.findUnique({
      where: { id },
    })

    if (!existingService) {
      return NextResponse.json({ error: "Servicio no encontrado" }, { status: 404 })
    }

    // Solo permitir eliminación si el usuario es el propietario o es administrador
    const isAdmin = session.user.role === "ADMIN" // Asumiendo que tienes un campo role en el modelo User
    if (existingService.createdBy !== userId && !isAdmin) {
      return NextResponse.json({ error: "No autorizado para eliminar este servicio" }, { status: 403 })
    }

    // Eliminar el servicio
    await prisma.service.delete({
      where: { id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error al eliminar servicio:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}

