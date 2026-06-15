'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { EMERGENCY_CATEGORIES, EmergencyCategory, detectEmergencyCategory } from '@/lib/emergency/categories';
import { useNiaChatStore } from '@/lib/useNiaStore';
import { useCartStore } from '@/lib/stores/useCartStore';
import CustomEmergencyTile from '@/components/emergency/CustomEmergencyTile';
import type { CustomEmergencyTileHandle } from '@/components/emergency/CustomEmergencyTile';

export default function EmergencyPage() {
  const router = useRouter();
  const [inputText, setInputText] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<EmergencyCategory | null>(null);
  const selectedRef = useRef<HTMLDivElement>(null);
  const customTileRef = useRef<CustomEmergencyTileHandle>(null);
  const [orderConfirmed, setOrderConfirmed] = useState(false);
  const [orderedKitName, setOrderedKitName] = useState('');
  const [orderedKitTotal, setOrderedKitTotal] = useState(0);
  const [orderedKitCount, setOrderedKitCount] = useState(0);

  // Cart awareness for sticky bar
  const cartItems = useCartStore((s) => s.items);
  const cartTotalItems = useCartStore((s) => s.getTotalItems());
  const cartTotalPrice = useCartStore((s) => s.getTotalPrice());
  const [isScrolled, setIsScrolled] = useState(false);

  // Hysteresis scroll listener — two thresholds prevent bounce
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 90) {
        setIsScrolled(true);
      } else if (window.scrollY < 40) {
        setIsScrolled(false);
      }
      // Between 40–90: no change (dead zone prevents thrashing)
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Search only runs on explicit submit
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = inputText.trim();
    if (trimmed.length < 2) return;
    const detected = detectEmergencyCategory(trimmed);
    if (detected) {
      setSelectedCategory(detected);
      setTimeout(() => {
        selectedRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 100);
    } else {
      // Unknown emergency — route to the custom tile and auto-submit
      setSelectedCategory(null);
      customTileRef.current?.prefillAndSubmit(trimmed);
    }
  };

  return (
    <div className="min-h-screen bg-[#EAEDED] pb-24">
      {/* Header — sticky, collapses subtitle on scroll, search always visible */}
      <header className="sticky top-0 z-50 bg-gradient-to-r from-red-500 to-orange-500 shadow-md text-white">
        <div
          className="px-4 sm:px-8 overflow-hidden transition-all duration-300 ease-in-out"
          style={{
            paddingTop: isScrolled ? '10px' : '48px',
            paddingBottom: isScrolled ? '10px' : '32px',
          }}
        >
          <div className="max-w-4xl mx-auto">
            {/* Row 1: Back + Title (always visible) */}
            <div className={`flex items-center gap-3 transition-all duration-300 ${isScrolled ? 'mb-2' : 'mb-1'}`}>
              <a
                href="/"
                className="inline-flex items-center gap-1 text-white/80 hover:text-white text-sm font-medium transition-colors flex-shrink-0"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
                </svg>
                <span className={`transition-all duration-300 ${isScrolled ? 'hidden sm:inline' : ''}`}>Back</span>
              </a>
              <h1
                className="font-extrabold tracking-tight transition-all duration-300"
                style={{
                  fontSize: isScrolled ? '1.1rem' : '2.25rem',
                  lineHeight: isScrolled ? '1.5rem' : '2.5rem',
                }}
              >🚨 What&apos;s the emergency?</h1>
            </div>

            {/* Row 2: Subtitle — collapses smoothly with max-height */}
            <div
              className="overflow-hidden transition-all duration-300 ease-in-out"
              style={{
                maxHeight: isScrolled ? '0px' : '50px',
                opacity: isScrolled ? 0 : 0.9,
                marginBottom: isScrolled ? '0px' : '16px',
              }}
            >
              <p className="text-red-100 text-lg">Tell us or tap below — assembled kit + order in 60 seconds</p>
            </div>

            {/* Row 3: Search bar — always visible, fixed height */}
            <form onSubmit={handleSearch} className={`relative hidden md:flex transition-all duration-300 ${isScrolled ? '' : ''}`}>
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Describe your emergency... (e.g. 'my baby has rash')"
                className="flex-1 h-11 bg-white text-gray-900 placeholder-gray-500 px-5 text-base outline-none font-medium rounded-l-md rounded-r-none border border-r-0 border-[#D5D9D9] focus:ring-2 focus:ring-[#FF9900] focus:border-transparent"
              />
              <button
                type="submit"
                aria-label="Search"
                className="h-11 w-14 flex items-center justify-center bg-[#FFA41C] hover:bg-[#FA8900] rounded-r-md rounded-l-none transition-colors flex-shrink-0"
              >
                <svg className="w-5 h-5 text-[#0F1111]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                </svg>
              </button>
            </form>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-8 mt-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {EMERGENCY_CATEGORIES.map(category => (
            <div key={category.id}>
              <button
                onClick={() => {
                  setSelectedCategory(category === selectedCategory ? null : category);
                  if (category !== selectedCategory) {
                    setTimeout(() => {
                      selectedRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    }, 50);
                  }
                }}
                className={`w-full h-full p-4 rounded-sm border-2 text-left flex flex-col items-center justify-center transition-all ${selectedCategory?.id === category.id
                  ? 'border-transparent shadow-md scale-[1.02]'
                  : 'border-transparent hover:scale-105'
                  }`}
                style={{
                  backgroundColor: `${category.color}15`, // 15% opacity trick
                  borderColor: selectedCategory?.id === category.id ? category.color : 'transparent'
                }}
              >
                <div className="text-4xl mb-3">{category.icon}</div>
                <h3 className="font-bold text-gray-900 text-center leading-tight mb-2">
                  {category.name}
                </h3>
                <span className="bg-white/80 text-xs px-2 py-1 rounded-sm font-bold shadow-sm" style={{ color: category.color }}>
                  ~10 min
                </span>
                <span className="text-[10px] text-gray-500 mt-1">{category.kit.length} items</span>
              </button>
            </div>
          ))}

          {/* 9th tile — Custom Emergency ("Something Else?") */}
          <CustomEmergencyTile ref={customTileRef} />
        </div>

        {/* Expanded View */}
        {selectedCategory && (
          <div
            ref={selectedRef}
            className="mt-8 bg-white rounded-sm shadow-md overflow-hidden border border-[#D5D9D9] animate-in fade-in slide-in-from-bottom-4 duration-300"
          >
            <div className="p-6 border-b border-[#D5D9D9] flex items-center gap-4" style={{ backgroundColor: `${selectedCategory.color}10` }}>
              <span className="text-4xl">{selectedCategory.icon}</span>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">{selectedCategory.name} Kit</h2>
                <p className="text-gray-600">Carefully curated items for immediate relief.</p>
              </div>
            </div>

            <div className="p-6">
              <div className="space-y-4 mb-6">
                {selectedCategory.kit.map(item => (
                  <div key={item.id} className="flex items-center justify-between bg-[#F7F8F8] p-3 rounded-sm border border-[#D5D9D9]">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl w-10 h-10 bg-white rounded-sm flex items-center justify-center border border-[#D5D9D9]">{item.image}</span>
                      <div>
                        <div className="font-semibold text-gray-900">{item.name}</div>
                        <div className="text-sm text-gray-500">Qty: {item.qty}</div>
                      </div>
                    </div>
                    <div className="font-bold text-gray-900">₹{item.price * item.qty}</div>
                  </div>
                ))}
              </div>

              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pt-6 border-t border-gray-100">
                {!orderConfirmed ? (
                  <>
                    <div>
                      <div className="text-3xl font-extrabold text-gray-900 mb-1">
                        ₹{selectedCategory.kit.reduce((sum, item) => sum + (item.price * item.qty), 0)}
                      </div>
                      <div className="text-sm text-green-600 font-bold flex items-center gap-1">
                        ⚡ Fastest available: ~8 min from Central Hub
                      </div>
                    </div>

                    <div className="flex flex-col w-full md:w-auto gap-3">
                      <button
                        onClick={() => {
                          const total = selectedCategory.kit.reduce((sum, item) => sum + (item.price * item.qty), 0);
                          selectedCategory.kit.forEach(item => {
                            useNiaChatStore.getState().addToCart({
                              id: item.id,
                              name: item.name,
                              price: item.price,
                              mrp: item.price + 20,
                              image: item.image,
                              qty: item.qty,
                              category: selectedCategory.name,
                            });
                          });
                          setOrderedKitName(selectedCategory.name);
                          setOrderedKitTotal(total);
                          setOrderedKitCount(selectedCategory.kit.length);
                          setOrderConfirmed(true);
                          setTimeout(() => {
                            selectedRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                          }, 100);
                        }}
                        className="bg-[#FFD814] hover:bg-[#F7CA00] text-[#0F1111] text-lg font-bold py-4 md:px-12 rounded-md shadow-sm transition-all transform hover:-translate-y-0.5"
                      >
                        Order this kit
                      </button>
                      <button
                        onClick={() => {
                          useNiaChatStore.getState().open('Customize my ' + selectedCategory.name + ' emergency kit');
                          router.push('/');
                        }}
                        className="text-gray-500 hover:text-gray-900 font-medium text-sm underline underline-offset-4 decoration-gray-300 text-center"
                      >
                        Customize kit in chat
                      </button>
                    </div>
                  </>
                ) : (
                  /* ── Order Confirmation Inline ── */
                  <div className="w-full">
                    <div className="bg-green-50 border border-green-200 rounded-sm p-5 mb-4">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0">
                          <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                          </svg>
                        </div>
                        <div>
                          <h3 className="text-lg font-bold text-green-800">{orderedKitName} Kit added!</h3>
                          <p className="text-sm text-green-700">
                            {orderedKitCount} items · ₹{orderedKitTotal} · Arrives in ~8 min
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3">
                      <button
                        onClick={() => useCartStore.getState().openCart()}
                        className="flex-1 py-3 px-6 bg-white border-2 border-[#D5D9D9] text-[#0F1111] font-bold rounded-md hover:bg-gray-50 transition-colors text-center"
                      >
                        🛒 View Cart
                      </button>
                      <button
                        onClick={() => router.push('/express-checkout')}
                        className="flex-1 py-3 px-6 bg-[#FFD814] hover:bg-[#F7CA00] text-[#0F1111] font-bold rounded-md shadow-sm transition-all transform hover:-translate-y-0.5 text-center"
                      >
                        ⚡ Express Checkout →
                      </button>
                    </div>

                    <button
                      onClick={() => {
                        setOrderConfirmed(false);
                        setSelectedCategory(null);
                      }}
                      className="w-full mt-3 text-sm text-gray-400 hover:text-gray-600 font-medium text-center"
                    >
                      ← Back to kits
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Mobile Sticky Input Bar */}
      <div className={`md:hidden fixed left-0 right-0 p-3 bg-white border-t border-[#D5D9D9] shadow-[0_-10px_20px_-10px_rgba(0,0,0,0.1)] z-10 ${cartItems.length > 0 ? 'bottom-[60px]' : 'bottom-0'}`}>
        <form onSubmit={handleSearch} className="flex">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Describe your emergency..."
            className="flex-1 h-11 bg-white text-gray-900 placeholder-gray-500 px-4 text-base outline-none rounded-l-md rounded-r-none border border-r-0 border-[#D5D9D9] focus:ring-2 focus:ring-[#FF9900] focus:border-transparent"
          />
          <button
            type="submit"
            aria-label="Search"
            className="h-11 w-12 flex items-center justify-center bg-[#FFA41C] hover:bg-[#FA8900] rounded-r-md rounded-l-none transition-colors flex-shrink-0"
          >
            <svg className="w-5 h-5 text-[#0F1111]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
            </svg>
          </button>
        </form>
      </div>

      {/* Mobile Sticky Cart Bar — appears once items are in cart */}
      {cartItems.length > 0 && (
        <div className="md:hidden fixed bottom-0 left-0 right-0 z-10 bg-[#232F3E] text-white">
          <div className="flex items-center justify-between px-4 py-3">
            <div className="flex items-center gap-2">
              <span className="text-lg">🛒</span>
              <span className="text-sm font-semibold">
                {cartTotalItems} item{cartTotalItems !== 1 ? 's' : ''} · ₹{cartTotalPrice}
              </span>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => useCartStore.getState().openCart()}
                className="px-4 py-2 bg-white/20 hover:bg-white/30 text-white text-sm font-semibold rounded-md transition-colors"
              >
                View Cart
              </button>
              <button
                onClick={() => router.push('/express-checkout')}
                className="px-4 py-2 bg-[#FFD814] hover:bg-[#F7CA00] text-[#0F1111] text-sm font-bold rounded-md transition-colors"
              >
                Checkout ⚡
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
