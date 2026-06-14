// components/ReorderRow/ProductReorderCard.tsx
// Compact card (~180px × ~260px) for the "Running Low?" horizontal reorder row.
// Renders AI-predicted consumption urgency, mini progress bar, qty selector,
// and a one-tap add-to-cart button wired to the global Zustand store.
// Production: product images from S3/CloudFront, prediction data from Amazon Personalize

'use client';

import { useState } from 'react';
import type { ConsumptionCycle } from '@/lib/personalization/consumptionEngine';
import { useNiaChatStore } from '@/lib/useNiaStore';

// ─── Props ──────────────────────────────────────────────────────────────────

interface ProductReorderCardProps {
  cycle: ConsumptionCycle;
}

// ─── Urgency helpers ────────────────────────────────────────────────────────

type Urgency = 'critical' | 'low' | 'soon';

function getUrgency(daysUntilRunOut: number): Urgency {
  if (daysUntilRunOut <= 1) return 'critical';
  if (daysUntilRunOut <= 3) return 'low';
  return 'soon';
}

/** Badge config keyed by urgency level */
const URGENCY_CONFIG: Record<
  Urgency,
  { emoji: string; label: string; bg: string; text: string; barColor: string }
> = {
  critical: {
    emoji: '🔴',
    label: 'Almost out',
    bg: 'bg-red-50',
    text: 'text-red-600',
    // Red → orange gradient for the consumption bar
    barColor: 'bg-gradient-to-r from-red-500 to-orange-400',
  },
  low: {
    emoji: '🟠',
    label: 'Running low',
    bg: 'bg-amber-50',
    text: 'text-amber-700',
    barColor: 'bg-gradient-to-r from-orange-500 to-amber-400',
  },
  soon: {
    emoji: '🟡',
    label: 'Order soon',
    bg: 'bg-yellow-50',
    text: 'text-yellow-700',
    // Yellow → green gradient shows more remaining supply
    barColor: 'bg-gradient-to-r from-yellow-400 to-green-400',
  },
};

// ─── Component ──────────────────────────────────────────────────────────────

