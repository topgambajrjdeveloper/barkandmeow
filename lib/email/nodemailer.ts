// lib/email/nodemailer.ts
import nodemailer from "nodemailer"

// Configuración del transporte de Nodemailer
export const createNodemailerTransport = () => {
  // Para desarrollo (usando Mailtrap)
  if (process.env.NODE_ENV !== "production") {
    return nodemailer.createTransport({
      host: "smtp.mailtrap.io",
      port: 2525,
      auth: {
        user: process.env.MAILTRAP_USER,
        pass: process.env.MAILTRAP_PASS,
      },
    })
  }

  // Para producción (como fallback)
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 587),
    secure: process.env.SMTP_SECURE === "true",
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASSWORD,
    },
  })
}

// Función para enviar email con Nodemailer
export const sendEmailWithNodemailer = async ({
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
  const transporter = createNodemailerTransport()

  const mailOptions: nodemailer.SendMailOptions = {
    from,
    to,
    subject,
    html,
  }

  if (replyTo) {
    mailOptions.replyTo = replyTo
  }

  const info = await transporter.sendMail(mailOptions)

  console.log(`Email enviado con Nodemailer: ${info.messageId}`)

  // Si estamos en desarrollo, devolvemos la URL de vista previa de Mailtrap
  if (process.env.NODE_ENV !== "production" && info.messageId) {
    // Mailtrap no proporciona una URL de vista previa directamente a través de la API
    // pero puedes construir una URL para ver el email en la interfaz de Mailtrap
    return {
      messageId: info.messageId,
      previewUrl: `https://mailtrap.io/inboxes/${process.env.MAILTRAP_INBOX_ID}/messages/${info.messageId}`,
    }
  }

  return {
    messageId: info.messageId,
  }
}

