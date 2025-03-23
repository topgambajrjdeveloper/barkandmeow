import { NextResponse } from "next/server"
import { auth } from "@/auth"
import prisma from "@/lib/prismadb"

export async function GET() {
  try {
    const session = await auth()

    // Verificar si el usuario está autenticado y es administrador
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 })
    }

    // Obtener estadísticas básicas
    const usersCount = await prisma.user.count()

    // Aquí puedes añadir más consultas para obtener otras estadísticas
    // Por ejemplo, contar mascotas, mensajes, etc.

    return NextResponse.json({
      usersCount,
      // Otras estadísticas...
    })
  } catch (error) {
    console.error("Error en API de administración:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}

