import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { healthCardSchema } from "@/lib/validations"
import prisma from "@/lib/prismadb"

// POST: Crear una nueva cartilla sanitaria
export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth()

    if (!session || !session.user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    // Await the params Promise before accessing id
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

    // Verificar si ya existe una cartilla sanitaria
    if (pet.healthCard) {
      return NextResponse.json({ error: "Esta mascota ya tiene una cartilla sanitaria" }, { status: 400 })
    }

    // Validar los datos recibidos
    const data = await request.json()
    const validationResult = healthCardSchema.safeParse(data)

    if (!validationResult.success) {
      const errorMessage = validationResult.error.errors.map((e) => e.message).join(", ")
      return NextResponse.json({ error: errorMessage }, { status: 400 })
    }

    const validatedData = validationResult.data

    // Crear la cartilla sanitaria
    const healthCard = await prisma.healthCard.create({
      data: {
        veterinarianName: validatedData.veterinarianName,
        clinicName: validatedData.clinicName,
        clinicAddress: validatedData.clinicAddress,
        clinicPhone: validatedData.clinicPhone,
        clinicEmail: validatedData.clinicEmail,
        lastCheckupDate: validatedData.lastCheckupDate ? new Date(validatedData.lastCheckupDate) : null,
        nextCheckupDate: validatedData.nextCheckupDate ? new Date(validatedData.nextCheckupDate) : null,
        notes: validatedData.notes,
        petId: petId,
      },
    })

    return NextResponse.json(healthCard)
  } catch (error) {
    console.error("Error creating health card:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}

// PUT: Actualizar una cartilla sanitaria existente
export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth()

    if (!session || !session.user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    // Await the params Promise before accessing id
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

    // Verificar si existe una cartilla sanitaria
    if (!pet.healthCard) {
      return NextResponse.json({ error: "Esta mascota no tiene una cartilla sanitaria" }, { status: 400 })
    }

    // Validar los datos recibidos
    const data = await request.json()
    const validationResult = healthCardSchema.safeParse(data)

    if (!validationResult.success) {
      const errorMessage = validationResult.error.errors.map((e) => e.message).join(", ")
      return NextResponse.json({ error: errorMessage }, { status: 400 })
    }

    const validatedData = validationResult.data

    // Actualizar la cartilla sanitaria
    const updatedHealthCard = await prisma.healthCard.update({
      where: { id: pet.healthCard.id },
      data: {
        veterinarianName: validatedData.veterinarianName,
        clinicName: validatedData.clinicName,
        clinicAddress: validatedData.clinicAddress,
        clinicPhone: validatedData.clinicPhone,
        clinicEmail: validatedData.clinicEmail,
        lastCheckupDate: validatedData.lastCheckupDate ? new Date(validatedData.lastCheckupDate) : null,
        nextCheckupDate: validatedData.nextCheckupDate ? new Date(validatedData.nextCheckupDate) : null,
        notes: validatedData.notes,
      },
    })

    return NextResponse.json(updatedHealthCard)
  } catch (error) {
    console.error("Error updating health card:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}

// DELETE: Eliminar una cartilla sanitaria
export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth()

    if (!session || !session.user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    // Await the params Promise before accessing id
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

    // Verificar si existe una cartilla sanitaria
    if (!pet.healthCard) {
      return NextResponse.json({ error: "Esta mascota no tiene una cartilla sanitaria" }, { status: 400 })
    }

    // Eliminar la cartilla sanitaria
    await prisma.healthCard.delete({
      where: { id: pet.healthCard.id },
    })

    return NextResponse.json({ message: "Cartilla sanitaria eliminada correctamente" })
  } catch (error) {
    console.error("Error deleting health card:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}

// GET: Obtener la cartilla sanitaria
export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth()

    if (!session || !session.user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    // Await the params Promise before accessing id
    const resolvedParams = await params
    const petId = resolvedParams.id

    // Verificar que la mascota existe
    const pet = await prisma.pet.findUnique({
      where: { id: petId },
      include: {
        healthCard: {
          include: {
            vaccinations: {
              orderBy: {
                date: "desc",
              },
            },
            medications: {
              orderBy: {
                startDate: "desc",
              },
            },
            medicalHistory: {
              orderBy: {
                date: "desc",
              },
            },
          },
        },
      },
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

    if (!pet.healthCard) {
      return NextResponse.json({ error: "Esta mascota no tiene una cartilla sanitaria" }, { status: 404 })
    }

    return NextResponse.json(pet.healthCard)
  } catch (error) {
    console.error("Error fetching health card:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}

