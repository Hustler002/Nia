'use client';

// ReorderNudgeCard.tsx
// Rich card rendered inside the Nia chat panel when Nia proactively nudges
// the user about a product that's running low.
//
// Features:
// - Product info with emoji image and name
// - Consumption cycle context ("you reorder this every ~N days")
// - SVG sparkline timeline: dots for past orders + projected future dot for runout
// - Quantity selector (minus/plus)
// - "Add to cart" CTA (orange, Amazon-style)
// - "Remind me tomorrow" ghost button
// - "Don't remind me for this item" dismiss link
//
// Production: wire addToCart to real cart API, persist dismiss/snooze in DynamoDB

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import type { ReorderNudge } from '@/lib/useNiaStore';
import { useNiaChatStore } from '@/lib/useNiaStore';

interface ReorderNudgeCardProps {
  nudge: ReorderNudge;
  content: string;
}

// ── SVG Sparkline Timeline ──────────────────────────────────────────────────
// Renders a small inline chart showing past order dates as dots on a timeline,
// with a projected future dot (dashed line connector) for predicted runout.
// No charting library needed — pure SVG.

function SparklineTimeline({
  cycleDays,
  percentUsed,
  lastOrdered,
}: {
  cycleDays: number;
  percentUsed: number;
  lastOrdered: string;
}) {
  const [animate, setAnimate] = useState(false);

  useEffect(() => {
    // Small delay so the animation triggers after mount
    const t = setTimeout(() => setAnimate(true), 200);
    return () => clearTimeout(t);
  }, []);

  // Generate fake "past order" x positions
  // We show 3-4 past orders plus 1 projected future one
  const numPastOrders = Math.min(4, Math.max(2, Math.ceil(percentUsed / 25)));
  const width = 280;
  const height = 48;
  const paddingX = 20;
  const usableWidth = width - paddingX * 2;

  // Past order positions: evenly spaced from left to the "now" marker
  // "Now" is at percentUsed% of the way from left to right
  const nowX = paddingX + (usableWidth * Math.min(percentUsed, 100)) / 100;
  const futureX = paddingX + usableWidth; // rightmost = predicted runout

  // Generate past order dot positions (evenly spaced before "now")
  const pastDots: number[] = [];
  for (let i = 0; i < numPastOrders; i++) {
    const frac = i / numPastOrders;
    pastDots.push(paddingX + frac * (nowX - paddingX));
  }

  const dotY = height / 2;
  const labelY = height - 4;

  // Parse days from "X days ago"
  const daysAgo = parseInt(lastOrdered) || 0;
  const daysRemaining = Math.max(0, cycleDays - daysAgo);

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      className="w-full h-12"
      role="img"
      aria-label={`Order timeline: last ordered ${lastOrdered}, predicted runout in ${daysRemaining} days`}
    >
      {/* Background timeline track */}
      <line
        x1={paddingX}
        y1={dotY}
        x2={nowX}
        y2={dotY}
        stroke="#00838F"
        strokeWidth={2}
        strokeLinecap="round"
        opacity={animate ? 1 : 0}
        style={{
          transition: 'opacity 0.5s ease-out',
        }}
      />

      {/* Dashed line from now to predicted runout */}
      <line
        x1={nowX}
        y1={dotY}
        x2={futureX}
        y2={dotY}
        stroke="#FF9900"
        strokeWidth={2}
        strokeDasharray="4 3"
        strokeLinecap="round"
        opacity={animate ? 0.6 : 0}
        style={{
          transition: 'opacity 0.8s ease-out 0.3s',
        }}
      />

      {/* Past order dots */}
      {pastDots.map((x, i) => (
        <circle
          key={`past-${i}`}
          cx={x}
          cy={dotY}
          r={animate ? 4 : 0}
          fill="#00838F"
          style={{
            transition: `r 0.3s ease-out ${0.1 * i}s`,
          }}
        />
      ))}

      {/* "Now" marker — larger, pulsing */}
      <circle
        cx={nowX}
        cy={dotY}
        r={animate ? 6 : 0}
        fill="#00838F"
        stroke="white"
        strokeWidth={2}
        style={{
          transition: 'r 0.4s ease-out 0.3s',
        }}
      />

      {/* Predicted runout dot — orange, with glow */}
      <circle
        cx={futureX}
        cy={dotY}
        r={animate ? 5 : 0}
        fill="#FF9900"
        stroke="white"
        strokeWidth={2}
        opacity={animate ? 0.9 : 0}
        style={{
          transition: 'r 0.4s ease-out 0.5s, opacity 0.4s ease-out 0.5s',
        }}
      />
      {/* Outer glow ring on the predicted dot */}
      <circle
        cx={futureX}
        cy={dotY}
        r={animate ? 9 : 0}
        fill="none"
        stroke="#FF9900"
        strokeWidth={1}
        opacity={animate ? 0.3 : 0}
        style={{
          transition: 'r 0.4s ease-out 0.6s, opacity 0.4s ease-out 0.6s',
        }}
      />

      {/* Labels */}
      <text
        x={paddingX}
        y={labelY}
        fontSize={9}
        fill="#9CA3AF"
        textAnchor="start"
      >
        {daysAgo > 0 ? `${daysAgo}d ago` : 'Today'}
      </text>
      <text
        x={futureX}
        y={labelY}
        fontSize={9}
        fill="#FF9900"
        textAnchor="end"
        fontWeight={600}
      >
        ~{daysRemaining}d left
      </text>
    </svg>
  );
}

