// app/api/test-email/route.ts
import { NextResponse } from "next/server"
import { sendConfirmationEmail } from "@/lib/email"

export async function GET(request: Request) {
  try {
    // Obtener el email de los parámetros de consulta
    const { searchParams } = new URL(request.url)
    const email = searchParams.get('email') || 'test@example.com'
    const token = 'test-token-123'
    
    const result = await sendConfirmationEmail(email, token)
    
    return NextResponse.json({ 
      success: true, 
      message: "Email de prueba enviado correctamente",
      result 
    })
  } catch (error) {
    console.error("Error detallado en prueba de email:", error)
    return NextResponse.json({ 
      error: "Error al enviar email", 
      details: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined
    }, { status: 500 })
  }
}