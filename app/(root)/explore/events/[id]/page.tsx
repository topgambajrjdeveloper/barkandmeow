/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
"use client"

import { useState, useEffect } from "react"
import { useParams, notFound } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { format, isToday, addDays, isSameDay } from "date-fns"
import { es } from "date-fns/locale"
import { Calendar, MapPin, Users, ArrowLeft, Loader2, ExternalLink } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { toast } from "sonner"
import type { Event } from "@/types"
import { ShareContent } from "@/components/(root)/share-content"

interface EventWithDetails extends Event {
  createdBy: {
    id: string
    username: string
    profileImage: string | null
  }
  attendees: {
    id: string
    username: string
    profileImage: string | null
  }[]
  _count: {
    attendees: number
  }
}

export default function EventPage() {
  const params = useParams()
  const eventId = params.id as string

  const [event, setEvent] = useState<EventWithDetails | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isAttending, setIsAttending] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [userId, setUserId] = useState<string | null>(null)
  const [mapError, setMapError] = useState(false)

  // Obtener detalles del evento
  useEffect(() => {
    const fetchEvent = async () => {
      setIsLoading(true)
      try {
        const response = await fetch(`/api/events/${eventId}`)
        if (!response.ok) {
          throw new Error("Error al cargar el evento")
        }
        const data = await response.json()
        setEvent(data)

        // Verificar si el usuario está autenticado
        const authResponse = await fetch("/api/auth/session")
        if (authResponse.ok) {
          const authData = await authResponse.json()
          if (authData.user) {
            setIsAuthenticated(true)
            setUserId(authData.user.id)

            // Verificar si el usuario está asistiendo
            if (data.attendees.some((attendee: any) => attendee.id === authData.user.id)) {
              setIsAttending(true)
            }
          }
        }
      } catch (error) {
        console.error("Error:", error)
        toast.error("No se pudo cargar el evento")
      } finally {
        setIsLoading(false)
      }
    }

    if (eventId) {
      fetchEvent()
    }
  }, [eventId])

  // Manejar asistencia al evento
  const handleAttendEvent = async () => {
    if (!isAuthenticated) {
      window.location.href = `/login?callbackUrl=/explore/events/${eventId}`
      return
    }

    setIsSubmitting(true)
    try {
      const response = await fetch(`/api/events/${eventId}/attend`, {
        method: isAttending ? "DELETE" : "POST",
        headers: {
          "Content-Type": "application/json",
        },
      })

      if (!response.ok) {
        throw new Error("Error al actualizar asistencia")
      }

      // Actualizar estado local
      setIsAttending(!isAttending)

      // Actualizar conteo de asistentes
      if (event) {
        setEvent({
          ...event,
          _count: {
            ...event._count,
            attendees: isAttending ? event._count.attendees - 1 : event._count.attendees + 1,
          },
          attendees: isAttending
            ? event.attendees.filter((attendee) => attendee.id !== userId)
            : [...event.attendees, { id: userId!, username: "Tú", profileImage: null }],
        })
      }

      toast.success(isAttending ? "Ya no asistirás a este evento" : "¡Asistirás a este evento!")
    } catch (error) {
      console.error("Error:", error)
      toast.error("No se pudo actualizar la asistencia")
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return <EventSkeleton />
  }

  if (!event) {
    notFound()
  }

  const eventDate = new Date(event.date)
  const isTodayEvent = isToday(eventDate)
  const isTomorrowEvent = isSameDay(addDays(new Date(), 1), eventDate)

  let dateLabel = format(eventDate, "PPP", { locale: es })
  if (isTodayEvent) dateLabel = "Hoy, " + format(eventDate, "p", { locale: es })
  if (isTomorrowEvent) dateLabel = "Mañana, " + format(eventDate, "p", { locale: es })

  // Generar URL de OpenStreetMap para la ubicación
  const openStreetMapUrl =
    event.latitude && event.longitude
      ? `https://www.openstreetmap.org/?mlat=${event.latitude}&mlon=${event.longitude}&zoom=15`
      : null

  // Generar URL de imagen estática de OpenStreetMap
  const staticMapUrl =
    event.latitude && event.longitude
      ? `https://maps.geoapify.com/v1/staticmap?style=osm-carto&width=600&height=300&center=lonlat:${event.longitude},${event.latitude}&zoom=15&marker=lonlat:${event.longitude},${event.latitude};color:%23ff0000;size:medium&apiKey=YOUR_GEOAPIFY_API_KEY`
      : null

  // URL alternativa usando OpenStreetMap Tile Server (sin API key)
  const fallbackMapUrl =
    event.latitude && event.longitude
      ? `https://www.openstreetmap.org/export/embed.html?bbox=${event.longitude - 0.01}%2C${event.latitude - 0.01}%2C${event.longitude + 0.01}%2C${event.latitude + 0.01}&layer=mapnik&marker=${event.latitude}%2C${event.longitude}`
      : null

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-6">
        <Button variant="outline" size="sm" asChild>
          <Link href="/explore/events">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver a eventos
          </Link>
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <div className="md:col-span-2 space-y-6">
          <div className="relative rounded-lg overflow-hidden h-64 md:h-96">
            <Image
              src={event.imageUrl || "/placeholder.svg?height=400&width=800"}
              alt={event.title}
              fill
              className="object-cover"
            />
            {isTodayEvent && (
              <Badge className="absolute top-4 right-4 bg-secondary text-secondary-foreground">Hoy</Badge>
            )}
          </div>

          <div>
            <h1 className="text-3xl font-bold">{event.title}</h1>
            <div className="flex flex-wrap gap-4 mt-4">
              <div className="flex items-center">
                <Calendar className="h-5 w-5 mr-2 text-muted-foreground" />
                <span>{dateLabel}</span>
              </div>
              <div className="flex items-center">
                <MapPin className="h-5 w-5 mr-2 text-muted-foreground" />
                <span>{event.location}</span>
              </div>
              <div className="flex items-center">
                <Users className="h-5 w-5 mr-2 text-muted-foreground" />
                <span>{event._count.attendees} asistentes</span>
              </div>
            </div>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Descripción</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="whitespace-pre-wrap">{event.description}</p>
            </CardContent>
          </Card>

          {event.attendees.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Asistentes</CardTitle>
                <CardDescription>Personas que asistirán a este evento</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-4">
                  {event.attendees.map((attendee) => (
                    <Link key={attendee.id} href={`/profile/${attendee.id}`} className="flex flex-col items-center">
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={attendee.profileImage || undefined} alt={attendee.username} />
                        <AvatarFallback>{attendee.username.substring(0, 2).toUpperCase()}</AvatarFallback>
                      </Avatar>
                      <span className="text-sm mt-1">{attendee.username}</span>
                    </Link>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Organizador</CardTitle>
            </CardHeader>
            <CardContent>
              <Link href={`/profile/${event.createdBy.id}`} className="flex items-center gap-3">
                <Avatar>
                  <AvatarImage src={event.createdBy.profileImage || undefined} alt={event.createdBy.username} />
                  <AvatarFallback>{event.createdBy.username.substring(0, 2).toUpperCase()}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">{event.createdBy.username}</p>
                  <p className="text-sm text-muted-foreground">Organizador</p>
                </div>
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Acciones</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {isAuthenticated ? (
                <Button
                  className="w-full"
                  variant={isAttending ? "outline" : "default"}
                  onClick={handleAttendEvent}
                  disabled={isSubmitting}
                >
                  {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {isAttending ? "No asistiré" : "Asistiré"}
                </Button>
              ) : (
                <Button asChild className="w-full">
                  <Link href={`/login?callbackUrl=/explore/events/${eventId}`}>Inicia sesión para asistir</Link>
                </Button>
              )}

              <ShareContent
                className="w-full"
                title={event.title}
                description={event.description}
                url={window.location.href}
                image={event.imageUrl || ""}
              />
            </CardContent>
          </Card>

          {event.latitude && event.longitude && (
            <Card>
              <CardHeader>
                <CardTitle>Ubicación</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="aspect-video relative rounded-md overflow-hidden">
                  {/* Usar iframe para mostrar el mapa de OpenStreetMap */}
                  {fallbackMapUrl && (
                    <iframe
                      width="100%"
                      height="100%"
                      frameBorder="0"
                      scrolling="no"
                      marginHeight={0}
                      marginWidth={0}
                      src={fallbackMapUrl}
                      style={{ border: 0, position: "absolute", top: 0, left: 0, width: "100%", height: "100%" }}
                      title="Mapa de ubicación"
                    ></iframe>
                  )}
                </div>
                <div className="flex flex-col gap-2 mt-4">
                  {openStreetMapUrl && (
                    <Button variant="outline" className="w-full" asChild>
                      <a href={openStreetMapUrl} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="mr-2 h-4 w-4" />
                        Ver en OpenStreetMap
                      </a>
                    </Button>
                  )}
                  {event.latitude && event.longitude && (
                    <Button variant="outline" className="w-full" asChild>
                      <a
                        href={`https://www.openstreetmap.org/directions?from=&to=${event.latitude}%2C${event.longitude}`}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <MapPin className="mr-2 h-4 w-4" />
                        Cómo llegar
                      </a>
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}

function EventSkeleton() {
  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-6">
        <Skeleton className="h-9 w-32" />
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <div className="md:col-span-2 space-y-6">
          <Skeleton className="h-64 md:h-96 w-full rounded-lg" />

          <div>
            <Skeleton className="h-10 w-3/4 mb-4" />
            <div className="flex flex-wrap gap-4">
              <Skeleton className="h-6 w-32" />
              <Skeleton className="h-6 w-40" />
              <Skeleton className="h-6 w-32" />
            </div>
          </div>

          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-32" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-3/4" />
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-32" />
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-3">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div>
                  <Skeleton className="h-5 w-32 mb-1" />
                  <Skeleton className="h-4 w-20" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-32" />
            </CardHeader>
            <CardContent className="space-y-4">
              <Skeleton className="h-9 w-full" />
              <Skeleton className="h-9 w-full" />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

