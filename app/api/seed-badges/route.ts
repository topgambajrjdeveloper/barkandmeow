import { NextResponse } from "next/server"
import  prisma  from "@/lib/prismadb"

// Esta ruta es solo para desarrollo/administración
// Permite crear las insignias iniciales en la base de datos

export async function POST(request: Request) {
  try {
    // Verificar si es una solicitud autorizada (en producción deberías usar una clave API)
    const { authorization } = request.headers
    if (!authorization || authorization !== `Bearer ${process.env.ADMIN_API_KEY}`) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    // Crear la insignia de usuario premium si no existe
    const premiumBadge = await prisma.badge.upsert({
      where: { id: "premium-supporter" },
      update: {},
      create: {
        id: "premium-supporter",
        name: "Usuario Premium",
        description: "Apoya a BarkAndMeow y tiene plaza reservada en eventos",
        imageUrl: "/badges/premium.png",
      },
    })

    // Puedes añadir más insignias aquí
    const badges = [premiumBadge]

    return NextResponse.json({
      success: true,
      message: "Insignias creadas correctamente",
      badges,
    })
  } catch (error) {
    console.error("Error al crear insignias:", error)
    return NextResponse.json({ error: "Error al procesar la solicitud" }, { status: 500 })
  }
}

