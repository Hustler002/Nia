// components/NiaFab.tsx
// Legacy FAB component — kept for backward compat but not used in the current layout
// The NiaTrigger component in NiaWidget/ is the active trigger button.

'use client';

import { useNiaChatStore } from '@/lib/useNiaStore';

export function NiaFab() {
  const { isOpen, toggle, hasProactiveNudge } = useNiaChatStore();

  return (
    <button
      onClick={toggle}
      className={`fixed bottom-6 right-6 z-[99] w-14 h-14 rounded-full shadow-lg flex items-center justify-center transition-all hover:scale-110 active:scale-95 ${
        isOpen
          ? 'bg-gray-700 rotate-45'
          : 'bg-gradient-to-br from-orange-500 to-amber-500 nia-fab-pulse'
      }`}
      aria-label={isOpen ? 'Close Nia' : 'Open Nia'}
    >
      {isOpen ? (
        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
      ) : (
        <>
          {/* Nia icon */}
          <span className="text-lg font-bold group-hover:scale-110 transition-transform">N</span>

          {/* Pulse ring */}
          <div className="absolute inset-0 rounded-full bg-[#00838F]/30 animate-nia-pulse" />

          {/* Tooltip */}
          <div className="absolute bottom-full right-0 mb-2 px-3 py-1.5 bg-[#0F1111] text-white text-xs rounded-sm opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
            Ask Nia anything ✨
          </div>

          {hasProactiveNudge && (
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full border-2 border-white flex items-center justify-center z-10">
              <span className="text-[8px] text-white font-bold">!</span>
            </span>
          )}
        </>
      )}
    </button>
  );
}
