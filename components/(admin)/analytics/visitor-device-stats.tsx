"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts"
import { useState, useEffect } from "react"

interface DeviceData {
  deviceType: string
  _count: {
    id: number
  }
}

interface VisitorDeviceStatsProps {
  deviceData: DeviceData[]
}

export default function VisitorDeviceStats({ deviceData }: VisitorDeviceStatsProps) {
  const [chartData, setChartData] = useState<any[]>([])

  useEffect(() => {
    // Transformar los datos para el gráfico
    const formattedData = deviceData.map((item) => ({
      name: formatDeviceType(item.deviceType || "unknown"),
      value: item._count.id,
    }))

    setChartData(formattedData)
  }, [deviceData])

  // Función para formatear el tipo de dispositivo
  const formatDeviceType = (type: string): string => {
    switch (type.toLowerCase()) {
      case "desktop":
        return "Escritorio"
      case "mobile":
        return "Móvil"
      case "tablet":
        return "Tablet"
      default:
        return "Desconocido"
    }
  }

  // Colores para el gráfico
  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042"]

  return (
    <Card className="col-span-1">
      <CardHeader>
        <CardTitle>Dispositivos</CardTitle>
        <CardDescription>Distribución de visitantes por tipo de dispositivo</CardDescription>
      </CardHeader>
      <CardContent className="h-[350px]">
        {chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={120}
                fill="#8884d8"
                dataKey="value"
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => [`${value} visitas`, "Visitas"]} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex items-center justify-center h-full">
            <p className="text-muted-foreground">No hay datos de dispositivos disponibles</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

