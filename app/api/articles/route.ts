import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const niche = searchParams.get('niche');
  
  try {
    const articles = await db.article.findMany({
      where: niche ? { niche } : undefined,
      include: {
        products: true,
      },
      orderBy: {
        publishedAt: 'desc',
      },
      take: 20,
    });
    
    return NextResponse.json(articles);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch articles' }, { status: 500 });
  }
}
