import { NextResponse } from "next/server"
import prisma from "@/lib/prismadb"

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    console.log("API /api/profile/[id] - Recibida solicitud para ID:", params.id)

    // Verificar si el ID es válido
    if (!params.id) {
      console.error("ID no proporcionado")
      return NextResponse.json({ error: "ID no proporcionado" }, { status: 400 })
    }

    // Determinar si es "me" y obtener el ID del usuario actual si es necesario
    const userId = params.id
    if (userId === "me") {
      // Aquí deberías implementar la lógica para obtener el ID del usuario actual
      // Por ejemplo, usando la sesión de autenticación
      // userId = session?.user?.id;

      // Como no tenemos acceso a la sesión aquí, devolvemos un error
      return NextResponse.json({ error: "Funcionalidad 'me' no implementada" }, { status: 501 })
    }

    // Buscar usuario por ID
    const user = await prisma.user.findUnique({
      where: {
        id: userId,
      },
      include: {
        pets: true, // Incluir la relación de mascotas
        // Incluir otras relaciones según sea necesario
      },
    })

    // Si no se encuentra el usuario
    if (!user) {
      console.error("Usuario no encontrado para ID:", userId)
      return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 })
    }

    console.log("Usuario encontrado:", user)

    // Devolver los datos del usuario
    return NextResponse.json(user)
  } catch (error) {
    console.error("Error al obtener perfil:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}

