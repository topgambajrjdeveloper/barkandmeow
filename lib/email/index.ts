// lib/email/index.ts
import { sendEmailWithNodemailer } from "./nodemailer"
import { sendEmailWithResend } from "./resend"

// Enum para los proveedores de email
export enum EmailProvider {
  NODEMAILER = "nodemailer",
  RESEND = "resend",
}

// Interfaz para los datos del email
export interface EmailData {
  to: string
  subject: string
  html: string
  from?: string
  replyTo?: string
}

// Función unificada para enviar emails
export async function sendEmail({
  to,
  subject,
  html,
  // from = process.env.EMAIL_FROM || "no-reply@barkandmeow.app",
  from = process.env.EMAIL_FROM || "onboarding@resend.dev",

  replyTo,
  provider = (process.env.DEFAULT_EMAIL_PROVIDER as EmailProvider) || EmailProvider.NODEMAILER,
  fallbackProvider = true,
}: EmailData & {
  provider?: EmailProvider
  fallbackProvider?: boolean
}) {
  try {
    // Determinar el proveedor basado en el entorno si no se especifica
    if (!provider) {
      provider = process.env.NODE_ENV === "production" ? EmailProvider.RESEND : EmailProvider.NODEMAILER
    }

    // Intentar enviar con el proveedor principal
    if (provider === EmailProvider.RESEND) {
      return await sendEmailWithResend({ to, subject, html, from, replyTo })
    } else {
      return await sendEmailWithNodemailer({ to, subject, html, from, replyTo })
    }
  } catch (error) {
    console.error(`Error al enviar email con ${provider}:`, error)

    // Si está habilitado el fallback y el proveedor principal falló, intentar con el otro
    if (fallbackProvider) {
      console.log(`Intentando enviar con proveedor de respaldo...`)
      try {
        if (provider === EmailProvider.RESEND) {
          return await sendEmailWithNodemailer({ to, subject, html, from, replyTo })
        } else {
          return await sendEmailWithResend({ to, subject, html, from, replyTo })
        }
      } catch (fallbackError) {
        console.error("Error al enviar con proveedor de respaldo:", fallbackError)
        throw fallbackError
      }
    }

    throw error
  }
}

// Función para enviar email de confirmación
export async function sendConfirmationEmail(to: string, token: string) {
  const confirmationUrl = `${process.env.NEXT_PUBLIC_APP_URL}/confirm-email?token=${token}`
  const siteName = process.env.NEXT_NAME_WEB || "BarkAndMeow"
  console.log(`[DEV ONLY] Email de confirmación simulado para: ${to} con token: ${token}`)
  console.log(`URL de confirmación: ${process.env.NEXT_PUBLIC_APP_URL}/confirm-email?token=${token}`)
  
  return sendEmail({
    to,
    subject: `Confirma tu cuenta en ${siteName}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1>Bienvenido a ${siteName}!</h1>
        <p>Por favor, confirma tu cuenta haciendo clic en el siguiente enlace:</p>
        <div style="margin: 30px 0; text-align: center;">
          <a href="${confirmationUrl}" 
             style="background-color: #0070f3; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
            Confirmar mi cuenta
          </a>
        </div>
        <p>Si no has solicitado esta cuenta, puedes ignorar este correo.</p>
        <p>Saludos,<br>El equipo de ${siteName}</p>
      </div>
    `,
  })
}

// Función para enviar email de restablecimiento de contraseña
export async function sendPasswordResetEmail(to: string, token: string) {
  const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL}/reset-password?token=${token}`
  const siteName = process.env.NEXT_NAME_WEB || "BarkAndMeow"

  return sendEmail({
    to,
    subject: `Restablece tu contraseña en ${siteName}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1>Restablecimiento de contraseña</h1>
        <p>Has solicitado restablecer tu contraseña. Haz clic en el siguiente enlace para establecer una nueva contraseña:</p>
        <div style="margin: 30px 0; text-align: center;">
          <a href="${resetUrl}" 
             style="background-color: #0070f3; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
            Restablecer mi contraseña
          </a>
        </div>
        <p>Si no solicitaste este cambio, puedes ignorar este correo.</p>
        <p>Este enlace expirará en 1 hora.</p>
        <p>Saludos,<br>El equipo de ${siteName}</p>
      </div>
    `,
  })
}

// Función para enviar emails de contacto
export async function sendContactEmail(name: string, email: string, subject: string, message: string) {
  const siteName = process.env.NEXT_NAME_WEB || "BarkAndMeow"

  try {
    await sendEmail({
      to: process.env.CONTACT_EMAIL || "onboarding@resend.dev",
      subject: `Formulario de contacto: ${subject}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Nuevo mensaje de contacto</h2>
          <p><strong>Nombre:</strong> ${name}</p>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Asunto:</strong> ${subject}</p>
          <p><strong>Mensaje:</strong></p>
          <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px;">
            ${message.replace(/\n/g, "<br>")}
          </div>
          <p>Saludos,<br>El equipo de ${siteName}</p>
        </div>
      `,
      replyTo: email, // Para que puedas responder directamente al remitente
    })

    return { success: true }
  } catch (error) {
    console.error("Error al enviar email de contacto:", error)
    return { success: false, error }
  }
}

