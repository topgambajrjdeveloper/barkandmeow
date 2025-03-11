"use server"

import { transporter } from "@/lib/email"
import type { ContactFormValues } from "@/lib/validations"

export async function sendContactForm(data: ContactFormValues) {
  try {
    // Enviar correo al administrador
    await transporter.sendMail({
      from: `"Formulario de Contacto" <${data.email}>`,
      to: process.env.EMAIL_FROM || "no-reply@barkandmeow.app", // Configura esta variable de entorno
      subject: `Nuevo mensaje de contacto: ${data.subject}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Nuevo mensaje de contacto</h2>
          <p><strong>Nombre:</strong> ${data.name}</p>
          <p><strong>Email:</strong> ${data.email}</p>
          <p><strong>Asunto:</strong> ${data.subject}</p>
          <p><strong>Mensaje:</strong></p>
          <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px;">
            ${data.message.replace(/\n/g, "<br>")}
          </div>
          <p style="color: #666; font-size: 12px; margin-top: 20px;">
            Este mensaje fue enviado desde el formulario de contacto de ${process.env.NEXT_NAME_WEB}.
          </p>
        </div>
      `,
    })

    // Enviar confirmación al usuario
    await transporter.sendMail({
      from: `"${process.env.NEXT_NAME_WEB}" <no-reply@barkandmeow.app>`,
      to: data.email,
      subject: "Hemos recibido tu mensaje",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Gracias por contactarnos</h2>
          <p>Hola ${data.name},</p>
          <p>Hemos recibido tu mensaje con el asunto "${data.subject}".</p>
          <p>Nuestro equipo revisará tu consulta y te responderemos lo antes posible.</p>
          <p>Saludos,<br>El equipo de ${process.env.NEXT_NAME_WEB}</p>
        </div>
      `,
    })

    return { success: true }
  } catch (error) {
    console.error("Error sending contact form emails:", error)
    throw new Error("Failed to send contact form")
  }
}

