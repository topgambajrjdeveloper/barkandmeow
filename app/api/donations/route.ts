import { NextResponse } from "next/server"
import prisma from "@/lib/prismadb"
import { z } from "zod"

// Esquema de validación para la donación
const donationSchema = z.object({
  orderId: z.string(),
  payerId: z.string(),
  amount: z.number().positive(),
  email: z.string().email(),
  name: z.string(),
})

export async function POST(request: Request) {
  try {
    const body = await request.json()

    // Validar los datos
    const validatedData = donationSchema.parse(body)

    // Guardar la donación en la base de datos
    const donation = await prisma.donation.create({
      data: {
        paypalOrderId: validatedData.orderId,
        paypalPayerId: validatedData.payerId,
        amount: validatedData.amount,
        email: validatedData.email,
        name: validatedData.name,
        status: "completed",
      },
    })

    return NextResponse.json({ success: true, donation })
  } catch (error) {
    console.error("Error al procesar la donación:", error)

    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Datos de donación inválidos" }, { status: 400 })
    }

    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}

