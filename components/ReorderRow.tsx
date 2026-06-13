// components/ReorderRow.tsx
// Horizontally scrollable row of AI-predicted reorder items
// Production: data from Amazon Personalize consumption-cycle predictions

'use client';

import { reorderProducts } from '@/lib/mockData';
import ProductReorderCard from './ProductReorderCard';

export default function ReorderRow() {
  return (
    <section className="py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Section header */}
        <div className="flex items-center gap-2 mb-4">
          <h2 className="text-xl font-bold text-[#0F1111]">Running low?</h2>
          <span className="text-lg" title="AI-predicted based on your purchase history">
            ✨
          </span>
          <span className="text-xs bg-[#E0F2F1] text-[#00838F] font-semibold px-2 py-0.5 rounded-full">
            AI predicted
          </span>
        </div>

        {/* Scrollable row */}
        <div className="flex gap-3 overflow-x-auto pb-4 -mx-4 px-4 snap-x snap-mandatory scrollbar-hide">
          {reorderProducts.map((product) => (
            <div key={product.id} className="snap-start">
              <ProductReorderCard product={product} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
