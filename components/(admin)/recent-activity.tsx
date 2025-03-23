"use client"

import { useState, useEffect } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"

interface ActivityItem {
  id: string
  user: {
    id: string
    name: string
    image: string | null
  }
  action: string
  target: string
  targetType: "user" | "pet" | "post" | "comment" | "page" | "event"
  timestamp: string
}

export function RecentActivity() {
  const [activities, setActivities] = useState<ActivityItem[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchActivities = async () => {
      setIsLoading(true)
      try {
        // En una implementación real, esto sería una llamada a tu API
        // const response = await fetch('/api/admin/activities');
        // const data = await response.json();

        // Datos de ejemplo
        const mockActivities: ActivityItem[] = [
          {
            id: "1",
            user: {
              id: "1",
              name: "maria_garcia",
              image: null,
            },
            action: "created",
            target: "Nueva foto de Luna",
            targetType: "post",
            timestamp: "2023-10-15T10:30:00Z",
          },
          {
            id: "2",
            user: {
              id: "2",
              name: "carlos_lopez",
              image: null,
            },
            action: "commented",
            target: "¡Qué bonito perro!",
            targetType: "comment",
            timestamp: "2023-10-15T10:35:00Z",
          },
          {
            id: "3",
            user: {
              id: "3",
              name: "admin",
              image: null,
            },
            action: "updated",
            target: "Política de Cookies",
            targetType: "page",
            timestamp: "2023-10-15T11:00:00Z",
          },
          {
            id: "4",
            user: {
              id: "4",
              name: "laura_martinez",
              image: null,
            },
            action: "registered",
            target: "Bella",
            targetType: "pet",
            timestamp: "2023-10-15T11:15:00Z",
          },
          {
            id: "5",
            user: {
              id: "5",
              name: "pedro_sanchez",
              image: null,
            },
            action: "joined",
            target: "Paseo en el parque",
            targetType: "event",
            timestamp: "2023-10-15T11:30:00Z",
          },
          {
            id: "6",
            user: {
              id: "1",
              name: "maria_garcia",
              image: null,
            },
            action: "followed",
            target: "carlos_lopez",
            targetType: "user",
            timestamp: "2023-10-15T11:45:00Z",
          },
          {
            id: "7",
            user: {
              id: "2",
              name: "carlos_lopez",
              image: null,
            },
            action: "reported",
            target: "Contenido inapropiado",
            targetType: "post",
            timestamp: "2023-10-15T12:00:00Z",
          },
        ]

        setActivities(mockActivities)
        setIsLoading(false)
      } catch (error) {
        console.error("Error fetching activities:", error)
        setIsLoading(false)
      }
    }

    fetchActivities()
  }, [])

  const getActionColor = (action: string): string => {
    switch (action) {
      case "created":
      case "registered":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
      case "updated":
      case "edited":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300"
      case "deleted":
      case "removed":
      case "reported":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
      case "commented":
      case "followed":
      case "joined":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300"
    }
  }

  const getTargetTypeIcon = (targetType: string): string => {
    switch (targetType) {
      case "user":
        return "👤"
      case "pet":
        return "🐾"
      case "post":
        return "📝"
      case "comment":
        return "💬"
      case "page":
        return "📄"
      case "event":
        return "📅"
      default:
        return "📌"
    }
  }

  const formatTimestamp = (timestamp: string): string => {
    const date = new Date(timestamp)
    const now = new Date()
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60))

    if (diffInMinutes < 1) {
      return "Justo ahora"
    } else if (diffInMinutes < 60) {
      return `Hace ${diffInMinutes} ${diffInMinutes === 1 ? "minuto" : "minutos"}`
    } else if (diffInMinutes < 1440) {
      const hours = Math.floor(diffInMinutes / 60)
      return `Hace ${hours} ${hours === 1 ? "hora" : "horas"}`
    } else {
      return date.toLocaleDateString()
    }
  }

  return (
    <div className="space-y-4">
      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex items-center gap-4">
              <div className="h-10 w-10 rounded-full bg-muted animate-pulse"></div>
              <div className="space-y-2 flex-1">
                <div className="h-4 w-3/4 bg-muted animate-pulse rounded"></div>
                <div className="h-3 w-1/2 bg-muted animate-pulse rounded"></div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <ScrollArea className="h-[400px] pr-4">
          <div className="space-y-6">
            {activities.map((activity) => (
              <div key={activity.id} className="flex items-start gap-4">
                <Avatar>
                  <AvatarImage src={activity.user.image || undefined} alt={activity.user.name} />
                  <AvatarFallback>{activity.user.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                </Avatar>
                <div className="flex-1 space-y-1">
                  <div className="flex items-center gap-2">
                    <Button variant="link" className="p-0 h-auto font-medium" asChild>
                      <a href={`/admin/users/${activity.user.id}`}>{activity.user.name}</a>
                    </Button>
                    <Badge className={getActionColor(activity.action)} variant="outline">
                      {activity.action}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {getTargetTypeIcon(activity.targetType)} {activity.target}
                  </p>
                  <p className="text-xs text-muted-foreground">{formatTimestamp(activity.timestamp)}</p>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      )}

      <div className="flex justify-center">
        <Button variant="outline" size="sm">
          Ver todas las actividades
        </Button>
      </div>
    </div>
  )
}

