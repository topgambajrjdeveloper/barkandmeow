import { NextResponse } from "next/server"
import { auth } from "@/auth"
import prisma from "@/lib/prismadb"
import { teamMemberSchema } from "@/lib/validations"

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const session = await auth()

    // Verificar si el usuario está autenticado y es administrador
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 })
    }

    // Obtener el ID de forma asíncrona
    const { id } = await params

    // Buscar el miembro del equipo
    const teamMember = await prisma.teamMember.findUnique({
      where: { id },
    })

    if (!teamMember) {
      return NextResponse.json({ error: "Miembro del equipo no encontrado" }, { status: 404 })
    }

    return NextResponse.json(teamMember)
  } catch (error) {
    console.error("Error al obtener miembro del equipo:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const session = await auth()

    // Verificar si el usuario está autenticado y es administrador
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 })
    }

    // Obtener el ID de forma asíncrona
    const { id } = await params

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

    // Verificar que el miembro existe
    const teamMember = await prisma.teamMember.findUnique({
      where: { id },
    })

    if (!teamMember) {
      return NextResponse.json({ error: "Miembro del equipo no encontrado" }, { status: 404 })
    }

    // Actualizar miembro del equipo
    const updatedTeamMember = await prisma.teamMember.update({
      where: { id },
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

    return NextResponse.json(updatedTeamMember)
  } catch (error) {
    console.error("Error al actualizar miembro del equipo:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const session = await auth()

    // Verificar si el usuario está autenticado y es administrador
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 })
    }

    // Obtener el ID de forma asíncrona
    const { id } = await params

    // Verificar que el miembro existe
    const teamMember = await prisma.teamMember.findUnique({
      where: { id },
    })

    if (!teamMember) {
      return NextResponse.json({ error: "Miembro del equipo no encontrado" }, { status: 404 })
    }

    // Eliminar miembro del equipo
    await prisma.teamMember.delete({
      where: { id },
    })

    return NextResponse.json({ message: "Miembro del equipo eliminado correctamente" })
  } catch (error) {
    console.error("Error al eliminar miembro del equipo:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}

