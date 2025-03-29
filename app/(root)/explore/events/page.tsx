import Link from "next/link"
import Image from "next/image"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { Calendar, MapPin, Users, ArrowRight } from "lucide-react"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import prisma from "@/lib/prismadb"

async function getEvents() {
  try {
    const events = await prisma.event.findMany({
      where: {
        date: { gte: new Date() },
        isPublished: true,
      },
      orderBy: { date: "asc" },
      include: {
        createdBy: {
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

    return events
  } catch (error) {
    console.error("Error fetching events:", error)
    return []
  }
}

export default async function EventsPage() {
  const events = await getEvents()

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">Eventos para Mascotas</h1>
          <p className="text-muted-foreground mt-2">Descubre eventos cercanos para ti y tus mascotas</p>
        </div>
        <Button asChild className="mt-4 md:mt-0">
          <Link href="/events/calendar">
            Ver calendario
            <Calendar className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </div>

      {events.length === 0 ? (
        <div className="text-center py-12">
          <h2 className="text-xl font-semibold mb-2">No hay eventos próximos</h2>
          <p className="text-muted-foreground mb-6">No se encontraron eventos programados para las próximas fechas.</p>
          <Button asChild>
            <Link href="/events/create">Crear un evento</Link>
          </Button>
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {events.map((event) => (
            <EventCard key={event.id} event={event} />
          ))}
        </div>
      )}
    </div>
  )
}

function EventCard({ event }: { event: any }) {
  const eventDate = new Date(event.date)
  const isToday = new Date().toDateString() === eventDate.toDateString()
  const isTomorrow = new Date(new Date().setDate(new Date().getDate() + 1)).toDateString() === eventDate.toDateString()

  let dateLabel = format(eventDate, "PPP", { locale: es })
  if (isToday) dateLabel = "Hoy, " + format(eventDate, "p", { locale: es })
  if (isTomorrow) dateLabel = "Mañana, " + format(eventDate, "p", { locale: es })

  return (
    <Card className="overflow-hidden flex flex-col h-full">
      <div className="relative h-48 w-full">
        <Image
          src={event.imageUrl || "/placeholder.svg?height=200&width=400"}
          alt={event.title}
          fill
          className="object-cover"
        />
        {isToday && <Badge className="absolute top-2 right-2 bg-secondary text-secondary-foreground">Hoy</Badge>}
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
            <span>{event._count.attendees} asistentes</span>
          </div>
          <p className="text-sm text-muted-foreground line-clamp-3 mt-2">{event.description}</p>
        </div>
      </CardContent>
      <CardFooter className="pt-0">
        <Button asChild variant="outline" className="w-full">
          <Link href={`/events/${event.id}`}>
            Ver detalles
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </CardFooter>
    </Card>
  )
}

