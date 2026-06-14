// components/ReorderRow/ReorderRow.tsx
// Horizontally scrollable row of AI-predicted reorder items
// Uses the consumption engine to derive "running low" predictions
// Production: data from Amazon Personalize consumption-cycle predictions

'use client';

import { useState, useEffect } from 'react';
import { getRunningLowItems } from '@/lib/personalization/consumptionEngine';
import type { ConsumptionCycle } from '@/lib/personalization/consumptionEngine';
import ProductReorderCard from './ProductReorderCard';
import { useNiaChatStore } from '@/lib/useNiaStore';

export default function ReorderRow() {
  const [items, setItems] = useState<ConsumptionCycle[]>([]);
  // Track mount state so we can trigger the entrance animation exactly once
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const data = getRunningLowItems();
    setItems(data);
    // Small RAF delay ensures the initial opacity-0 frame is painted before
    // we flip to the visible state, giving the browser a chance to animate.
    requestAnimationFrame(() => setMounted(true));
  }, []);

  return (
    <section className="py-8 px-4">
      <div
        className={`max-w-7xl mx-auto transition-all duration-700 ease-out ${
          mounted
            ? 'opacity-100 translate-y-0'
            : 'opacity-0 translate-y-6'
        }`}
      >
        {items.length > 0 ? (
          <>
            {/* ── Section header ─────────────────────────────────── */}
            <div className="flex items-center gap-2 mb-1">
              <h2 className="text-xl font-bold text-[#0F1111]">
                Running low? 📉
              </h2>
              <span
                className="text-lg"
                title="AI-predicted based on your purchase history"
              >
                ✨
              </span>
              <span className="text-[10px] bg-[#F7F8F8] text-[#007185] font-bold px-2 py-0.5 rounded-sm border border-[#D5D9D9]">
                AI predicted
              </span>
            </div>
            <p className="text-sm text-gray-400 mb-4">
              Nia predicts based on your order history
            </p>

            {/* ── Scrollable card row ────────────────────────────── */}
            <div className="flex gap-3 overflow-x-auto pb-4 -mx-4 px-4 snap-x snap-mandatory scrollbar-hide">
              {items.map((cycle) => (
                <div key={cycle.productId} className="snap-start">
                  <ProductReorderCard cycle={cycle} />
                </div>
              ))}
            </div>

            {/* ── Right-side predictions link ─────────────────────── */}
            <div className="flex justify-end mt-2">
              <button
                onClick={() =>
                  useNiaChatStore
                    .getState()
                    .open("Show me everything I'm likely running low on")
                }
                className="text-[#007185] text-xs font-semibold hover:text-[#C45500] hover:underline cursor-pointer transition-colors"
              >
                See all predictions →
              </button>
            </div>
          </>
        ) : (
          /* ── Empty state — user is well stocked ──────────────── */
          <div className="bg-white rounded-sm border border-[#D5D9D9] p-6 text-center">
            {/* Green checkmark circle */}
            <div className="w-14 h-14 mx-auto mb-3 rounded-full bg-green-100 flex items-center justify-center">
              <svg
                className="w-7 h-7 text-green-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M4.5 12.75l6 6 9-13.5"
                />
              </svg>
            </div>
            <p className="text-lg font-bold text-[#0F1111]">
              You're well stocked! 🎉
            </p>
            <p className="text-sm text-gray-400 mt-1">
              Nia will nudge you when it's time to reorder.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}

// Production extension:
// - Replace getRunningLowItems() with live API call to Amazon Personalize /consumption-cycles endpoint
// - Add skeleton/loading shimmer while data loads
// - Support drag-to-scroll and touch momentum on mobile
// - Track impression analytics for each card shown
// - A/B test section title copy ("Running low?" vs "Time to restock?")
