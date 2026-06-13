'use client';

import { useRef, useState, useEffect } from 'react';
import type { CartItem } from '@/lib/useNiaStore';

// ─── Props ──────────────────────────────────────────────────────────────────
interface ProductListCardProps {
  items: CartItem[];
  content: string;
}

// ─── Component ──────────────────────────────────────────────────────────────
export default function ProductListCard({ items, content }: ProductListCardProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  // Track whether the scroll container can still scroll right — drives the fade
  const [canScrollRight, setCanScrollRight] = useState(false);

  // Re-evaluate overflow on mount and whenever items change
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    const checkOverflow = () => {
      // 2px threshold avoids false negatives from sub-pixel rounding
      setCanScrollRight(el.scrollWidth - el.scrollLeft - el.clientWidth > 2);
    };

    checkOverflow();
    el.addEventListener('scroll', checkOverflow, { passive: true });
    // ResizeObserver catches container resizes (e.g. widget open animation)
    const ro = new ResizeObserver(checkOverflow);
    ro.observe(el);

    return () => {
      el.removeEventListener('scroll', checkOverflow);
      ro.disconnect();
    };
  }, [items]);

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
      <p className="px-4 pt-4 pb-3 text-sm text-[#0F1111] leading-relaxed">
        {content}
      </p>

      {/* ── Scrollable product row ────────────────────────────────────── */}
      <div className="relative px-4 pb-4">
        <div
          ref={scrollRef}
          className="
            flex gap-3 overflow-x-auto
            scrollbar-hide
            pb-1
          "
          /* scrollbar-hide is a Tailwind plugin utility;
             if unavailable, the CSS fallback below handles it */
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {items.map((item) => (
            <div
              key={item.id}
              className="
                min-w-[140px] max-w-[140px] flex-shrink-0
                bg-white rounded-xl
                border border-gray-100 shadow-sm
                p-3
                flex flex-col
                hover:shadow-md hover:border-gray-200
                transition-all duration-200
              "
            >
              {/* Product emoji */}
              <div className="text-3xl text-center py-2" role="img" aria-label={item.name}>
                {item.image}
              </div>

              {/* Product name — 2-line clamp */}
              <p
                className="
                  text-xs font-semibold text-[#0F1111]
                  leading-tight mt-1
                  line-clamp-2 min-h-[2rem]
                "
              >
                {item.name}
              </p>

              {/* Price row */}
              <div className="flex items-baseline gap-1.5 mt-1.5">
                <span className="text-sm font-bold text-[#0F1111]">₹{item.price}</span>
                {/* Show MRP strikethrough only when it differs from sale price */}
                {item.mrp > item.price && (
                  <span className="text-[10px] text-gray-400 line-through">
                    ₹{item.mrp}
                  </span>
                )}
              </div>

              {/* Add button */}
              <button
                type="button"
                className="
                  w-full mt-2
                  bg-[#00838F] text-white text-xs font-semibold
                  rounded-lg py-1.5
                  hover:bg-[#006d75] active:scale-[0.96]
                  transition-all duration-150
                "
              >
                + Add
              </button>
            </div>
          ))}
        </div>

        {/* ── Right-edge gradient fade — only visible when more items await ── */}
        <div
          className={`
            pointer-events-none absolute top-0 right-4 bottom-1
            w-10 rounded-r-xl
            bg-gradient-to-l from-white to-transparent
            transition-opacity duration-300
            ${canScrollRight ? 'opacity-100' : 'opacity-0'}
          `}
          aria-hidden="true"
        />
      </div>
    </div>
  );
}

// ─── Production Extension ────────────────────────────────────────────────────
// - Wire "+ Add" buttons to cart API (POST /api/cart/add)
// - Add "Added ✓" state with teal checkmark after adding
// - Fetch real product images from CDN and replace emoji placeholders
// - Show star rating below the name from review aggregation service
// - Add left/right scroll arrow buttons for non-touch devices
// - Implement skeleton loading tiles while product data streams in
// - Track "product_viewed" / "product_added" analytics events
// - Support drag-to-scroll on desktop with momentum physics
