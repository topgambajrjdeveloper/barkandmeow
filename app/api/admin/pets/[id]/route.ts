import { NextResponse } from "next/server"
import { auth } from "@/auth"
import prisma from "@/lib/prismadb"

// Obtener una mascota específica
export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const session = await auth()

    // Verificar si el usuario está autenticado y es administrador
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 })
    }

    const petId = params.id

    // Actualizar la consulta para incluir información del pasaporte y tarjeta de salud
    const pet = await prisma.pet.findUnique({
      where: { id: petId },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            email: true,
            profileImage: true,
          },
        },
        passport: true,
        healthCard: {
          include: {
            vaccinations: true,
            medications: true,
            medicalHistory: true,
          },
        },
        _count: {
          select: {
            followers: true,
          },
        },
      },
    })

    if (!pet) {
      return NextResponse.json({ error: "Mascota no encontrada" }, { status: 404 })
    }

    return NextResponse.json(pet)
  } catch (error) {
    console.error("Error al obtener la mascota:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}

// Actualizar una mascota
export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const session = await auth()

    // Verificar si el usuario está autenticado y es administrador
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 })
    }

    const petId = params.id
    const data = await request.json()

    // Verificar que la mascota existe
    const pet = await prisma.pet.findUnique({
      where: { id: petId },
    })

    if (!pet) {
      return NextResponse.json({ error: "Mascota no encontrada" }, { status: 404 })
    }

    // Actualizar la mascota
    const updatedPet = await prisma.pet.update({
      where: { id: petId },
      data: {
        name: data.name,
        type: data.type,
        breed: data.breed,
        age: data.age ? Number(data.age) : null,
        image: data.image,
        description: data.description,
        // Otros campos que quieras actualizar
      },
    })

    return NextResponse.json(updatedPet)
  } catch (error) {
    console.error("Error al actualizar la mascota:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}

// Eliminar una mascota
export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const session = await auth()

    // Verificar si el usuario está autenticado y es administrador
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 })
    }

    const { id: petId } = await params

    // Verificar que la mascota existe
    const pet = await prisma.pet.findUnique({
      where: { id: petId },
    })

    if (!pet) {
      return NextResponse.json({ error: "Mascota no encontrada" }, { status: 404 })
    }

    // Eliminar registros relacionados primero
    // 1. Eliminar seguidores de la mascota
    await prisma.petFollows.deleteMany({
      where: { petId: petId },
    })

    // 2. Eliminar otros registros relacionados si existen
    // Por ejemplo, si tienes publicaciones asociadas a mascotas:
    // await prisma.post.deleteMany({
    //   where: { petId: petId },
    // })

    // Finalmente, eliminar la mascota
    await prisma.pet.delete({
      where: { id: petId },
    })

    return NextResponse.json({ message: "Mascota eliminada correctamente" })
  } catch (error) {
    console.error("Error al eliminar la mascota:", error)
    return NextResponse.json(
      {
        error: "Error interno del servidor",
        details: error instanceof Error ? error.message : "Error desconocido",
      },
      { status: 500 },
    )
  }
}

