"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { Calendar, MapPin, Users } from "lucide-react"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

interface Event {
  id: string
  title: string
  location: string
  date: string
  _count: {
    attendees: number
  }
}

export function EventsCard() {
  const [events, setEvents] = useState<Event[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await fetch("/api/events?upcoming=true&limit=3")
        const data = await response.json()
        setEvents(data.events)
      } catch (error) {
        console.error("Error fetching events:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchEvents()
  }, [])

  return (
    <Card className="border-background/1 border-4">
      <CardHeader>
        <h3 className="text-lg font-semibold">Eventos cercanos</h3>
      </CardHeader>
      <CardContent className="space-y-4">
        {isLoading ? (
          <>
            <EventSkeleton />
            <EventSkeleton />
          </>
        ) : events.length > 0 ? (
          events.map((event) => <EventItem key={event.id} event={event} />)
        ) : (
          <p className="text-sm text-muted-foreground">No hay eventos próximos</p>
        )}
      </CardContent>
      <CardFooter>
        <Link href="/explore" className="text-sm text-primary">
          Ver todos los eventos
        </Link>
      </CardFooter>
    </Card>
  )
}

function EventItem({ event }: { event: Event }) {
  return (
    <Link href={`/events/${event.id}`} className="block hover:bg-accent/50 rounded-md p-2 -mx-2 transition-colors">
      <h4 className="font-medium">{event.title}</h4>
      <div className="flex items-center text-xs text-muted-foreground mt-1">
        <Calendar className="h-3 w-3 mr-1" />
        {format(new Date(event.date), "PPP", { locale: es })}
      </div>
      <div className="flex items-center text-xs text-muted-foreground mt-1">
        <MapPin className="h-3 w-3 mr-1" />
        {event.location}
      </div>
      <div className="flex items-center text-xs text-muted-foreground mt-1">
        <Users className="h-3 w-3 mr-1" />
        {event._count.attendees} asistentes
      </div>
    </Link>
  )
}

function EventSkeleton() {
  return (
    <div className="space-y-2">
      <Skeleton className="h-5 w-3/4" />
      <Skeleton className="h-3 w-1/2" />
      <Skeleton className="h-3 w-2/3" />
    </div>
  )
}

