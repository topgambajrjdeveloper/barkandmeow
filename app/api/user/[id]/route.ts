import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    // Resolver la promesa params antes de acceder a sus propiedades
    const resolvedParams = await params
    const paramId = resolvedParams.id

    const session = await auth()

    if (!session || !session.user) {
      console.log("No authorized session")
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const userId = paramId === "me" ? session.user.id : paramId
    console.log("Resolved user ID:", userId)

    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        include: {
          pets: {
            include: {
              passport: true,
              healthCard: true,
            },
          },
        },
      })

      if (!user) {
        console.log("User not found")
        return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 })
      }

      console.log("User found:", user.id)

      // If the profile is not public and it's not the authenticated user, limit the information
      if (!user.isPublicProfile && userId !== session.user.id) {
        console.log("Returning limited public profile")
        return NextResponse.json({
          id: user.id,
          username: user.username,
          profileImage: user.profileImage,
          isPublicProfile: user.isPublicProfile,
        })
      }

      // Prepare the user profile data
      const userProfile = {
        ...user,
        createdAt: user.createdAt.toISOString(),
        updatedAt: user.updatedAt.toISOString(),
        pets: user.pets.map((pet) => ({
          ...pet,
          createdAt: pet.createdAt.toISOString(),
          updatedAt: pet.updatedAt.toISOString(),
          passport: pet.passport,
          healthCard: pet.healthCard,
        })),
      }

      console.log("Returning full user profile")
      return NextResponse.json(userProfile)
    } catch (prismaError) {
      console.error("Prisma error:", prismaError)
      return NextResponse.json({ error: "Error de base de datos" }, { status: 500 })
    }
  } catch (error) {
    console.error("Error fetching user profile:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}

