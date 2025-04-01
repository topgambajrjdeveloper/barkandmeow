import type { MetadataRoute } from "next"

export default function robots(): MetadataRoute.Robots {
  const baseUrl = 'https://barkandmeow.app';

  return {
    rules: [
      {
        userAgent: "Googlebot",
        allow: ["/"],
        disallow: ["/private/", "/admin/"],
        crawlDelay: 2, // Segundos entre solicitudes (solo para algunos bots)
      },
      {
        userAgent: ["Bingbot", "Yandex"],
        allow: "/",
        disallow: ["/private/", "/admin/", "/api/"],
      },
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/api/", "/admin/", "/private/", "/login", "/register"],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
    host: baseUrl, // Opcional: especifica el host canónico
  }
}