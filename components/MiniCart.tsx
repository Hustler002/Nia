'use client';

import { useNiaChatStore } from '@/lib/useNiaStore';
import Image from 'next/image';

export default function MiniCart() {
  const { isCartOpen, closeCart, liveCart, updateQty, removeFromCart } = useNiaChatStore();

  if (!isCartOpen) return null;

  const totalItems = liveCart.reduce((sum, item) => sum + item.qty, 0);
  const totalPrice = liveCart.reduce((sum, item) => sum + item.price * item.qty, 0);

  const handleCheckout = () => {
    alert('Checkout flow not available in demo. In production: saved address + payment pre-fill + 1-tap confirm.');
  };

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100]" 
        onClick={closeCart}
      />

      {/* Drawer */}
      <div className="fixed top-0 right-0 h-full w-full max-w-md bg-white shadow-2xl z-[101] flex flex-col transform transition-transform duration-300">
        <div className="flex items-center justify-between p-4 border-b border-gray-100">
          <h2 className="text-xl font-bold text-gray-900">Your Cart</h2>
          <button onClick={closeCart} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <svg className="w-6 h-6 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {liveCart.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-500 space-y-4">
              <span className="text-6xl">🛒</span>
              <p>Your cart is empty.</p>
              <button 
                onClick={closeCart}
                className="text-[#00838F] font-semibold hover:underline"
              >
                Continue Shopping
              </button>
            </div>
          ) : (
            liveCart.map((item) => (
              <div key={item.id} className="flex gap-4 bg-white border border-gray-100 p-3 rounded-2xl shadow-sm">
                <div className="w-16 h-16 bg-gray-50 rounded-xl flex items-center justify-center text-3xl shrink-0">
                  {item.image.length < 5 ? item.image : <img src={item.image} alt={item.name} className="w-12 h-12 object-contain" />}
                </div>
                <div className="flex-1 min-w-0 flex flex-col justify-between">
                  <div className="flex justify-between items-start gap-2">
                    <p className="text-sm font-semibold text-gray-900 truncate">{item.name}</p>
                    <button 
                      onClick={() => removeFromCart(item.id)}
                      className="text-gray-400 hover:text-red-500 transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                  <div className="flex items-center justify-between mt-2">
                    <p className="text-sm font-bold text-[#0F1111]">₹{item.price * item.qty}</p>
                    <div className="flex items-center gap-3 bg-gray-50 rounded-lg px-2 py-1">
                      <button onClick={() => updateQty(item.id, item.qty - 1)} className="w-6 h-6 flex items-center justify-center font-bold text-gray-600 hover:text-gray-900">-</button>
                      <span className="text-sm font-semibold w-4 text-center">{item.qty}</span>
                      <button onClick={() => updateQty(item.id, item.qty + 1)} className="w-6 h-6 flex items-center justify-center font-bold text-[#00838F] hover:text-[#006d75]">+</button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {liveCart.length > 0 && (
          <div className="p-4 border-t border-gray-100 bg-gray-50">
            <div className="flex justify-between items-center mb-2">
              <span className="text-gray-600 font-medium">Subtotal ({totalItems} items)</span>
              <span className="text-xl font-bold text-[#0F1111]">₹{totalPrice}</span>
            </div>
            <p className="text-xs text-green-600 font-medium mb-4 flex items-center gap-1">
              <span>⚡</span> All items arrive in ~10 min
            </p>
            <button 
              onClick={handleCheckout}
              className="w-full py-4 bg-[#FF9900] hover:bg-[#e88b00] text-white font-bold rounded-2xl transition-all shadow-lg shadow-[#FF9900]/20 flex justify-center items-center gap-2"
            >
              Proceed to Checkout <span className="font-normal text-white/80">→</span>
            </button>
            <button 
              onClick={closeCart}
              className="w-full mt-3 py-2 text-gray-500 font-medium hover:text-gray-800 transition-colors text-sm"
            >
              Continue Shopping
            </button>
          </div>
        )}
      </div>
    </>
  );
}
