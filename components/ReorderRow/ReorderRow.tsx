// components/ReorderRow/ReorderRow.tsx
// Horizontally scrollable row of AI-predicted reorder items
// Uses the consumption engine to derive "running low" predictions
// "See all predictions" expands to show ALL items (not just 7-day window)
// Production: data from Amazon Personalize consumption-cycle predictions

'use client';

import { useState, useEffect } from 'react';
import { getRunningLowItems, getAllPredictions } from '@/lib/personalization/consumptionEngine';
import type { ConsumptionCycle } from '@/lib/personalization/consumptionEngine';
import ProductReorderCard from './ProductReorderCard';

export default function ReorderRow() {
  const [items, setItems] = useState<ConsumptionCycle[]>([]);
  const [allItems, setAllItems] = useState<ConsumptionCycle[]>([]);
  const [showAll, setShowAll] = useState(false);
  // Track mount state so we can trigger the entrance animation exactly once
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const data = getRunningLowItems();
    setItems(data);
    // Small RAF delay ensures the initial opacity-0 frame is painted before
    // we flip to the visible state, giving the browser a chance to animate.
    requestAnimationFrame(() => setMounted(true));
  }, []);

  const handleShowAll = () => {
    if (!showAll) {
      // Lazy-load all predictions on first click
      if (allItems.length === 0) {
        setAllItems(getAllPredictions());
      }
      setShowAll(true);
    } else {
      setShowAll(false);
    }
  };

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

            {/* ── See all predictions toggle ─────────────────────── */}
            <div className="flex justify-end mt-2">
              <button
                onClick={handleShowAll}
                className="text-[#007185] text-xs font-semibold hover:text-[#C45500] hover:underline cursor-pointer transition-colors"
              >
                {showAll ? '← Show less' : 'See all predictions →'}
              </button>
            </div>

            {/* ── Expanded predictions grid ──────────────────────── */}
            {showAll && allItems.length > 0 && (
              <div className="mt-4 bg-white rounded-sm border border-[#D5D9D9] overflow-hidden">
                <div className="px-4 py-3 bg-[#F7F8F8] border-b border-[#D5D9D9]">
                  <h3 className="text-sm font-bold text-[#0F1111]">All Consumption Predictions</h3>
                  <p className="text-[11px] text-gray-400 mt-0.5">{allItems.length} items tracked · sorted by urgency</p>
                </div>
                <div className="divide-y divide-gray-100">
                  {allItems.map((cycle) => {
                    const isUrgent = cycle.daysUntilRunOut <= 2;
                    const isSoon = cycle.daysUntilRunOut <= 7 && !isUrgent;
                    const statusColor = isUrgent
                      ? 'text-red-600 bg-red-50'
                      : isSoon
                        ? 'text-amber-600 bg-amber-50'
                        : 'text-green-600 bg-green-50';
                    const statusLabel = isUrgent
                      ? 'Reorder now'
                      : isSoon
                        ? `${cycle.daysUntilRunOut}d left`
                        : `~${cycle.daysUntilRunOut}d left`;

                    return (
                      <div key={cycle.productId} className="flex items-center gap-4 px-4 py-3 hover:bg-[#F7F8F8] transition-colors">
                        {/* Product */}
                        <span className="text-2xl flex-shrink-0">{cycle.image}</span>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-[#0F1111] truncate">{cycle.productName}</p>
                          <p className="text-[11px] text-gray-400">
                            {cycle.category} · {cycle.unit} · every ~{Math.round(cycle.avgDaysBetweenOrders)}d
                          </p>
                        </div>

                        {/* Usage bar */}
                        <div className="hidden sm:block w-20 flex-shrink-0">
                          <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all ${
                                isUrgent ? 'bg-red-500' : isSoon ? 'bg-amber-400' : 'bg-green-400'
                              }`}
                              style={{ width: `${Math.min(cycle.percentUsed, 100)}%` }}
                            />
                          </div>
                          <p className="text-[10px] text-gray-400 mt-0.5 text-center">{cycle.percentUsed}% used</p>
                        </div>

                        {/* Status badge */}
                        <span className={`flex-shrink-0 text-[10px] font-bold px-2 py-1 rounded-sm ${statusColor}`}>
                          {statusLabel}
                        </span>

                        {/* Confidence */}
                        <span className={`hidden md:inline-flex flex-shrink-0 text-[10px] font-medium px-1.5 py-0.5 rounded-sm border ${
                          cycle.confidence === 'high'
                            ? 'text-[#007185] bg-[#F7FAFA] border-[#007185]/30'
                            : cycle.confidence === 'medium'
                              ? 'text-amber-600 bg-amber-50 border-amber-200'
                              : 'text-gray-500 bg-gray-50 border-gray-200'
                        }`}>
                          {cycle.confidence}
                        </span>

                        {/* Price */}
                        <span className="flex-shrink-0 text-sm font-bold text-[#0F1111]">₹{cycle.price}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
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
              You&apos;re well stocked! 🎉
            </p>
            <p className="text-sm text-gray-400 mt-1">
              Nia will nudge you when it&apos;s time to reorder.
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
