// lib/email/resend.ts
import { Resend } from "resend"

// Inicializar Resend con la API key
const resend = new Resend(process.env.RESEND_API_KEY)

// Función para enviar email con Resend
export const sendEmailWithResend = async ({
  to,
  subject,
  html,
  from = process.env.EMAIL_FROM || "no-reply@barkandmeow.app",
  replyTo,
}: {
  to: string
  subject: string
  html: string
  from?: string
  replyTo?: string
}) => {
  try {
    const options: any = {
      from,
      to,
      subject,
      html,
    }

    if (replyTo) {
      options.reply_to = replyTo
    }

    const { data, error } = await resend.emails.send(options)

    if (error) {
      console.error("Error al enviar email con Resend:", error)
      throw new Error(error.message)
    }

    console.log(`Email enviado con Resend: ${data?.id}`)
    return {
      messageId: data?.id,
    }
  } catch (error) {
    console.error("Error al enviar email con Resend:", error)
    throw error
  }
}

