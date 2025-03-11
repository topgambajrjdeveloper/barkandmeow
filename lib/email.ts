import nodemailer from "nodemailer"

export let transporter: nodemailer.Transporter

if (process.env.NODE_ENV === "production") {
  // Configuración para producción
  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT),
    secure: process.env.SMTP_SECURE === "true",
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  })
} else {
  // Configuración para desarrollo (Mailtrap)
  transporter = nodemailer.createTransport({
    host: "smtp.mailtrap.io",
    port: 2525,
    auth: {
      user: process.env.MAILTRAP_USER,
      pass: process.env.MAILTRAP_PASS,
    },
  })
}

// Función auxiliar para formatear el tiempo restante de manera legible
function formatTimeRemaining(date: Date): string {
  const now = new Date()
  const diffTime = date.getTime() - now.getTime()
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

  if (diffDays <= 0) {
    return "hoy"
  } else if (diffDays === 1) {
    return "mañana"
  } else if (diffDays < 7) {
    return `en ${diffDays} días`
  } else if (diffDays < 30) {
    const weeks = Math.floor(diffDays / 7)
    return `en ${weeks} ${weeks === 1 ? "semana" : "semanas"}`
  } else {
    const months = Math.floor(diffDays / 30)
    return `en ${months} ${months === 1 ? "mes" : "meses"}`
  }
}

export async function sendConfirmationEmail(to: string, token: string) {
  const confirmationUrl = `${process.env.NEXT_PUBLIC_APP_URL}/confirm-email?token=${token}`

  await transporter.sendMail({
    from: `"${process.env.NEXT_NAME_WEB}" <no-reply@barkandmeow.app>`,
    to,
    subject: `Confirma tu cuenta en ${process.env.NEXT_NAME_WEB}`,
    html: `
      <h1>Bienvenido a ${process.env.NEXT_NAME_WEB}!</h1>
      <p>Por favor, confirma tu cuenta haciendo clic en el siguiente enlace:</p>
      <a href="${confirmationUrl}">Confirmar mi cuenta</a>
    `,
  })
}

export async function sendPasswordResetEmail(to: string, token: string) {
  const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL}/reset-password?token=${token}`

  await transporter.sendMail({
    from: `"${process.env.NEXT_NAME_WEB}" <no-reply@barkandmeow.app>`,
    to,
    subject: `Restablece tu contraseña en ${process.env.NEXT_NAME_WEB}`,
    html: `
      <h1>Restablecimiento de contraseña</h1>
      <p>Has solicitado restablecer tu contraseña. Haz clic en el siguiente enlace para establecer una nueva contraseña:</p>
      <a href="${resetUrl}">Restablecer mi contraseña</a>
      <p>Si no solicitaste este cambio, puedes ignorar este correo.</p>
    `,
  })
}


export async function sendVaccinationReminderEmail(
  to: string,
  username: string,
  petName: string,
  vaccineName: string,
  expiryDate: Date,
  petId: string,
) {
  // Calcular tiempo restante en formato legible
  const timeRemaining = formatTimeRemaining(expiryDate)
  const formattedDate = expiryDate.toLocaleDateString()

  await transporter.sendMail({
    from: `"${process.env.NEXT_NAME_WEB}" <no-reply@barkandmeow.app>`,
    to,
    subject: `Recordatorio de vacunación para ${petName}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Recordatorio de vacunación</h2>
        <p>Hola ${username},</p>
        <p>Te recordamos que la vacuna <strong>${vaccineName}</strong> para <strong>${petName}</strong> vence ${timeRemaining}.</p>
        <p>Fecha programada: <strong>${formattedDate}</strong></p>
        <p>Por favor, programa una cita con tu veterinario para mantener al día la salud de ${petName}.</p>
        <div style="margin: 30px 0;">
          <a href="${process.env.NEXT_PUBLIC_APP_URL}/pets/${petId}/health" 
             style="background-color: #0070f3; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
            Ver cartilla sanitaria
          </a>
        </div>
        <p>Saludos,<br>El equipo de BarkAndMeow</p>
      </div>
    `,
  })
}


