import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { AdminStats } from "@/components/(admin)/admin-stats"
import { RecentActivity } from "@/components/(admin)/recent-activity"
import { DashboardCharts } from "@/components/(admin)/dashboard-charts"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Calendar } from "lucide-react"

export default function AdminDashboard() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Panel de Administración</h1>
        <Button asChild>
          <Link href="/admin/events/new">
            <Calendar className="h-4 w-4 mr-2" />
            Crear Evento
          </Link>
        </Button>
      </div>

      <AdminStats />

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Actividad Reciente</CardTitle>
            <CardDescription>Las últimas acciones realizadas en la plataforma</CardDescription>
          </CardHeader>
          <CardContent>
            <RecentActivity />
          </CardContent>
        </Card>

        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Estadísticas</CardTitle>
            <CardDescription>Resumen de actividad en los últimos 30 días</CardDescription>
          </CardHeader>
          <CardContent>
            <DashboardCharts />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

