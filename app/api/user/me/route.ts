import { NextResponse } from "next/server"
import { auth } from "@/auth"
import prisma from "@/lib/prismadb"

export async function GET() {
  try {
    console.log("API: Fetching current user data")
    const session = await auth()

    if (!session || !session.user) {
      console.log("API: No authorized session for /me endpoint")
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const userId = session.user.id

    // Ahora incluimos el campo bio en la consulta
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        username: true,
        email: true,
        profileImage: true,
        petName: true,
        petType: true,
        petImage: true,
        bio: true, // Incluimos el campo bio
        location: true,
        isPublicProfile: true,
        createdAt: true,
        updatedAt: true,
      },
    })

    if (!user) {
      console.log("API: Current user not found in database")
      return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 })
    }

    console.log("API: Current user data retrieved successfully:", user)

    return NextResponse.json({
      ...user,
      createdAt: user.createdAt.toISOString(),
      updatedAt: user.updatedAt.toISOString(),
    })
  } catch (error) {
    console.error("API: Error fetching current user:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}

