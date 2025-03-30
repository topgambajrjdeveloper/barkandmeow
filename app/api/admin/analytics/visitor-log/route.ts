import { NextResponse } from "next/server"
import prisma from "@/lib/prismadb"
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
    const visitorId =
      request.headers
        .get("cookie")
        ?.match(/visitor_id=([^;]+)/)
        ?.at(1) || uuidv4()

    // Obtener información del user agent
    const userAgent = request.headers.get("user-agent") || ""
    const deviceType = detectDeviceType(userAgent)

    // Crear registro de visita - sin esperar a la geolocalización para hacerlo más rápido
    const visitorLog = await prisma.visitorLog.create({
      data: {
        visitorId,
        path: path || "/",
        referrer: referrer || "direct",
        userAgent,
        deviceType,
        date: new Date().toISOString().split("T")[0], // Formato YYYY-MM-DD
      },
    })

    // Intentar obtener la ubicación en segundo plano
    try {
      // Importar dinámicamente para evitar problemas de SSR
      const { getUserLocation } = await import("@/lib/location")

      // Obtener ubicación sin bloquear la respuesta
      getUserLocation()
        .then(async (locationData) => {
          if (locationData.city || locationData.country || locationData.latitude) {
            // Actualizar el registro con la información de ubicación
            await prisma.visitorLog
              .update({
                where: { id: visitorLog.id },
                data: {
                  city: locationData.city || null,
                  country: locationData.country || null,
                  latitude: locationData.latitude || null,
                  longitude: locationData.longitude || null,
                },
              })
              .catch((e) => console.error("Error updating visitor location:", e))
          }
        })
        .catch((e) => console.error("Error getting location:", e))
    } catch (locationError) {
      // Ignorar errores de ubicación, no son críticos
      console.error("Non-critical location error:", locationError)
    }

    return NextResponse.json({
      success: true,
      visitorId,
    })
  } catch (error) {
    console.error("Error logging visitor:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}

