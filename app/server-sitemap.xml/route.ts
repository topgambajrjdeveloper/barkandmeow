import { getServerSideSitemap } from "next-sitemap"
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

export async function GET() {
  const pets = await prisma.pet.findMany({
    select: { id: true },
  })

  const users = await prisma.user.findMany({
    select: { id: true },
  })

  const petFields = pets.map((pet) => ({
    loc: `https://barkandmeow.com/pets/${pet.id}`, // Actualizado con el nuevo nombre
    lastmod: new Date().toISOString(),
  }))

  const userFields = users.map((user) => ({
    loc: `https://barkandmeow.com/profile/${user.id}`, // Actualizado con el nuevo nombre
    lastmod: new Date().toISOString(),
  }))

  const fields = [...petFields, ...userFields]

  return getServerSideSitemap(fields)
}

