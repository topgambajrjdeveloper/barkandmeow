/** @type {import('next-sitemap').IConfig} */
module.exports = {
    siteUrl: process.env.NEXT_PUBLIC_APP_URL || process.env.NEXT_PUBLIC_APP_URL, // Actualizado con el nuevo nombre
    generateRobotsTxt: true,
    exclude: ["/server-sitemap.xml"],
    outDir: '.next',
    robotsTxtOptions: {
      additionalSitemaps: [
        // "https://barkandmeow.com/server-sitemap.xml",
        `https://${NEXT_PUBLIC_APP_URL}/server-sitemap.xml`
      ],
    },
  }
  
  