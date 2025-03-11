import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function PetFriendlyPage() {
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Establecimientos Pet-Friendly</h1>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Aquí irían las tarjetas de los establecimientos pet-friendly */}
        <Card>
          <CardHeader>
            <CardTitle>Nombre del Establecimiento</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Descripción del establecimiento pet-friendly...</p>
          </CardContent>
        </Card>
        {/* Más tarjetas de establecimientos... */}
      </div>
    </div>
  )
}

