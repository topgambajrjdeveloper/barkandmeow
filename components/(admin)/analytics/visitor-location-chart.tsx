"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts"
import { useState, useEffect } from "react"

interface LocationData {
  country: string
  _count: {
    id: number
  }
}

interface VisitorLocationChartProps {
  locationData: LocationData[]
}

export default function VisitorLocationChart({ locationData }: VisitorLocationChartProps) {
  const [chartData, setChartData] = useState<any[]>([])

  useEffect(() => {
    // Transformar los datos para el gráfico
    const formattedData = locationData.map((item) => ({
      country: item.country || "Desconocido",
      visits: item._count.id,
    }))

    setChartData(formattedData)
  }, [locationData])

  // Colores para las barras
  const colors = [
    "#8884d8",
    "#83a6ed",
    "#8dd1e1",
    "#82ca9d",
    "#a4de6c",
    "#d0ed57",
    "#ffc658",
    "#ff8042",
    "#ff6361",
    "#bc5090",
  ]

  return (
    <Card className="col-span-1">
      <CardHeader>
        <CardTitle>Ubicación de Visitantes</CardTitle>
        <CardDescription>Distribución de visitantes por país</CardDescription>
      </CardHeader>
      <CardContent className="h-[350px]">
        {chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              margin={{
                top: 5,
                right: 30,
                left: 20,
                bottom: 60,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="country" angle={-45} textAnchor="end" height={70} interval={0} />
              <YAxis />
              <Tooltip
                formatter={(value) => [`${value} visitas`, "Visitas"]}
                labelFormatter={(label) => `País: ${label}`}
              />
              <Bar dataKey="visits" name="Visitas">
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex items-center justify-center h-full">
            <p className="text-muted-foreground">No hay datos de ubicación disponibles</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

