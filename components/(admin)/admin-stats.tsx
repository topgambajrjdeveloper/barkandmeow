"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, PawPrint, FileText, Heart } from "lucide-react"

interface StatsData {
  usersCount: number
  petsCount: number
  postsCount: number
  commentsCount: number
  followsCount: number
  petFollowsCount: number
  healthCardsCount: number
  passportsCount: number
  newUsersCount: number
  newPostsCount: number
}

export function AdminStats() {
  const [stats, setStats] = useState<StatsData>({
    usersCount: 0,
    petsCount: 0,
    postsCount: 0,
    commentsCount: 0,
    followsCount: 0,
    petFollowsCount: 0,
    healthCardsCount: 0,
    passportsCount: 0,
    newUsersCount: 0,
    newPostsCount: 0,
  })
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      setIsLoading(true)
      try {
        const response = await fetch("/api/admin/stats")

        if (!response.ok) {
          throw new Error("Error al cargar estadísticas")
        }

        const data = await response.json()
        setStats(data)
        setIsLoading(false)
      } catch (error) {
        console.error("Error fetching stats:", error)
        setIsLoading(false)
      }
    }

    fetchStats()
  }, [])

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Usuarios</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {isLoading ? (
              <div className="h-8 w-24 animate-pulse rounded bg-muted"></div>
            ) : (
              stats.usersCount.toLocaleString()
            )}
          </div>
          <p className="text-xs text-muted-foreground">
            {isLoading ? (
              <span className="block h-4 w-32 animate-pulse rounded bg-muted"></span>
            ) : (
              `+${stats.newUsersCount} nuevos esta semana`
            )}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Mascotas</CardTitle>
          <PawPrint className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {isLoading ? (
              <div className="h-8 w-24 animate-pulse rounded bg-muted"></div>
            ) : (
              stats.petsCount.toLocaleString()
            )}
          </div>
          <p className="text-xs text-muted-foreground">
            {isLoading ? (
              <span className="block h-4 w-32 animate-pulse rounded bg-muted"></span>
            ) : (
              `${(stats.petsCount / (stats.usersCount || 1)).toFixed(1)} mascotas por usuario`
            )}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Publicaciones</CardTitle>
          <FileText className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {isLoading ? (
              <div className="h-8 w-24 animate-pulse rounded bg-muted"></div>
            ) : (
              stats.postsCount.toLocaleString()
            )}
          </div>
          <p className="text-xs text-muted-foreground">
            {isLoading ? (
              <span className="block h-4 w-32 animate-pulse rounded bg-muted"></span>
            ) : (
              `+${stats.newPostsCount} nuevas esta semana`
            )}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Seguidores</CardTitle>
          <Heart className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {isLoading ? (
              <div className="h-8 w-24 animate-pulse rounded bg-muted"></div>
            ) : (
              (stats.followsCount + stats.petFollowsCount).toLocaleString()
            )}
          </div>
          <p className="text-xs text-muted-foreground">
            {isLoading ? (
              <span className="block h-4 w-32 animate-pulse rounded bg-muted"></span>
            ) : (
              `${stats.followsCount} usuarios, ${stats.petFollowsCount} mascotas`
            )}
          </p>
        </CardContent>
      </Card>
    </div>
  )
}

