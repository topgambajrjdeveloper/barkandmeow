import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function EventsPage() {
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Eventos para Mascotas</h1>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Aquí irían las tarjetas de los eventos */}
        <Card>
          <CardHeader>
            <CardTitle>Nombre del Evento</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Descripción del evento...</p>
          </CardContent>
        </Card>
        {/* Más tarjetas de eventos... */}
      </div>
    </div>
  )
}

