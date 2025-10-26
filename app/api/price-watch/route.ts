import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST(request: Request) {
  try {
    const { productId, targetPrice, email } = await request.json();
    
    if (!productId || !targetPrice || !email) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const watch = await db.priceWatch.create({
      data: {
        email,
        targetPrice,
        expiresAt: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
        product: {
          connect: { id: productId }
        }
      },
    });
    
    return NextResponse.json(watch);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to create price watch' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const watches = await db.priceWatch.findMany({
      where: { notified: false },
      take: 100,
    });
    
    return NextResponse.json(watches);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch price watches' },
      { status: 500 }
    );
  }
}
