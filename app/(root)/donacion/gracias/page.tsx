import { Suspense } from "react"
import { redirect } from "next/navigation"
import Link from "next/link"
import { CheckCircle } from "lucide-react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import prisma from "@/lib/prismadb"

interface ThankYouPageProps {
  searchParams: { order_id?: string }
}

async function DonationDetails({ orderId }: { orderId: string }) {
  // Buscar la donación en la base de datos
  const donation = await prisma.donation.findUnique({
    where: { paypalOrderId: orderId },
  })

  if (!donation) {
    return (
      <div className="text-center">
        <p>Gracias por tu donación. Estamos procesando los detalles.</p>
      </div>
    )
  }

  return (
    <div className="text-center space-y-2">
      <p className="text-lg font-medium">
        Has donado <span className="text-primary">{donation.amount.toFixed(2)}€</span>
      </p>
      {donation.email && <p className="text-sm text-muted-foreground">Hemos enviado un recibo a {donation.email}</p>}
    </div>
  )
}

export default function ThankYouPage({ searchParams }: ThankYouPageProps) {
  const orderId = searchParams.order_id

  if (!orderId) {
    redirect("/")
  }

  return (
    <div className="container max-w-md py-12">
      <Card className="text-center">
        <CardHeader>
          <div className="flex justify-center mb-4">
            <CheckCircle className="h-16 w-16 text-green-500" />
          </div>
          <CardTitle className="text-2xl">¡Gracias por tu donación!</CardTitle>
          <CardDescription>Tu apoyo es fundamental para seguir mejorando BarkAndMeow</CardDescription>
        </CardHeader>
        <CardContent>
          <Suspense fallback={<p className="text-center">Verificando tu donación...</p>}>
            <DonationDetails orderId={orderId} />
          </Suspense>

          <div className="mt-6 space-y-4">
            <p>
              Gracias a personas como tú, podemos seguir trabajando para crear una comunidad mejor para todas las
              mascotas y sus dueños.
            </p>
            <p className="text-sm text-muted-foreground">
              Si tienes alguna pregunta sobre tu donación, no dudes en contactarnos a través de nuestro formulario de
              contacto.
            </p>
          </div>
        </CardContent>
        <CardFooter className="flex justify-center">
          <Button asChild>
            <Link href="/">Volver al inicio</Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}

