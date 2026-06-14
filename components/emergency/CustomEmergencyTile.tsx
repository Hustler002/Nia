// components/emergency/CustomEmergencyTile.tsx
// The 9th emergency tile — freeform "Something Else?" input.
// Lets users describe any emergency; Nia builds a dynamic kit or suggests alternatives.
// ADDITIVE: This is a new file. No existing files were modified to create this.

'use client';

import { useState, useRef, forwardRef, useImperativeHandle } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCartStore } from '@/lib/stores/useCartStore';
import { useUserStore } from '@/lib/stores/useUserStore';
import { useNiaChatStore } from '@/lib/useNiaStore';
import type { CustomEmergencyResult } from '@/types';

// Expose imperative handle so the parent emergency page can pre-fill & auto-submit
export interface CustomEmergencyTileHandle {
  prefillAndSubmit: (text: string) => void;
}

const EXAMPLE_CHIPS = [
  { label: 'Torch 🔦', query: 'I need a torch' },
  { label: 'Medicines 💊', query: 'I need medicines' },
  { label: 'Food & Water 🍎', query: 'I need food and water' },
  { label: 'Cables ⚡', query: 'I need charging cables' },
];

const CustomEmergencyTile = forwardRef<CustomEmergencyTileHandle>(function CustomEmergencyTile(_, ref) {
  const [description, setDescription] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<CustomEmergencyResult | null>(null);
  const [apiResponse, setApiResponse] = useState<any>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const tileRef = useRef<HTMLDivElement>(null);

  const user = useUserStore((s) => s.user);
  const addToCart = useCartStore((s) => s.addItem);
  const openNiaPanel = useNiaChatStore((s) => s.open);

  // Imperative method for parent to pre-fill + auto-submit
  useImperativeHandle(ref, () => ({
    prefillAndSubmit: (text: string) => {
      setDescription(text);
      setResult(null);
      setApiResponse(null);
      // Scroll this tile into view
      setTimeout(() => {
        tileRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        handleSubmit(text);
      }, 100);
    },
  }));

  const handleSubmit = async (overrideText?: string) => {
    const text = overrideText || description;
    const trimmed = text.trim();
    if (trimmed.length < 3) return;

    setIsLoading(true);
    setResult(null);
    setApiResponse(null);

    try {
      const response = await fetch('/api/nia', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [{
            id: 'custom-emergency-' + Date.now(),
            role: 'user',
            content: trimmed,
            type: 'text',
            timestamp: new Date(),
          }],
          userId: user?.id ?? 'priya-sharma-001',
          pincode: user?.pincode ?? '110001',
        }),
      });

      const data = await response.json();
      setApiResponse(data);

      if (data.type === 'emergency_kit' && data.data) {
        setResult({
          kit: {
            category: data.data.category,
            name: data.data.name,
            items: data.data.items,
            totalPrice: data.data.totalPrice,
            eta: data.data.eta,
          },
          canFullyHelp: data.data.canFullyHelp ?? true,
          canPartiallyHelp: data.data.canPartiallyHelp ?? false,
          niaMessage: data.content,
          cannotHelpWith: data.data.cannotHelpWith ?? [],
          alternativeSuggestion: data.data.alternativeSuggestion ?? undefined,
        });
      } else {
        // Text response — safety override or clarification
        setResult({
          kit: null,
          canFullyHelp: false,
          canPartiallyHelp: false,
          niaMessage: data.content,
          cannotHelpWith: [],
          alternativeSuggestion: data.reason || undefined,
        });
      }
    } catch {
      setResult({
        kit: null,
        canFullyHelp: false,
        canPartiallyHelp: false,
        niaMessage: 'Something went wrong. Please try again or describe what items you need.',
        cannotHelpWith: [],
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSubmit();
  };

  const handleOrderAll = () => {
    if (!result?.kit) return;
    result.kit.items.forEach((item) => {
      addToCart({
        id: item.id,
        name: item.name,
        price: item.price,
        mrp: item.mrp,
        image: item.image,
        qty: item.qty,
        category: item.category || result.kit!.category,
      });
    });
    useCartStore.getState().openCart();
  };

  const handleCustomize = () => {
    openNiaPanel('Help me customize my emergency kit for ' + description);
  };

  const handleReset = () => {
    setDescription('');
    setResult(null);
    setApiResponse(null);
    setTimeout(() => inputRef.current?.focus(), 50);
  };

  // ─── Render ────────────────────────────────────────────────────

  return (
    <div ref={tileRef} className="col-span-2 md:col-span-4">
      <div
        className={`w-full p-5 rounded-sm border-2 border-dashed transition-all ${
          result ? 'border-[#607D8B] bg-white shadow-md' : 'border-gray-300 bg-[#F5F7F8] hover:border-[#607D8B] hover:shadow-sm'
        }`}
      >
        {/* ── Tile Header ────────────────────────────────── */}
        <div className="flex items-center gap-3 mb-3">
          <span className="text-3xl">⚠️</span>
          <div>
            <h3 className="font-bold text-gray-900 text-lg">Something Else?</h3>
            <p className="text-sm text-gray-500">
              Describe any emergency — Nia builds a kit from what&apos;s available
            </p>
          </div>
        </div>

        {/* ── Input Form ─────────────────────────────────── */}
        {!isLoading && !result && (
          <form onSubmit={handleFormSubmit} className="mt-3">
            <input
              ref={inputRef}
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe your emergency... (tyre puncture, power cut, etc.)"
              className="w-full h-11 bg-white text-gray-900 placeholder-gray-400 px-4 text-sm outline-none rounded-sm border border-[#D5D9D9] focus:ring-2 focus:ring-[#607D8B] focus:border-transparent transition-all"
            />
            <button
              type="submit"
              disabled={description.trim().length < 3}
              className="mt-3 w-full h-11 bg-[#00838F] hover:bg-[#00695C] disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-bold text-sm rounded-sm transition-colors"
            >
              Get Help →
            </button>
          </form>
        )}

        {/* ── Loading State ──────────────────────────────── */}
        <AnimatePresence>
          {isLoading && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="mt-4 p-4 bg-[#E0F2F1] rounded-sm text-center"
            >
              <p className="text-sm font-semibold text-[#00838F]">
                ⚡ Checking what Amazon Now can send for &quot;{description}&quot;
              </p>
              <div className="flex justify-center gap-1 mt-2">
                <span className="w-2 h-2 bg-[#00838F] rounded-full animate-bounce [animation-delay:0ms]" />
                <span className="w-2 h-2 bg-[#00838F] rounded-full animate-bounce [animation-delay:150ms]" />
                <span className="w-2 h-2 bg-[#00838F] rounded-full animate-bounce [animation-delay:300ms]" />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Result ─────────────────────────────────────── */}
        <AnimatePresence>
          {result && !isLoading && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
              className="mt-4 overflow-hidden"
            >
              {result.kit ? (
                <>
                  {/* ── Nia's message ─────────────────────── */}
                  <div className="p-3 bg-[#E0F2F1] rounded-sm mb-4">
                    <p className="text-sm text-[#0F1111] whitespace-pre-line">
                      <span className="font-bold text-[#00838F]">Nia:</span> {result.niaMessage}
                    </p>
                  </div>

                  {/* ── Kit Items ─────────────────────────── */}
                  <div className="bg-white border border-[#D5D9D9] rounded-sm overflow-hidden">
                    <div className="p-4 border-b border-[#D5D9D9] flex items-center justify-between" style={{ backgroundColor: '#607D8B10' }}>
                      <div>
                        <h4 className="font-bold text-gray-900">{result.kit.name}</h4>
                        <p className="text-xs text-gray-500">{result.kit.items.length} items · {result.kit.eta}</p>
                      </div>
                      <div className="text-right">
                        <span className="text-xl font-extrabold text-gray-900">₹{result.kit.totalPrice}</span>
                        {apiResponse?.confidence && (
                          <span className="block text-xs text-[#00838F] font-semibold">
                            {apiResponse.confidence}% confidence
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="p-4 space-y-3">
                      {result.kit.items.map((item) => (
                        <div key={item.id} className="flex items-center justify-between bg-[#F7F8F8] p-2.5 rounded-sm border border-[#D5D9D9]">
                          <div className="flex items-center gap-3">
                            <span className="text-xl w-8 h-8 bg-white rounded-sm flex items-center justify-center border border-[#D5D9D9]">{item.image}</span>
                            <div>
                              <div className="font-medium text-gray-900 text-sm">{item.name}</div>
                              <div className="text-xs text-gray-500">
                                Qty: {item.qty} · ETA: {item.eta ? `~${item.eta} min` : result.kit!.eta}
                              </div>
                            </div>
                          </div>
                          <div className="font-bold text-gray-900 text-sm">₹{item.price * item.qty}</div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* ── Partial help: What Nia can't deliver ── */}
                  {result.canPartiallyHelp && !result.canFullyHelp && result.cannotHelpWith && result.cannotHelpWith.length > 0 && (
                    <div className="mt-4 space-y-3">
                      <div className="p-3 bg-amber-50 border border-amber-200 rounded-sm">
                        <p className="text-sm font-bold text-amber-800 mb-1.5">⚠️ What Nia can&apos;t deliver:</p>
                        <ul className="text-sm text-amber-700 space-y-1">
                          {result.cannotHelpWith.map((item, idx) => (
                            <li key={idx} className="flex items-start gap-1.5">
                              <span className="mt-0.5">•</span>
                              <span>{item}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      {result.alternativeSuggestion && (
                        <div className="p-3 bg-[#E0F2F1] border border-[#B2DFDB] rounded-sm">
                          <p className="text-sm font-bold text-[#00695C] mb-1">💡 For the rest:</p>
                          <p className="text-sm text-[#00695C]">{result.alternativeSuggestion}</p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* ── Action Buttons ────────────────────── */}
                  <div className="mt-4 space-y-2">
                    <button
                      onClick={handleOrderAll}
                      className="w-full h-12 bg-[#FFD814] hover:bg-[#F7CA00] text-[#0F1111] font-bold rounded-sm shadow-sm transition-all transform hover:-translate-y-0.5"
                    >
                      🛒 Add all to cart · ₹{result.kit.totalPrice}
                    </button>
                    <div className="flex gap-3 justify-center text-sm">
                      <button
                        onClick={handleCustomize}
                        className="text-[#00838F] hover:underline font-medium"
                      >
                        ✏️ Customize this kit
                      </button>
                      <span className="text-gray-300">·</span>
                      <button
                        onClick={handleReset}
                        className="text-gray-500 hover:text-gray-700 font-medium"
                      >
                        ↩ Try a different description
                      </button>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  {/* ── Cannot help / Safety Override ────── */}
                  <div className="text-center p-6">
                    <div className="text-4xl mb-3">
                      {result.niaMessage.includes('🚑') ? '🚑' :
                       result.niaMessage.includes('🔥') ? '🔥' : '😔'}
                    </div>
                    <p className="text-sm text-gray-700 whitespace-pre-line mb-4">{result.niaMessage}</p>

                    {result.alternativeSuggestion && (
                      <p className="text-xs text-gray-500 mb-4">{result.alternativeSuggestion}</p>
                    )}

                    <p className="text-xs text-gray-400 mb-3">Try describing what items you need instead...</p>
                    <div className="flex flex-wrap gap-2 justify-center">
                      {EXAMPLE_CHIPS.map((chip) => (
                        <button
                          key={chip.label}
                          onClick={() => {
                            setDescription(chip.query);
                            setResult(null);
                            setApiResponse(null);
                            handleSubmit(chip.query);
                          }}
                          className="px-3 py-1.5 bg-[#F5F7F8] border border-[#D5D9D9] rounded-full text-xs font-medium text-gray-700 hover:bg-[#E0F2F1] hover:border-[#00838F] transition-colors"
                        >
                          {chip.label}
                        </button>
                      ))}
                    </div>

                    <button
                      onClick={handleReset}
                      className="mt-4 text-[#00838F] text-sm font-medium hover:underline"
                    >
                      ↩ Try a different description
                    </button>
                  </div>
                </>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
});

export default CustomEmergencyTile;
