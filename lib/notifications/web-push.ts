import webpush from "web-push"
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

// Configurar las claves VAPID para Web Push
webpush.setVapidDetails(
  `mailto:${process.env.VAPID_CONTACT_EMAIL || process.env.EMAIL_FROM}`,
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || "",
  process.env.VAPID_PRIVATE_KEY || "",
)

/**
 * Envía una notificación push a un usuario específico
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function sendPushNotification(userId: string, payload: any) {
  try {
    // Obtener todas las suscripciones push del usuario
    const subscriptions = await prisma.pushSubscription.findMany({
      where: { userId },
    })

    if (subscriptions.length === 0) {
      return { success: false, error: "No push subscriptions found for user" }
    }

    const results = await Promise.allSettled(
      subscriptions.map(async (subscription) => {
        try {
          await webpush.sendNotification(JSON.parse(subscription.subscription), JSON.stringify(payload))
          return { success: true, subscriptionId: subscription.id }
        } catch (error) {
          // Si hay un error 410 (Gone), la suscripción ya no es válida
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          if (error instanceof Error && error.name === "WebPushError" && (error as any).statusCode === 410) {
            // Eliminar la suscripción inválida
            await prisma.pushSubscription.delete({
              where: { id: subscription.id },
            })
          }
          return {
            success: false,
            subscriptionId: subscription.id,
            error: error instanceof Error ? error.message : "Unknown error",
          }
        }
      }),
    )

    return {
      success: true,
      results,
    }
  } catch (error) {
    console.error("Error sending push notification:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    }
  }
}

/**
 * Guarda una nueva suscripción push para un usuario
 */
export async function saveSubscription(userId: string, subscription: PushSubscriptionJSON) {
  try {
    // Verificar si ya existe esta suscripción
    const existingSubscription = await prisma.pushSubscription.findFirst({
      where: {
        userId,
        subscription: JSON.stringify(subscription),
      },
    })

    if (existingSubscription) {
      return { success: true, subscriptionId: existingSubscription.id, isNew: false }
    }

    // Crear nueva suscripción
    const newSubscription = await prisma.pushSubscription.create({
      data: {
        userId,
        subscription: JSON.stringify(subscription),
      },
    })

    return { success: true, subscriptionId: newSubscription.id, isNew: true }
  } catch (error) {
    console.error("Error saving push subscription:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    }
  }
}

