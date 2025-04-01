import { NextResponse } from "next/server"
import prisma from "@/lib/prismadb"

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    
    // Verificar si el ID es válido
    if (!params.id) {
      console.error("ID no proporcionado")
      return NextResponse.json({ error: "ID no proporcionado" }, { status: 400 })
    }

    // Buscar usuario por ID
    const user = await prisma.user.findUnique({
      where: {
        id: params.id === "me" ? "current-user-id" : params.id, // Reemplazar "current-user-id" con lógica para obtener el ID del usuario actual
      },
      include: {
        pets: true, // Incluir la relación de mascotas
      },
    })

    // Si no se encuentra el usuario
    if (!user) {
      return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 })
    }


    // Devolver los datos del usuario
    return NextResponse.json(user)
  } catch (error) {
    console.error("Error al obtener perfil:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}