export default function ProductReorderCard({ cycle }: ProductReorderCardProps) {
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);

  const urgency = getUrgency(cycle.daysUntilRunOut);
  const cfg = URGENCY_CONFIG[urgency];

  // Clamp percent to 0-100 for the progress bar
  const percentUsed = Math.min(100, Math.max(0, cycle.percentUsed));

  // Derive "last ordered X days ago" label
  const daysAgoLabel =
    cycle.daysSinceLastOrder === 0
      ? 'Ordered today'
      : cycle.daysSinceLastOrder === 1
        ? 'Last ordered 1 day ago'
        : `Last ordered ${cycle.daysSinceLastOrder} days ago`;

  const handleAdd = () => {
    // Build a CartItem from the consumption cycle data
    useNiaChatStore.getState().addToCart({
      id: cycle.productId,
      name: cycle.productName,
      price: cycle.price,
      mrp: cycle.price, // ConsumptionCycle doesn't track MRP; use price as fallback
      image: cycle.image, // emoji for demo; URL in production
      qty,
      category: cycle.category,
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  return (
    <div
      className={
        'flex-shrink-0 w-44 sm:w-48 bg-white rounded-2xl border border-gray-100 ' +
        'shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden group flex flex-col'
      }
    >
      {/* ── 1. Product image area ─────────────────────────────────────── */}
      <div className="relative bg-gray-50 bg-gradient-to-b from-gray-50 to-white flex items-center justify-center h-20">
        {/* Large emoji product visual */}
        <span className="text-3xl select-none group-hover:scale-110 transition-transform duration-200">
          {cycle.image}
        </span>

        {/* Urgency badge — top-left pill */}
        <span
          className={`absolute top-2 left-2 ${cfg.bg} ${cfg.text} text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-0.5`}
        >
          {cfg.emoji} {cfg.label}
        </span>
      </div>

      {/* ── 2. Product info ───────────────────────────────────────────── */}
      <div className="px-3 pt-3 pb-1">
        <h3
          className="text-sm font-semibold text-[#0F1111] line-clamp-2 leading-tight"
          title={cycle.productName}
        >
          {cycle.productName}
        </h3>
        <p className="text-xs text-gray-400 mt-0.5">{cycle.unit}</p>
        <p className="text-[11px] text-gray-400 mt-0.5">{daysAgoLabel}</p>
      </div>

      {/* ── 3. Mini consumption bar ───────────────────────────────────── */}
      <div className="px-3 mt-1">
        {/* Track */}
        <div className="w-full h-[3px] bg-gray-100 rounded-full overflow-hidden">
          {/* Fill — width reflects estimated consumption */}
          <div
            className={`h-full rounded-full ${cfg.barColor} transition-all duration-500`}
            style={{ width: `${percentUsed}%` }}
          />
        </div>
        <p className="text-[10px] text-gray-400 mt-0.5">
          ~{percentUsed}% used (est.)
        </p>
      </div>

      {/* ── 4. Price row ──────────────────────────────────────────────── */}
      <div className="flex items-center justify-between px-3 mt-2">
        <span className="text-base font-bold text-[#0F1111]">
          ₹{cycle.price}
        </span>
        {/* No mrp in ConsumptionCycle — omit strikethrough for now */}
      </div>

      {/* ── 5. Quantity selector ──────────────────────────────────────── */}
      <div className="flex items-center justify-center gap-3 px-3 mt-2">
        <button
          onClick={() => setQty((q) => Math.max(1, q - 1))}
          className="w-7 h-7 rounded-full border border-gray-200 text-gray-500 flex items-center justify-center
                     hover:border-[#00838F] hover:text-[#00838F] active:scale-95 transition-all duration-150"
          aria-label="Decrease quantity"
        >
          −
        </button>
        <span className="text-sm font-semibold text-[#0F1111] w-4 text-center select-none">
          {qty}
        </span>
        <button
          onClick={() => setQty((q) => q + 1)}
          className="w-7 h-7 rounded-full border border-gray-200 text-gray-500 flex items-center justify-center
                     hover:border-[#00838F] hover:text-[#00838F] active:scale-95 transition-all duration-150"
          aria-label="Increase quantity"
        >
          +
        </button>
      </div>

      {/* ── 6. Add-to-cart button ─────────────────────────────────────── */}
      <div className="px-3 mt-2">
        <button
          onClick={handleAdd}
          disabled={added}
          className={
            'w-full py-2 rounded-xl text-xs font-semibold transition-all duration-200 active:scale-[0.97] ' +
            (added
              ? 'bg-green-50 text-green-600 cursor-default'
              : 'bg-[#00838F] hover:bg-[#006d75] text-white')
          }
          aria-label={
            added
              ? `${cycle.productName} added to cart`
              : `Add ${cycle.productName} to cart`
          }
        >
          {added ? '✓ Added!' : '+ Add to cart'}
        </button>
      </div>

      {/* ── 7. Confidence indicator ───────────────────────────────────── */}
      {/* Only shown for high or low confidence; medium is implicit default */}
      <div className="flex justify-end px-3 pb-2 mt-1 min-h-[16px]">
        {cycle.confidence === 'high' && (
          <span className="text-[10px] text-green-500" title="High confidence prediction">
            🔒
          </span>
        )}
        {cycle.confidence === 'low' && (
          <span className="text-[10px] text-gray-400" title="Low confidence — limited data">
            ❓
          </span>
        )}
      </div>
    </div>
  );
}

// Production extension:
// - Replace emoji with <Image> component loading from S3/CloudFront CDN
// - Wire confidence to Amazon Personalize real-time prediction scores
// - Add haptic feedback on mobile for add-to-cart (navigator.vibrate)
// - Track "add to cart" events via Amazon Pinpoint for conversion analytics
// - Support Subscribe & Save toggle with discounted price display
// - Add swipe-to-dismiss on mobile to train the reorder model (negative signal)
