'use client';

import { useCartStore } from '@/lib/stores/useCartStore';
import { useNiaChatStore } from '@/lib/useNiaStore';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';

export default function MiniCart() {
  const { items, isOpen, closeCart, removeItem, updateQuantity } = useCartStore();
  const totalItems = useCartStore((s) => s.getTotalItems());
  const totalPrice = useCartStore((s) => s.getTotalPrice());
  const maxETA = items.length > 0 ? Math.max(...items.map((i) => i.eta || 10)) : 0;

  // Nia awareness for panel coexistence
  const isNiaOpen = useNiaChatStore((s) => s.isOpen);
  const [isDesktop, setIsDesktop] = useState(false);

  // Desktop/mobile detection
  useEffect(() => {
    const check = () => setIsDesktop(window.innerWidth >= 640);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  // Mobile: auto-close Nia when cart opens (cart takes priority)
  useEffect(() => {
    if (isOpen && !isDesktop && isNiaOpen) {
      useNiaChatStore.getState().close();
    }
  }, [isOpen, isDesktop, isNiaOpen]);

  return (
   <>
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/30 backdrop-blur-sm z-[900]"
            onClick={closeCart}
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed top-0 right-0 bottom-0 w-full sm:w-[380px] bg-white shadow-2xl z-[901] flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <span className="text-lg">🛒</span>
                <h2 className="text-base font-bold text-[#0F1111]">
                  Cart ({totalItems} item{totalItems !== 1 ? 's' : ''})
                </h2>
              </div>
              <button
                onClick={closeCart}
                className="w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center transition-colors"
                aria-label="Close cart"
              >
                <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Items */}
            <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
              {items.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center py-12">
                  <span className="text-4xl mb-3">🛒</span>
                  <p className="text-sm font-medium text-gray-500">Your cart is empty</p>
                  <p className="text-xs text-gray-400 mt-1">Ask Nia to build you a cart!</p>
                </div>
              ) : (
                items.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl border border-gray-100"
                  >
                    <span className="text-2xl w-10 text-center flex-shrink-0">{item.image}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-[#0F1111] truncate">{item.name}</p>
                      <p className="text-xs text-gray-400">{item.category}</p>
                    </div>
                    {/* Qty controls */}
                    <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden bg-white flex-shrink-0">
                      <button
                        onClick={() => updateQuantity(item.id, item.qty - 1)}
                        className="w-7 h-7 flex items-center justify-center text-sm hover:bg-gray-100"
                      >
                        −
                      </button>
                      <span className="w-7 h-7 flex items-center justify-center text-xs font-semibold">
                        {item.qty}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.id, item.qty + 1)}
                        className="w-7 h-7 flex items-center justify-center text-sm hover:bg-gray-100"
                      >
                        +
                      </button>
                    </div>
                    <span className="text-sm font-semibold text-[#0F1111] flex-shrink-0 w-14 text-right">
                      ₹{item.price * item.qty}
                    </span>
                    <button
                      onClick={() => removeItem(item.id)}
                      className="text-gray-300 hover:text-red-400 transition-colors flex-shrink-0"
                      aria-label={`Remove ${item.name}`}
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ))
              )}
            </div>

            {/* Footer */}
            {items.length > 0 && (
              <div className="border-t border-gray-100 px-5 py-4 bg-white">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm text-gray-500">Subtotal</span>
                  <span className="text-lg font-bold text-[#0F1111]">₹{totalPrice}</span>
                </div>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs text-gray-400">Estimated delivery</span>
                  <span className="text-xs text-green-600 font-medium flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                    ~{maxETA} min
                  </span>
                </div>
                <button
                  onClick={() => {
                    closeCart();
                    // Navigate to payment
                    window.location.href = '/payment';
                  }}
                  className="w-full py-3 bg-[#FF9900] hover:bg-[#e88b00] text-white font-semibold text-sm rounded-xl shadow-md transition-colors"
                >
                  Proceed to Checkout
                </button>
                <button
                  onClick={closeCart}
                  className="w-full mt-2 py-2 text-xs text-gray-500 hover:text-[#00838F] font-medium transition-colors"
                >
                  Continue Shopping
                </button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>

    {/* Minimized cart pill — visible on mobile when displaced by Nia */}
    {!isOpen && isNiaOpen && !isDesktop && totalItems > 0 && (
      <button
        onClick={() => useCartStore.getState().openCart()}
        className="fixed bottom-24 left-4 z-[1000] px-4 py-2.5 bg-[#FF9900] text-white rounded-full shadow-lg flex items-center gap-2 sm:hidden animate-in fade-in slide-in-from-left-4 duration-300"
      >
        <span className="text-base">🛒</span>
        <span className="text-sm font-semibold">{totalItems} item{totalItems !== 1 ? 's' : ''}</span>
      </button>
    )}
   </>
  );
}
