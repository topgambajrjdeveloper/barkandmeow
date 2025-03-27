import { NextResponse } from "next/server";
import prisma from "@/lib/prismadb";

export async function POST(request: Request) {
  try {
    const { email, amount, source } = await request.json();

    // Validar datos
    if (!email || !amount || !source) {
      return NextResponse.json(
        { error: "Faltan datos requeridos" },
        { status: 400 }
      );
    }

    // Buscar usuario por email
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return NextResponse.json(
        { error: "No se encontró un usuario con ese email" },
        { status: 404 }
      );
    }

    // Registrar la intención de donación
    const donationIntent = await prisma.donationIntent.create({
      data: {
        userId: user.id,
        amount,
        source,
        status: "pending",
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 horas
      },
    });

    return NextResponse.json({
      success: true,
      message: "Intención de donación registrada correctamente",
      donationId: donationIntent.id,
    });
  } catch (error) {
    console.error("Error al registrar intención de donación:", error);
    return NextResponse.json(
      { error: "Error al procesar la solicitud" },
      { status: 500 }
    );
  }
}
