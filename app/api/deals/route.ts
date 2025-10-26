import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { generateAffiliateLink, detectRetailer } from '@/lib/affiliate';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get('category');
  const retailer = searchParams.get('retailer');
  
  try {
    const deals = await db.deal.findMany({
      where: {
        isActive: true,
        ...(retailer && { retailer }),
        ...(category && {
          product: { category }
        }),
      },
      include: {
        product: true,
      },
      orderBy: {
        discount: 'desc',
      },
      take: 50,
    });
    
    const dealsWithAffiliateLinks = deals.map(deal => ({
      ...deal,
      affiliateUrl: generateAffiliateLink(
        deal.url,
        detectRetailer(deal.url) || 'amazon'
      ),
    }));
    
    return NextResponse.json(dealsWithAffiliateLinks);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch deals' }, { status: 500 });
  }
}
