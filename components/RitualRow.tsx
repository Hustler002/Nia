// components/RitualRow.tsx
// Horizontally scrollable row of recurring purchase bundles
// Data from ritualsEngine — detects repeated purchase patterns for the user
// Falls back to mockData if no history yet

'use client';

import { useEffect, useState } from 'react';
import RitualCard from './RitualCard';
import { rituals } from '@/lib/mockData';
import { detectRituals } from '@/lib/ritualsEngine';
import { useUser } from '@clerk/nextjs';

export default function RitualRow() {
  const { user } = useUser();
  const [items, setItems] = useState(rituals); // start with mock
  const [isLive, setIsLive] = useState(false);

  useEffect(() => {
    if (!user?.id) return;
    detectRituals(user.id).then((liveRituals) => {
      if (liveRituals.length > 0) {
        // Map engine output to shape RitualCard expects
        const mapped = liveRituals.map((r) => ({
          id: r.id,
          name: r.name,
          description: `You order this every ~${(r as any).frequencyDays ?? r.lastOrderedDaysAgo ?? 7} days`,
          emoji: r.items[0]?.image || '⚡',
          items: r.items.map((item: any) => ({
            id: item.id,
            name: item.name,
            price: item.price,
            mrp: item.mrp,
            image: item.image,
            qty: item.qty,
            category: item.category,
          })),
          totalPrice: r.totalPrice,
          savings: 0,
          frequency: `Every ${(r as any).frequencyDays ?? r.lastOrderedDaysAgo ?? 7} days`,
        }));
        setItems(mapped as any);
        setIsLive(true);
      }
    }).catch(() => {/* silently fall back to mock */});
  }, [user?.id]);

  return (
    <section className="py-8 px-4 bg-gray-50/50">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center gap-2 mb-4">
          <h2 className="text-xl font-bold text-[#0F1111]">Your usual orders</h2>
          <span className="text-lg">⚡</span>
          {isLive && (
            <span className="text-xs bg-[#FFF3E0] text-[#FF9900] font-semibold px-2 py-0.5 rounded-full">
              Learned from your history
            </span>
          )}
        </div>

        <div className="flex gap-3 overflow-x-auto pb-4 -mx-4 px-4 snap-x snap-mandatory scrollbar-hide">
          {items.map((ritual) => (
            <div key={ritual.id} className="snap-start">
              <RitualCard ritual={ritual as any} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
