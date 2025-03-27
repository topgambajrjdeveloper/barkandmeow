import { NextResponse } from "next/server"
import  prisma  from "@/lib/prismadb"

// Verificar la firma del webhook (en una implementación real)
const verifyPatreonWebhook = (request: Request) => {
  // Aquí iría la lógica para verificar la firma del webhook
  // usando el header 'X-Patreon-Signature' y un secreto compartido
  return true
}

export async function POST(request: Request) {
  try {
    // Verificar que la solicitud es legítima
    if (!verifyPatreonWebhook(request)) {
      return NextResponse.json({ error: "Firma inválida" }, { status: 401 })
    }

    const data = await request.json()
    const event = request.headers.get("X-Patreon-Event")

    console.log(`Webhook de Patreon recibido: ${event}`)

    // Procesar diferentes tipos de eventos
    switch (event) {
      case "members:pledge:create":
        await handlePledgeCreate(data)
        break
      case "members:pledge:update":
        await handlePledgeUpdate(data)
        break
      case "members:pledge:delete":
        await handlePledgeDelete(data)
        break
      default:
        console.log(`Evento no manejado: ${event}`)
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error al procesar webhook de Patreon:", error)
    return NextResponse.json({ error: "Error al procesar webhook" }, { status: 500 })
  }
}

// Manejar creación de una nueva membresía
async function handlePledgeCreate(data: any) {
  const member = data.data
  const included = data.included || []

  // Encontrar el usuario de Patreon en los datos incluidos
  const patreonUser = included.find(
    (item: any) => item.type === "user" && item.id === member.relationships?.user?.data?.id,
  )

  if (!patreonUser) {
    console.error("No se encontró información del usuario en los datos")
    return
  }

  // Buscar si ya tenemos este usuario en nuestra base de datos
  const userEmail = patreonUser.attributes.email
  const user = await prisma.user.findUnique({
    where: { email: userEmail },
  })

  // Si no existe el usuario, podríamos crear uno o simplemente registrar la membresía
  if (!user) {
    console.log(`Usuario con email ${userEmail} no encontrado en nuestra base de datos`)
    return
  }

  // Actualizar el estado del usuario a premium
  await prisma.user.update({
    where: { id: user.id },
    data: {
      isPremium: true,
      premiumSince: new Date(),
    },
  })

  // Añadir la insignia de usuario premium
  const premiumBadge = await prisma.badge.findFirst({
    where: { id: "premium-supporter" },
  })

  if (!premiumBadge) {
    // Crear la insignia si no existe
    await prisma.badge.create({
      data: {
        id: "premium-supporter",
        name: "Usuario Premium",
        description: "Apoya a BarkAndMeow y tiene plaza reservada en eventos",
        imageUrl: "/badges/premium.png",
      },
    })
  }

  // Verificar si el usuario ya tiene la insignia
  const existingBadge = await prisma.userBadge.findFirst({
    where: {
      userId: user.id,
      badgeId: "premium-supporter",
    },
  })

  if (!existingBadge) {
    // Añadir la insignia si no la tiene
    await prisma.userBadge.create({
      data: {
        userId: user.id,
        badgeId: "premium-supporter",
        awardedAt: new Date(),
      },
    })
  }

  // Actualizar cualquier intención de donación pendiente
  await prisma.donationIntent.updateMany({
    where: {
      userId: user.id,
      status: "pending",
    },
    data: {
      status: "completed",
      completedAt: new Date(),
    },
  })

  console.log(`Usuario ${user.id} actualizado a premium y se le ha otorgado la insignia`)
}

// Manejar actualización de una membresía existente
async function handlePledgeUpdate(data: any) {
  // Similar a handlePledgeCreate para renovaciones
  await handlePledgeCreate(data)
}

// Manejar eliminación de una membresía
async function handlePledgeDelete(data: any) {
  const member = data.data
  const included = data.included || []

  // Encontrar el usuario de Patreon
  const patreonUser = included.find(
    (item: any) => item.type === "user" && item.id === member.relationships?.user?.data?.id,
  )

  if (!patreonUser) {
    console.error("No se encontró información del usuario en los datos")
    return
  }

  // Buscar el usuario en nuestra base de datos
  const userEmail = patreonUser.attributes.email
  const user = await prisma.user.findUnique({
    where: { email: userEmail },
  })

  if (!user) {
    console.log(`Usuario con email ${userEmail} no encontrado en nuestra base de datos`)
    return
  }

  // No eliminamos la insignia, pero actualizamos el estado premium
  await prisma.user.update({
    where: { id: user.id },
    data: {
      isPremium: false,
      premiumUntil: new Date(), // Fecha en que terminó su membresía
    },
  })

  console.log(`Membresía premium cancelada para el usuario ${user.id}`)
}

