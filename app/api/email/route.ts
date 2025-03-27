import { NextResponse } from "next/server"
import { sendEmail, type EmailProvider } from "@/lib/email"

export async function POST(request: Request) {
  try {
    const { to, subject, html, from, provider } = await request.json()

    // Validar datos requeridos
    if (!to || !subject || !html) {
      return NextResponse.json({ error: "Se requieren los campos to, subject y html" }, { status: 400 })
    }

    // Enviar email
    const result = await sendEmail({
      to,
      subject,
      html,
      from,
      provider: provider as EmailProvider,
    })

    return NextResponse.json({ success: true, ...result })
  } catch (error) {
    console.error("Error en la ruta de envío de email:", error)
    return NextResponse.json({ error: "Error al enviar el email", details: (error as Error).message }, { status: 500 })
  }
}

