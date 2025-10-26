'use client';

interface PriceHistoryEntry {
  id: string;
  price: number;
  timestamp: Date;
  source: string;
}

interface PriceChartProps {
  history: PriceHistoryEntry[];
}

export function PriceChart({ history }: PriceChartProps) {
  if (history.length === 0) {
    return <div className="text-gray-500 text-center py-8">No price history available</div>;
  }

  // Simple text-based chart (upgrade to chart library later)
  const prices = history.map(h => h.price);
  const minPrice = Math.min(...prices);
  const maxPrice = Math.max(...prices);
  const currentPrice = history[0].price;

  return (
    <div className="border rounded-lg p-6">
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div>
          <div className="text-sm text-gray-600">Current</div>
          <div className="text-2xl font-bold">${currentPrice.toFixed(2)}</div>
        </div>
        <div>
          <div className="text-sm text-gray-600">30-Day Low</div>
          <div className="text-2xl font-bold text-green-600">${minPrice.toFixed(2)}</div>
        </div>
        <div>
          <div className="text-sm text-gray-600">30-Day High</div>
          <div className="text-2xl font-bold text-red-600">${maxPrice.toFixed(2)}</div>
        </div>
      </div>

      <div className="space-y-2">
        <div className="text-sm font-semibold text-gray-700 mb-3">Recent Price Changes</div>
        {history.slice(0, 10).map((entry) => (
          <div key={entry.id} className="flex items-center justify-between text-sm py-2 border-b">
            <span className="text-gray-600">
              {new Date(entry.timestamp).toLocaleDateString()}
            </span>
            <span className="font-semibold">${entry.price.toFixed(2)}</span>
            <span className="text-xs text-gray-500">{entry.source}</span>
          </div>
        ))}
      </div>

      <div className="mt-4 text-xs text-gray-500">
        💡 Tip: Prices tend to drop during Black Friday, Cyber Monday, and Prime Day events.
      </div>
    </div>
  );
}
