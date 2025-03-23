import { NextResponse } from "next/server"
import prisma from "@/lib/prismadb"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const token = searchParams.get("token")

  if (!token) {
    return NextResponse.json({ error: "Token no proporcionado" }, { status: 400 })
  }

  try {
    const user = await prisma.user.findFirst({
      where: { confirmationToken: token },
    })

    if (!user) {
      return NextResponse.json({ error: "Token inválido" }, { status: 400 })
    }

    await prisma.user.update({
      where: { id: user.id },
      data: {
        isEmailConfirmed: true,
        confirmationToken: null,
      },
    })

    return NextResponse.json({ message: "Email confirmado exitosamente" })
  } catch (error) {
    console.error("Error al confirmar email:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}

