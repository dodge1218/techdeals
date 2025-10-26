import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET(request: NextRequest) {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'

  const products = await prisma.product.findMany({
    where: { isActive: true },
    select: { id: true, updatedAt: true },
  })

  const articles = await prisma.article.findMany({
    where: { status: 'published' },
    select: { slug: true, updatedAt: true },
  })

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${baseUrl}</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>${baseUrl}/deals</loc>
    <changefreq>hourly</changefreq>
    <priority>0.9</priority>
  </url>
${articles.map(a => `  <url>
    <loc>${baseUrl}/article/${a.slug}</loc>
    <lastmod>${a.updatedAt.toISOString()}</lastmod>
    <priority>0.7</priority>
  </url>`).join('\n')}
${products.slice(0, 100).map(p => `  <url>
    <loc>${baseUrl}/product/${p.id}</loc>
    <lastmod>${p.updatedAt.toISOString()}</lastmod>
    <priority>0.7</priority>
  </url>`).join('\n')}
</urlset>`

  await prisma.$disconnect()

  return new NextResponse(xml, {
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 'public, max-age=3600',
    },
  })
}
