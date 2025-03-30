import type { MetadataRoute } from "next";
import prisma from "@/lib/prismadb";

// Función para obtener la fecha de última modificación en formato ISO
function getLastModified(date?: Date): string {
  return date ? new Date(date).toISOString() : new Date().toISOString();
}

// Función principal que genera el sitemap
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3001";

  // Rutas estáticas (páginas que siempre existen)
  const staticRoutes = [
    {
      url: `${baseUrl}`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: `${baseUrl}/explore`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/feed`,
      lastModified: new Date(),
      changeFrequency: "hourly",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/contact`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: `${baseUrl}/privacy`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.3,
    },
    {
      url: `${baseUrl}/terms`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.3,
    },
    {
        url: `${baseUrl}/cookies`,
        lastModified: new Date(),
        changeFrequency: "monthly",
        priority: 0.3,
      },
  ] as MetadataRoute.Sitemap;

  // Obtener rutas dinámicas de la base de datos
  try {    

    // Obtener todos los eventos
    const events = await prisma.event.findMany({
      where: {
        isPublished: true,
      },
      select: {
        id: true,
        updatedAt: true,
      },
    });

    const eventRoutes = events.map((event) => ({
      url: `${baseUrl}/events/${event.id}`,
      lastModified: getLastModified(event.updatedAt),
      changeFrequency: "weekly" as const,
      priority: 0.7,
    }));
        
    // Combinar todas las rutas
    return [...staticRoutes, ...eventRoutes];
  } catch (error) {
    console.error("Error generating sitemap:", error);
    // Si hay un error, devolver al menos las rutas estáticas
    return staticRoutes;
  }
}