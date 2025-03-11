import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { sendPushNotification } from "@/lib/notifications/web-push"
import { sendVaccinationReminderEmail } from "@/lib/email"

// Ruta para probar el envío de notificaciones
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function POST(request: Request) {
  try {
    const session = await auth()

    if (!session || !session.user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const userId = session.user.id
    const email = session.user.email

    if (!email) {
      return NextResponse.json({ error: "Usuario sin correo electrónico" }, { status: 400 })
    }

    // Enviar una notificación push de prueba
    const pushResult = await sendPushNotification(userId, {
      title: "Recordatorio de vacunación",
      body: "Esta es una notificación de prueba para recordatorios de vacunación.",
      icon: "/icons/notification-icon.png",
      data: {
        url: "/settings/notifications",
      },
    })

    // Enviar un correo electrónico de prueba
    const emailResult = await sendVaccinationReminderEmail(
      email,
      session.user.name || "Usuario",
      "Tu mascota",
      "Vacuna de prueba",
      new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 días en el futuro
      "test-pet-id",
    )

    return NextResponse.json({
      success: true,
      push: pushResult,
      email: !!emailResult,
    })
  } catch (error) {
    console.error("Error sending test notifications:", error)
    return NextResponse.json({ error: error instanceof Error ? error.message : "Error desconocido" }, { status: 500 })
  }
}

