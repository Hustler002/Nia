'use client';

import { useState, useCallback, useMemo } from 'react';
import type { CartItem } from '@/lib/useNiaStore';
import { useNiaChatStore } from '@/lib/useNiaStore';

// ─── Props ──────────────────────────────────────────────────────────────────
interface CartSummaryCardProps {
  items: CartItem[];
  content: string;
}

// ─── Component ──────────────────────────────────────────────────────────────
export default function CartSummaryCard({ items, content }: CartSummaryCardProps) {
  const { addToCart } = useNiaChatStore();
  const [addedAll, setAddedAll] = useState(false);

  // Local qty state — cloned from props so user edits don't mutate upstream data
  const [quantities, setQuantities] = useState<Record<string, number>>(() =>
    Object.fromEntries(items.map((item) => [item.id, item.qty]))
  );

  const updateQty = useCallback((id: string, delta: number) => {
    setQuantities((prev) => ({
      ...prev,
      // Floor at 1 — removing items entirely would need a confirm UX
      [id]: Math.max(1, (prev[id] ?? 1) + delta),
    }));
  }, []);

  const handleAddAll = () => {
    items.forEach(item => {
      addToCart({ ...item, qty: quantities[item.id] ?? item.qty });
    });
    setAddedAll(true);
    setTimeout(() => setAddedAll(false), 2000);
  };

  // Derived running total recomputed only when quantities change
  const total = useMemo(
    () =>
      items.reduce(
        (sum, item) => sum + item.price * (quantities[item.id] ?? item.qty),
        0
      ),
    [items, quantities]
  );

  return (
    <div
      className="
        w-full max-w-sm rounded-2xl bg-white
        border-l-4 border-l-[#00838F]
        shadow-[0_2px_12px_rgba(0,0,0,0.06)]
        overflow-hidden
      "
    >
      {/* ── Header text ───────────────────────────────────────────────── */}
      <p className="px-4 pt-4 pb-2 text-sm text-[#0F1111] leading-relaxed">
        {content}
      </p>

      {/* ── Item list ─────────────────────────────────────────────────── */}
      <ul className="flex flex-col gap-2 px-4">
        {items.map((item) => (
          <li
            key={item.id}
            className="
              flex items-center gap-3 p-2.5
              bg-gray-50 rounded-xl border border-gray-100
              hover:bg-gray-100 transition-colors duration-150
            "
          >
            {/* Emoji image — sized consistently regardless of emoji width */}
            <span className="text-2xl w-9 text-center shrink-0" role="img" aria-label={item.name}>
              {item.image}
            </span>

            {/* Name — truncated to a single line */}
            <span className="flex-1 text-sm font-medium text-[#0F1111] truncate min-w-0">
              {item.name}
            </span>

            {/* Qty selector — compact pill with minus/plus buttons */}
            <div className="flex items-center gap-0 shrink-0 bg-white rounded-lg border border-gray-200 overflow-hidden">
              <button
                type="button"
                onClick={() => updateQty(item.id, -1)}
                className="
                  w-7 h-7 flex items-center justify-center
                  text-[#0F1111] text-sm font-bold
                  hover:bg-gray-100 active:bg-gray-200
                  transition-colors duration-100
                "
                aria-label={`Decrease quantity of ${item.name}`}
              >
                −
              </button>
              <span className="w-7 h-7 flex items-center justify-center text-xs font-semibold text-[#0F1111] select-none">
                {quantities[item.id] ?? item.qty}
              </span>
              <button
                type="button"
                onClick={() => updateQty(item.id, 1)}
                className="
                  w-7 h-7 flex items-center justify-center
                  text-[#0F1111] text-sm font-bold
                  hover:bg-gray-100 active:bg-gray-200
                  transition-colors duration-100
                "
                aria-label={`Increase quantity of ${item.name}`}
              >
                +
              </button>
            </div>

            {/* Price */}
            <span className="text-sm font-semibold text-[#0F1111] shrink-0 tabular-nums">
              ₹{item.price}
            </span>
          </li>
        ))}
      </ul>

      {/* ── Total bar ─────────────────────────────────────────────────── */}
      <div className="px-4 pt-3 pb-2">
        <div
          className="
            flex items-center justify-between
            bg-[#E0F2F1] rounded-xl px-4 py-3
          "
        >
          <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-[#0F1111]">
              Total: ₹{total}
            </span>
            {/* Delivery badge — green dot signals freshness/speed */}
            <span
              className="
                inline-flex items-center gap-1
                text-[10px] font-medium text-green-700
                bg-green-50 border border-green-200
                rounded-full px-2 py-0.5
              "
            >
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
              10 min delivery
            </span>
          </div>

          <button
            type="button"
            onClick={handleAddAll}
            className={`
              text-sm font-semibold rounded-lg px-5 py-2
              active:scale-[0.97] transition-all duration-150
              shadow-[0_2px_6px_rgba(255,153,0,0.3)]
              ${addedAll
                ? 'bg-green-500 text-white'
                : 'bg-[#FF9900] text-white hover:bg-[#e88b00]'
              }
            `}
          >
            {addedAll ? '✓ Added to cart!' : 'Add all to cart'}
          </button>
        </div>
      </div>

      {/* ── Edit items link ───────────────────────────────────────────── */}
      <div className="px-4 pb-4 pt-1">
        <button
          type="button"
          className="text-xs text-[#00838F] underline underline-offset-2 hover:text-[#006d75] transition-colors"
        >
          Edit items
        </button>
      </div>
    </div>
  );
}

// ─── Production Extension ────────────────────────────────────────────────────
// - Wire "Add all to cart" to actual cart API (POST /api/cart/bulk-add)
// - Debounce qty changes and sync with backend cart state
// - Add swipe-to-remove gesture on each item row
// - Show per-item savings (mrp vs price) if discount > 0
// - Integrate with delivery ETA API for real-time slot availability
// - Add skeleton loading state while cart data is being fetched
// - Support undo after removing an item
