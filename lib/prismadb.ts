import { PrismaClient } from "@prisma/client"

// Declarar un tipo para el objeto global con nuestra propiedad prisma
declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined
}

// Crear una instancia de PrismaClient
const client = globalThis.prisma || new PrismaClient()

// En desarrollo, asignar la instancia a la variable global para reutilizarla
// En producción, esto no tiene efecto
if (process.env.NODE_ENV !== "production") {
  globalThis.prisma = client
}

// Exportar la instancia de PrismaClient
export default client

