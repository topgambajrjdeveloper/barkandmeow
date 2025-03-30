import { NextResponse } from "next/server"
import prisma from "@/lib/prismadb"
import { getUserLocation } from "@/lib/location"
import { cookies } from "next/headers"
import { v4 as uuidv4 } from "uuid"

// Función para detectar el tipo de dispositivo
function detectDeviceType(userAgent: string): string {
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent)
  const isTablet = /iPad|Android(?!.*Mobile)/i.test(userAgent)

  if (isTablet) return "tablet"
  if (isMobile) return "mobile"
  return "desktop"
}

export async function POST(request: Request) {
  try {
    const { referrer, path } = await request.json()

    // Obtener o crear ID de visitante usando cookies
    const cookieStore = cookies()
    let visitorId = cookieStore.get("visitor_id")?.value

    if (!visitorId) {
      visitorId = uuidv4()
      // La cookie se establecerá en el cliente
    }

    // Obtener información del user agent
    const userAgent = request.headers.get("user-agent") || ""
    const deviceType = detectDeviceType(userAgent)

    // Obtener ubicación del visitante
    const locationData = await getUserLocation()

    // Crear registro de visita
    const visitorLog = await prisma.visitorLog.create({
      data: {
        visitorId,
        path: path || "/",
        referrer: referrer || "direct",
        userAgent,
        deviceType,
        city: locationData.city || null,
        country: locationData.country || null,
        latitude: locationData.latitude || null,
        longitude: locationData.longitude || null,
        date: new Date().toISOString().split("T")[0], // Formato YYYY-MM-DD
      },
    })

    return NextResponse.json({
      success: true,
      visitorId,
    })
  } catch (error) {
    console.error("Error logging visitor:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}

