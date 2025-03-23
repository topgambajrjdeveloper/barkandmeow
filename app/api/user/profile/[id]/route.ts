import { NextResponse } from "next/server"
import { auth } from "@/auth"
import prisma from "@/lib/prismadb"

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    // Resolver la promesa params antes de acceder a sus propiedades
    const resolvedParams = await params
    const id = resolvedParams.id
    console.log("API: Fetching profile for ID:", id)

    const session = await auth()

    if (!session || !session.user) {
      console.log("API: No authorized session")
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const userId = id === "me" ? session.user.id : id
    console.log("API: Resolved user ID:", userId)

    try {
      console.log("API: Attempting to find user with ID:", userId)
      const user = await prisma.user.findUnique({
        where: { id: userId },
        include: {
          pets: {
            include: {
              passport: true,
              healthCard: {
                include: {
                  vaccinations: true,
                  medications: true,
                  medicalHistory: true,
                },
              },
            },
          },
          followers: {
            select: {
              follower: {
                select: {
                  id: true,
                  username: true,
                  profileImage: true,
                },
              },
            },
          },
          following: {
            select: {
              following: {
                select: {
                  id: true,
                  username: true,
                  profileImage: true,
                },
              },
            },
          },
          _count: {
            select: {
              followers: true,
              following: true,
              posts: true,
            },
          },
        },
      })

      if (!user) {
        console.log("API: User not found in database for ID:", userId)
        return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 })
      }

      console.log("API: User found:", user.id)

      // Verificar si el usuario actual sigue al perfil que se está viendo
      const isFollowing = await prisma.follows.findUnique({
        where: {
          followerId_followingId: {
            followerId: session.user.id,
            followingId: userId,
          },
        },
      })

      // Verificar si el perfil que se está viendo sigue al usuario actual
      const isFollowedBy = await prisma.follows.findUnique({
        where: {
          followerId_followingId: {
            followerId: userId,
            followingId: session.user.id,
          },
        },
      })

      const userProfile = {
        id: user.id,
        username: user.username || "Usuario sin nombre",
        email: user.email,
        profileImage: user.profileImage,
        bio: user.bio || "",
        petName: user.petName || "",
        petType: user.petType || "",
        petImage: user.petImage || null,
        isPublicProfile: user.isPublicProfile,
        location: user.location,
        createdAt: user.createdAt.toISOString(),
        postsCount: user._count.posts,
        followersCount: user._count.followers,
        followingCount: user._count.following,
        pets: user.pets.map((pet) => ({
          id: pet.id,
          name: pet.name,
          type: pet.type,
          breed: pet.breed,
          age: pet.age,
          image: pet.image,
          description: pet.description,
          passport: pet.passport,
          healthCard: pet.healthCard,
        })),
        followers: user.followers.map((f) => f.follower),
        following: user.following.map((f) => f.following),
        isFollowing: !!isFollowing,
        isFollowedBy: !!isFollowedBy,
        friends: [], // Añadido para cumplir con la interfaz UserProfile
      }

      console.log("API: Returning user profile successfully")
      return NextResponse.json(userProfile)
    } catch (prismaError) {
      console.error("API: Prisma error:", prismaError)
      return NextResponse.json(
        {
          error:
            "Error de base de datos: " + (prismaError instanceof Error ? prismaError.message : "Error desconocido"),
        },
        { status: 500 },
      )
    }
  } catch (error) {
    console.error("API: Error fetching user profile:", error)
    return NextResponse.json(
      { error: "Error interno del servidor: " + (error instanceof Error ? error.message : "Error desconocido") },
      { status: 500 },
    )
  }
}

