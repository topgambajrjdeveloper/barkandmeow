import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function ShopsPage() {
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Tiendas para Mascotas</h1>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Aquí irían las tarjetas de las tiendas */}
        <Card>
          <CardHeader>
            <CardTitle>Nombre de la Tienda</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Descripción de la tienda...</p>
          </CardContent>
        </Card>
        {/* Más tarjetas de tiendas... */}
      </div>
    </div>
  )
}

