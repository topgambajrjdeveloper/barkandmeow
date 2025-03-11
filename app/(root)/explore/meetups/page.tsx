import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function MeetupsPage() {
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Quedadas para Pasear</h1>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Aquí irían las tarjetas de las quedadas */}
        <Card>
          <CardHeader>
            <CardTitle>Nombre de la Quedada</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Detalles de la quedada...</p>
          </CardContent>
        </Card>
        {/* Más tarjetas de quedadas... */}
      </div>
    </div>
  )
}

