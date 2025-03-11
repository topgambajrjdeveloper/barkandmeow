import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { PrismaClient } from "@prisma/client"
import { vaccinationSchema } from "@/lib/validations"

const prisma = new PrismaClient()

// POST: Añadir una nueva vacuna
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

    // Verificar si existe una cartilla sanitaria
    if (!pet.healthCard) {
      return NextResponse.json({ error: "Esta mascota no tiene una cartilla sanitaria" }, { status: 400 })
    }

    // Validar los datos recibidos
    const data = await request.json()
    const validationResult = vaccinationSchema.safeParse(data)

    if (!validationResult.success) {
      const errorMessage = validationResult.error.errors.map((e) => e.message).join(", ")
      return NextResponse.json({ error: errorMessage }, { status: 400 })
    }

    const validatedData = validationResult.data

    // Añadir la vacuna
    const vaccination = await prisma.vaccination.create({
      data: {
        name: validatedData.name,
        date: new Date(validatedData.date),
        expiryDate: validatedData.expiryDate ? new Date(validatedData.expiryDate) : null,
        batchNumber: validatedData.batchNumber,
        veterinarianName: validatedData.veterinarianName,
        notes: validatedData.notes,
        healthCardId: pet.healthCard.id,
      },
    })

    return NextResponse.json(vaccination)
  } catch (error) {
    console.error("Error adding vaccination:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}

// GET: Obtener todas las vacunas
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

    // Obtener todas las vacunas
    const vaccinations = await prisma.vaccination.findMany({
      where: { healthCardId: pet.healthCard.id },
      orderBy: { date: "desc" },
    })

    return NextResponse.json(vaccinations)
  } catch (error) {
    console.error("Error fetching vaccinations:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}

