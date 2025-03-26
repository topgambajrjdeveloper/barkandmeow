import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Search, Home } from "lucide-react"

export default function NotFound() {
  return (
    <div className="container py-12 flex items-center justify-center">
      <Card className="max-w-md w-full">
        <CardHeader className="text-center">
          <Search className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
          <CardTitle className="text-2xl">Equipo no encontrado</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-center">
            Lo sentimos, no pudimos encontrar la información del equipo que estás buscando.
          </p>
        </CardContent>
        <CardFooter className="flex justify-center">
          <Button asChild>
            <Link href="/" className="flex items-center gap-2">
              <Home className="h-4 w-4" />
              Volver al inicio
            </Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}

