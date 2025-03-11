import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function TermsAndConditionsPage() {
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Términos y Condiciones</h1>
      <Card>
        <CardHeader>
          <CardTitle>Aceptación de los Términos</CardTitle>
        </CardHeader>
        <CardContent>
          <p>
            Al acceder y utilizar BarkAndMeow, usted acepta estar sujeto a estos Términos y Condiciones y a nuestra
            Política de Privacidad. Si no está de acuerdo con alguna parte de estos términos, no podrá utilizar nuestros
            servicios.
          </p>
        </CardContent>
      </Card>
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Uso del Servicio</CardTitle>
        </CardHeader>
        <CardContent>
          <p>
            Usted se compromete a utilizar BarkAndMeow solo para fines legales y de una manera que no infrinja los
            derechos de otros usuarios o restrinja su uso del servicio. Está prohibido cualquier uso del servicio que
            viole las leyes aplicables o promueva actividades ilegales.
          </p>
        </CardContent>
      </Card>
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Contenido del Usuario</CardTitle>
        </CardHeader>
        <CardContent>
          <p>
            Al publicar contenido en BarkAndMeow, usted otorga a BarkAndMeow una licencia no exclusiva para usar, modificar,
            ejecutar públicamente, mostrar públicamente y distribuir dicho contenido en y a través de BarkAndMeow.
          </p>
        </CardContent>
      </Card>
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Modificaciones del Servicio</CardTitle>
        </CardHeader>
        <CardContent>
          <p>
            BarkAndMeow se reserva el derecho de modificar o discontinuar, temporal o permanentemente, el servicio (o
            cualquier parte del mismo) con o sin previo aviso.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}

