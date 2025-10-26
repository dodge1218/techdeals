import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getLLMProvider } from '@/lib/llm-provider';
import { addDisclosure } from '@/lib/compliance';

export async function POST(request: Request) {
  try {
    const { productIds, niche, title } = await request.json();
    
    if (!productIds || productIds.length === 0) {
      return NextResponse.json(
        { error: 'Product IDs required' },
        { status: 400 }
      );
    }
    
    const products = await db.product.findMany({
      where: { id: { in: productIds } },
      include: { deals: { where: { isActive: true } } },
    });
    
    const productInfo = products.map(p => 
      `${p.title} (${p.brand}) - ${p.category}`
    ).join(', ');
    
    const prompt = `Write a detailed article about these products for ${niche || 'tech enthusiasts'}: ${productInfo}. 
    Title: ${title || 'Product Review'}. 
    Include 5-10 purchase links throughout. Explain why each product is valuable.`;
    
    const llm = getLLMProvider();
    const content = await llm.complete(prompt, 1500);
    const contentWithDisclosure = addDisclosure(content);
    
    const slug = (title || 'article')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')
      + '-' + Date.now();
    
    const article = await db.article.create({
      data: {
        title: title || 'Generated Article',
        slug,
        content: contentWithDisclosure,
        excerpt: content.substring(0, 200) + '...',
        niche: niche || 'general',
        products: {
          connect: productIds.map((id: string) => ({ id })),
        },
      },
      include: {
        products: true,
      },
    });
    
    return NextResponse.json(article);
  } catch (error) {
    console.error('Article generation error:', error);
    return NextResponse.json(
      { error: 'Failed to generate article' },
      { status: 500 }
    );
  }
}
