'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface Trend {
  id: string;
  signal: string;
  metric: string;
  value: number;
  timestamp: Date | string;
  product: {
    title: string;
    category: string;
  };
}

export function TrendChart({ trends }: { trends: Trend[] }) {
  const signalColors: Record<string, string> = {
    price_drop: 'bg-green-500',
    price_spike: 'bg-red-500',
    media_mention: 'bg-blue-500',
    search_volume: 'bg-purple-500',
    social_buzz: 'bg-yellow-500',
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Trending Now</CardTitle>
        <CardDescription>Real-time market signals</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {trends.map((trend) => (
            <div key={trend.id} className="flex items-center justify-between border-b pb-3 last:border-0">
              <div className="flex-1">
                <div className="font-medium line-clamp-1">{trend.product.title}</div>
                <div className="text-sm text-muted-foreground">
                  <Badge variant="outline" className="mr-2">{trend.product.category}</Badge>
                  <span className="capitalize">{trend.signal.replace('_', ' ')}</span>
                </div>
              </div>
              <div className="text-right">
                <div className={`inline-flex items-center px-3 py-1 rounded-full text-white text-sm font-medium ${signalColors[trend.signal] || 'bg-gray-500'}`}>
                  {trend.value > 0 ? '+' : ''}{trend.value.toFixed(1)}
                  {trend.metric === 'percentage' && '%'}
                </div>
              </div>
            </div>
          ))}
          {trends.length === 0 && (
            <p className="text-center text-muted-foreground py-8">
              No trends detected yet
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
