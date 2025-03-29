import { EventForm } from "@/components/(admin)/events/event-form"

export default function NewEventPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Crear Nuevo Evento</h1>
      <EventForm />
    </div>
  )
}

