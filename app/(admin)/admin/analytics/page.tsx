import { Suspense } from "react"
import { Skeleton } from "@/components/ui/skeleton"

import prisma from "@/lib/prismadb"
import { auth } from "@/auth"
import { redirect } from "next/navigation"
import VisitorMetrics from "@/components/(admin)/analytics/visitor-metrics"
import VisitorLocationChart from "@/components/(admin)/analytics/visitor-location-chart"
import VisitorDeviceStats from "@/components/(admin)/analytics/visitor-device-stats"

async function getAnalyticsData() {
  // Obtener estadísticas de visitantes por ubicación
  const visitorsByLocation = await prisma.visitorLog.groupBy({
    by: ["country"],
    _count: {
      id: true,
    },
    orderBy: {
      _count: {
        id: "desc",
      },
    },
    take: 10,
  })

  // Obtener estadísticas de dispositivos
  const deviceStats = await prisma.visitorLog.groupBy({
    by: ["deviceType"],
    _count: {
      id: true,
    },
  })

  // Obtener métricas generales
  const totalVisits = await prisma.visitorLog.count()
  const uniqueVisitors = await prisma.visitorLog.groupBy({
    by: ["visitorId"],
    _count: true,
  })
  const uniqueVisitorsCount = uniqueVisitors.length

  // Obtener tendencia de visitas (últimos 7 días)
  const sevenDaysAgo = new Date()
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

  const dailyVisits = await prisma.visitorLog.groupBy({
    by: ["date"],
    _count: {
      id: true,
    },
    where: {
      createdAt: {
        gte: sevenDaysAgo,
      },
    },
    orderBy: {
      date: "asc",
    },
  })

  return {
    visitorsByLocation,
    deviceStats,
    totalVisits,
    uniqueVisitorsCount,
    dailyVisits,
  }
}

export default async function AnalyticsPage() {
  const session = await auth()

  // Verificar si el usuario es administrador
  if (!session?.user || session.user.role !== "ADMIN") {
    redirect("/")
  }

  const analyticsData = await getAnalyticsData()

  return (
    <div className="container py-6">
      <h1 className="text-3xl font-bold mb-6">Análisis de Audiencia</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <Suspense fallback={<Skeleton className="h-[120px] w-full" />}>
          <VisitorMetrics
            totalVisits={analyticsData.totalVisits}
            uniqueVisitors={analyticsData.uniqueVisitorsCount}
            dailyVisits={analyticsData.dailyVisits}
          />
        </Suspense>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Suspense fallback={<Skeleton className="h-[400px] w-full" />}>
          <VisitorLocationChart locationData={analyticsData.visitorsByLocation} />
        </Suspense>

        <Suspense fallback={<Skeleton className="h-[400px] w-full" />}>
          <VisitorDeviceStats deviceData={analyticsData.deviceStats} />
        </Suspense>
      </div>
    </div>
  )
}

