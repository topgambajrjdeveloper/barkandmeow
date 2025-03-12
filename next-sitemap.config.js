/** @type {import('next-sitemap').IConfig} */
module.exports = {
    siteUrl: process.env.SITE_URL || "https://barkandmeow.app", // Actualizado con el nuevo nombre
    generateRobotsTxt: true,
    exclude: ["/server-sitemap.xml"],
    outDir: '.next',
    robotsTxtOptions: {
      additionalSitemaps: [
        "https://barkandmeow.app/server-sitemap.xml", // Actualizado con el nuevo nombre
      ],
    },
  }
  
  