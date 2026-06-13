// components/RitualRow.tsx
// Horizontally scrollable row of reorderable ritual bundles
// Production: pattern detection via Amazon Personalize + DynamoDB order history

'use client';

import { rituals } from '@/lib/mockData';
import RitualCard from './RitualCard';

export default function RitualRow() {
  return (
    <section className="py-8 px-4 bg-gray-50/50">
      <div className="max-w-7xl mx-auto">
        {/* Section header */}
        <div className="flex items-center gap-2 mb-4">
          <h2 className="text-xl font-bold text-[#0F1111]">Your usual orders</h2>
          <span className="text-lg">⚡</span>
        </div>

        {/* Scrollable row */}
        <div className="flex gap-3 overflow-x-auto pb-4 -mx-4 px-4 snap-x snap-mandatory scrollbar-hide">
          {rituals.map((ritual) => (
            <div key={ritual.id} className="snap-start">
              <RitualCard ritual={ritual} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
