import Link from "next/link"
import { PlusCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { EventsTable } from "@/components/(admin)/events/events-table"
import { getAllEvents } from "@/lib/events"

export default async function AdminEventsPage() {
  const { events } = await getAllEvents()

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Gestión de Eventos</h1>
        <Button asChild>
          <Link href="/admin/events/new">
            <PlusCircle className="h-4 w-4 mr-2" />
            Nuevo Evento
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Eventos</CardTitle>
          <CardDescription>
            Administra los eventos de la plataforma. Puedes crear, editar, publicar y eliminar eventos.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <EventsTable events={events} />
        </CardContent>
      </Card>
    </div>
  )
}

