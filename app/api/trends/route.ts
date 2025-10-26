import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const signal = searchParams.get('signal');
  const hours = parseInt(searchParams.get('hours') || '24');
  
  try {
    const since = new Date(Date.now() - hours * 60 * 60 * 1000);
    
    const trends = await db.trend.findMany({
      where: {
        ...(signal && { signal }),
        timestamp: {
          gte: since,
        },
      },
      include: {
        product: true,
      },
      orderBy: {
        timestamp: 'desc',
      },
      take: 100,
    });
    
    return NextResponse.json(trends);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch trends' }, { status: 500 });
  }
}
