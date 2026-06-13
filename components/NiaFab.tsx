// components/NiaFab.tsx
// Floating action button to toggle Nia chat panel (visible on desktop)
// Hidden on mobile since TopBar has the toggle button
// Production: add unread notification badge, haptic feedback

'use client';

import { useNiaStore } from '@/lib/useNiaStore';

export default function NiaFab() {
  const { isOpen, toggleNia } = useNiaStore();

  if (isOpen) return null;

  return (
    <button
      onClick={toggleNia}
      className="fixed bottom-6 right-6 z-[997] hidden sm:flex w-14 h-14 rounded-full bg-[#00838F] hover:bg-[#006d75] text-white shadow-lg hover:shadow-xl items-center justify-center transition-all duration-300 hover:scale-105 active:scale-95 group"
      aria-label="Open Nia assistant"
    >
      {/* Nia icon */}
      <span className="text-lg font-bold group-hover:scale-110 transition-transform">N</span>

      {/* Pulse ring */}
      <div className="absolute inset-0 rounded-full bg-[#00838F]/30 animate-nia-pulse" />

      {/* Tooltip */}
      <div className="absolute bottom-full right-0 mb-2 px-3 py-1.5 bg-[#0F1111] text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
        Ask Nia anything ✨
      </div>
    </button>
  );
}
