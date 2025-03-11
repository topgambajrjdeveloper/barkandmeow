/** @type {import('next-sitemap').IConfig} */
module.exports = {
    siteUrl: process.env.SITE_URL || "https://barkandmeow.com", // Actualizado con el nuevo nombre
    generateRobotsTxt: true,
    exclude: ["/server-sitemap.xml"],
    robotsTxtOptions: {
      additionalSitemaps: [
        "https://barkandmeow.com/server-sitemap.xml", // Actualizado con el nuevo nombre
      ],
    },
  }
  
  