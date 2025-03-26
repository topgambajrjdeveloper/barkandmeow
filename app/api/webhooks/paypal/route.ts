import { NextResponse } from "next/server"
import { headers } from "next/headers"
import prisma from "@/lib/prismadb"

// Función para verificar la autenticidad de la notificación de PayPal
async function verifyPayPalWebhook(headers: Headers, body: any) {
  // En una implementación real, deberías verificar la firma de PayPal
  // Esto requiere hacer una solicitud a la API de PayPal
  // Por simplicidad, aquí solo verificamos que el webhook tenga un token válido
  const webhookToken = headers.get("paypal-auth-algo")

  // En producción, deberías implementar una verificación más robusta
  return !!webhookToken
}

export async function POST(request: Request) {
  try {
    const headersList = headers()
    const body = await request.json()

    // Verificar la autenticidad del webhook
    const isValid = await verifyPayPalWebhook(headersList, body)

    if (!isValid) {
      return NextResponse.json({ error: "Webhook no autorizado" }, { status: 401 })
    }

    // Procesar el evento según su tipo
    const eventType = body.event_type

    switch (eventType) {
      case "PAYMENT.CAPTURE.COMPLETED": {
        const resource = body.resource
        const orderId = resource.supplementary_data?.related_ids?.order_id

        if (orderId) {
          // Actualizar el estado de la donación en la base de datos
          await prisma.donation.updateMany({
            where: { paypalOrderId: orderId },
            data: { status: "completed" },
          })

          // Aquí podrías enviar un email de agradecimiento, etc.
        }
        break
      }

      case "PAYMENT.CAPTURE.DENIED":
      case "PAYMENT.CAPTURE.REFUNDED": {
        const resource = body.resource
        const orderId = resource.supplementary_data?.related_ids?.order_id

        if (orderId) {
          // Actualizar el estado de la donación en la base de datos
          await prisma.donation.updateMany({
            where: { paypalOrderId: orderId },
            data: { status: eventType === "PAYMENT.CAPTURE.DENIED" ? "denied" : "refunded" },
          })
        }
        break
      }

      default:
        console.log(`Evento de PayPal no manejado: ${eventType}`)
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error("Error al procesar el webhook de PayPal:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}

