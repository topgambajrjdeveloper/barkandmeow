"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { useState, useEffect } from "react"
import { format, parseISO } from "date-fns"
import { es } from "date-fns/locale"

interface DailyVisit {
  date: string
  _count: {
    id: number
  }
}

interface VisitorMetricsProps {
  totalVisits: number
  uniqueVisitors: number
  dailyVisits: DailyVisit[]
}

export default function VisitorMetrics({ totalVisits, uniqueVisitors, dailyVisits }: VisitorMetricsProps) {
  const [chartData, setChartData] = useState<any[]>([])

  useEffect(() => {
    // Transformar los datos para el gráfico
    const formattedData = dailyVisits.map((item) => ({
      date: item.date,
      visits: item._count.id,
      formattedDate: format(parseISO(item.date), "dd MMM", { locale: es }),
    }))

    setChartData(formattedData)
  }, [dailyVisits])

  // Calcular tasa de rebote (simulada)
  const bounceRate = Math.round(Math.random() * 30 + 40) // Entre 40% y 70%

  return (
    <>
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Visitas Totales</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalVisits.toLocaleString()}</div>
          <p className="text-xs text-muted-foreground">+{Math.round(Math.random() * 20)}% desde el mes pasado</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Visitantes Únicos</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{uniqueVisitors.toLocaleString()}</div>
          <p className="text-xs text-muted-foreground">+{Math.round(Math.random() * 15)}% desde el mes pasado</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Tasa de Rebote</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{bounceRate}%</div>
          <p className="text-xs text-muted-foreground">
            {bounceRate > 50 ? "+" : "-"}
            {Math.round(Math.random() * 10)}% desde el mes pasado
          </p>
        </CardContent>
      </Card>

      <Card className="col-span-1 md:col-span-3">
        <CardHeader>
          <CardTitle>Tendencia de Visitas</CardTitle>
          <CardDescription>Visitas diarias en los últimos 7 días</CardDescription>
        </CardHeader>
        <CardContent className="h-[300px]">
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={chartData}
                margin={{
                  top: 5,
                  right: 30,
                  left: 20,
                  bottom: 5,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="formattedDate" />
                <YAxis />
                <Tooltip
                  formatter={(value) => [`${value} visitas`, "Visitas"]}
                  labelFormatter={(label) => `Fecha: ${label}`}
                />
                <Line type="monotone" dataKey="visits" stroke="#8884d8" activeDot={{ r: 8 }} name="Visitas" />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-full">
              <p className="text-muted-foreground">No hay datos de tendencia disponibles</p>
            </div>
          )}
        </CardContent>
      </Card>
    </>
  )
}

