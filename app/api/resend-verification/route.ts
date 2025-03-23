import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { sendConfirmationEmail } from "@/lib/email"
import crypto from "crypto"
import prisma from "@/lib/prismadb"

export async function POST() {
  try {
    const session = await auth()

    if (!session || !session.user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id as string },
    })

    if (!user) {
      return NextResponse.json({ error: "Usuario no encontrado" }, { status: 404 })
    }

    if (user.isEmailConfirmed) {
      return NextResponse.json({ error: "El correo ya está verificado" }, { status: 400 })
    }

    const confirmationToken = crypto.randomBytes(32).toString("hex")

    await prisma.user.update({
      where: { id: user.id },
      data: { confirmationToken },
    })

    await sendConfirmationEmail(user.email, confirmationToken)

    return NextResponse.json({ message: "Correo de verificación reenviado" })
  } catch (error) {
    console.error("Error resending verification email:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}

