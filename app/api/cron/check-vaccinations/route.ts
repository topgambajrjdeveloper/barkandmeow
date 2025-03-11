import { NextResponse } from "next/server"
import { checkUpcomingVaccinations } from "@/lib/notifications/vaccination-reminder"

// Esta ruta se puede llamar desde un servicio de cron externo
export async function GET(request: Request) {
  // Verificar la clave API para seguridad (opcional pero recomendado)
  const { searchParams } = new URL(request.url)
  const apiKey = searchParams.get("apiKey")

  if (apiKey !== process.env.CRON_API_KEY) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const result = await checkUpcomingVaccinations()
    return NextResponse.json(result)
  } catch (error) {
    console.error("Error in vaccination check cron:", error)
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unknown error" }, { status: 500 })
  }
}

