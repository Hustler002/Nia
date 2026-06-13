// app/emergency/page.tsx
// Emergency Mode landing page — high-stress, fast-decision UI
// Design principles: ZERO cognitive load, maximum contrast, large tap targets (64px+),
// speed as the only message, color-coded urgency, icons + labels + one action per kit
// Production: real inventory from nearest dark store, live ETA, one-step checkout

'use client';

import { useState, useRef, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import {
  emergencyCategories,
  generateEmergencyKit,
  detectEmergencyCategory,
} from '@/lib/emergency/categories';
import type { EmergencyCategory, EmergencyKitData } from '@/lib/emergency/categories';
import { useNiaChatStore } from '@/lib/useNiaStore';

// ─── Emergency Category Tile ────────────────────────────────────────────────

function EmergencyCategoryTile({
  category,
  isActive,
  isHighlighted,
  onTap,
}: {
  category: EmergencyCategory;
  isActive: boolean;
  isHighlighted: boolean;
  onTap: () => void;
}) {
  return (
    <motion.button
      onClick={onTap}
      whileTap={{ scale: 0.97 }}
      className={`relative w-full rounded-2xl p-5 text-left transition-all duration-300 min-h-[120px] flex flex-col items-center justify-center gap-2 border-2 ${
        isActive
          ? 'shadow-lg scale-[1.02]'
          : 'shadow-sm hover:shadow-md hover:scale-[1.01]'
      } ${isHighlighted ? 'emergency-tile-active' : ''}`}
      style={{
        backgroundColor: `${category.color}18`,
        borderColor: isActive ? category.color : `${category.color}30`,
        // Set the CSS variable for the highlight animation to use this category's color
        '--highlight-color': `${category.color}50`,
      } as React.CSSProperties}
      aria-label={`${category.name} emergency kit`}
      id={`emergency-tile-${category.id}`}
    >
      {/* Active indicator dot */}
      {isActive && (
        <motion.div
          layoutId="active-dot"
          className="absolute top-3 right-3 w-2.5 h-2.5 rounded-full"
          style={{ backgroundColor: category.color }}
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
        />
      )}

      {/* Large emoji */}
      <span className="text-4xl sm:text-5xl" role="img" aria-hidden="true">
        {category.emoji}
      </span>

      {/* Category name */}
      <span className="text-sm sm:text-base font-bold text-[#0F1111] text-center leading-tight">
        {category.name}
      </span>

      {/* ETA + item count */}
      <div className="flex items-center gap-2">
        <span
          className="text-[10px] sm:text-xs font-bold px-2 py-0.5 rounded-full text-white"
          style={{ backgroundColor: category.color }}
        >
          ~10 min
        </span>
        <span className="text-[10px] sm:text-xs text-gray-400">
          {category.itemCount} items
        </span>
      </div>
    </motion.button>
  );
}

// ─── Expanded Kit View ──────────────────────────────────────────────────────

function ExpandedKitView({
  kit,
  onCustomize,
}: {
  kit: EmergencyKitData;
  onCustomize: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
      className="col-span-2 sm:col-span-4 overflow-hidden"
    >
      <div className="kit-expand-enter bg-white rounded-2xl border border-gray-100 shadow-lg p-4 sm:p-6 mb-2">
        {/* Kit header */}
        <div className="flex items-center gap-3 mb-4">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center text-xl"
            style={{ backgroundColor: `${kit.categoryColor}20` }}
          >
            {kit.categoryEmoji}
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-bold text-[#0F1111]">
              {kit.name}
            </h3>
            <p className="text-xs text-gray-400">{kit.description}</p>
          </div>
        </div>

        {/* Item list */}
        <div className="space-y-1 mb-4">
          {kit.items.map((item, idx) => (
            <div
              key={item.id}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl ${
                idx % 2 === 0 ? 'bg-gray-50' : 'bg-white'
              }`}
            >
              <span className="text-lg flex-shrink-0 w-8 text-center">
                {item.image}
              </span>
              <div className="flex-1 min-w-0">
                <p className="text-xs sm:text-sm font-medium text-[#0F1111] truncate">
                  {item.name}
                </p>
                {item.qty > 1 && (
                  <p className="text-[10px] text-gray-400">Qty: {item.qty}</p>
                )}
              </div>
              <div className="flex flex-col items-end flex-shrink-0">
                <span className="text-xs sm:text-sm font-bold text-[#0F1111]">
                  ₹{item.price * item.qty}
                </span>
                {item.mrp > item.price && (
                  <span className="text-[10px] text-gray-300 line-through">
                    ₹{item.mrp * item.qty}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* ETA + Store */}
        <div
          className="rounded-xl p-3 mb-4 text-center text-white"
          style={{ backgroundColor: kit.categoryColor }}
        >
          <p className="text-[10px] uppercase tracking-wider opacity-80">
            Fastest Available
          </p>
          <p className="text-lg font-bold mt-0.5">
            {kit.eta} 🚚
          </p>
          <p className="text-[10px] opacity-80 mt-0.5">
            from {kit.storeName}
          </p>
        </div>

        {/* Total + CTA */}
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm text-gray-400">Kit total</span>
          <span className="text-xl font-bold text-[#0F1111]">
            ₹{kit.totalPrice}
          </span>
        </div>

        {/* Primary CTA — cannot be missed */}
        <button
          className="w-full bg-[#FF9900] hover:bg-[#e8870d] text-white font-bold text-base rounded-xl py-4 transition-colors shadow-md min-h-[56px]"
          style={{ animation: 'emergency-pulse 2s ease-in-out infinite' }}
          id={`order-kit-${kit.categoryId}`}
        >
          Order this kit — ₹{kit.totalPrice}
        </button>

        {/* Secondary action */}
        <button
          onClick={onCustomize}
          className="w-full text-center text-sm text-[#00838F] hover:text-[#006d75] font-medium mt-3 py-2 transition-colors"
        >
          ✏️ Customize this kit with Nia
        </button>
      </div>
    </motion.div>
  );
}

// ─── Main Emergency Page ────────────────────────────────────────────────────

export default function EmergencyPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [highlightedCategory, setHighlightedCategory] = useState<string | null>(null);
  const [activeKit, setActiveKit] = useState<EmergencyKitData | null>(null);
  const [isListening, setIsListening] = useState(false);

  const gridRef = useRef<HTMLDivElement>(null);
  const kitRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const { open: openNia } = useNiaChatStore();

  // Handle category tap
  const handleCategoryTap = useCallback((categoryId: string) => {
    if (activeCategory === categoryId) {
      // Collapse if already active
      setActiveCategory(null);
      setActiveKit(null);
      setHighlightedCategory(null);
      return;
    }

    setActiveCategory(categoryId);
    setHighlightedCategory(null);
    const kit = generateEmergencyKit(categoryId);
    setActiveKit(kit);

    // Scroll to the kit view after a brief delay for animation
    setTimeout(() => {
      kitRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }, 100);
  }, [activeCategory]);

  // Handle search input — auto-detect emergency category
  const handleSearchSubmit = useCallback((e?: React.FormEvent) => {
    e?.preventDefault();
    if (!searchQuery.trim()) return;

    const detected = detectEmergencyCategory(searchQuery);
    if (detected) {
      setHighlightedCategory(detected.id);
      setActiveCategory(detected.id);
      const kit = generateEmergencyKit(detected.id);
      setActiveKit(kit);

      // Scroll to the matched tile
      setTimeout(() => {
        const tile = document.getElementById(`emergency-tile-${detected.id}`);
        tile?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 100);
    } else {
      // No match — open Nia chat with the query
      openNia(searchQuery);
    }
  }, [searchQuery, openNia]);

  const liveDetectedCategoryId = useMemo(() => {
    if (!searchQuery.trim()) return null;
    return detectEmergencyCategory(searchQuery)?.id ?? null;
  }, [searchQuery]);

  const visibleHighlightedCategory = highlightedCategory ?? liveDetectedCategoryId;

  // Customize kit — opens Nia with context
  const handleCustomize = useCallback(() => {
    if (activeKit) {
      openNia(`Customize my ${activeKit.categoryName} emergency kit`);
    }
  }, [activeKit, openNia]);

  // Voice input
  const toggleVoice = useCallback(() => {
    if (isListening) {
      setIsListening(false);
      return;
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const SpeechRecognitionAPI = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognitionAPI) {
      // Fallback demo: simulate voice input
      setIsListening(true);
      setTimeout(() => {
        setSearchQuery('I have a fever');
        setIsListening(false);
      }, 2000);
      return;
    }

    const recognition = new SpeechRecognitionAPI();
    recognition.lang = 'en-IN';
    recognition.interimResults = false;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setSearchQuery(transcript);
      setIsListening(false);
    };

    recognition.onerror = () => setIsListening(false);
    recognition.onend = () => setIsListening(false);

    setIsListening(true);
    recognition.start();
  }, [isListening]);

  // Determine which row the expanded kit should appear after
  // On mobile (2 cols), after the row containing the active tile
  // On desktop (4 cols), after the row containing the active tile
  const activeCategoryIndex = activeCategory
    ? emergencyCategories.findIndex((c) => c.id === activeCategory)
    : -1;

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* ── Header: Red/Orange urgent gradient ── */}
      <header className="relative overflow-hidden bg-gradient-to-br from-[#D32F2F] via-[#FF4500] to-[#FF6B00]">
        {/* Shimmer overlay */}
        <div className="absolute inset-0 urgent-shimmer pointer-events-none" />

        <div className="relative max-w-4xl mx-auto px-4 pt-8 pb-8 sm:pt-12 sm:pb-10 text-center">
          {/* Back to home */}
          <Link
            href="/"
            className="absolute top-4 left-4 text-white/70 hover:text-white text-xs flex items-center gap-1 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
            </svg>
            Back
          </Link>

          {/* Main heading */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2 flex items-center justify-center gap-3">
              <span className="text-4xl sm:text-5xl animate-pulse">🚨</span>
              What&apos;s the emergency?
            </h1>
            <p className="text-white/80 text-sm sm:text-base max-w-md mx-auto">
              Tell us or tap below — assembled kit + order in 60 seconds
            </p>
          </motion.div>

          {/* Search input */}
          <motion.form
            onSubmit={handleSearchSubmit}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.15 }}
            className="mt-6 max-w-lg mx-auto"
          >
            <div
              className={`flex items-center gap-2 bg-white/95 backdrop-blur-sm rounded-2xl px-4 py-3 shadow-xl border-2 transition-colors ${
                isListening
                  ? 'border-red-400 bg-red-50/95'
                  : visibleHighlightedCategory
                  ? 'border-green-400'
                  : 'border-white/50 focus-within:border-white'
              }`}
            >
              <svg
                className="w-5 h-5 text-gray-400 flex-shrink-0"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z"
                />
              </svg>

              <input
                ref={inputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={
                  isListening
                    ? 'Listening...'
                    : 'Describe your emergency... "baby has rash", "fever"'
                }
                className="flex-1 bg-transparent text-sm sm:text-base outline-none text-[#0F1111] placeholder-gray-400"
                disabled={isListening}
                aria-label="Describe your emergency"
                id="emergency-search-input"
              />

              {/* Voice button */}
              <button
                type="button"
                onClick={toggleVoice}
                className={`w-10 h-10 rounded-full flex items-center justify-center transition-all flex-shrink-0 ${
                  isListening
                    ? 'bg-red-500 text-white animate-pulse'
                    : 'bg-gray-100 text-gray-500 hover:bg-[#E0F2F1] hover:text-[#00838F]'
                }`}
                aria-label={isListening ? 'Stop recording' : 'Voice input'}
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 01-3-3V4.5a3 3 0 116 0v8.25a3 3 0 01-3 3z"
                  />
                </svg>
              </button>

              {/* Submit button */}
              <button
                type="submit"
                className="w-10 h-10 rounded-full bg-[#FF9900] hover:bg-[#e8870d] text-white flex items-center justify-center transition-all flex-shrink-0 shadow-md"
                aria-label="Search"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                </svg>
              </button>
            </div>

            {/* Auto-detected category hint */}
            <AnimatePresence>
              {visibleHighlightedCategory && (
                <motion.p
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="text-white/90 text-xs mt-2 flex items-center justify-center gap-1"
                >
                  <span className="text-green-300">✓</span>
                  Detected:{' '}
                  <strong>
                    {emergencyCategories.find((c) => c.id === visibleHighlightedCategory)?.name}
                  </strong>{' '}
                  — tap Enter or the tile below
                </motion.p>
              )}
            </AnimatePresence>
          </motion.form>
        </div>
      </header>

      {/* ── Category Grid ── */}
      <main className="max-w-4xl mx-auto px-4 py-6 sm:py-8" ref={gridRef}>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
          {emergencyCategories.map((category) => {
            // Determine which row this tile is on (mobile: 2 cols, desktop: 4 cols)
            // We need to insert the expanded kit view after the correct row
            const isActive = activeCategory === category.id;
            const isHighlighted = visibleHighlightedCategory === category.id;

            return (
              <EmergencyCategoryTile
                key={category.id}
                category={category}
                isActive={isActive}
                isHighlighted={isHighlighted && !isActive}
                onTap={() => handleCategoryTap(category.id)}
              />
            );
          })}
        </div>

        {/* Expanded Kit View — rendered below the grid */}
        <div ref={kitRef}>
          <AnimatePresence>
            {activeKit && activeCategoryIndex >= 0 && (
              <ExpandedKitView
                key={activeKit.categoryId}
                kit={activeKit}
                onCustomize={handleCustomize}
              />
            )}
          </AnimatePresence>
        </div>

        {/* Delivery info */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-center mt-6 sm:mt-8"
        >
          <div className="inline-flex items-center gap-2 bg-gray-50 px-4 py-2 rounded-full border border-gray-100">
            <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
            <p className="text-xs text-gray-500">
              ⚡ Delivering to <strong>110001</strong> · Estimated: <strong>10 min</strong> · Free delivery on emergency orders
            </p>
          </div>
        </motion.div>
      </main>

      {/* ── Sticky Bottom Input (mobile only) ── */}
      <div className="sm:hidden fixed bottom-0 inset-x-0 bg-white border-t border-gray-100 shadow-[0_-4px_20px_rgba(0,0,0,0.08)] px-4 py-3 z-50">
        <form onSubmit={handleSearchSubmit}>
          <div
            className={`flex items-center gap-2 rounded-xl px-3 py-2.5 border transition-colors ${
              isListening
                ? 'bg-red-50 border-red-300'
                : 'bg-gray-50 border-gray-200 focus-within:border-[#FF4500]'
            }`}
          >
            <span className="text-lg flex-shrink-0">🚨</span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={
                isListening ? 'Listening...' : 'What do you need? "my baby has rash"'
              }
              className="flex-1 bg-transparent text-sm outline-none text-[#0F1111] placeholder-gray-400"
              disabled={isListening}
              aria-label="Emergency search mobile"
              id="emergency-search-mobile"
            />
            <button
              type="button"
              onClick={toggleVoice}
              className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 ${
                isListening
                  ? 'bg-red-500 text-white animate-pulse'
                  : 'bg-gray-100 text-gray-500'
              }`}
              aria-label="Voice input"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 01-3-3V4.5a3 3 0 116 0v8.25a3 3 0 01-3 3z"
                />
              </svg>
            </button>
            <button
              type="submit"
              className="w-9 h-9 rounded-full bg-[#FF4500] text-white flex items-center justify-center flex-shrink-0"
              aria-label="Search"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
              </svg>
            </button>
          </div>
        </form>
      </div>

      {/* Spacer for sticky bottom input on mobile */}
      <div className="sm:hidden h-20" />
    </div>
  );
}

// Production extension:
// - Real-time inventory polling from the nearest dark store determines actual kit availability
// - ETA accuracy improves with dark-store real-time load data + delivery fleet GPS positioning
// - "Order Now" triggers a one-step checkout with pre-filled payment (UPI/saved card) —
//   bypasses the standard cart → address → payment flow for emergencies
// - Kit composition is A/B tested: which items per category lead to highest conversion
// - Emergency orders get priority routing in the logistics queue (Step Functions orchestration)
// - Voice input uses Amazon Transcribe for better Hindi/Hinglish recognition
// - Category detection uses Bedrock Agent's NLU instead of keyword matching
// - Analytics track: time-to-order per emergency category, most common emergencies by pincode,
//   and unmet emergency queries (fed to Nia for Sellers intent gap dashboard)
