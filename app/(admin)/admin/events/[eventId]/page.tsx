import { notFound } from "next/navigation"
import prisma from "@/lib/prismadb"
import { EventForm } from "@/components/(admin)/events/event-form"

interface EventPageProps {
  params: {
    eventId: string
  }
}

export default async function EditEventPage({ params }: EventPageProps) {
  // Esperar a que params esté disponible y luego acceder a eventId
  const { eventId } = await params

  const event = await prisma.event.findUnique({
    where: {
      id: eventId,
    },
  })

  if (!event) {
    notFound()
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Editar Evento</h1>
      <EventForm initialData={event} isEditing />
    </div>
  )
}

