import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function AboutPage() {
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Acerca de BarkAndMeow</h1>
      <Card>
        <CardHeader>
          <CardTitle>Nuestra Misión</CardTitle>
        </CardHeader>
        <CardContent>
          <p>
            BarkAndMeow nació con la misión de conectar a los amantes de las mascotas, creando una comunidad vibrante
            donde los dueños de mascotas pueden compartir experiencias, encontrar recursos útiles y hacer nuevos amigos
            para sus compañeros peludos.
          </p>
        </CardContent>
      </Card>
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Quiénes Somos</CardTitle>
        </CardHeader>
        <CardContent>
          <p>
            Somos un equipo apasionado de desarrolladores y amantes de los animales. Nuestra experiencia en tecnología y
            nuestro amor por las mascotas nos impulsaron a crear una plataforma que mejore la vida de las mascotas y sus
            dueños.
          </p>
        </CardContent>
      </Card>
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Nuestros Valores</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="list-disc pl-5 space-y-2">
            <li>Amor y respeto por todas las mascotas</li>
            <li>Compromiso con el bienestar animal</li>
            <li>Fomento de una comunidad inclusiva y solidaria</li>
            <li>Innovación continua para mejorar la experiencia de nuestros usuarios</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  )
}

