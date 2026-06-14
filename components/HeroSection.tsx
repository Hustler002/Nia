// components/HeroSection.tsx
// Main hero with the Nia conversational input bar
// Amazon-style search bar: rigid rectangle, flush search button on right
// Uses useNiaChatStore (Zustand) for all Nia interactions

'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useNiaChatStore } from '@/lib/useNiaStore';
import { useUserStore } from '@/lib/stores/useUserStore';

const heroPlaceholders = [
  '"Movie night for 4 under ₹500"',
  '"Best earbuds under ₹2000"',
  '"I have a fever — need medicine fast"',
  '"Weekly groceries for 2 under ₹1500"',
  '"Birthday party for 10 kids"',
];

const quickStartChips = [
  { label: '🎬 Movie night', query: 'Movie night for 4 under ₹500' },
  { label: '🎂 Party kit', query: 'Birthday party for 10 kids' },
  { label: '🚨 Emergency', href: '/emergency' },
  { label: '🍳 Sunday brunch', query: 'Sunday brunch essentials for family' },
  { label: '💪 Gym fuel', query: 'Post-workout protein snacks under ₹300' },
];

export default function HeroSection() {
  const router = useRouter();
  const { open: openNia, sendMessage } = useNiaChatStore();
  const { user } = useUserStore();
  const [placeholderIdx, setPlaceholderIdx] = useState(0);
  const [isFading, setIsFading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const [inputValue, setInputValue] = useState('');

  // Rotate placeholders every 3 seconds with a fade transition
  useEffect(() => {
    const interval = setInterval(() => {
      setIsFading(true);
      setTimeout(() => {
        setPlaceholderIdx((prev) => (prev + 1) % heroPlaceholders.length);
        setIsFading(false);
      }, 300);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim()) {
      openNia(inputValue.trim());
      sendMessage(inputValue.trim(), user?.id, user?.pincode);
      setInputValue('');
    }
  };

  const handleChipClick = (chip: typeof quickStartChips[0]) => {
    if (chip.href) {
      router.push(chip.href);
      return;
    }
    if (chip.query) {
      openNia(chip.query);
      sendMessage(chip.query, user?.id, user?.pincode);
    }
  };

  const handleInputFocus = () => {
    // On mobile, clicking the input opens the Nia panel directly
    if (window.innerWidth < 640) {
      openNia();
    }
  };

  return (
    <section className="relative py-6 sm:py-10 px-4 overflow-hidden bg-gradient-to-b from-[#232F3E] via-[#37475A] to-[#EAEDED]">
      <div className="relative max-w-2xl mx-auto text-center">
        {/* Greeting */}
        {user && (
          <div className="mb-2">
            <span className="text-sm text-gray-400">
              Hi {user.name.split(' ')[0]}! 👋
            </span>
          </div>
        )}

        {/* Headline */}
        <h1 className="text-2xl sm:text-4xl font-bold text-white mb-2 tracking-tight">
          Tell <span className="text-[#00838F]">Nia</span> what you need.
        </h1>
        <p className="text-base sm:text-lg text-white/70 mb-6 font-medium">
          Full cart. 10 minutes. Done.
        </p>

        {/* Amazon-style Search Bar */}
        <form onSubmit={handleSubmit} className="relative">
          <div className="flex items-stretch bg-white rounded-sm shadow-md border-2 border-[#FEBD69] focus-within:border-[#FF9900] transition-colors">
            {/* Nia avatar — Nia branding, stays teal */}
            <div className="flex items-center px-3 bg-[#E0F2F1] border-r border-[#D5D9D9] rounded-l-sm">
              <div className="relative flex-shrink-0">
                <div className="w-8 h-8 rounded-full bg-[#00838F] flex items-center justify-center">
                  <span className="text-white text-xs font-bold">N</span>
                </div>
                <div className="absolute inset-0 rounded-full bg-[#00838F]/30 animate-nia-pulse" />
              </div>
            </div>

            {/* Input */}
            <input
              ref={inputRef}
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onFocus={handleInputFocus}
              placeholder={heroPlaceholders[placeholderIdx]}
              className={`flex-1 text-sm sm:text-base bg-transparent outline-none text-[#0F1111] placeholder-gray-400 px-3 py-3 transition-opacity duration-300 ${
                isFading && !inputValue ? 'opacity-0' : 'opacity-100'
              }`}
              aria-label="Ask Nia what you need"
              id="nia-hero-input"
            />

            {/* Mic button */}
            <button
              type="button"
              onClick={() => openNia()}
              className="flex-shrink-0 w-11 flex items-center justify-center border-l border-[#D5D9D9] hover:bg-gray-50 transition-colors"
              aria-label="Voice input"
            >
              <svg className="w-5 h-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 01-3-3V4.5a3 3 0 116 0v8.25a3 3 0 01-3 3z" />
              </svg>
            </button>

            {/* Submit button — Amazon orange, flush right */}
            <button
              type="submit"
              className="flex-shrink-0 w-12 bg-[#FEBD69] hover:bg-[#F3A847] flex items-center justify-center rounded-r-sm transition-colors"
              aria-label="Send to Nia"
            >
              <svg className="w-5 h-5 text-[#0F1111]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
              </svg>
            </button>
          </div>
        </form>

        {/* Quick start chips — Amazon filter pill style */}
        <div className="flex flex-wrap justify-center gap-2 mt-4">
          {quickStartChips.map((chip) => (
            <button
              key={chip.label}
              onClick={() => handleChipClick(chip)}
              className="px-3 py-1.5 rounded-sm bg-white border border-[#D5D9D9] text-xs font-medium text-[#0F1111] hover:bg-[#F7FAFA] hover:border-[#007185] hover:text-[#007185] shadow-sm transition-all duration-150"
            >
              {chip.label}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
