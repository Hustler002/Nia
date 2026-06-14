'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useNiaChatStore } from '@/lib/useNiaStore';
import { CATALOG } from '@/lib/catalog/products';

const CATEGORIES = [
  { id: 'All', icon: '🏠' },
  { id: 'Snacks', icon: '🍿' },
  { id: 'Beverages', icon: '🥤' },
  { id: 'Dairy', icon: '🥛' },
  { id: 'Fitness & Protein', icon: '💪' },
  { id: 'Breakfast & Eggs', icon: '🍳' },
  { id: 'Personal Care', icon: '🧴' },
  { id: 'Health & Medicine', icon: '💊' },
  { id: 'Grocery Staples', icon: '🛒' },
  { id: 'Instant Food', icon: '🍜' },
  { id: 'Electronics Accessories', icon: '🎧' },
];

export default function ProductBrowsePanel() {
  const { liveCart, browseCategory, addToCart, removeFromCart, updateQty, clearCart, setBrowseCategory, open, relatedProducts, activeQuery } = useNiaChatStore();
  const router = useRouter();
  const [cartOpen, setCartOpen] = useState(false);
  const [addedId, setAddedId] = useState<string | null>(null);

  // Determine what to show in the grid
  let filtered = CATALOG;
  if (browseCategory === 'Suggested') {
    // Show AI's related products, fallback to catalog if empty for some reason
    filtered = relatedProducts.length > 0 ? relatedProducts as any : CATALOG;
  } else if (browseCategory !== 'All') {
    filtered = CATALOG.filter(p => p.category === browseCategory);
  }

  // Dynamic categories array — inject "Suggested" if there's an active query
  const dynamicCategories = [...CATEGORIES];
  if (activeQuery && relatedProducts.length > 0) {
    dynamicCategories.unshift({ id: 'Suggested', icon: '✨' });
  }

  // Auto-switch to Suggested tab when a new query comes in
  useEffect(() => {
    if (activeQuery && relatedProducts.length > 0) {
      setBrowseCategory('Suggested');
    }
  }, [activeQuery, relatedProducts, setBrowseCategory]);

  const totalItems = liveCart.reduce((sum, i) => sum + i.qty, 0);
  const totalPrice = liveCart.reduce((sum, i) => sum + i.price * i.qty, 0);

  const handleAdd = (product: typeof CATALOG[0]) => {
    addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      mrp: product.mrp,
      image: product.imageUrl,
      qty: 1,
      category: product.category,
    });
    setAddedId(product.id);
    setTimeout(() => setAddedId(null), 1000);
  };

  const cartQty = (id: string) => liveCart.find(i => i.id === id)?.qty ?? 0;

  return (
    <section className="w-full bg-white border-t border-gray-100">
      {/* ── Section Header ── */}
      <div className="max-w-7xl mx-auto px-4 pt-8 pb-4 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-[#0F1111]">Shop Everything</h2>
          <p className="text-sm text-gray-400 mt-0.5">Browse manually or let Nia build your cart with AI</p>
        </div>
        <button
          onClick={() => open('What should I get today?')}
          className="flex items-center gap-2 px-4 py-2 bg-[#00838F] text-white text-sm font-semibold rounded-xl hover:bg-[#006d75] transition-all shadow-md hover:shadow-lg"
        >
          <span>✨</span>
          <span>Ask Nia</span>
        </button>
      </div>

      {/* ── Category Tabs (horizontal scroll) ── */}
      <div className="max-w-7xl mx-auto px-4 pb-4">
        <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
          {dynamicCategories.map(cat => (
            <button
              key={cat.id}
              onClick={() => setBrowseCategory(cat.id)}
              className={`flex-shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium border transition-all ${
                browseCategory === cat.id
                  ? 'bg-[#00838F] text-white border-[#00838F] shadow-md'
                  : 'bg-white text-gray-600 border-gray-200 hover:border-[#00838F] hover:text-[#00838F]'
              }`}
            >
              <span>{cat.icon}</span>
              <span>{cat.id}</span>
            </button>
          ))}
        </div>
      </div>

      {/* ── Product Grid ── */}
      <div className="max-w-7xl mx-auto px-4 pb-10">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
          <AnimatePresence mode="popLayout">
            {filtered.map((product) => {
              const qty = cartQty(product.id);
              const justAdded = addedId === product.id;
              const discount = product.mrp > product.price
                ? Math.round(((product.mrp - product.price) / product.mrp) * 100)
                : 0;

              return (
                <motion.div
                  key={product.id}
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.15 }}
                  className="bg-white border border-gray-100 rounded-2xl p-3 flex flex-col gap-2 hover:shadow-md hover:border-[#00838F]/20 transition-all group"
                >
                  {/* Image / Emoji */}
                  <div className="relative w-full aspect-square bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl flex items-center justify-center text-4xl">
                    {product.imageUrl}
                    {discount > 0 && (
                      <span className="absolute top-1.5 left-1.5 bg-green-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                        -{discount}%
                      </span>
                    )}
                    {qty > 0 && (
                      <span className="absolute top-1.5 right-1.5 bg-[#00838F] text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center">
                        {qty}
                      </span>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-[#0F1111] leading-tight line-clamp-2">{product.name}</p>
                    <p className="text-[10px] text-gray-400 mt-0.5">{product.unit}</p>
                    <div className="flex items-baseline gap-1 mt-1">
                      <span className="text-sm font-bold text-[#0F1111]">₹{product.price}</span>
                      {product.mrp > product.price && (
                        <span className="text-[10px] text-gray-400 line-through">₹{product.mrp}</span>
                      )}
                    </div>
                    <div className="flex items-center gap-1 mt-0.5">
                      <span className="text-[10px] text-amber-500">★ {product.rating}</span>
                      <span className="text-[9px] text-gray-300">·</span>
                      <span className="text-[10px] text-green-600 font-medium">~{product.eta_minutes} min</span>
                    </div>
                  </div>

                  {/* Add button / Qty control */}
                  {qty === 0 ? (
                    <motion.button
                      whileTap={{ scale: 0.94 }}
                      onClick={() => handleAdd(product)}
                      className={`w-full py-2 rounded-xl text-xs font-bold transition-all ${
                        justAdded
                          ? 'bg-green-500 text-white'
                          : 'bg-[#E0F2F1] text-[#00838F] hover:bg-[#00838F] hover:text-white'
                      }`}
                    >
                      {justAdded ? '✓ Added!' : '+ Add'}
                    </motion.button>
                  ) : (
                    <div className="flex items-center justify-between bg-[#00838F] rounded-xl px-2 py-1">
                      <button
                        onClick={() => updateQty(product.id, qty - 1)}
                        className="w-6 h-6 text-white font-bold text-lg flex items-center justify-center hover:bg-white/20 rounded-lg transition-colors"
                      >
                        −
                      </button>
                      <span className="text-white text-xs font-bold">{qty}</span>
                      <button
                        onClick={() => updateQty(product.id, qty + 1)}
                        className="w-6 h-6 text-white font-bold text-lg flex items-center justify-center hover:bg-white/20 rounded-lg transition-colors"
                      >
                        +
                      </button>
                    </div>
                  )}
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      </div>

      {/* ── Floating Cart Bar (appears when cart has items) ── */}
      <AnimatePresence>
        {totalItems > 0 && !cartOpen && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 sm:left-auto sm:translate-x-0 sm:right-[440px]"
          >
            <button
              onClick={() => setCartOpen(true)}
              className="flex items-center gap-3 bg-[#0F1111] text-white px-6 py-3.5 rounded-2xl shadow-2xl hover:bg-[#232F3E] transition-all"
            >
              <div className="relative">
                <span className="text-xl">🛒</span>
                <span className="absolute -top-2 -right-2 bg-[#FF9900] text-[#0F1111] text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                  {totalItems}
                </span>
              </div>
              <div className="text-left">
                <p className="text-xs text-white/60">{totalItems} item{totalItems > 1 ? 's' : ''}</p>
                <p className="text-sm font-bold">View Cart · ₹{totalPrice}</p>
              </div>
              <span className="text-white/40">→</span>
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Cart Drawer ── */}
      <AnimatePresence>
        {cartOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/40 z-[990]"
              onClick={() => setCartOpen(false)}
            />
            <motion.div
              initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="fixed right-0 top-0 bottom-0 w-full sm:w-[380px] bg-white z-[991] flex flex-col shadow-2xl"
            >
              {/* Cart Header */}
              <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
                <div>
                  <h3 className="font-bold text-[#0F1111]">Your Cart 🛒</h3>
                  <p className="text-xs text-gray-400">{totalItems} item{totalItems > 1 ? 's' : ''} · ~10 min delivery</p>
                </div>
                <button onClick={() => setCartOpen(false)} className="w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center">
                  <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Cart Items */}
              <div className="flex-1 overflow-y-auto px-4 py-3 space-y-2">
                {liveCart.map(item => (
                  <motion.div
                    key={item.id}
                    layout
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl"
                  >
                    <span className="text-2xl w-10 h-10 flex items-center justify-center bg-white rounded-lg shadow-sm flex-shrink-0">
                      {item.image}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-[#0F1111] line-clamp-1">{item.name}</p>
                      <p className="text-xs text-[#00838F] font-bold mt-0.5">₹{item.price}</p>
                    </div>
                    <div className="flex items-center gap-1 bg-[#00838F] rounded-xl px-2 py-1">
                      <button onClick={() => updateQty(item.id, item.qty - 1)} className="text-white text-sm font-bold w-5 h-5 flex items-center justify-center hover:bg-white/20 rounded">−</button>
                      <span className="text-white text-xs font-bold w-4 text-center">{item.qty}</span>
                      <button onClick={() => updateQty(item.id, item.qty + 1)} className="text-white text-sm font-bold w-5 h-5 flex items-center justify-center hover:bg-white/20 rounded">+</button>
                    </div>
                    <button onClick={() => removeFromCart(item.id)} className="text-gray-300 hover:text-red-400 transition-colors ml-1">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </motion.div>
                ))}

                {/* Ask Nia to add more */}
                <button
                  onClick={() => { setCartOpen(false); open('Add more items to my cart'); }}
                  className="w-full py-3 border-2 border-dashed border-[#00838F]/30 text-[#00838F] text-sm font-medium rounded-xl hover:bg-[#E0F2F1] transition-colors flex items-center justify-center gap-2"
                >
                  <span>✨</span>
                  <span>Ask Nia to add more</span>
                </button>
              </div>

              {/* Cart Footer */}
              <div className="border-t border-gray-100 p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-gray-400">Total ({totalItems} items)</p>
                    <p className="text-2xl font-bold text-[#0F1111]">₹{totalPrice}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-green-600 font-medium">Free delivery</p>
                    <p className="text-xs text-gray-400">arrives in ~10 min</p>
                  </div>
                </div>
                <button
                  onClick={() => { setCartOpen(false); router.push('/payment'); }}
                  className="w-full bg-[#FF9900] hover:bg-[#f08900] text-[#0F1111] font-bold py-4 rounded-2xl transition-all shadow-lg hover:shadow-xl text-sm"
                >
                  Place Order →
                </button>
                <button onClick={clearCart} className="w-full text-xs text-gray-400 hover:text-red-400 transition-colors py-1">
                  Clear cart
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </section>
  );
}
