"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

import { format, subDays } from "date-fns"
import { MapPin, Users, Calendar, Globe, Smartphone, RefreshCw } from "lucide-react"
import { BarChart, LineChart, PieChart } from "@/components/ui/chart"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import dynamic from "next/dynamic"
import { DatePickerWithRange } from "@/components/(admin)/date-picker-with-range"

// Importar el mapa de analíticas de forma dinámica para evitar errores de SSR
const AnalyticsMap = dynamic(() => import("@/components/(admin)/analytics/analytics-map"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[500px] flex items-center justify-center bg-muted rounded-md">
      <Skeleton className="h-full w-full" />
    </div>
  ),
})

// Tipos para los datos de análisis
interface VisitorLocation {
  country: string
  city: string
  count: number
  latitude: number
  longitude: number
}

interface DeviceStats {
  deviceType: string
  count: number
}

interface DateStats {
  date: string
  count: number
}

interface LocationAnalytics {
  totalVisitors: number
  uniqueVisitors: number
  countries: { name: string; count: number }[]
  cities: { name: string; count: number }[]
  devices: DeviceStats[]
  dateStats: DateStats[]
  locations: VisitorLocation[]
}

export default function LocationAnalyticsPage() {
  const [analytics, setAnalytics] = useState<LocationAnalytics | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [dateRange, setDateRange] = useState({
    from: subDays(new Date(), 30),
    to: new Date(),
  })
  const [groupBy, setGroupBy] = useState<"day" | "week" | "month">("day")

  const fetchAnalytics = async () => {
    setLoading(true)
    setError(null)

    try {
      const from = dateRange.from ? format(dateRange.from, "yyyy-MM-dd") : undefined
      const to = dateRange.to ? format(dateRange.to, "yyyy-MM-dd") : undefined

      const response = await fetch(`/api/admin/analytics/location?from=${from}&to=${to}&groupBy=${groupBy}`)

      if (!response.ok) {
        throw new Error("Error al cargar los datos de análisis")
      }

      const data = await response.json()
      setAnalytics(data)
    } catch (err) {
      console.error("Error fetching analytics:", err)
      setError(err instanceof Error ? err.message : "Error desconocido")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAnalytics()
  }, [dateRange, groupBy])

  // Preparar datos para gráficos
  const prepareCountryChartData = () => {
    if (!analytics || !analytics.countries) return { labels: [], datasets: [] }

    const topCountries = [...analytics.countries].sort((a, b) => b.count - a.count).slice(0, 10)

    return {
      labels: topCountries.map((c) => c.name || "Desconocido"),
      datasets: [
        {
          label: "Visitantes por país",
          data: topCountries.map((c) => c.count),
          backgroundColor: [
            "rgba(53, 162, 235, 0.8)",
            "rgba(75, 192, 192, 0.8)",
            "rgba(255, 99, 132, 0.8)",
            "rgba(255, 159, 64, 0.8)",
            "rgba(153, 102, 255, 0.8)",
            "rgba(255, 205, 86, 0.8)",
            "rgba(201, 203, 207, 0.8)",
            "rgba(54, 162, 235, 0.8)",
            "rgba(153, 102, 255, 0.8)",
            "rgba(255, 159, 64, 0.8)",
          ],
        },
      ],
    }
  }

  const prepareDeviceChartData = () => {
    if (!analytics || !analytics.devices) return { labels: [], datasets: [] }

    return {
      labels: analytics.devices.map((d) => d.deviceType || "Desconocido"),
      datasets: [
        {
          label: "Visitantes por dispositivo",
          data: analytics.devices.map((d) => d.count),
          backgroundColor: ["rgba(255, 99, 132, 0.8)", "rgba(54, 162, 235, 0.8)", "rgba(255, 206, 86, 0.8)"],
        },
      ],
    }
  }

  const prepareDateChartData = () => {
    if (!analytics || !analytics.dateStats) return { labels: [], datasets: [] }

    return {
      labels: analytics.dateStats.map((d) => d.date),
      datasets: [
        {
          label: "Visitantes por fecha",
          data: analytics.dateStats.map((d) => d.count),
          borderColor: "rgba(75, 192, 192, 1)",
          backgroundColor: "rgba(75, 192, 192, 0.2)",
          tension: 0.4,
        },
      ],
    }
  }

  return (
    <div className="container mx-auto py-8">
      <div className="flex flex-col space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Análisis de Ubicación</h1>
            <p className="text-muted-foreground">
              Visualiza de dónde provienen tus visitantes y cómo interactúan con tu sitio.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
            <DatePickerWithRange value={dateRange} onChange={setDateRange} />

            <Select value={groupBy} onValueChange={(value) => setGroupBy(value as "day" | "week" | "month")}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Agrupar por" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="day">Día</SelectItem>
                <SelectItem value="week">Semana</SelectItem>
                <SelectItem value="month">Mes</SelectItem>
              </SelectContent>
            </Select>

            <Button onClick={fetchAnalytics} variant="outline" size="icon">
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total de Visitantes</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {loading ? (
                <Skeleton className="h-8 w-24" />
              ) : (
                <div className="text-2xl font-bold">{analytics?.totalVisitors || 0}</div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Visitantes Únicos</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {loading ? (
                <Skeleton className="h-8 w-24" />
              ) : (
                <div className="text-2xl font-bold">{analytics?.uniqueVisitors || 0}</div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Países</CardTitle>
              <Globe className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              {loading ? (
                <Skeleton className="h-8 w-24" />
              ) : (
                <div className="text-2xl font-bold">{analytics?.countries?.length || 0}</div>
              )}
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="map" className="w-full">
          <TabsList>
            <TabsTrigger value="map">
              <MapPin className="mr-2 h-4 w-4" />
              Mapa
            </TabsTrigger>
            <TabsTrigger value="countries">
              <Globe className="mr-2 h-4 w-4" />
              Países
            </TabsTrigger>
            <TabsTrigger value="devices">
              <Smartphone className="mr-2 h-4 w-4" />
              Dispositivos
            </TabsTrigger>
            <TabsTrigger value="trends">
              <Calendar className="mr-2 h-4 w-4" />
              Tendencias
            </TabsTrigger>
          </TabsList>

          <TabsContent value="map" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Mapa de Visitantes</CardTitle>
                <CardDescription>Distribución geográfica de los visitantes de tu sitio</CardDescription>
              </CardHeader>
              <CardContent className="h-[500px] p-0">
                {loading ? (
                  <div className="w-full h-full flex items-center justify-center">
                    <Skeleton className="h-full w-full" />
                  </div>
                ) : (
                  <AnalyticsMap locations={analytics?.locations || []} />
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="countries" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Visitantes por País</CardTitle>
                <CardDescription>Los 10 países con más visitantes</CardDescription>
              </CardHeader>
              <CardContent className="h-[400px]">
                {loading ? <Skeleton className="h-full w-full" /> : <BarChart data={prepareCountryChartData()} />}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="devices" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Visitantes por Dispositivo</CardTitle>
                <CardDescription>Distribución de visitantes por tipo de dispositivo</CardDescription>
              </CardHeader>
              <CardContent className="h-[400px]">
                {loading ? <Skeleton className="h-full w-full" /> : <PieChart data={prepareDeviceChartData()} />}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="trends" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Tendencias de Visitas</CardTitle>
                <CardDescription>Evolución de visitantes a lo largo del tiempo</CardDescription>
              </CardHeader>
              <CardContent className="h-[400px]">
                {loading ? <Skeleton className="h-full w-full" /> : <LineChart data={prepareDateChartData()} />}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <Card>
          <CardHeader>
            <CardTitle>Principales Ciudades</CardTitle>
            <CardDescription>Las 10 ciudades con más visitantes</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-2">
                {Array(5)
                  .fill(0)
                  .map((_, i) => (
                    <Skeleton key={i} className="h-8 w-full" />
                  ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {analytics?.cities
                  ?.sort((a, b) => b.count - a.count)
                  .slice(0, 10)
                  .map((city, index) => (
                    <div key={index} className="flex items-center justify-between p-2 border rounded-md">
                      <div className="flex items-center">
                        <MapPin className="h-4 w-4 mr-2 text-muted-foreground" />
                        <span>{city.name || "Desconocido"}</span>
                      </div>
                      <span className="font-medium">{city.count}</span>
                    </div>
                  ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

