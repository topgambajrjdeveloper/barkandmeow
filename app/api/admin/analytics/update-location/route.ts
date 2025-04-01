import { type NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prismadb"

export async function POST(request: NextRequest) {
  try {
    const data = await request.json()
    const { logId, city, country, latitude, longitude } = data

    if (!logId) {
      return NextResponse.json({ error: "ID de registro no proporcionado" }, { status: 400 })
    }

    // Actualizar el registro con la información de ubicación
    await prisma.visitorLog.update({
      where: {
        id: logId,
      },
      data: {
        city,
        country,
        latitude: latitude ? Number.parseFloat(latitude) : null,
        longitude: longitude ? Number.parseFloat(longitude) : null,
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error al actualizar ubicación:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}

