// components/ReorderRow.tsx
// Horizontally scrollable row of AI-predicted reorder items
// Data from consumptionEngine — reads real order history from Supabase
// Falls back to mockData if Supabase not configured or no orders yet

'use client';

import { useEffect, useState } from 'react';
import ProductReorderCard from './ProductReorderCard';
import { reorderProducts } from '@/lib/mockData';
import { getInventoryStatus } from '@/lib/consumptionEngine';
import { useUser } from '@clerk/nextjs';

export default function ReorderRow() {
  const { user } = useUser();
  const [items, setItems] = useState(reorderProducts);
  const [isLive, setIsLive] = useState(false);

  useEffect(() => {
    if (!user?.id) return;
    getInventoryStatus(user.id).then((liveItems) => {
      if (liveItems.length > 0) {
        // Map engine output to the shape ProductReorderCard expects
        const mapped = liveItems.map((item) => ({
          id: item.id,
          name: item.name,
          price: item.price,
          mrp: item.mrp,
          image: item.image,
          category: item.category,
          unit: '1 unit',
          rating: 4.5,
          reviewCount: 100,
          percentUsed: item.percentUsed,
          daysUntilEmpty: item.daysUntilEmpty,
          status: item.status,
          lastOrdered: item.lastOrdered,
          cycleDays: 7,
        }));
        setItems(mapped as any);
        setIsLive(true);
      }
    }).catch(() => {/* silently fall back to mock */});
  }, [user?.id]);

  return (
    <section className="py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center gap-2 mb-4">
          <h2 className="text-xl font-bold text-[#0F1111]">Running low?</h2>
          <span className="text-lg" title="AI-predicted based on your purchase history">
            ✨
          </span>
          <span className="text-xs bg-[#E0F2F1] text-[#00838F] font-semibold px-2 py-0.5 rounded-full">
            {isLive ? 'Based on your orders' : 'AI predicted'}
          </span>
        </div>

        <div className="flex gap-3 overflow-x-auto pb-4 -mx-4 px-4 snap-x snap-mandatory scrollbar-hide">
          {items.map((product) => (
            <div key={product.id} className="snap-start">
              <ProductReorderCard product={product as any} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
