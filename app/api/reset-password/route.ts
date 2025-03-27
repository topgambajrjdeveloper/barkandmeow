import { NextResponse } from "next/server"
import { hash } from "bcryptjs"
import { sendPasswordResetEmail } from "@/lib/email"
import crypto from "crypto"
import { resetPasswordSchema, newPasswordSchema } from "@/lib/validations"
import prisma from "@/lib/prismadb"


export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { email } = resetPasswordSchema.parse(body)

    const user = await prisma.user.findUnique({ where: { email } })

    if (user) {
      const resetToken = crypto.randomBytes(32).toString("hex")
      const resetTokenExpiry = new Date(Date.now() + 3600000) // 1 hora

      await prisma.user.update({
        where: { id: user.id },
        data: {
          resetPasswordToken: resetToken,
          resetPasswordExpires: resetTokenExpiry,
        },
      })

      try {
        await sendPasswordResetEmail(email, resetToken)
        console.log("Email de restablecimiento enviado correctamente")
      } catch (emailError) {
        console.error("Error detallado al enviar email:", emailError)
        // Continuar con la respuesta aunque falle el email
      }
    }

    // Siempre devolver un mensaje genérico por seguridad
    return NextResponse.json({
      message: "Si existe una cuenta asociada a este correo, recibirás instrucciones para restablecer tu contraseña.",
    })
  } catch (error) {
    console.error("Error detallado al solicitar restablecimiento de contraseña:", error)
    return NextResponse.json({ 
      error: "Error interno del servidor",
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json()
    const { token, newPassword } = newPasswordSchema.parse(body)

    const user = await prisma.user.findFirst({
      where: {
        resetPasswordToken: token,
        resetPasswordExpires: { gt: new Date() },
      },
    })

    if (!user) {
      return NextResponse.json({ error: "Token inválido o expirado" }, { status: 400 })
    }

    const hashedPassword = await hash(newPassword, 10)

    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        resetPasswordToken: null,
        resetPasswordExpires: null,
      },
    })

    return NextResponse.json({ message: "Contraseña actualizada exitosamente" })
  } catch (error) {
    console.error("Error al restablecer contraseña:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}

