import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { articleGenerator } from '@/services/writer/article-generator';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { niche, productIds } = body;

    if (!niche || !Array.isArray(productIds) || productIds.length < 5) {
      return NextResponse.json(
        { error: 'Niche and at least 5 product IDs required' },
        { status: 400 }
      );
    }

    // Fetch products
    const products = await prisma.product.findMany({
      where: { id: { in: productIds } },
      include: {
        offers: {
          orderBy: { price: 'asc' },
          take: 1,
        },
      },
    });

    if (products.length < 5) {
      return NextResponse.json(
        { error: 'At least 5 valid products required' },
        { status: 400 }
      );
    }

    // Generate article
    const outline = await articleGenerator.generateRoundup({
      niche,
      products: products.map((p) => ({
        id: p.id,
        title: p.title,
        description: p.description || undefined,
        price: p.offers[0]?.price || 0,
        vendor: p.offers[0]?.vendor || 'unknown',
      })),
    });

    const content = articleGenerator.generateHTML(outline);

    // Create article
    const slug = niche
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');

    const article = await prisma.article.create({
      data: {
        title: outline.title,
        slug: `${slug}-${Date.now()}`,
        excerpt: outline.excerpt,
        content,
        niche,
        status: 'draft',
        seoTitle: outline.title.slice(0, 60),
        seoDescription: outline.excerpt.slice(0, 160),
      },
    });

    // Create article links
    for (let i = 0; i < products.length; i++) {
      await prisma.articleLink.create({
        data: {
          articleId: article.id,
          productId: products[i].id,
          position: i + 1,
        },
      });
    }

    return NextResponse.json({
      success: true,
      article: {
        id: article.id,
        slug: article.slug,
        title: article.title,
      },
    });
  } catch (error: any) {
    console.error('Article generation failed:', error);
    return NextResponse.json(
      { error: error.message || 'Article generation failed' },
      { status: 500 }
    );
  }
}
