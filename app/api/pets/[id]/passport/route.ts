import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { passportSchema } from "@/lib/validations"
import prisma from "@/lib/prismadb"

// POST: Crear un nuevo pasaporte
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
      include: { passport: true },
    })

    if (!pet) {
      return NextResponse.json({ error: "Mascota no encontrada" }, { status: 404 })
    }

    if (pet.userId !== session.user.id) {
      return NextResponse.json({ error: "No tienes permiso para modificar esta mascota" }, { status: 403 })
    }

    // Verificar si ya existe un pasaporte
    if (pet.passport) {
      return NextResponse.json({ error: "Esta mascota ya tiene un pasaporte" }, { status: 400 })
    }

    // Validar los datos recibidos
    const data = await request.json()
    const validationResult = passportSchema.safeParse(data)

    if (!validationResult.success) {
      const errorMessage = validationResult.error.errors.map((e) => e.message).join(", ")
      return NextResponse.json({ error: errorMessage }, { status: 400 })
    }

    const validatedData = validationResult.data

    // Crear el pasaporte
    const passport = await prisma.passport.create({
      data: {
        passportNumber: validatedData.passportNumber,
        issuedDate: new Date(validatedData.issuedDate),
        expiryDate: validatedData.expiryDate ? new Date(validatedData.expiryDate) : null,
        issuingCountry: validatedData.issuingCountry,
        microchipNumber: validatedData.microchipNumber,
        species: validatedData.species,
        breed: validatedData.breed,
        sex: validatedData.sex,
        dateOfBirth: new Date(validatedData.dateOfBirth),
        transponderCode: validatedData.transponderCode,
        transponderReadDate: validatedData.transponderReadDate ? new Date(validatedData.transponderReadDate) : null,
        transponderLocation: validatedData.transponderLocation,
        tattooCode: validatedData.tattooCode,
        tattooDate: validatedData.tattooDate ? new Date(validatedData.tattooDate) : null,
        tattooLocation: validatedData.tattooLocation,
        veterinarianName: validatedData.veterinarianName,
        clinicAddress: validatedData.clinicAddress,
        clinicPostalCode: validatedData.clinicPostalCode,
        clinicCity: validatedData.clinicCity,
        clinicCountry: validatedData.clinicCountry,
        clinicPhone: validatedData.clinicPhone,
        clinicEmail: validatedData.clinicEmail,
        petId: petId,
      },
    })

    return NextResponse.json(passport)
  } catch (error) {
    console.error("Error creating passport:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}

// PUT: Actualizar un pasaporte existente
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
      include: { passport: true },
    })

    if (!pet) {
      return NextResponse.json({ error: "Mascota no encontrada" }, { status: 404 })
    }

    if (pet.userId !== session.user.id) {
      return NextResponse.json({ error: "No tienes permiso para modificar esta mascota" }, { status: 403 })
    }

    // Verificar si existe un pasaporte
    if (!pet.passport) {
      return NextResponse.json({ error: "Esta mascota no tiene un pasaporte" }, { status: 400 })
    }

    // Validar los datos recibidos
    const data = await request.json()
    const validationResult = passportSchema.safeParse(data)

    if (!validationResult.success) {
      const errorMessage = validationResult.error.errors.map((e) => e.message).join(", ")
      return NextResponse.json({ error: errorMessage }, { status: 400 })
    }

    const validatedData = validationResult.data

    // Actualizar el pasaporte
    const updatedPassport = await prisma.passport.update({
      where: { id: pet.passport.id },
      data: {
        passportNumber: validatedData.passportNumber,
        issuedDate: new Date(validatedData.issuedDate),
        expiryDate: validatedData.expiryDate ? new Date(validatedData.expiryDate) : null,
        issuingCountry: validatedData.issuingCountry,
        microchipNumber: validatedData.microchipNumber,
        species: validatedData.species,
        breed: validatedData.breed,
        sex: validatedData.sex,
        dateOfBirth: new Date(validatedData.dateOfBirth),
        transponderCode: validatedData.transponderCode,
        transponderReadDate: validatedData.transponderReadDate ? new Date(validatedData.transponderReadDate) : null,
        transponderLocation: validatedData.transponderLocation,
        tattooCode: validatedData.tattooCode,
        tattooDate: validatedData.tattooDate ? new Date(validatedData.tattooDate) : null,
        tattooLocation: validatedData.tattooLocation,
        veterinarianName: validatedData.veterinarianName,
        clinicAddress: validatedData.clinicAddress,
        clinicPostalCode: validatedData.clinicPostalCode,
        clinicCity: validatedData.clinicCity,
        clinicCountry: validatedData.clinicCountry,
        clinicPhone: validatedData.clinicPhone,
        clinicEmail: validatedData.clinicEmail,
      },
    })

    return NextResponse.json(updatedPassport)
  } catch (error) {
    console.error("Error updating passport:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}

// DELETE: Eliminar un pasaporte
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
      include: { passport: true },
    })

    if (!pet) {
      return NextResponse.json({ error: "Mascota no encontrada" }, { status: 404 })
    }

    if (pet.userId !== session.user.id) {
      return NextResponse.json({ error: "No tienes permiso para modificar esta mascota" }, { status: 403 })
    }

    // Verificar si existe un pasaporte
    if (!pet.passport) {
      return NextResponse.json({ error: "Esta mascota no tiene un pasaporte" }, { status: 400 })
    }

    // Eliminar el pasaporte
    await prisma.petPassport.delete({
      where: { id: pet.passport.id },
    })

    return NextResponse.json({ message: "Pasaporte eliminado correctamente" })
  } catch (error) {
    console.error("Error deleting passport:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}

