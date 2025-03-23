import { NextResponse } from "next/server"
import { auth } from "@/auth"
import prisma from "@/lib/prismadb"

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  try {
    const session = await auth()

    // Verificar si el usuario está autenticado y es administrador
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 })
    }

    const userId = params.id
    const { status } = await request.json()

    // Validar el estado
    if (!["active", "suspended", "pending"].includes(status)) {
      return NextResponse.json({ error: "Estado no válido" }, { status: 400 })
    }

    // Verificar que el usuario existe
    const user = await prisma.user.findUnique({
      where: { id: userId },
    })

    if (!user) {
      return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 })
    }

    // Actualizar el usuario según el estado
    // Nota: Como no tenemos un campo 'status' en el modelo User,
    // mapeamos los estados a campos existentes
    let updateData = {}

    if (status === "active") {
      updateData = { isEmailConfirmed: true }
    } else if (status === "suspended") {
      // Aquí podrías implementar la lógica para suspender un usuario
      // Por ejemplo, podrías tener un campo isActive o isSuspended
      updateData = { isEmailConfirmed: false }
    } else if (status === "pending") {
      updateData = { isEmailConfirmed: false }
    }

    // Actualizar el usuario
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: updateData,
    })

    return NextResponse.json(updatedUser)
  } catch (error) {
    console.error("Error al actualizar el estado del usuario:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}

