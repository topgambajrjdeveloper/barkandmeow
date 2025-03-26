"use server"
import { z } from "zod"
import prisma from "@/lib/prismadb"

// Esquema de validación para la cantidad de donación
const donationSchema = z.number().positive().min(1).max(10000)

// Función para obtener los detalles de una donación
export async function getDonationDetails(orderId: string) {
  try {
    const donation = await prisma.donation.findUnique({
      where: { paypalOrderId: orderId },
    })

    if (!donation) {
      return { error: "Donación no encontrada" }
    }

    return {
      amount: donation.amount,
      email: donation.email,
      name: donation.name,
      status: donation.status,
      date: donation.createdAt,
    }
  } catch (error) {
    console.error("Error al obtener detalles de la donación:", error)
    return { error: "Error al obtener detalles de la donación" }
  }
}

