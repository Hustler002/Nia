// components/NiaWidget/NiaTrigger.tsx
// The floating action button that opens the Nia chat panel
// Desktop: bottom-right corner. Mobile: bottom-center
// Shows a pulse animation and orange badge dot when there's a proactive nudge
// Production: add haptic feedback on mobile, unread message count badge

'use client';

import { useNiaChatStore } from '@/lib/useNiaStore';
import { motion, AnimatePresence } from 'framer-motion';

export default function NiaTrigger() {
  const { isOpen, toggle, hasProactiveNudge } = useNiaChatStore();

  if (isOpen) return null;

  return (
    <AnimatePresence>
      <motion.button
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 260, damping: 20 }}
        onClick={toggle}
        className="fixed z-[997] flex items-center justify-center group
          /* Mobile: bottom-center */
          bottom-5 left-1/2 -translate-x-1/2
          /* Desktop: bottom-right */
          sm:left-auto sm:translate-x-0 sm:bottom-6 sm:right-6
          w-14 h-14 rounded-full bg-[#00838F] hover:bg-[#006d75]
          text-white shadow-lg hover:shadow-xl
          transition-all duration-300 hover:scale-105 active:scale-95"
        aria-label="Open Nia assistant"
        id="nia-trigger-button"
      >
        {/* Nia waveform icon */}
        <div className="flex items-center gap-[2px]">
          <div className="w-[3px] h-3 bg-white/90 rounded-full animate-[waveform_1s_ease-in-out_infinite]" />
          <div className="w-[3px] h-5 bg-white rounded-full animate-[waveform_1s_ease-in-out_0.15s_infinite]" />
          <div className="w-[3px] h-4 bg-white/90 rounded-full animate-[waveform_1s_ease-in-out_0.3s_infinite]" />
          <div className="w-[3px] h-6 bg-white rounded-full animate-[waveform_1s_ease-in-out_0.45s_infinite]" />
          <div className="w-[3px] h-3 bg-white/90 rounded-full animate-[waveform_1s_ease-in-out_0.6s_infinite]" />
        </div>

        {/* Pulse ring — always active to draw attention */}
        <div className="absolute inset-0 rounded-full bg-[#00838F]/30 animate-nia-pulse pointer-events-none" />

        {/* Proactive nudge badge — orange dot */}
        {hasProactiveNudge && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-[#FF9900] border-2 border-white shadow-sm"
          />
        )}

        {/* Tooltip (desktop only) */}
        <div className="absolute bottom-full right-1/2 translate-x-1/2 sm:right-0 sm:translate-x-0 mb-2 px-3 py-1.5 bg-[#0F1111] text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none shadow-lg">
          Ask Nia anything ✨
          <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-l-[5px] border-r-[5px] border-t-[5px] border-l-transparent border-r-transparent border-t-[#0F1111]" />
        </div>
      </motion.button>
    </AnimatePresence>
  );
}

// Production extension:
// - Add unread message count badge instead of simple dot
// - Implement haptic feedback on mobile (navigator.vibrate)
// - Track click analytics for engagement metrics
// - Add context-aware tooltip text based on user behavior
