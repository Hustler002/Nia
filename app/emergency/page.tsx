'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { EMERGENCY_CATEGORIES, EmergencyCategory, detectEmergencyCategory } from '@/lib/emergency/categories';
import { useNiaChatStore } from '@/lib/useNiaStore';

export default function EmergencyPage() {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<EmergencyCategory | null>(null);
  const selectedRef = useRef<HTMLDivElement>(null);

  // Handle auto-detect from input
  useEffect(() => {
    if (query.trim().length > 2) {
      const detected = detectEmergencyCategory(query);
      if (detected && detected.id !== selectedCategory?.id) {
        setSelectedCategory(detected);
        // Add small delay to let it render before scroll
        setTimeout(() => {
          selectedRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, 100);
      }
    }
  }, [query, selectedCategory?.id]);

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* Header */}
      <div className="bg-gradient-to-r from-red-500 to-orange-500 pt-12 pb-8 px-4 sm:px-8 shadow-md text-white sticky top-0 z-20">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl sm:text-4xl font-extrabold mb-2 tracking-tight">🚨 What's the emergency?</h1>
          <p className="text-red-100 text-lg mb-6 opacity-90">Tell us or tap below — assembled kit + order in 60 seconds</p>
          
          <div className="relative hidden md:block">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Describe your emergency... (e.g. 'my baby has rash')"
              className="w-full text-gray-900 px-5 py-4 rounded-xl text-lg outline-none focus:ring-4 focus:ring-red-300 transition-all shadow-lg font-medium"
            />
            <button aria-label="Voice input" className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-red-500 text-2xl">
              🎤
            </button>
          </div>
        </div>
      </div>

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
                className={`w-full h-full p-4 rounded-2xl border-2 text-left flex flex-col items-center justify-center transition-all ${
                  selectedCategory?.id === category.id 
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
                <span className="bg-white/80 text-xs px-2 py-1 rounded-full font-bold shadow-sm" style={{ color: category.color }}>
                  ~10 min
                </span>
                <span className="text-[10px] text-gray-500 mt-1">{category.kit.length} items</span>
              </button>
            </div>
          ))}
        </div>

        {/* Expanded View */}
        {selectedCategory && (
          <div 
            ref={selectedRef}
            className="mt-8 bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100 animate-in fade-in slide-in-from-bottom-4 duration-300"
          >
            <div className="p-6 border-b border-gray-100 flex items-center gap-4" style={{ backgroundColor: `${selectedCategory.color}10` }}>
              <span className="text-4xl">{selectedCategory.icon}</span>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">{selectedCategory.name} Kit</h2>
                <p className="text-gray-600">Carefully curated items for immediate relief.</p>
              </div>
            </div>
            
            <div className="p-6">
              <div className="space-y-4 mb-6">
                {selectedCategory.kit.map(item => (
                  <div key={item.id} className="flex items-center justify-between bg-gray-50 p-3 rounded-xl">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm">{item.image}</span>
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
                      useNiaChatStore.getState().openCart();
                    }}
                    className="bg-orange-500 hover:bg-orange-600 text-white text-lg font-bold py-4 md:px-12 rounded-xl shadow-lg shadow-orange-500/30 transition-all transform hover:-translate-y-1"
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
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Mobile Sticky Input Bar */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-200 shadow-[0_-10px_20px_-10px_rgba(0,0,0,0.1)] z-10">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="What do you need?"
          className="w-full bg-gray-100 text-gray-900 px-4 py-3 rounded-full text-base outline-none focus:ring-2 focus:ring-red-400"
        />
      </div>
    </div>
  );
}
