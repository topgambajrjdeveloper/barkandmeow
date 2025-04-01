"use client"

import { useRef, useEffect } from "react"
import { Chart, registerables } from "chart.js"

// Registrar los componentes necesarios de Chart.js
Chart.register(...registerables)

interface ChartProps {
  data: {
    labels: string[]
    datasets: {
      label: string
      data: number[]
      backgroundColor?: string | string[]
      borderColor?: string
      borderWidth?: number
      tension?: number
    }[]
  }
  height?: number
}

export function BarChart({ data, height = 400 }: ChartProps) {
  const chartRef = useRef<HTMLCanvasElement>(null)
  const chartInstance = useRef<Chart | null>(null)

  useEffect(() => {
    if (!chartRef.current) return

    // Destruir el gráfico existente si hay uno
    if (chartInstance.current) {
      chartInstance.current.destroy()
    }

    // Crear nuevo gráfico
    const ctx = chartRef.current.getContext("2d")
    if (ctx) {
      chartInstance.current = new Chart(ctx, {
        type: "bar",
        data,
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: "top",
            },
          },
        },
      })
    }

    // Limpiar al desmontar
    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy()
      }
    }
  }, [data])

  return <canvas ref={chartRef} height={height} />
}

export function LineChart({ data, height = 400 }: ChartProps) {
  const chartRef = useRef<HTMLCanvasElement>(null)
  const chartInstance = useRef<Chart | null>(null)

  useEffect(() => {
    if (!chartRef.current) return

    // Destruir el gráfico existente si hay uno
    if (chartInstance.current) {
      chartInstance.current.destroy()
    }

    // Crear nuevo gráfico
    const ctx = chartRef.current.getContext("2d")
    if (ctx) {
      chartInstance.current = new Chart(ctx, {
        type: "line",
        data,
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: "top",
            },
          },
        },
      })
    }

    // Limpiar al desmontar
    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy()
      }
    }
  }, [data])

  return <canvas ref={chartRef} height={height} />
}

export function PieChart({ data, height = 400 }: ChartProps) {
  const chartRef = useRef<HTMLCanvasElement>(null)
  const chartInstance = useRef<Chart | null>(null)

  useEffect(() => {
    if (!chartRef.current) return

    // Destruir el gráfico existente si hay uno
    if (chartInstance.current) {
      chartInstance.current.destroy()
    }

    // Crear nuevo gráfico
    const ctx = chartRef.current.getContext("2d")
    if (ctx) {
      chartInstance.current = new Chart(ctx, {
        type: "pie",
        data,
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: "top",
            },
          },
        },
      })
    }

    // Limpiar al desmontar
    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy()
      }
    }
  }, [data])

  return <canvas ref={chartRef} height={height} />
}

