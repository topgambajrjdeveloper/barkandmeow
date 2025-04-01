import { type NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prismadb"
import { format } from "date-fns"
import { v4 as uuidv4 } from "uuid"
import { cookies } from "next/headers"

// Función para detectar el tipo de dispositivo
function detectDeviceType(userAgent: string): string {
  if (/mobile|android|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent.toLowerCase())) {
    return "Mobile"
  } else if (/tablet|ipad/i.test(userAgent.toLowerCase())) {
    return "Tablet"
  } else {
    return "Desktop"
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json()
    const { path, city, country, latitude, longitude } = data

    // Obtener información del navegador
    const userAgent = request.headers.get("user-agent") || ""
    const referrer = request.headers.get("referer") || ""

    // Detectar tipo de dispositivo
    const deviceType = detectDeviceType(userAgent)

    // Obtener o crear ID de visitante desde cookies
    const cookieStore = cookies()
    let visitorId = cookieStore.get("visitor_id")?.value

    if (!visitorId) {
      visitorId = uuidv4()
      // La cookie se establecerá en la respuesta
    }

    // Crear registro de visita
    await prisma.visitorLog.create({
      data: {
        visitorId,
        path,
        referrer,
        userAgent,
        deviceType,
        city,
        country,
        latitude: latitude ? Number.parseFloat(latitude) : null,
        longitude: longitude ? Number.parseFloat(longitude) : null,
        date: format(new Date(), "yyyy-MM-dd"), // Formato YYYY-MM-DD para facilitar agrupaciones
      },
    })

    // Crear respuesta y establecer cookie
    const response = NextResponse.json({ success: true })

    // Establecer cookie de visitante si no existe
    if (!cookieStore.get("visitor_id")) {
      response.cookies.set({
        name: "visitor_id",
        value: visitorId,
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        maxAge: 60 * 60 * 24 * 365, // 1 año
        path: "/",
      })
    }

    return response
  } catch (error) {
    console.error("Error al registrar visita:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}

