import { NextResponse } from "next/server"
import { auth } from "@/auth"
import prisma from "@/lib/prismadb"
import { teamMemberSchema } from "@/lib/validations"

export async function GET() {
  try {
    const session = await auth()

    // Verificar si el usuario está autenticado y es administrador
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 })
    }

    // Obtener todos los miembros del equipo ordenados por orden y luego por nombre
    const teamMembers = await prisma.teamMember.findMany({
      orderBy: [{ order: "asc" }, { name: "asc" }],
    })

    return NextResponse.json(teamMembers)
  } catch (error) {
    console.error("Error en API de equipo:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const session = await auth()

    // Verificar si el usuario está autenticado y es administrador
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 })
    }

    const data = await request.json()

    // Validar datos con Zod
    const validationResult = teamMemberSchema.safeParse(data)

    if (!validationResult.success) {
      const errors = validationResult.error.errors.map((error) => ({
        field: error.path.join("."),
        message: error.message,
      }))
      return NextResponse.json({ errors }, { status: 400 })
    }

    // Crear nuevo miembro del equipo
    const newTeamMember = await prisma.teamMember.create({
      data: {
        name: data.name,
        role: data.role,
        bio: data.bio || "",
        image: data.image,
        order: data.order || 0,
        twitter: data.twitter,
        instagram: data.instagram,
        facebook: data.facebook,
        linkedin: data.linkedin,
        github: data.github,
        isFounder: data.isFounder || false,
      },
    })

    return NextResponse.json(newTeamMember, { status: 201 })
  } catch (error) {
    console.error("Error al crear miembro del equipo:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}

