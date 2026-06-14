// components/HeroSection.tsx
// Main hero with the Nia conversational input bar
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
    <section className="relative py-12 sm:py-20 px-4 overflow-hidden">
      {/* Subtle gradient background */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#E0F2F1]/40 via-white to-white" />
      
      {/* Decorative floating dots */}
      <div className="absolute top-8 left-[10%] w-2 h-2 rounded-full bg-[#00838F]/20 animate-float-slow" />
      <div className="absolute top-20 right-[15%] w-3 h-3 rounded-full bg-[#FF9900]/20 animate-float-medium" />
      <div className="absolute bottom-12 left-[20%] w-2.5 h-2.5 rounded-full bg-[#00838F]/15 animate-float-fast" />

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
        <h1 className="text-3xl sm:text-5xl font-bold text-[#0F1111] mb-3 tracking-tight">
          Tell <span className="text-[#00838F]">Nia</span> what you need.
        </h1>
        <p className="text-lg sm:text-xl text-gray-500 mb-8 font-medium">
          Full cart. 10 minutes. Done.
        </p>

        {/* Input bar */}
        <form onSubmit={handleSubmit} className="relative">
          <div className="flex items-center bg-white rounded-2xl shadow-lg shadow-gray-200/80 border border-gray-200 hover:border-[#00838F]/40 focus-within:border-[#00838F] focus-within:shadow-[#00838F]/10 transition-all duration-300 px-4 py-3 gap-3">
            {/* Nia avatar with pulse */}
            <div className="relative flex-shrink-0">
              <div className="w-10 h-10 rounded-full bg-[#00838F] flex items-center justify-center">
                <span className="text-white text-sm font-bold">N</span>
              </div>
              <div className="absolute inset-0 rounded-full bg-[#00838F]/30 animate-nia-pulse" />
            </div>

            {/* Input */}
            <input
              ref={inputRef}
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onFocus={handleInputFocus}
              placeholder={heroPlaceholders[placeholderIdx]}
              className={`flex-1 text-base sm:text-lg bg-transparent outline-none text-[#0F1111] placeholder-gray-400 transition-opacity duration-300 ${
                isFading && !inputValue ? 'opacity-0' : 'opacity-100'
              }`}
              aria-label="Ask Nia what you need"
              id="nia-hero-input"
            />

            {/* Submit button */}
            <button
              type="submit"
              className="flex-shrink-0 w-10 h-10 rounded-full bg-[#00838F] hover:bg-[#006d75] flex items-center justify-center transition-colors shadow-md"
              aria-label="Send to Nia"
            >
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
              </svg>
            </button>
          </div>
        </form>

        {/* Quick start chips */}
        <div className="flex flex-wrap justify-center gap-2 mt-5">
          {quickStartChips.map((chip) => (
            <button
              key={chip.label}
              onClick={() => handleChipClick(chip)}
              className="px-4 py-2 rounded-full bg-white border border-gray-200 text-sm font-medium text-gray-700 hover:border-[#00838F] hover:text-[#00838F] hover:shadow-md transition-all duration-200"
            >
              {chip.label}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