// ── Main Card ───────────────────────────────────────────────────────────────

export default function ReorderNudgeCard({ nudge, content }: ReorderNudgeCardProps) {
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);
  const [snoozed, setSnoozed] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const { product } = nudge;

  // ── Derived values ──────────────────────────────────────────────────────
  const percentUsed = Math.min(100, Math.max(0, product.percentUsed));

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

  // ── Quantity helpers ────────────────────────────────────────────────────
  const decrement = () => setQty((q) => Math.max(1, q - 1));
  const increment = () => setQty((q) => q + 1);

  // ── Add to cart ─────────────────────────────────────────────────────────
  const handleAddToCart = () => {
    useNiaChatStore.getState().addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      mrp: product.price, // same for demo
      image: product.image,
      qty,
      category: 'Reorder',
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 2500);
  };

  // ── Snooze/Dismiss ─────────────────────────────────────────────────────
  if (dismissed) {
    return (
      <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm text-center">
        <p className="text-sm text-gray-400">
          Got it — I won&apos;t remind you about {product.name} for a while. ✌️
        </p>
      </div>
    );
  }

  if (snoozed) {
    return (
      <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm text-center">
        <p className="text-sm text-gray-400">
          No problem! I&apos;ll remind you about {product.name} tomorrow. ⏰
        </p>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="bg-white rounded-2xl p-4 border-l-4 border-[#00838F] shadow-sm"
    >
      {/* ── Content text ──────────────────────────────────────────────── */}
      <p className="text-sm text-[#0F1111] mb-3 leading-relaxed">{content}</p>

      {/* ── Product info row ──────────────────────────────────────────── */}
      <div className="flex items-center gap-3 mb-1">
        {/* Emoji product image */}
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center shadow-inner">
          <span className="text-2xl leading-none" role="img" aria-label={product.name}>
            {product.image}
          </span>
        </div>
        <div className="flex flex-col min-w-0">
          <span className="text-sm font-semibold text-[#0F1111] truncate">
            {product.name}
          </span>
          <span className="text-xs text-gray-400">
            You reorder this every ~{product.cycleDays} days
          </span>
        </div>
      </div>

      {/* Price */}
      <p className="text-lg font-bold text-[#0F1111] mb-0.5">
        ₹{product.price.toLocaleString('en-IN')}
      </p>

      {/* Last-ordered meta */}
      <p className="text-xs text-gray-400 mb-3">
        Last ordered: {product.lastOrdered}
      </p>

      {/* ── Sparkline timeline chart ──────────────────────────────────── */}
      <div className="mb-3 bg-gray-50/50 rounded-xl p-2">
        <SparklineTimeline
          cycleDays={product.cycleDays}
          percentUsed={percentUsed}
          lastOrdered={product.lastOrdered}
        />
      </div>

      {/* ── Consumption cycle bar ─────────────────────────────────────── */}
      <div className="mb-4">
        {/* "XX% used" label */}
        <div className="relative h-4 mb-1">
          <span
            className={`absolute text-[10px] font-bold ${labelColor} -translate-x-1/2`}
            style={{ left: `${Math.min(92, Math.max(4, percentUsed))}%` }}
          >
            {percentUsed}% used
          </span>
        </div>

        {/* Bar track */}
        <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${percentUsed}%` }}
            transition={{ duration: 0.8, ease: 'easeOut', delay: 0.2 }}
            className={`h-full rounded-full ${barColor}`}
          />
        </div>

        {/* Labels below the bar */}
        <div className="flex justify-between mt-1">
          <span className="text-[10px] text-gray-400">Last ordered</span>
          <span className="text-[10px] text-gray-400">
            Runs out ~{Math.max(0, product.cycleDays - (parseInt(product.lastOrdered) || 0))} days
          </span>
        </div>
      </div>

      {/* ── Quantity selector ─────────────────────────────────────────── */}
      <div className="flex items-center gap-3 mb-3">
        <button
          type="button"
          onClick={decrement}
          aria-label="Decrease quantity"
          className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center
            text-[#0F1111] text-sm font-medium hover:bg-gray-50 active:scale-95 transition"
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
          className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center
            text-[#0F1111] text-sm font-medium hover:bg-gray-50 active:scale-95 transition"
        >
          +
        </button>
      </div>

      {/* ── Add to cart CTA ───────────────────────────────────────────── */}
      <button
        type="button"
        onClick={handleAddToCart}
        disabled={added}
        className={`rounded-xl py-2.5 px-5 w-full text-sm font-semibold transition-all active:scale-[0.98] ${
          added
            ? 'bg-green-500 text-white'
            : 'bg-[#FF9900] hover:bg-[#e88b00] text-white'
        }`}
      >
        {added ? '✓ Added to cart!' : `Add to cart · ₹${(product.price * qty).toLocaleString('en-IN')}`}
      </button>

      {/* ── Secondary actions ─────────────────────────────────────────── */}
      <div className="flex items-center justify-between mt-3">
        <button
          type="button"
          onClick={() => setSnoozed(true)}
          className="text-xs text-[#00838F] font-medium hover:underline transition-colors"
        >
          ⏰ Remind me tomorrow
        </button>
        <button
          type="button"
          onClick={() => setDismissed(true)}
          className="text-[11px] text-gray-400 hover:text-gray-600 transition-colors"
        >
          Don&apos;t remind me
        </button>
      </div>

      {/* ── AI attribution ────────────────────────────────────────────── */}
      <p className="text-[10px] text-gray-300 italic text-center mt-3">
        ✨ Powered by AI consumption tracking
      </p>
    </motion.div>
  );
}

// Production extension:
// - Wire addToCart to Zustand cart store / DynamoDB CartService
// - Animate the progress bar fill on first mount with useEffect + state toggle
// - Fire analytics event on quantity change and add-to-cart click
// - Support "Subscribe & Save" toggle for recurring deliveries
// - Fetch real-time price and stock from Product Catalog API
// - Deep-link product name to full PDP within the widget
// - Snooze/dismiss: persist choices in DynamoDB per user_id + product_id
// - "Remind me tomorrow" schedules a Lambda invocation via EventBridge
// - Sparkline chart: in production, plot actual order timestamps from order history
//   service, with real dates on x-axis instead of evenly-spaced dots
