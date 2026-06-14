'use client';

// app/payment/page.tsx
// Amazon-style checkout page — left-aligned, structured, trust signals
// Shows: item(s), resolved address, total, delivery ETA, confirm button.

import { Suspense, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useNiaChatStore } from '@/lib/useNiaStore';
import { supabase } from '@/lib/supabaseClient';
import { useUser } from '@clerk/nextjs';

function PaymentContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { liveCart, clearCart } = useNiaChatStore();
  const { user } = useUser();
  const [placing, setPlacing] = useState(false);
  const [placed, setPlaced] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Read from query params (set by Nia autonomous checkout) or from liveCart
  const addressLabel = searchParams.get('address') || 'Home';
  const directItemName = searchParams.get('item');

  const cartItems = liveCart.length > 0
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
      const userId = user?.id ?? 'guest';
      if (supabase) {
        await supabase.from('orders').insert({
          user_id: userId,
          address_id: null,
          items: cartItems,
          total,
          placed_at: new Date().toISOString(),
        });
      }
      clearCart();
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
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#EAEDED] px-4 text-center">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-7xl mb-6"
        >
          🎉
        </motion.div>
        <h1 className="text-3xl font-bold text-[#0F1111] mb-2">Order Placed!</h1>
        <p className="text-gray-600 text-lg mb-1">Delivering to <strong>{addressLabel}</strong></p>
        <p className="text-[#007600] font-bold text-xl">Arriving in ~10 minutes ⚡</p>
        <p className="text-xs text-gray-400 mt-6">Redirecting to home...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#EAEDED] px-4 text-center">
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
          className="bg-[#FFD814] hover:bg-[#F7CA00] text-[#0F1111] font-bold px-6 py-3 rounded-md transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#EAEDED]">
      {/* Header — Amazon Secure Checkout bar */}
      <div className="bg-white border-b border-[#D5D9D9] px-4 py-3 shadow-sm">
        <div className="max-w-5xl mx-auto flex items-center gap-3">
          <button onClick={() => router.back()} className="p-1.5 rounded-sm hover:bg-gray-100 transition-colors">
            <svg className="w-5 h-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4 text-[#007600]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
            </svg>
            <h1 className="text-xl font-bold text-[#0F1111]">Secure Checkout</h1>
          </div>
        </div>
      </div>

      {/* Main content — left-aligned, structured layout */}
      <div className="max-w-5xl mx-auto px-4 py-6">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Left column — Address + Items + Payment */}
          <div className="flex-1 space-y-4">
            {/* Delivery Address */}
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-sm border border-[#D5D9D9] p-4"
            >
              <div className="flex items-center gap-2 mb-2 pb-2 border-b border-[#D5D9D9]">
                <span className="text-sm font-bold text-[#C45500]">1</span>
                <h2 className="font-bold text-sm text-[#0F1111]">Delivery Address</h2>
              </div>
              <div className="flex items-start gap-3 ml-5">
                <div>
                  <p className="text-sm font-bold text-[#0F1111]">{addressLabel}</p>
                  <p className="text-xs text-gray-600 mt-0.5">
                    {addressLabel.toLowerCase().includes('mom')
                      ? "Mom's House, Andheri West, Mumbai — 400058"
                      : "Home, Connaught Place, New Delhi — 110001"}
                  </p>
                  <p className="text-xs text-[#007600] mt-1 font-bold">⚡ Estimated delivery: 8–12 minutes</p>
                </div>
                <button className="text-xs text-[#007185] hover:text-[#C45500] hover:underline ml-auto">Change</button>
              </div>
            </motion.div>

            {/* Order Items */}
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-sm border border-[#D5D9D9] p-4"
            >
              <div className="flex items-center gap-2 mb-3 pb-2 border-b border-[#D5D9D9]">
                <span className="text-sm font-bold text-[#C45500]">2</span>
                <h2 className="font-bold text-sm text-[#0F1111]">
                  Review Items ({cartItems.length})
                </h2>
              </div>
              <div className="space-y-3">
                {cartItems.map((item, i) => (
                  <div key={i} className="flex items-center gap-3 py-2 border-b border-gray-100 last:border-0">
                    <span className="text-2xl w-10 text-center flex-shrink-0">{item.image}</span>
                    <div className="flex-1">
                      <p className="font-medium text-sm text-[#007185] hover:text-[#C45500] cursor-pointer">{item.name}</p>
                      <p className="text-xs text-gray-500">Qty: {item.qty}</p>
                    </div>
                    <p className="font-bold text-sm text-[#0F1111]">₹{item.price * item.qty}</p>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Payment Method */}
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-sm border border-[#D5D9D9] p-4"
            >
              <div className="flex items-center gap-2 mb-3 pb-2 border-b border-[#D5D9D9]">
                <span className="text-sm font-bold text-[#C45500]">3</span>
                <h2 className="font-bold text-sm text-[#0F1111]">Payment Method</h2>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-sm bg-[#F7F8F8] border-2 border-[#007185]">
                <div className="w-4 h-4 rounded-full border-[5px] border-[#007185]" />
                <div>
                  <p className="font-medium text-sm text-[#0F1111]">UPI / Amazon Pay</p>
                  <p className="text-xs text-gray-500">pranjal@upi (demo)</p>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Right column — Order Summary */}
          <div className="lg:w-[320px] flex-shrink-0">
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white rounded-sm border border-[#D5D9D9] p-4 sticky top-20"
            >
              {/* Place Order button — top of summary (Amazon style) */}
              <button
                onClick={handleConfirm}
                disabled={placing || cartItems.length === 0}
                className="w-full bg-[#FFD814] hover:bg-[#F7CA00] disabled:opacity-60 text-[#0F1111] font-bold text-sm py-2.5 rounded-md shadow-sm transition-all duration-200 mb-3"
              >
                {placing ? '⏳ Placing...' : 'Place your order'}
              </button>

              <p className="text-[11px] text-gray-500 mb-3 leading-relaxed">
                By placing your order, you agree to Amazon&apos;s Conditions of Use and Privacy Notice. This is a hackathon demo.
              </p>

              <div className="border-t border-[#D5D9D9] pt-3">
                <h3 className="font-bold text-sm text-[#0F1111] mb-2">Order Summary</h3>
                <div className="space-y-1.5 text-xs">
                  <div className="flex justify-between text-gray-600">
                    <span>Items ({cartItems.length}):</span><span>₹{subtotal}</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Delivery:</span>
                    <span className={deliveryFee === 0 ? 'text-[#007600] font-bold' : ''}>
                      {deliveryFee === 0 ? 'FREE' : `₹${deliveryFee}`}
                    </span>
                  </div>
                  <div className="flex justify-between font-bold text-[#CC0C39] text-base pt-2 border-t border-[#D5D9D9]">
                    <span>Order total:</span><span>₹{total}</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function PaymentPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-[#EAEDED]">
        <div className="animate-spin text-3xl">⚡</div>
      </div>
    }>
      <PaymentContent />
    </Suspense>
  );
}
