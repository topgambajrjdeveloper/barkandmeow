"use server"

import { z } from "zod"
import { sendContactEmail } from "@/lib/email"
import { contactFormSchema, type ContactFormValues } from "@/lib/validations"

export async function sendContactForm(formData: ContactFormValues) {
  try {
    // Validar los datos del formulario
    const validatedData = contactFormSchema.parse(formData)

    // Enviar el email
    const result = await sendContactEmail(
      validatedData.name,
      validatedData.email,
      validatedData.subject,
      validatedData.message,
    )

    if (!result.success) {
      throw new Error("Error al enviar el email")
    }

    return { success: true }
  } catch (error) {
    console.error("Error en sendContactForm:", error)

    if (error instanceof z.ZodError) {
      // Error de validación
      return { success: false, error: "Datos de formulario inválidos" }
    }

    return { success: false, error: "Error al procesar la solicitud" }
  }
}

