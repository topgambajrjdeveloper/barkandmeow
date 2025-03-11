import { PrismaClient } from "@prisma/client"
import { formatDistanceToNow, addDays, isBefore } from "date-fns"
import { es } from "date-fns/locale"
import { sendVaccinationReminderEmail } from "@/lib/email"
import { sendPushNotification } from "@/lib/notifications/web-push"

const prisma = new PrismaClient()

// Configuración para determinar cuándo enviar recordatorios
const REMINDER_DAYS = [30, 15, 7, 3, 1] // Días antes de la fecha de vacunación

/**
 * Verifica las próximas vacunaciones y envía recordatorios
 * Esta función se ejecutaría periódicamente mediante un cron job
 */
export async function checkUpcomingVaccinations() {
  try {
    // Obtener todas las vacunas con fechas de vencimiento futuras
    const vaccinations = await prisma.vaccination.findMany({
      where: {
        expiryDate: {
          not: null,
        },
      },
      include: {
        healthCard: {
          include: {
            pet: {
              include: {
                user: {
                  select: {
                    id: true,
                    email: true,
                    username: true,
                    // Añadir preferencias de notificación cuando las implementes
                    // notificationPreferences: true,
                  },
                },
              },
            },
          },
        },
      },
    })

    // Fecha actual
    const today = new Date()

    // Filtrar vacunas que necesitan recordatorio
    const remindersToSend = vaccinations.filter((vaccination) => {
      if (!vaccination.expiryDate) return false

      const expiryDate = new Date(vaccination.expiryDate)

      // Verificar si la fecha de vencimiento está en alguno de los días de recordatorio
      return REMINDER_DAYS.some((days) => {
        const reminderDate = addDays(today, days)
        return isBefore(reminderDate, expiryDate) && isBefore(expiryDate, addDays(reminderDate, 1))
      })
    })

    // Enviar recordatorios para cada vacuna
    for (const vaccination of remindersToSend) {
      if (vaccination.healthCard?.pet?.user?.email) {
        const user = vaccination.healthCard.pet.user
        const pet = vaccination.healthCard.pet

        // Enviar correo electrónico
        // Aquí podrías verificar las preferencias del usuario para ver si quiere recibir correos
        await sendVaccinationReminderEmail(
          user.email,
          user.username || "Usuario",
          pet.name,
          vaccination.name,
          vaccination.expiryDate as Date,
          pet.id,
        )

        // Enviar notificación push si el usuario tiene suscripciones
        // Aquí también podrías verificar las preferencias del usuario
        await sendPushNotification(user.id, {
          title: `Recordatorio de vacunación para ${pet.name}`,
          body: `La vacuna ${vaccination.name} vence ${formatDistanceToNow(vaccination.expiryDate as Date, {
            locale: es,
            addSuffix: true,
          })}`,
          icon: pet.image || "/icons/notification-icon.png",
          data: {
            url: `/pets/${pet.id}/health`,
          },
        })
      }
    }

    return {
      success: true,
      remindersSent: remindersToSend.length,
    }
  } catch (error) {
    console.error("Error checking upcoming vaccinations:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Error desconocido",
    }
  }
}

