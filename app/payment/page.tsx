'use client';

// app/payment/page.tsx
// Pre-filled payment page — navigated to when Nia's checkout_direct tool fires
// or when the user clicks "Place Order" from the cart drawer.
// Shows: item(s), resolved address, total, delivery ETA, confirm button.

import { Suspense, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useNiaChatStore } from '@/lib/useNiaStore';
import { useCartStore } from '@/lib/stores/useCartStore';
import { useUserStore } from '@/lib/stores/useUserStore';
import { supabase } from '@/lib/supabaseClient';

function PaymentContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { liveCart, clearCart: clearNiaCart } = useNiaChatStore();
  const { items: cartItems2, clearCart: clearCartStore } = useCartStore();
  const user = useUserStore((s) => s.user);
  const [placing, setPlacing] = useState(false);
  const [placed, setPlaced] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Read from query params (set by Nia autonomous checkout) or from liveCart
  const addressLabel = searchParams.get('address') || 'Home';
  const directItemName = searchParams.get('item');

  const cartItems = cartItems2.length > 0
    ? cartItems2
    : liveCart.length > 0
    ? liveCart
    : directItemName
    ? [{ id: 'direct-1', name: directItemName, price: 89, mrp: 99, image: '📦', qty: 1, category: 'Other' }]
    : [];

  const subtotal = cartItems.reduce((sum, i) => sum + i.price * i.qty, 0);
  const deliveryFee = subtotal >= 199 ? 0 : 29;
  const total = subtotal + deliveryFee;

  const handleConfirm = async () => {
    setPlacing(true);
    try {
      // Use real Clerk userId, fall back to 'guest' if not logged in
      const userId = user?.id ?? 'priya-sharma-001';
      if (supabase) {
        await supabase.from('orders').insert({
          user_id: userId,
          address_id: null,
          items: cartItems,
          total,
          placed_at: new Date().toISOString(),
        });
      }
      clearNiaCart();
      clearCartStore();
      setPlaced(true);
      setTimeout(() => router.push('/'), 3000);
    } catch (e) {
      console.error('Order placement error:', e);
      setError('Something went wrong placing your order. Please try again.');
    }
    setPlacing(false);
  };

  if (placed) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-[#E0F2F1] to-white px-4 text-center">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-7xl mb-6"
        >
          🎉
        </motion.div>
        <h1 className="text-3xl font-bold text-[#0F1111] mb-2">Order Placed!</h1>
        <p className="text-gray-500 text-lg mb-1">Delivering to <strong>{addressLabel}</strong></p>
        <p className="text-[#00838F] font-semibold text-xl">Arriving in ~10 minutes ⚡</p>
        <p className="text-xs text-gray-400 mt-6">Redirecting to home...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-red-50 to-white px-4 text-center">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-7xl mb-6"
        >
          😔
        </motion.div>
        <h1 className="text-3xl font-bold text-[#0F1111] mb-2">Something went wrong</h1>
        <p className="text-gray-500 text-lg mb-4">{error}</p>
        <button
          onClick={() => { setError(null); }}
          className="bg-[#00838F] hover:bg-[#006d75] text-white font-bold px-6 py-3 rounded-xl transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 px-4 py-4 flex items-center gap-3">
        <button onClick={() => router.back()} className="p-2 rounded-full hover:bg-gray-100 transition-colors">
          <svg className="w-5 h-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h1 className="text-xl font-bold text-[#0F1111]">Review & Pay</h1>
      </div>

      <div className="max-w-lg mx-auto px-4 py-6 space-y-4">

        {/* Delivery Address */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm"
        >
          <div className="flex items-center gap-2 mb-2">
            <span className="text-lg">📍</span>
            <h2 className="font-semibold text-[#0F1111]">Delivery Address</h2>
          </div>
          <div className="ml-7">
            <span className="inline-block bg-[#E0F2F1] text-[#00838F] text-xs font-bold px-2 py-0.5 rounded-full mb-1">
              {addressLabel.toUpperCase()}
            </span>
            <p className="text-sm text-gray-600">
              {addressLabel.toLowerCase().includes('mom')
                ? "Mom's House, Andheri West, Mumbai — 400058"
                : "Home, Connaught Place, New Delhi — 110001"}
            </p>
            <p className="text-xs text-[#00838F] mt-1 font-medium">⚡ Estimated delivery: 8–12 minutes</p>
          </div>
        </motion.div>

        {/* Order Items */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm"
        >
          <h2 className="font-semibold text-[#0F1111] mb-3">
            Your Order ({cartItems.length} item{cartItems.length !== 1 ? 's' : ''})
          </h2>
          <div className="space-y-3">
            {cartItems.map((item, i) => (
              <div key={i} className="flex items-center gap-3">
                <span className="text-2xl w-10 text-center">{item.image}</span>
                <div className="flex-1">
                  <p className="font-medium text-sm text-[#0F1111]">{item.name}</p>
                  <p className="text-xs text-gray-400">Qty: {item.qty}</p>
                </div>
                <p className="font-semibold text-sm text-[#0F1111]">₹{item.price * item.qty}</p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Bill Summary */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm"
        >
          <h2 className="font-semibold text-[#0F1111] mb-3">Bill Summary</h2>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between text-gray-600">
              <span>Subtotal</span><span>₹{subtotal}</span>
            </div>
            <div className="flex justify-between text-gray-600">
              <span>Delivery Fee</span>
              <span className={deliveryFee === 0 ? 'text-green-600 font-medium' : ''}>
                {deliveryFee === 0 ? 'FREE' : `₹${deliveryFee}`}
              </span>
            </div>
            <div className="flex justify-between font-bold text-[#0F1111] text-base pt-2 border-t border-gray-100">
              <span>Total</span><span>₹{total}</span>
            </div>
          </div>
        </motion.div>

        {/* Payment Method (Demo) */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm"
        >
          <h2 className="font-semibold text-[#0F1111] mb-3">Payment Method</h2>
          <div className="flex items-center gap-3 p-3 rounded-xl bg-[#E0F2F1] border-2 border-[#00838F]">
            <span className="text-xl">💳</span>
            <div>
              <p className="font-medium text-sm text-[#0F1111]">UPI / Amazon Pay</p>
              <p className="text-xs text-gray-500">pranjal@upi (demo)</p>
            </div>
            <div className="ml-auto w-4 h-4 rounded-full bg-[#00838F] flex items-center justify-center">
              <div className="w-2 h-2 rounded-full bg-white" />
            </div>
          </div>
        </motion.div>

        {/* Confirm Button */}
        <motion.button
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          onClick={handleConfirm}
          disabled={placing || cartItems.length === 0}
          className="w-full bg-[#00838F] hover:bg-[#006d75] disabled:opacity-60 text-white font-bold text-lg py-4 rounded-2xl shadow-lg transition-all duration-200 flex items-center justify-center gap-3"
        >
          {placing ? (
            <span className="animate-spin text-xl">⏳</span>
          ) : (
            <>
              <span>⚡</span>
              <span>Confirm & Place Order — ₹{total}</span>
            </>
          )}
        </motion.button>

        <p className="text-center text-xs text-gray-400 pb-6">
          By placing this order you agree to our Terms of Service. This is a hackathon demo.
        </p>
      </div>
    </div>
  );
}

export default function PaymentPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin text-3xl">⚡</div>
      </div>
    }>
      <PaymentContent />
    </Suspense>
  );
}
