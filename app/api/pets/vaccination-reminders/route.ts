import { type NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import prisma from "@/lib/prismadb"

export async function POST(request: NextRequest) {
  try {
    const session = await auth()

    if (!session || !session.user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const { petId, enabled } = await request.json()

    if (!petId) {
      return NextResponse.json({ error: "ID de mascota requerido" }, { status: 400 })
    }

    // Verificar que la mascota existe y pertenece al usuario
    const pet = await prisma.pet.findUnique({
      where: { id: petId },
    })

    if (!pet) {
      return NextResponse.json({ error: "Mascota no encontrada" }, { status: 404 })
    }

    if (pet.userId !== session.user.id) {
      return NextResponse.json({ error: "No tienes permiso para modificar esta mascota" }, { status: 403 })
    }

    // Actualizar las preferencias de recordatorio
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const updatedPet = await prisma.pet.update({
      where: { id: petId },
      data: {
        vaccinationRemindersEnabled: enabled,
      },
    })

    return NextResponse.json({
      success: true,
      enabled,
    })
  } catch (error) {
    console.error("Error updating vaccination reminders:", error)
    return NextResponse.json({ error: error instanceof Error ? error.message : "Error desconocido" }, { status: 500 })
  }
}

