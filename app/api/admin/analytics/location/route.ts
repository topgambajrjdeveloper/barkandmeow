import { type NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prismadb"
import { startOfDay, endOfDay, parseISO, subDays } from "date-fns"
import { auth } from "@/auth"

export async function GET(request: NextRequest) {
  try {
    // Verificar autenticación y permisos usando tu sistema de auth
    const session = await auth()

    if (!session?.user?.email) {
      return NextResponse.json({ error: "No autenticado" }, { status: 401 })
    }

    // Verificar si el usuario es administrador
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { role: true },
    })

    if (user?.role !== "ADMIN") {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 })
    }

    // Obtener parámetros de consulta
    const searchParams = request.nextUrl.searchParams
    const fromDate = searchParams.get("from")
    const toDate = searchParams.get("to")
    const groupBy = searchParams.get("groupBy") || "day"

    // Establecer fechas predeterminadas si no se proporcionan
    const from = fromDate ? startOfDay(parseISO(fromDate)) : startOfDay(subDays(new Date(), 30))

    const to = toDate ? endOfDay(parseISO(toDate)) : endOfDay(new Date())

    // Obtener datos de visitantes
    const visitorLogs = await prisma.visitorLog.findMany({
      where: {
        createdAt: {
          gte: from,
          lte: to,
        },
      },
    })

    // Calcular estadísticas
    const totalVisitors = visitorLogs.length
    const uniqueVisitors = new Set(visitorLogs.map((log) => log.visitorId)).size

    // Agrupar por país
    const countryCounts: Record<string, number> = {}
    visitorLogs.forEach((log) => {
      const country = log.country || "Desconocido"
      countryCounts[country] = (countryCounts[country] || 0) + 1
    })

    const countries = Object.entries(countryCounts).map(([name, count]) => ({
      name,
      count,
    }))

    // Agrupar por ciudad
    const cityCounts: Record<string, number> = {}
    visitorLogs.forEach((log) => {
      const city = log.city || "Desconocido"
      cityCounts[city] = (cityCounts[city] || 0) + 1
    })

    const cities = Object.entries(cityCounts).map(([name, count]) => ({
      name,
      count,
    }))

    // Agrupar por dispositivo
    const deviceCounts: Record<string, number> = {}
    visitorLogs.forEach((log) => {
      const deviceType = log.deviceType || "Desconocido"
      deviceCounts[deviceType] = (deviceCounts[deviceType] || 0) + 1
    })

    const devices = Object.entries(deviceCounts).map(([deviceType, count]) => ({
      deviceType,
      count,
    }))

    // Agrupar por fecha
    const dateCounts: Record<string, number> = {}
    visitorLogs.forEach((log) => {
      // Usar el campo date que ya está en formato YYYY-MM-DD
      const date = log.date
      dateCounts[date] = (dateCounts[date] || 0) + 1
    })

    const dateStats = Object.entries(dateCounts)
      .map(([date, count]) => ({
        date,
        count,
      }))
      .sort((a, b) => a.date.localeCompare(b.date))

    // Preparar datos de ubicación para el mapa
    const locationMap: Record<string, { lat: number; lng: number; count: number; country: string; city: string }> = {}

    visitorLogs.forEach((log) => {
      if (log.latitude && log.longitude) {
        // Redondear coordenadas para agrupar puntos cercanos
        const lat = Math.round(log.latitude * 100) / 100
        const lng = Math.round(log.longitude * 100) / 100
        const key = `${lat},${lng}`

        if (!locationMap[key]) {
          locationMap[key] = {
            lat: log.latitude,
            lng: log.longitude,
            count: 0,
            country: log.country || "Desconocido",
            city: log.city || "Desconocido",
          }
        }

        locationMap[key].count++
      }
    })

    const locations = Object.values(locationMap).map((loc) => ({
      latitude: loc.lat,
      longitude: loc.lng,
      count: loc.count,
      country: loc.country,
      city: loc.city,
    }))

    // Devolver resultados
    return NextResponse.json({
      totalVisitors,
      uniqueVisitors,
      countries,
      cities,
      devices,
      dateStats,
      locations,
    })
  } catch (error) {
    console.error("Error al obtener análisis de ubicación:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}

