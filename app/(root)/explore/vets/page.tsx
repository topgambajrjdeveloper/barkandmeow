import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function VetsPage() {
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Veterinarios</h1>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Aquí irían las tarjetas de los veterinarios */}
        <Card>
          <CardHeader>
            <CardTitle>Nombre del Veterinario</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Información del veterinario...</p>
          </CardContent>
        </Card>
        {/* Más tarjetas de veterinarios... */}
      </div>
    </div>
  )
}

