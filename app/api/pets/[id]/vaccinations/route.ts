import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { vaccinationSchema } from "@/lib/validations"
import prisma from "@/lib/prismadb"

// POST: Crear una nueva vacuna
export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth()

    if (!session || !session.user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    // Resolver la promesa params antes de acceder a sus propiedades
    const resolvedParams = await params
    const petId = resolvedParams.id

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

    // Validar los datos recibidos
    const data = await request.json()
    const validationResult = vaccinationSchema.safeParse(data)

    if (!validationResult.success) {
      const errorMessage = validationResult.error.errors.map((e) => e.message).join(", ")
      return NextResponse.json({ error: errorMessage }, { status: 400 })
    }

    const validatedData = validationResult.data

    // Verificar si existe una cartilla sanitaria, si no, crearla
    let healthCardId = pet.healthCard?.id

    if (!healthCardId) {
      // Crear una nueva cartilla sanitaria
      const healthCard = await prisma.healthCard.create({
        data: {
          petId: petId,
        },
      })
      healthCardId = healthCard.id
    }

    // Crear la vacuna - Corregido para usar solo los campos que existen en la base de datos
    const vaccinationData = {
      name: validatedData.name,
      date: new Date(validatedData.date),
      // Usar solo expiryDate ya que nextDueDate no existe en la base de datos
      expiryDate: validatedData.nextDueDate ? new Date(validatedData.nextDueDate) : null,
      // Usar veterinarianName
      veterinarianName: validatedData.veterinarian || null,
      // Añadir batchNumber como null si no está presente
      batchNumber: null,
      // Añadir notes si está presente
      notes: validatedData.notes || null,
      healthCardId: healthCardId,
    }

    const vaccination = await prisma.vaccination.create({
      data: vaccinationData,
    })

    return NextResponse.json(vaccination)
  } catch (error) {
    console.error("Error creating vaccination:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}

// PUT: Actualizar una vacuna existente
export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth()

    if (!session || !session.user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    // Resolver la promesa params antes de acceder a sus propiedades
    const resolvedParams = await params
    const petId = resolvedParams.id

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

    // Validar los datos recibidos
    const data = await request.json()

    // Extraer el ID de la vacuna del cuerpo de la solicitud
    const { id: vaccinationId, ...vaccinationData } = data

    if (!vaccinationId) {
      return NextResponse.json({ error: "ID de vacuna no proporcionado" }, { status: 400 })
    }

    const validationResult = vaccinationSchema.safeParse(vaccinationData)

    if (!validationResult.success) {
      const errorMessage = validationResult.error.errors.map((e) => e.message).join(", ")
      return NextResponse.json({ error: errorMessage }, { status: 400 })
    }

    const validatedData = validationResult.data

    // Verificar que la vacuna existe y pertenece a la mascota
    const existingVaccination = await prisma.vaccination.findFirst({
      where: {
        id: vaccinationId,
        healthCard: {
          petId: petId,
        },
      },
    })

    if (!existingVaccination) {
      return NextResponse.json({ error: "Vacuna no encontrada o no pertenece a esta mascota" }, { status: 404 })
    }

    // Actualizar la vacuna
    const updatedVaccination = await prisma.vaccination.update({
      where: { id: vaccinationId },
      data: {
        name: validatedData.name,
        date: new Date(validatedData.date),
        // Usar solo expiryDate ya que nextDueDate no existe en la base de datos
        expiryDate: validatedData.nextDueDate ? new Date(validatedData.nextDueDate) : null,
        veterinarianName: validatedData.veterinarian || null,
        batchNumber: null,
        notes: validatedData.notes || null,
      },
    })

    return NextResponse.json(updatedVaccination)
  } catch (error) {
    console.error("Error updating vaccination:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}

// DELETE: Eliminar una vacuna
export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth()

    if (!session || !session.user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    // Resolver la promesa params antes de acceder a sus propiedades
    const resolvedParams = await params
    const petId = resolvedParams.id

    const { searchParams } = new URL(request.url)
    const vaccinationId = searchParams.get("vaccinationId")

    if (!vaccinationId) {
      return NextResponse.json({ error: "ID de vacuna no proporcionado" }, { status: 400 })
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

    // Verificar que la vacuna existe y pertenece a la mascota
    const existingVaccination = await prisma.vaccination.findFirst({
      where: {
        id: vaccinationId,
        healthCard: {
          petId: petId,
        },
      },
    })

    if (!existingVaccination) {
      return NextResponse.json({ error: "Vacuna no encontrada o no pertenece a esta mascota" }, { status: 404 })
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

