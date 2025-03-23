import { NextResponse } from "next/server"
import { auth } from "@/auth"
import prisma from "@/lib/prismadb"
import { vaccinationSchema } from "@/lib/validations"



// PUT: Actualizar una vacuna
export async function PUT(request: Request, { params }: { params: Promise<{ id: string; vaccinationId: string }> }) {
  try {
    const session = await auth()

    if (!session || !session.user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    // Await the params Promise before accessing properties
    const resolvedParams = await params
    const petId = resolvedParams.id
    const vaccinationId = resolvedParams.vaccinationId

    // Verificar que la mascota existe y pertenece al usuario
    const pet = await prisma.pet.findUnique({
      where: { id: petId },
      include: { healthCard: true },
    })

    if (!pet) {
      return NextResponse.json({ error: "Mascota no encontrada" }, { status: 404 })
    }

    if (pet.userId !== session.user.id) {
      return NextResponse.json({ error: "No tienes permiso para modificar esta mascota" }, { status: 403 })
    }

    // Verificar si existe una cartilla sanitaria
    if (!pet.healthCard) {
      return NextResponse.json({ error: "Esta mascota no tiene una cartilla sanitaria" }, { status: 400 })
    }

    // Verificar que la vacuna existe y pertenece a la cartilla sanitaria
    const vaccination = await prisma.vaccination.findUnique({
      where: { id: vaccinationId },
    })

    if (!vaccination) {
      return NextResponse.json({ error: "Vacuna no encontrada" }, { status: 404 })
    }

    if (vaccination.healthCardId !== pet.healthCard.id) {
      return NextResponse.json({ error: "La vacuna no pertenece a esta mascota" }, { status: 403 })
    }

    // Validar los datos recibidos
    const data = await request.json()
    const validationResult = vaccinationSchema.safeParse(data)

    if (!validationResult.success) {
      const errorMessage = validationResult.error.errors.map((e) => e.message).join(", ")
      return NextResponse.json({ error: errorMessage }, { status: 400 })
    }

    const validatedData = validationResult.data

    // Actualizar la vacuna
    const updatedVaccination = await prisma.vaccination.update({
      where: { id: vaccinationId },
      data: {
        name: validatedData.name,
        date: new Date(validatedData.date),
        expiryDate: validatedData.expiryDate ? new Date(validatedData.expiryDate) : null,
        batchNumber: validatedData.batchNumber,
        veterinarianName: validatedData.veterinarianName,
        notes: validatedData.notes,
      },
    })

    return NextResponse.json(updatedVaccination)
  } catch (error) {
    console.error("Error updating vaccination:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}

// DELETE: Eliminar una vacuna
export async function DELETE(request: Request, { params }: { params: Promise<{ id: string; vaccinationId: string }> }) {
  try {
    const session = await auth()

    if (!session || !session.user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    // Await the params Promise before accessing properties
    const resolvedParams = await params
    const petId = resolvedParams.id
    const vaccinationId = resolvedParams.vaccinationId

    // Verificar que la mascota existe y pertenece al usuario
    const pet = await prisma.pet.findUnique({
      where: { id: petId },
      include: { healthCard: true },
    })

    if (!pet) {
      return NextResponse.json({ error: "Mascota no encontrada" }, { status: 404 })
    }

    if (pet.userId !== session.user.id) {
      return NextResponse.json({ error: "No tienes permiso para modificar esta mascota" }, { status: 403 })
    }

    // Verificar si existe una cartilla sanitaria
    if (!pet.healthCard) {
      return NextResponse.json({ error: "Esta mascota no tiene una cartilla sanitaria" }, { status: 400 })
    }

    // Verificar que la vacuna existe y pertenece a la cartilla sanitaria
    const vaccination = await prisma.vaccination.findUnique({
      where: { id: vaccinationId },
    })

    if (!vaccination) {
      return NextResponse.json({ error: "Vacuna no encontrada" }, { status: 404 })
    }

    if (vaccination.healthCardId !== pet.healthCard.id) {
      return NextResponse.json({ error: "La vacuna no pertenece a esta mascota" }, { status: 403 })
    }

    // Eliminar la vacuna
    await prisma.vaccination.delete({
      where: { id: vaccinationId },
    })

    return NextResponse.json({ message: "Vacuna eliminada correctamente" })
  } catch (error) {
    console.error("Error deleting vaccination:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}

// GET: Obtener una vacuna específica
export async function GET(request: Request, { params }: { params: Promise<{ id: string; vaccinationId: string }> }) {
  try {
    const session = await auth()

    if (!session || !session.user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    // Await the params Promise before accessing properties
    const resolvedParams = await params
    const petId = resolvedParams.id
    const vaccinationId = resolvedParams.vaccinationId

    // Verificar que la mascota existe
    const pet = await prisma.pet.findUnique({
      where: { id: petId },
      include: { healthCard: true },
    })

    if (!pet) {
      return NextResponse.json({ error: "Mascota no encontrada" }, { status: 404 })
    }

    // Si la mascota no pertenece al usuario, verificar si el perfil es público
    if (pet.userId !== session.user.id) {
      const owner = await prisma.user.findUnique({
        where: { id: pet.userId },
        select: { isPublicProfile: true },
      })

      if (!owner || !owner.isPublicProfile) {
        return NextResponse.json({ error: "No tienes permiso para ver esta información" }, { status: 403 })
      }
    }

    // Verificar si existe una cartilla sanitaria
    if (!pet.healthCard) {
      return NextResponse.json({ error: "Esta mascota no tiene una cartilla sanitaria" }, { status: 404 })
    }

    // Obtener la vacuna
    const vaccination = await prisma.vaccination.findUnique({
      where: { id: vaccinationId },
    })

    if (!vaccination) {
      return NextResponse.json({ error: "Vacuna no encontrada" }, { status: 404 })
    }

    if (vaccination.healthCardId !== pet.healthCard.id) {
      return NextResponse.json({ error: "La vacuna no pertenece a esta mascota" }, { status: 403 })
    }

    return NextResponse.json(vaccination)
  } catch (error) {
    console.error("Error fetching vaccination:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}

