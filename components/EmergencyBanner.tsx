// components/EmergencyBanner.tsx
// Full-width emergency mode CTA strip
// Production: navigates to /emergency which triggers generate_emergency_kit() agent tool

'use client';

import Link from 'next/link';

export default function EmergencyBanner() {
  return (
    <Link
      href="/emergency"
      className="block group"
      aria-label="Emergency mode - get an assembled kit with fastest delivery"
    >
      <div className="relative overflow-hidden bg-gradient-to-r from-[#FF6B00] via-[#FF4500] to-[#D32F2F] py-4 px-4 sm:px-6">
        {/* Animated shine effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
        
        <div className="relative max-w-7xl mx-auto flex items-center justify-center gap-3">
          <span className="text-2xl animate-pulse">🚨</span>
          <p className="text-white font-semibold text-sm sm:text-base text-center">
            Emergency? Tap here — assembled kit + fastest delivery in 60 seconds
          </p>
          <svg
            className="w-5 h-5 text-white/80 group-hover:translate-x-1 transition-transform"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
          </svg>
        </div>
      </div>
    </Link>
  );
}
