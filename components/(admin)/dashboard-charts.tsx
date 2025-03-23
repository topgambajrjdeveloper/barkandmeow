"use client"

import { useState, useEffect } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  Line,
  LineChart,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts"

interface ChartData {
  name: string
  users: number
  pets: number
  posts: number
}

interface PieData {
  name: string
  value: number
  color: string
}

export function DashboardCharts() {
  const [chartData, setChartData] = useState<ChartData[]>([])
  const [pieData, setPieData] = useState<PieData[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchChartData = async () => {
      setIsLoading(true)
      try {
        // En una implementación real, esto sería una llamada a tu API
        // const response = await fetch('/api/admin/chart-data');
        // const data = await response.json();

        // Datos de ejemplo para el gráfico de líneas/barras/área
        const mockChartData: ChartData[] = [
          { name: "Ene", users: 120, pets: 180, posts: 240 },
          { name: "Feb", users: 150, pets: 200, posts: 320 },
          { name: "Mar", users: 180, pets: 250, posts: 380 },
          { name: "Abr", users: 220, pets: 300, posts: 450 },
          { name: "May", users: 250, pets: 350, posts: 520 },
          { name: "Jun", users: 280, pets: 380, posts: 580 },
          { name: "Jul", users: 310, pets: 420, posts: 650 },
          { name: "Ago", users: 340, pets: 460, posts: 720 },
          { name: "Sep", users: 360, pets: 500, posts: 790 },
          { name: "Oct", users: 390, pets: 530, posts: 850 },
          { name: "Nov", users: 400, pets: 550, posts: 900 },
          { name: "Dic", users: 420, pets: 580, posts: 950 },
        ]

        // Datos de ejemplo para el gráfico circular
        const mockPieData: PieData[] = [
          { name: "Perros", value: 65, color: "#8884d8" },
          { name: "Gatos", value: 30, color: "#82ca9d" },
          { name: "Otros", value: 5, color: "#ffc658" },
        ]

        setChartData(mockChartData)
        setPieData(mockPieData)
        setIsLoading(false)
      } catch (error) {
        console.error("Error fetching chart data:", error)
        setIsLoading(false)
      }
    }

    fetchChartData()
  }, [])

  if (isLoading) {
    return (
      <div className="h-[300px] flex items-center justify-center">
        <p>Cargando gráficos...</p>
      </div>
    )
  }

  return (
    <Tabs defaultValue="growth">
      <TabsList className="grid w-full grid-cols-4">
        <TabsTrigger value="growth">Crecimiento</TabsTrigger>
        <TabsTrigger value="engagement">Engagement</TabsTrigger>
        <TabsTrigger value="distribution">Distribución</TabsTrigger>
        <TabsTrigger value="activity">Actividad</TabsTrigger>
      </TabsList>

      <TabsContent value="growth" className="space-y-4">
        <div className="h-[300px] mt-4">
          <div className="w-full h-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="users" stroke="#8884d8" name="Usuarios" />
                <Line type="monotone" dataKey="pets" stroke="#82ca9d" name="Mascotas" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </TabsContent>

      <TabsContent value="engagement" className="space-y-4">
        <div className="h-[300px] mt-4">
          <div className="w-full h-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="posts" fill="#8884d8" name="Publicaciones" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </TabsContent>

      <TabsContent value="distribution" className="space-y-4">
        <div className="h-[300px] mt-4">
          <div className="w-full h-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </TabsContent>

      <TabsContent value="activity" className="space-y-4">
        <div className="h-[300px] mt-4">
          <div className="w-full h-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Area type="monotone" dataKey="users" stackId="1" stroke="#8884d8" fill="#8884d8" name="Usuarios" />
                <Area type="monotone" dataKey="pets" stackId="1" stroke="#82ca9d" fill="#82ca9d" name="Mascotas" />
                <Area
                  type="monotone"
                  dataKey="posts"
                  stackId="1"
                  stroke="#ffc658"
                  fill="#ffc658"
                  name="Publicaciones"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </TabsContent>
    </Tabs>
  )
}

