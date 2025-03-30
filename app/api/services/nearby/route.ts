import { NextResponse } from "next/server"
import { auth } from "@/auth"

// Datos de ejemplo para servicios cercanos
const sampleServices = [
  // Veterinarios
  {
    id: "vet1",
    title: "Clínica Veterinaria Central",
    description: "Atención veterinaria completa para todas las mascotas",
    category: "vets",
    location: { latitude: 40.416775, longitude: -3.70379 },
  },
  {
    id: "vet2",
    title: "Hospital Veterinario 24h",
    description: "Servicio de emergencia disponible las 24 horas",
    category: "vets",
    location: { latitude: 40.426775, longitude: -3.71379 },
  },

  // Tiendas
  {
    id: "shop1",
    title: "PetShop Deluxe",
    description: "Todo lo que tu mascota necesita",
    category: "shops",
    location: { latitude: 40.417775, longitude: -3.69379 },
  },
  {
    id: "shop2",
    title: "Accesorios para Mascotas",
    description: "Juguetes, camas, y más para tus amigos peludos",
    category: "shops",
    location: { latitude: 40.415775, longitude: -3.72379 },
  },

  // Cafés pet-friendly
  {
    id: "cafe1",
    title: "Café Patitas",
    description: "Café acogedor donde tu mascota es bienvenida",
    category: "pet-friendly",
    location: { latitude: 40.418775, longitude: -3.68379 },
  },
  {
    id: "cafe2",
    title: "La Terraza Canina",
    description: "Disfruta de un café con tu mascota en nuestra terraza",
    category: "pet-friendly",
    location: { latitude: 40.414775, longitude: -3.73379 },
  },
  

  // Quedadas
  {
    id: "meetup1",
    title: "Paseo Grupal en el Parque",
    description: "Únete a otros dueños de mascotas para un paseo divertido",
    category: "meetups",
    location: { latitude: 40.420775, longitude: -3.66379 },
  },
  {
    id: "meetup2",
    title: "Entrenamiento Canino Grupal",
    description: "Aprende técnicas de entrenamiento con otros dueños",
    category: "meetups",
    location: { latitude: 40.412775, longitude: -3.75379 },
  },
]

// Función para calcular la distancia entre dos puntos (fórmula de Haversine)
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371 // Radio de la Tierra en km
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLon = ((lon2 - lon1) * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) * Math.sin(dLon / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

export async function GET(request: Request) {
  try {
    const session = await auth()

    if (!session || !session.user) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    // Obtener parámetros de la URL
    const { searchParams } = new URL(request.url)
    const lat = Number.parseFloat(searchParams.get("lat") || "0")
    const lng = Number.parseFloat(searchParams.get("lng") || "0")
    const radius = Number.parseFloat(searchParams.get("radius") || "5")

    if (!lat || !lng) {
      return NextResponse.json({ error: "Parámetros de ubicación inválidos" }, { status: 400 })
    }

    // Filtrar servicios por distancia
    const nearbyServices = sampleServices
      .map((service) => {
        const distance = calculateDistance(lat, lng, service.location.latitude, service.location.longitude)
        return { ...service, distance }
      })
      .filter((service) => service.distance <= radius)

    return NextResponse.json(nearbyServices)
  } catch (error) {
    console.error("Error fetching nearby services:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}

