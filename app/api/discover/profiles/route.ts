import { NextResponse } from "next/server"
import { auth } from "@/auth"
import prisma from "@/lib/prismadb"

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function GET(request: Request) {
  try {
    const session = await auth()

    if (!session || !session.user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const profiles = await prisma.user.findMany({
      where: {
        id: { not: session.user.id },
      },
      select: {
        id: true,
        username: true,
        profileImage: true,
        pets: {
          select: {
            name: true,
            type: true,
          },
          take: 1,
        },
        followers: {
          where: {
            followerId: session.user.id,
          },
          select: {
            followerId: true,
          },
        },
      },
      take: 20, // Limit to 20 profiles for performance
    })

    const formattedProfiles = profiles.map((profile) => ({
      id: profile.id,
      username: profile.username,
      profileImage: profile.profileImage,
      petName: profile.pets[0]?.name || "",
      petType: profile.pets[0]?.type || "",
      isFollowing: profile.followers.length > 0,
    }))

    return NextResponse.json(formattedProfiles)
  } catch (error) {
    console.error("Error fetching profiles:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}

