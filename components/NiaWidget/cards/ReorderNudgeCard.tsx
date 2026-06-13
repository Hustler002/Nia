'use client';

// ReorderNudgeCard.tsx
// Proactive reorder card powered by AI consumption tracking.
// Shows product info, a consumption-cycle progress bar that changes color
// based on urgency, a quantity selector, and an add-to-cart CTA.
// Production: wire up addToCart to the real cart API / Zustand action.

import { useState } from 'react';
import type { ReorderNudge } from '@/lib/useNiaStore';

interface ReorderNudgeCardProps {
  nudge: ReorderNudge;
  content: string;
}

export default function ReorderNudgeCard({ nudge, content }: ReorderNudgeCardProps) {
  const [qty, setQty] = useState(1);
  const { product } = nudge;

  // ─── Derived values ──────────────────────────────────────────────────────
  const percentUsed = Math.min(100, Math.max(0, product.percentUsed));

  // How many days remain before the product is estimated to run out
  const daysRemaining = Math.max(
    0,
    product.cycleDays - Math.round(product.cycleDays * percentUsed / 100),
  );

  // Progress-bar color ramps from teal → orange → red as usage climbs
  const barColor =
    percentUsed >= 90
      ? 'bg-red-400'
      : percentUsed >= 70
        ? 'bg-[#FF9900]'
        : 'bg-[#00838F]';

  // Matching text color for the "XX% used" label
  const labelColor =
    percentUsed >= 90
      ? 'text-red-400'
      : percentUsed >= 70
        ? 'text-[#FF9900]'
        : 'text-[#00838F]';

  // ─── Quantity helpers ────────────────────────────────────────────────────
  const decrement = () => setQty((q) => Math.max(1, q - 1));
  const increment = () => setQty((q) => q + 1);

  return (
    <div
      className="
        bg-white rounded-2xl p-4
        border-l-4 border-[#00838F]
        shadow-sm
      "
    >
      {/* ── Content text ──────────────────────────────────────────────── */}
      <p className="text-sm text-[#0F1111] mb-3">{content}</p>

      {/* ── Product info row ──────────────────────────────────────────── */}
      <div className="flex items-center gap-3 mb-1">
        {/* Emoji product image */}
        <span className="text-3xl leading-none" role="img" aria-label={product.name}>
          {product.image}
        </span>
        <div className="flex flex-col">
          <span className="text-sm font-semibold text-[#0F1111]">{product.name}</span>
        </div>
      </div>

      {/* Price */}
      <p className="text-lg font-bold text-[#0F1111] mb-0.5">
        ₹{product.price.toLocaleString('en-IN')}
      </p>

      {/* Last-ordered meta */}
      <p className="text-xs text-gray-400 mb-4">
        Last ordered: {product.lastOrdered}
      </p>

      {/* ── Consumption cycle visualization ───────────────────────────── */}
      <div className="mb-4">
        {/* "XX% used" label — positioned proportionally above the bar */}
        <div className="relative h-4 mb-1">
          {/*
            We clamp the left offset between 0 % and ~92 % so the label
            never overflows the card on either side.
          */}
          <span
            className={`absolute text-[10px] font-bold ${labelColor} -translate-x-1/2`}
            style={{ left: `${Math.min(92, Math.max(4, percentUsed))}%` }}
          >
            {percentUsed}% used
          </span>
        </div>

        {/* Bar track */}
        <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
          {/* Animated fill — width animates on mount via CSS transition */}
          <div
            className={`h-full rounded-full ${barColor} transition-all duration-700 ease-out`}
            style={{ width: `${percentUsed}%` }}
          />
        </div>

        {/* Labels below the bar */}
        <div className="flex justify-between mt-1">
          <span className="text-[10px] text-gray-400">Last ordered</span>
          <span className="text-[10px] text-gray-400">
            Runs out ~{daysRemaining} days
          </span>
        </div>
      </div>

      {/* ── Quantity selector ─────────────────────────────────────────── */}
      <div className="flex items-center gap-3 mb-3">
        <button
          type="button"
          onClick={decrement}
          aria-label="Decrease quantity"
          className="
            w-8 h-8 rounded-full
            border border-gray-200
            flex items-center justify-center
            text-[#0F1111] text-sm font-medium
            hover:bg-gray-50 active:scale-95
            transition
          "
        >
          −
        </button>

        <span className="text-sm font-semibold text-[#0F1111] min-w-[1.25rem] text-center">
          {qty}
        </span>

        <button
          type="button"
          onClick={increment}
          aria-label="Increase quantity"
          className="
            w-8 h-8 rounded-full
            border border-gray-200
            flex items-center justify-center
            text-[#0F1111] text-sm font-medium
            hover:bg-gray-50 active:scale-95
            transition
          "
        >
          +
        </button>
      </div>

      {/* ── Add to cart CTA ───────────────────────────────────────────── */}
      <button
        type="button"
        className="
          bg-[#00838F] text-white
          rounded-xl py-2.5 px-5 w-full
          text-sm font-semibold
          hover:bg-[#006d75]
          active:scale-[0.98]
          transition
        "
      >
        Add to cart
      </button>

      {/* ── AI attribution ────────────────────────────────────────────── */}
      <p className="text-[10px] text-gray-300 italic text-center mt-2">
        Powered by AI consumption tracking
      </p>
    </div>
  );
}

// Production extension:
// - Wire addToCart to Zustand cart store / DynamoDB CartService
// - Animate the progress bar fill on first mount with useEffect + state toggle
// - Fire analytics event on quantity change and add-to-cart click
// - Support "Subscribe & Save" toggle for recurring deliveries
// - Fetch real-time price and stock from Product Catalog API
// - Deep-link product name to full PDP within the widget
