import { NextResponse } from 'next/server';
import prisma from '@/lib/prismadb';

export async function GET() {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  
  // Obtener datos dinámicos
  const pets = await prisma.pet.findMany({ select: { id: true } });
  const users = await prisma.user.findMany({ select: { id: true } });
  
  // Crear el XML
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
    <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
      <url>
        <loc>${baseUrl}</loc>
        <lastmod>${new Date().toISOString()}</lastmod>
        <priority>1.0</priority>
      </url>
      ${pets.map(pet => `
        <url>
          <loc>${baseUrl}/pets/${pet.id}</loc>
          <lastmod>${new Date().toISOString()}</lastmod>
          <priority>0.7</priority>
        </url>
      `).join('')}
      ${users.map(user => `
        <url>
          <loc>${baseUrl}/profile/${user.id}</loc>
          <lastmod>${new Date().toISOString()}</lastmod>
          <priority>0.6</priority>
        </url>
      `).join('')}
    </urlset>`;
  
  // Configurar la respuesta como XML
  return new NextResponse(xml, {
    headers: {
      'Content-Type': 'application/xml',
    },
  });
}