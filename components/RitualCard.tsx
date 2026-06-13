// components/RitualCard.tsx
// Card for "Your Rituals" row — named bundles the user orders repeatedly
// Production: order patterns detected via Amazon Personalize, stored in DynamoDB

'use client';

import { useState } from 'react';
import type { Ritual } from '@/lib/mockData';

export default function RitualCard({ ritual }: { ritual: Ritual }) {
  const [reordered, setReordered] = useState(false);

  const handleReorder = () => {
    setReordered(true);
    setTimeout(() => setReordered(false), 2500);
  };

  return (
    <div className="flex-shrink-0 w-64 sm:w-72 bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden group">
      {/* Header strip */}
      <div className="bg-gradient-to-r from-[#00838F]/5 to-[#00838F]/10 px-4 py-3 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <span className="text-xl">{ritual.emoji}</span>
          <h3 className="text-sm font-bold text-[#0F1111] truncate">{ritual.name}</h3>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Items preview */}
        <div className="space-y-1 mb-3">
          {ritual.items.slice(0, 3).map((item, i) => (
            <p key={i} className="text-xs text-gray-500 flex items-center gap-1.5">
              <span className="w-1 h-1 rounded-full bg-[#00838F]/40 flex-shrink-0" />
              {item}
            </p>
          ))}
          {ritual.items.length > 3 && (
            <p className="text-xs text-[#00838F] font-medium">
              +{ritual.items.length - 3} more items
            </p>
          )}
        </div>

        {/* Meta row */}
        <div className="flex items-center justify-between text-xs text-gray-400 mb-3">
          <span>{ritual.itemCount} items</span>
          <span>Last: {ritual.lastOrdered}</span>
        </div>

        {/* Reorder button */}
        {!reordered ? (
          <button
            onClick={handleReorder}
            className="w-full py-2.5 bg-[#00838F] hover:bg-[#006d75] text-white text-sm font-semibold rounded-xl transition-all duration-200 shadow-sm hover:shadow-md active:scale-[0.98]"
          >
            Reorder · ₹{ritual.total}
          </button>
        ) : (
          <div className="w-full py-2.5 bg-green-50 text-green-600 text-sm font-semibold rounded-xl text-center flex items-center justify-center gap-2">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
            </svg>
            Added to cart!
          </div>
        )}
      </div>
    </div>
  );
}
