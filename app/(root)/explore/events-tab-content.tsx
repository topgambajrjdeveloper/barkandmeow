"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { Calendar, MapPin, Users, ArrowRight, Filter } from "lucide-react"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { toast } from "sonner"
import type { Event } from "@/types"
import { ShareContent } from "@/components/(root)/share-content"

type EventsTabContentProps = {
  totalEvents?: number
}

export default function EventsTabContent({ totalEvents = 0 }: EventsTabContentProps) {
  const [events, setEvents] = useState<Event[]>([])
  const [filteredEvents, setFilteredEvents] = useState<Event[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // Filtros
  const [currentFilter, setCurrentFilter] = useState("all")

  // Cargar eventos al montar el componente
  useEffect(() => {
    fetchEvents()
  }, [])

  // Aplicar filtros cuando cambian
  useEffect(() => {
    applyFilters()
  }, [events, currentFilter])

  // Función para obtener eventos
  const fetchEvents = async () => {
    setIsLoading(true)
    try {
      const response = await fetch("/api/events")
      if (response.ok) {
        const data = await response.json()
        setEvents(data.events || [])
      } else {
        console.error("Error fetching events:", await response.text())
        toast.error("Error al cargar los eventos")
      }
    } catch (error) {
      console.error("Error:", error)
      toast.error("Error al cargar los eventos")
    } finally {
      setIsLoading(false)
    }
  }

  // Función para aplicar filtros
  const applyFilters = () => {
    if (!events.length) return

    let filtered = [...events]

    // Filtrar por fecha
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    if (currentFilter === "upcoming") {
      filtered = filtered.filter((event) => new Date(event.date) >= today)
    } else if (currentFilter === "past") {
      filtered = filtered.filter((event) => new Date(event.date) < today)
    }

    // Ordenar por fecha
    filtered = filtered.sort((a, b) =>
      currentFilter === "past"
        ? new Date(b.date).getTime() - new Date(a.date).getTime()
        : new Date(a.date).getTime() - new Date(b.date).getTime(),
    )

    setFilteredEvents(filtered)
  }

  // Función para cambiar el filtro de fecha
  const handleFilterChange = (value: string) => {
    setCurrentFilter(value)
  }

  // Función para resetear los filtros
  const resetFilters = () => {
    setCurrentFilter("all")
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-semibold">Eventos para Mascotas</h2>
          <p className="text-sm text-muted-foreground">
            {isLoading
              ? "Cargando eventos..."
              : `Mostrando ${filteredEvents.length} de ${totalEvents || events.length} eventos disponibles`}
          </p>
        </div>

        <div className="flex gap-2">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="sm" className="flex items-center gap-2">
                <Filter className="h-4 w-4" />
                Filtros
              </Button>
            </SheetTrigger>
            <SheetContent>
              <SheetHeader>
                <SheetTitle>Filtrar Eventos</SheetTitle>
                <SheetDescription>Personaliza los eventos que quieres ver</SheetDescription>
              </SheetHeader>

              <div className="py-6 space-y-6">
                <div className="space-y-4">
                  <h3 className="text-sm font-medium">Fecha</h3>
                  <Tabs value={currentFilter} onValueChange={handleFilterChange} className="w-full">
                    <TabsList className="grid grid-cols-3 w-full">
                      <TabsTrigger value="all">Todos</TabsTrigger>
                      <TabsTrigger value="upcoming">Próximos</TabsTrigger>
                      <TabsTrigger value="past">Pasados</TabsTrigger>
                    </TabsList>
                  </Tabs>
                </div>

                <Button variant="outline" className="w-full" onClick={resetFilters}>
                  Resetear filtros
                </Button>
              </div>
            </SheetContent>
          </Sheet>

          <Button asChild variant="default">
            <Link href="/explore/events">
              Ver todos
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="overflow-hidden">
              <div className="aspect-video">
                <Skeleton className="h-full w-full" />
              </div>
              <CardHeader>
                <Skeleton className="h-6 w-40" />
                <div className="space-y-2 mt-2">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-4 w-24" />
                </div>
              </CardHeader>
              <CardContent>
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-3/4" />
              </CardContent>
              <CardFooter>
                <Skeleton className="h-9 w-full" />
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : filteredEvents.length === 0 ? (
        <div className="text-center py-8">
          <div className="mb-4">
            <p>No se encontraron eventos que coincidan con los filtros.</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {currentFilter !== "all" && (
              <Button variant="outline" onClick={resetFilters}>
                Ver todos los eventos
              </Button>
            )}
            <Button asChild>
              <Link href="/events/create">Crear un evento</Link>
            </Button>
          </div>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredEvents.map((event) => (
            <EventCard key={event.id} event={event} />
          ))}
        </div>
      )}
    </div>
  )
}

function EventCard({ event }: { event: Event & { distance?: number } }) {
  const eventDate = new Date(event.date)
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const isToday = today.toDateString() === eventDate.toDateString()
  const isTomorrow = new Date(today.setDate(today.getDate() + 1)).toDateString() === eventDate.toDateString()
  const isPast = eventDate < new Date(new Date().setHours(0, 0, 0, 0))

  let dateLabel = format(eventDate, "PPP", { locale: es })
  if (isToday) dateLabel = "Hoy, " + format(eventDate, "p", { locale: es })
  if (isTomorrow) dateLabel = "Mañana, " + format(eventDate, "p", { locale: es })

  return (
    <Card className={`overflow-hidden flex flex-col h-full ${isPast ? "opacity-75" : ""}`}>
      <div className="relative h-48 w-full">
        <Image
          src={event.imageUrl || "/placeholder.svg?height=200&width=400"}
          alt={event.title}
          fill
          className={`object-cover ${isPast ? "grayscale" : ""}`}
        />
        {isToday && <Badge className="absolute top-2 right-2 bg-secondary text-secondary-foreground">Hoy</Badge>}
        {isPast && <Badge className="absolute top-2 right-2 bg-muted text-muted-foreground">Finalizado</Badge>}
        {event.distance !== undefined && (
          <Badge className="absolute top-2 left-2 bg-primary text-primary-foreground">
            {event.distance.toFixed(1)} km
          </Badge>
        )}
      </div>
      <CardHeader>
        <CardTitle className="line-clamp-2">{event.title}</CardTitle>
      </CardHeader>
      <CardContent className="flex-grow">
        <div className="space-y-3">
          <div className="flex items-center text-sm">
            <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
            <span>{dateLabel}</span>
          </div>
          <div className="flex items-center text-sm">
            <MapPin className="h-4 w-4 mr-2 text-muted-foreground" />
            <span className="line-clamp-1">{event.location}</span>
          </div>
          <div className="flex items-center text-sm">
            <Users className="h-4 w-4 mr-2 text-muted-foreground" />
            <span>{event._count?.attendees || 0} asistentes</span>
          </div>
          <p className="text-sm text-muted-foreground line-clamp-3 mt-2">{event.description}</p>
        </div>
      </CardContent>
      <CardFooter className="pt-0 flex flex-col gap-2">
        <Button asChild variant="outline" className="w-full">
          <Link href={`/explore/events/${event.id}`}>
            Ver detalles
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
        <ShareContent
          variant="ghost"
          size="sm"
          className="w-full"
          title={event.title}
          description={event.description || ""}
          url={`${window.location.origin}/events/${event.id}`}
          image={event.imageUrl || ""}
        />
      </CardFooter>
    </Card>
  )
}

