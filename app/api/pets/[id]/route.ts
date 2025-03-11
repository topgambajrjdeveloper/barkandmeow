import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

// Actualizar la función GET para incluir healthCard con sus vacunas
export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    // Resolver la promesa params antes de acceder a sus propiedades
    const resolvedParams = await params
    const petId = resolvedParams.id

    const session = await auth()

    if (!session || !session.user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    // Obtener la mascota con su dueño y seguidores
    const pet = await prisma.pet.findUnique({
      where: { id: petId },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            profileImage: true,
          },
        },
        followers: {
          select: {
            userId: true,
            user: {
              select: {
                id: true,
                username: true,
                profileImage: true,
              },
            },
          },
        },
        passport: true,
        healthCard: {
          include: {
            vaccinations: {
              select: {
                id: true,
                name: true,
                date: true,
                expiryDate: true,
                veterinarianName: true,
                notes: true,
                batchNumber: true,
              },
              orderBy: {
                date: "desc",
              },
            },
            medications: true,
            medicalHistory: true,
          },
        },
      },
    })

    if (!pet) {
      return NextResponse.json({ error: "Mascota no encontrada" }, { status: 404 })
    }

    // Verificar si el usuario actual sigue a esta mascota
    const isFollowing = await prisma.petFollows.findUnique({
      where: {
        userId_petId: {
          userId: session.user.id,
          petId: pet.id,
        },
      },
    })

    // Formatear la respuesta
    const petProfile = {
      id: pet.id,
      name: pet.name,
      type: pet.type,
      breed: pet.breed,
      age: pet.age,
      image: pet.image,
      description: pet.description,
      userId: pet.userId, // Asegurarse de incluir el userId directamente
      owner: pet.user,
      isFollowing: !!isFollowing,
      followersCount: pet.followers.length,
      followers: pet.followers.map((f) => ({
        id: f.user.id,
        username: f.user.username,
        profileImage: f.user.profileImage,
      })),
      passport: pet.passport,
      healthCard: pet.healthCard
        ? {
            id: pet.healthCard.id,
            vaccinations: pet.healthCard.vaccinations
              ? pet.healthCard.vaccinations.map((v) => ({
                  id: v.id,
                  name: v.name,
                  date: v.date.toISOString(),
                  expiryDate: v.expiryDate ? v.expiryDate.toISOString() : null,
                  veterinarianName: v.veterinarianName,
                  notes: v.notes,
                  batchNumber: v.batchNumber,
                }))
              : [],
            medications: pet.healthCard.medications || [],
            medicalHistory: pet.healthCard.medicalHistory || [],
          }
        : null,
      createdAt: pet.createdAt.toISOString(),
      updatedAt: pet.updatedAt.toISOString(),
    }

    return NextResponse.json(petProfile)
  } catch (error) {
    console.error("Error fetching pet profile:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}

