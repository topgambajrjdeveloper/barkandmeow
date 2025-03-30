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

  // Replace the entire useEffect hook with this improved version
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        // Make sure we're requesting enough events
        const response = await fetch("/api/events")

        if (!response.ok) {
          throw new Error(`Error fetching events: ${response.status}`)
        }

        const data = await response.json()
        console.log("Fetched events:", data) // Log the response to help debug

        // Check if events exist in the response
        if (data && Array.isArray(data.events)) {
          setEvents(data.events)
        } else {
          console.error("Invalid events data structure:", data)
          setEvents([])
        }
      } catch (error) {
        console.error("Error fetching events:", error)
        setEvents([])
      } finally {
        setIsLoading(false)
      }
    }

    fetchEvents()
  }, [])

  

  return (
    <Card className="border-background/1 border-4">
      {/* Replace the CardHeader with this */}
      <CardHeader>
        <h3 className="text-lg font-semibold">Eventos</h3>
        {!isLoading && events.length === 0 && (
          <p className="text-sm text-muted-foreground">No hay eventos disponibles en la base de datos</p>
        )}
      </CardHeader>
      {/* Replace the CardContent with this */}
      <CardContent className="space-y-4">
        {isLoading ? (
          <>
            <EventSkeleton />
            <EventSkeleton />
            <EventSkeleton />
          </>
        ) : events.length > 0 ? (
          events.map((event) => <EventItem key={event.id} event={event} />)
        ) : (
          <div className="py-2 text-center">
            <p className="text-sm text-muted-foreground">Intenta crear algunos eventos para verlos aquí</p>
          </div>
        )}
      </CardContent>
      {/* Replace the CardFooter with this */}
      <CardFooter>
        <Link href="/explore" className="text-sm text-primary">
          {events.length > 0 ? "Ver todos los eventos" : "Crear un evento"}
        </Link>
      </CardFooter>
    </Card>
  )
}

function EventItem({ event }: { event: Event }) {
  return (
    <Link href={`/explore/events/${event.id}`} className="block hover:bg-accent/50 rounded-md p-2 -mx-2 transition-colors">
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

