"use client"

import { notFound } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { Calendar, MapPin, Users, ArrowLeft, Share2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import prisma from "@/lib/prismadb"
import { auth } from "@/auth"
import { AttendEventButton } from "@/components/(auth)/components/events/attend-event-button"

async function getEvent(id: string) {
  try {
    const event = await prisma.event.findUnique({
      where: { id },
      include: {
        createdBy: {
          select: {
            id: true,
            username: true,
            profileImage: true,
          },
        },
        attendees: {
          select: {
            id: true,
            username: true,
            profileImage: true,
          },
        },
        _count: {
          select: { attendees: true },
        },
      },
    })

    return event
  } catch (error) {
    console.error("Error fetching event:", error)
    return null
  }
}

export default async function EventPage({ params }: { params: { id: string } }) {
  const session = await auth()
  const event = await getEvent(params.id)

  if (!event) {
    notFound()
  }

  const eventDate = new Date(event.date)
  const isToday = new Date().toDateString() === eventDate.toDateString()
  const isTomorrow = new Date(new Date().setDate(new Date().getDate() + 1)).toDateString() === eventDate.toDateString()

  let dateLabel = format(eventDate, "PPP", { locale: es })
  if (isToday) dateLabel = "Hoy, " + format(eventDate, "p", { locale: es })
  if (isTomorrow) dateLabel = "Mañana, " + format(eventDate, "p", { locale: es })

  const isAttending = session?.user?.id ? event.attendees.some((attendee) => attendee.id === session.user.id) : false

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
            {isToday && <Badge className="absolute top-4 right-4 bg-secondary text-secondary-foreground">Hoy</Badge>}
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
              {session?.user ? (
                <AttendEventButton eventId={event.id} isAttending={isAttending} />
              ) : (
                <Button asChild className="w-full">
                  <Link href={`/login?callbackUrl=/events/${event.id}`}>Inicia sesión para asistir</Link>
                </Button>
              )}

              <Button
                variant="outline"
                className="w-full"
                onClick={() => {
                  navigator
                    .share({
                      title: event.title,
                      text: `Echa un vistazo a este evento: ${event.title}`,
                      url: window.location.href,
                    })
                    .catch((err) => console.error("Error compartiendo:", err))
                }}
              >
                <Share2 className="mr-2 h-4 w-4" />
                Compartir
              </Button>
            </CardContent>
          </Card>

          {event.latitude && event.longitude && (
            <Card>
              <CardHeader>
                <CardTitle>Ubicación</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="aspect-video relative rounded-md overflow-hidden">
                  <Image
                    src={`https://api.mapbox.com/styles/v1/mapbox/streets-v11/static/pin-s+f00(${event.longitude},${event.latitude})/${event.longitude},${event.latitude},14,0/600x300?access_token=${process.env.NEXT_PUBLIC_MAPBOX_TOKEN}`}
                    alt="Mapa de ubicación"
                    fill
                    className="object-cover"
                  />
                </div>
                <Button variant="outline" className="w-full mt-4" asChild>
                  <a
                    href={`https://www.google.com/maps/search/?api=1&query=${event.latitude},${event.longitude}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Ver en Google Maps
                  </a>
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}

