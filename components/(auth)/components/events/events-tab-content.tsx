"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Calendar, MapPin, Clock } from "lucide-react"
import { toast } from "sonner"
import Image from "next/image"
import Link from "next/link"
import { format } from "date-fns"
import { es } from "date-fns/locale"

interface Event {
  id: string
  title: string
  description: string
  location: string
  date: Date
  endDate: Date | null
  imageUrl: string | null
  latitude: number | null
  longitude: number | null
  isPublished: boolean
}

interface EventsTabContentProps {
  totalEvents: number
  initialEvents?: Event[]
}

export default function EventsTabContent({ totalEvents, initialEvents = [] }: EventsTabContentProps) {
  const [events, setEvents] = useState<Event[]>(initialEvents)
  const [isLoading, setIsLoading] = useState(initialEvents.length === 0)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(initialEvents.length < totalEvents)

  useEffect(() => {
    if (initialEvents.length === 0) {
      fetchEvents()
    }
  }, [])

  const fetchEvents = async (pageToFetch = 1) => {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/events?page=${pageToFetch}&limit=6`)

      if (!response.ok) {
        throw new Error(`Error fetching events: ${response.status}`)
      }

      const data = await response.json()

      if (pageToFetch === 1) {
        setEvents(data.events)
      } else {
        setEvents((prev) => [...prev, ...data.events])
      }

      setHasMore(data.events.length === 6 && events.length + data.events.length < totalEvents)
      setPage(pageToFetch)
    } catch (error) {
      console.error("Error fetching events:", error)
      toast.error("No se pudieron cargar los eventos")
    } finally {
      setIsLoading(false)
    }
  }

  const loadMore = () => {
    if (!isLoading && hasMore) {
      fetchEvents(page + 1)
    }
  }

  if (isLoading && events.length === 0) {
    return (
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <Card key={i} className="overflow-hidden">
            <div className="h-48 relative">
              <Skeleton className="h-full w-full" />
            </div>
            <CardHeader>
              <Skeleton className="h-6 w-3/4" />
              <Skeleton className="h-4 w-1/2 mt-2" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-3/4" />
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (events.length === 0) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold mb-2">No hay eventos próximos</h2>
        <p className="text-muted-foreground mb-6">No se encontraron eventos programados para las próximas fechas.</p>
        <Button asChild>
          <Link href="/events/create">Crear un evento</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Eventos Próximos</h2>
        <Button variant="outline" asChild>
          <Link href="/events">Ver todos ({totalEvents})</Link>
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {events.map((event) => (
          <Card key={event.id} className="overflow-hidden">
            <div className="h-48 relative">
              <Image
                src={event.imageUrl || "/placeholder.svg?height=200&width=400"}
                alt={event.title}
                fill
                className="object-cover"
              />
            </div>
            <CardHeader>
              <CardTitle className="line-clamp-1">{event.title}</CardTitle>
              <div className="flex items-center text-sm text-muted-foreground">
                <Calendar className="h-4 w-4 mr-1" />
                <time dateTime={new Date(event.date).toISOString()}>
                  {format(new Date(event.date), "d 'de' MMMM, yyyy", { locale: es })}
                </time>
              </div>
              <div className="flex items-center text-sm text-muted-foreground">
                <Clock className="h-4 w-4 mr-1" />
                <time dateTime={new Date(event.date).toISOString()}>
                  {format(new Date(event.date), "HH:mm", { locale: es })}
                </time>
                {event.endDate && (
                  <>
                    <span className="mx-1">-</span>
                    <time dateTime={new Date(event.endDate).toISOString()}>
                      {format(new Date(event.endDate), "HH:mm", { locale: es })}
                    </time>
                  </>
                )}
              </div>
              <div className="flex items-center text-sm text-muted-foreground">
                <MapPin className="h-4 w-4 mr-1" />
                <span>{event.location}</span>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm line-clamp-2">{event.description}</p>
              <div className="mt-4">
                <Button variant="outline" size="sm" asChild className="w-full">
                  <Link href={`/events/${event.id}`}>Ver detalles</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {hasMore && (
        <div className="flex justify-center">
          <Button onClick={loadMore} disabled={isLoading}>
            {isLoading ? "Cargando..." : "Cargar más eventos"}
          </Button>
        </div>
      )}
    </div>
  )
}

