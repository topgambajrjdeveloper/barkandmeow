import { type NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prismadb"

export async function GET(request: NextRequest) {
  try {
    const token = request.nextUrl.searchParams.get("token")

    if (!token) {
      return NextResponse.redirect(new URL("/login?error=invalid-token", request.url))
    }

    // Buscar usuario con el token de confirmación
    const user = await prisma.user.findFirst({
      where: {
        confirmationToken: token,
      },
    })

    if (!user) {
      return NextResponse.redirect(new URL("/login?error=invalid-token", request.url))
    }

    // Actualizar usuario como confirmado
    await prisma.user.update({
      where: {
        id: user.id,
      },
      data: {
        isEmailConfirmed: true,
        confirmationToken: null, // Eliminar el token después de usarlo
      },
    })

    // Redirigir a la página de login con mensaje de éxito
    return NextResponse.redirect(new URL("/login?confirmed=true", request.url))
  } catch (error) {
    console.error("Error confirming email:", error)
    return NextResponse.redirect(new URL("/login?error=server-error", request.url))
  }
}

