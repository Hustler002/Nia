'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useCartStore } from '@/lib/stores/useCartStore';
import { useUserStore } from '@/lib/stores/useUserStore';
import { motion } from 'framer-motion';

// ─── Helpers ────────────────────────────────────────────────────────────────

function generateOrderId(): string {
  const digits = Math.floor(100000 + Math.random() * 900000);
  return `ORD-${digits}`;
}

// ─── Main Page ──────────────────────────────────────────────────────────────

export default function ExpressCheckoutPage() {
  const router = useRouter();
  const items = useCartStore((s) => s.items);
  const getTotalPrice = useCartStore((s) => s.getTotalPrice);

  const [stage, setStage] = useState<'checkout' | 'success'>('checkout');
  const [paymentMethod, setPaymentMethod] = useState<'amazon_pay' | 'cod'>('amazon_pay');
  const [orderId] = useState(() => generateOrderId());
  const [trackingToast, setTrackingToast] = useState(false);

  // Computed values
  const subtotal = getTotalPrice();
  const deliveryFee = 0;
  const total = subtotal + deliveryFee;
  const maxETA = useMemo(
    () => (items.length > 0 ? Math.max(...items.map((i) => i.eta || 10)) : 10),
    [items],
  );

  // ── Place order handler ─────────────────────────────────────────────────
  const handlePlaceOrder = () => {
    useCartStore.getState().clearCart();
    setStage('success');
  };

  // ── Empty cart ──────────────────────────────────────────────────────────
  if (items.length === 0 && stage === 'checkout') {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-[#F5F5F5] px-4">
        <p className="mb-4 text-lg font-medium text-[#0F1111]">Your cart is empty</p>
        <button
          onClick={() => router.push('/')}
          className="rounded-sm bg-[#FFD814] px-6 py-2 text-sm font-semibold text-[#0F1111] shadow-sm hover:bg-[#F7CA00] active:bg-[#E7B800]"
        >
          Back to Home
        </button>
      </div>
    );
  }

  // ── Success state ───────────────────────────────────────────────────────
  if (stage === 'success') {
    return (
      <div className="min-h-screen bg-[#F5F5F5] px-4 py-8">
        <div className="mx-auto max-w-md">
          {/* Animated checkmark */}
          <motion.div
            className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-green-500"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 200, damping: 15 }}
          >
            <motion.svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="white"
              strokeWidth={3}
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-12 w-12"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.5 }}
            >
              <motion.path
                d="M5 13l4 4L19 7"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ delay: 0.3, duration: 0.5 }}
              />
            </motion.svg>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-center"
          >
            <h1 className="mb-1 text-2xl font-bold text-[#0F1111]">Order Placed!</h1>
            <p className="mb-4 text-sm text-gray-600">Your emergency kit is on its way</p>

            <div className="mb-2 text-xs text-gray-500">Order ID</div>
            <div className="mb-4 font-mono text-sm font-semibold text-[#0F1111]">{orderId}</div>

            <div className="mb-6 rounded-sm border border-green-200 bg-green-50 px-4 py-3">
              <p className="text-2xl font-bold text-green-600">~{maxETA} minutes</p>
              <p className="text-xs text-green-700">Estimated arrival</p>
            </div>
          </motion.div>

          {/* Timeline */}
          <motion.div
            className="mb-8 rounded-sm border border-[#D5D9D9] bg-white p-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <h2 className="mb-3 text-sm font-bold text-[#0F1111]">Delivery Progress</h2>
            <div className="space-y-3">
              <TimelineStep emoji="✅" label="Order confirmed" active />
              <TimelineStep emoji="🏪" label="Being packed at nearest dark store" active />
              <TimelineStep emoji="🚴" label="Rider assigned" active={false} />
              <TimelineStep emoji="📦" label="Delivered" active={false} />
            </div>
          </motion.div>

          {/* Actions */}
          <div className="flex flex-col gap-3">
            <button
              onClick={() => router.push('/')}
              className="w-full rounded-sm bg-[#FFD814] py-3 text-sm font-semibold text-[#0F1111] shadow-sm hover:bg-[#F7CA00] active:bg-[#E7B800]"
            >
              Back to Home
            </button>
            <div className="relative">
              <button
                onClick={() => {
                  setTrackingToast(true);
                  setTimeout(() => setTrackingToast(false), 2500);
                }}
                className="w-full rounded-sm border border-[#D5D9D9] bg-white py-3 text-sm font-semibold text-[#0F1111] shadow-sm hover:bg-gray-50 active:bg-gray-100"
              >
                Track Order
              </button>
              {trackingToast && (
                <motion.div
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="absolute -top-10 left-1/2 -translate-x-1/2 whitespace-nowrap rounded bg-[#0F1111] px-3 py-1.5 text-xs text-white shadow-md"
                >
                  Tracking coming soon
                </motion.div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── Checkout form state ─────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-[#F5F5F5] pb-28">
      {/* Top bar */}
      <div className="sticky top-0 z-10 border-b border-[#D5D9D9] bg-white px-4 py-3">
        <button
          onClick={() => router.back()}
          className="text-sm font-medium text-[#007185] hover:text-[#C7511F] hover:underline"
        >
          ← Back to cart
        </button>
        <h1 className="mt-1 text-lg font-bold text-[#0F1111]">Express Checkout</h1>
      </div>

      <div className="mx-auto max-w-md space-y-3 px-4 pt-4">
        {/* ── Order Summary ──────────────────────────────────────────────── */}
        <section className="rounded-sm border border-[#D5D9D9] bg-white p-4">
          <h2 className="mb-3 text-sm font-bold text-[#0F1111]">
            Order Summary ({items.length} item{items.length !== 1 ? 's' : ''})
          </h2>

          <div className="divide-y divide-gray-100">
            {items.map((item) => (
              <div key={item.id} className="flex items-center gap-3 py-2">
                <span className="text-2xl leading-none">{item.image}</span>
                <div className="flex-1 min-w-0">
                  <p className="truncate text-sm text-[#0F1111]">{item.name}</p>
                  <p className="text-xs text-gray-500">Qty: {item.qty}</p>
                </div>
                <span className="text-sm font-semibold text-[#0F1111]">
                  ₹{(item.price * item.qty).toFixed(2)}
                </span>
              </div>
            ))}
          </div>

          <div className="mt-3 space-y-1 border-t border-gray-100 pt-3 text-sm">
            <div className="flex justify-between text-gray-600">
              <span>Subtotal</span>
              <span>₹{subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-green-600">
              <span>Delivery fee</span>
              <span>₹0 — FREE for Now</span>
            </div>
            <div className="flex justify-between text-base font-bold text-[#0F1111]">
              <span>Total</span>
              <span>₹{total.toFixed(2)}</span>
            </div>
          </div>

          <div className="mt-3 rounded-sm bg-[#FFF8E1] px-3 py-2 text-xs text-[#B26500]">
            ⚡ Estimated delivery in <strong>~{maxETA} min</strong>
          </div>
        </section>

        {/* ── Delivery Address ───────────────────────────────────────────── */}
        <section className="rounded-sm border border-[#D5D9D9] bg-white p-4">
          <div className="mb-2 flex items-center justify-between">
            <h2 className="text-sm font-bold text-[#0F1111]">Delivery Address</h2>
            <span className="group relative cursor-not-allowed text-xs text-[#007185]">
              Change
              <span className="pointer-events-none absolute -top-8 left-1/2 -translate-x-1/2 whitespace-nowrap rounded bg-[#0F1111] px-2 py-1 text-xs text-white opacity-0 shadow-md transition-opacity group-hover:opacity-100">
                Not available in demo
              </span>
            </span>
          </div>
          <p className="text-sm text-[#0F1111]">Flat 4B, Sunrise Apartments</p>
          <p className="text-sm text-gray-500">Koramangala 5th Block, Bengaluru 560034</p>
        </section>

        {/* ── Payment Method ─────────────────────────────────────────────── */}
        <section className="rounded-sm border border-[#D5D9D9] bg-white p-4">
          <h2 className="mb-3 text-sm font-bold text-[#0F1111]">Payment Method</h2>
          <div className="space-y-3">
            <label className="flex cursor-pointer items-center gap-3">
              <input
                type="radio"
                name="payment"
                value="amazon_pay"
                checked={paymentMethod === 'amazon_pay'}
                onChange={() => setPaymentMethod('amazon_pay')}
                className="h-4 w-4 accent-[#FF9900]"
              />
              <div>
                <p className="text-sm text-[#0F1111]">Amazon Pay Balance</p>
                <p className="text-xs text-gray-500">₹5,240.00 available</p>
              </div>
            </label>
            <label className="flex cursor-pointer items-center gap-3">
              <input
                type="radio"
                name="payment"
                value="cod"
                checked={paymentMethod === 'cod'}
                onChange={() => setPaymentMethod('cod')}
                className="h-4 w-4 accent-[#FF9900]"
              />
              <div>
                <p className="text-sm text-[#0F1111]">Cash on Delivery</p>
              </div>
            </label>
          </div>
        </section>
      </div>

      {/* ── Sticky "Place Order" bar ─────────────────────────────────────── */}
      <div className="fixed bottom-0 left-0 right-0 border-t border-[#D5D9D9] bg-white px-4 py-3 shadow-[0_-2px_8px_rgba(0,0,0,0.08)]">
        <div className="mx-auto max-w-md">
          <button
            onClick={handlePlaceOrder}
            className="w-full rounded-sm bg-[#FFD814] py-3.5 text-sm font-bold text-[#0F1111] shadow-sm hover:bg-[#F7CA00] active:bg-[#E7B800]"
          >
            Place Order · ₹{total.toFixed(2)}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Timeline step component ────────────────────────────────────────────────

function TimelineStep({
  emoji,
  label,
  active,
}: {
  emoji: string;
  label: string;
  active: boolean;
}) {
  return (
    <div className={`flex items-center gap-3 ${active ? '' : 'opacity-40'}`}>
      <span className="text-lg leading-none">{emoji}</span>
      <span className={`text-sm ${active ? 'text-[#0F1111]' : 'text-gray-400'}`}>{label}</span>
    </div>
  );
}
