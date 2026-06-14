// components/Rituals/RitualCard.tsx
// Compact card for the homepage rituals row (~200px wide).
// Features: one-click reorder with cart integration, item popover on hover,
// out-of-stock substitution flow, edit/rename support.
// Production: real inventory checks, analytics on reorder conversion rate

'use client';

import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Ritual, SubstitutionOption } from '@/lib/rituals/ritualDetector';
import { getSubstitutions, ritualToCartItems } from '@/lib/rituals/ritualDetector';
import { useNiaChatStore } from '@/lib/useNiaStore';

interface RitualCardProps {
  ritual: Ritual;
  onEdit?: (ritual: Ritual) => void;
}

export default function RitualCard({ ritual, onEdit }: RitualCardProps) {
  const [reordered, setReordered] = useState(false);
  const [showItems, setShowItems] = useState(false);
  const [showSubstitution, setShowSubstitution] = useState(false);
  const [substitutions, setSubstitutions] = useState<SubstitutionOption[]>([]);
  const [acceptedSubs, setAcceptedSubs] = useState<Set<string>>(new Set());
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const outOfStockCount = ritual.items.filter(i => !i.inStock).length;
  const isDueToday = ritual.daysSinceLastOrder >= 7 && ritual.frequency === 'weekly';

  // ── Reorder handler ─────────────────────────────────────────────────────
  const handleReorder = () => {
    // Check for out-of-stock items first
    const subs = getSubstitutions(ritual);
    if (subs.length > 0) {
      setSubstitutions(subs);
      setShowSubstitution(true);
      return;
    }

    // All items in stock — add directly to cart
    addToCart();
  };

  const addToCart = (extraSubs?: SubstitutionOption[]) => {
    const cartItems = ritualToCartItems(ritual, extraSubs);
    const store = useNiaChatStore.getState();

    cartItems.forEach(item => store.addToCart(item));

    setReordered(true);
    setShowSubstitution(false);

    // Show confirmation toast via a brief visual state change
    setTimeout(() => setReordered(false), 3000);
  };

  const acceptSubstitution = (sub: SubstitutionOption) => {
    setAcceptedSubs(prev => new Set(prev).add(sub.originalItem.productId));
  };

  const confirmSubstitutions = () => {
    const accepted = substitutions.filter(s => acceptedSubs.has(s.originalItem.productId));
    addToCart(accepted);
  };

  // ── Hover handlers for item popover ─────────────────────────────────────
  const handleMouseEnter = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setShowItems(true);
  };

  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => setShowItems(false), 200);
  };

  const totalInCart = ritual.items
    .filter(i => i.inStock || acceptedSubs.has(i.productId))
    .reduce((sum, i) => sum + i.price * i.quantity, 0);

  return (
    <div className="relative">
      <div
        className="flex-shrink-0 w-52 sm:w-56 bg-white rounded-sm border border-[#D5D9D9]
          hover:shadow-md transition-all duration-200 overflow-hidden group"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        {/* ── Header with icon and due badge ─────────────────────────── */}
        <div className="relative bg-gradient-to-br from-[#00838F]/5 to-[#00838F]/10 px-4 py-4 flex flex-col items-center">
          {/* Emoji icon */}
          <span className="text-3xl mb-1 group-hover:scale-110 transition-transform duration-200">
            {ritual.icon}
          </span>

          {/* Due today badge */}
          {isDueToday && (
            <span className="absolute top-2 right-2 bg-[#FF9900]/10 text-[#FF9900] text-[10px]
              font-bold px-2 py-0.5 rounded-full animate-pulse">
              Due today
            </span>
          )}

          {/* Order count badge */}
          <span className="absolute top-2 left-2 text-[10px] text-gray-400 font-medium">
            ×{ritual.orderCount}
          </span>

          {/* Edit button */}
          {onEdit && (
            <button
              onClick={(e) => { e.stopPropagation(); onEdit(ritual); }}
              className="absolute top-2 right-2 w-6 h-6 rounded-full bg-white/80 flex items-center
                justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white"
              aria-label="Edit ritual"
            >
              <svg className="w-3 h-3 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
              </svg>
            </button>
          )}
        </div>

        {/* ── Content ────────────────────────────────────────────────── */}
        <div className="px-4 pb-4 pt-3">
          <h3 className="text-sm font-bold text-[#0F1111] truncate" title={ritual.name}>
            {ritual.name}
          </h3>

          <div className="flex items-center gap-1.5 mt-1 text-xs text-gray-400">
            <span>{ritual.items.length} items</span>
            <span className="text-gray-300">·</span>
            <span>₹{ritual.estimatedTotal}</span>
          </div>

          {/* Out of stock warning */}
          {outOfStockCount > 0 && (
            <p className="text-[10px] text-amber-600 mt-1">
              ⚠ {outOfStockCount} item{outOfStockCount > 1 ? 's' : ''} out of stock
            </p>
          )}

          <p className="text-[11px] text-gray-400 mt-1.5">
            Last ordered {ritual.daysSinceLastOrder} days ago
          </p>

          {/* ── Reorder button ────────────────────────────────────── */}
          <div className="mt-3">
            {!reordered ? (
              <button
                onClick={handleReorder}
                className={`w-full py-2 text-xs font-bold rounded-md
                  transition-all duration-200 shadow-sm hover:shadow-md active:scale-[0.97]
                  ${isDueToday
                    ? 'bg-[#FFA41C] hover:bg-[#FA8900] text-[#0F1111]'
                    : 'bg-[#FFD814] hover:bg-[#F7CA00] text-[#0F1111]'
                  }`}
              >
                Reorder · ₹{ritual.estimatedTotal}
              </button>
            ) : (
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="w-full py-2 bg-green-50 text-green-600 text-xs font-bold
                  rounded-md text-center flex items-center justify-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                </svg>
                {ritual.items.length} items added!
              </motion.div>
            )}
          </div>
        </div>
      </div>

      {/* ── Item Popover (on hover) ────────────────────────────────────── */}
      <AnimatePresence>
        {showItems && !showSubstitution && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute z-50 left-0 right-0 top-full mt-2 bg-white rounded-sm
              border border-[#D5D9D9] shadow-lg p-3 min-w-[220px]"
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
          >
            <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide mb-2">
              Items in this ritual
            </p>
            <div className="space-y-1.5 max-h-48 overflow-y-auto">
              {ritual.items.map(item => (
                <div key={item.productId}
                  className={`flex items-center justify-between text-xs ${
                    item.inStock ? 'text-[#0F1111]' : 'text-gray-300 line-through'
                  }`}
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-sm flex-shrink-0">{item.image}</span>
                    <span className="truncate">{item.name}</span>
                    {item.quantity > 1 && (
                      <span className="text-[10px] text-gray-400">×{item.quantity}</span>
                    )}
                  </div>
                  <span className="text-gray-500 flex-shrink-0 ml-2">₹{item.price * item.quantity}</span>
                </div>
              ))}
            </div>
            <div className="border-t border-gray-100 mt-2 pt-2 flex justify-between text-xs font-bold text-[#0F1111]">
              <span>Total</span>
              <span>₹{ritual.estimatedTotal}</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Substitution Modal ─────────────────────────────────────────── */}
      <AnimatePresence>
        {showSubstitution && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/30 backdrop-blur-sm px-4"
            onClick={() => setShowSubstitution(false)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-white rounded-md p-4 max-w-sm w-full shadow-xl border border-[#D5D9D9]"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center">
                  <span className="text-sm">⚠️</span>
                </div>
                <div>
                  <h3 className="text-sm font-bold text-[#0F1111]">Some items unavailable</h3>
                  <p className="text-xs text-gray-400">Nia found substitutes for you</p>
                </div>
              </div>

              <div className="space-y-3">
                {substitutions.map(sub => (
                  <div key={sub.originalItem.productId}
                    className="bg-gray-50 rounded-xl p-3"
                  >
                    {/* Original (struck through) */}
                    <div className="flex items-center gap-2 text-xs text-gray-400 line-through mb-2">
                      <span>{sub.originalItem.image}</span>
                      <span>{sub.originalItem.name}</span>
                    </div>

                    {/* Arrow */}
                    <div className="flex items-center gap-2 mb-2">
                      <svg className="w-3 h-3 text-[#00838F]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 13.5L12 21m0 0l-7.5-7.5M12 21V3" />
                      </svg>
                      <span className="text-[10px] text-[#00838F] font-medium">{sub.reason}</span>
                    </div>

                    {/* Substitute */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-xs text-[#0F1111] font-medium">
                        <span>{sub.substitute.image}</span>
                        <span>{sub.substitute.name}</span>
                        <span className="text-gray-400">₹{sub.substitute.price}</span>
                      </div>
                      <button
                        onClick={() => acceptSubstitution(sub)}
                        className={`px-3 py-1 text-[11px] font-semibold rounded-sm transition-all ${
                          acceptedSubs.has(sub.originalItem.productId)
                            ? 'bg-green-50 text-green-600'
                            : 'bg-[#F7F8F8] text-[#007185] border border-[#D5D9D9] hover:bg-[#E7F4F5]'
                        }`}
                      >
                        {acceptedSubs.has(sub.originalItem.productId) ? '✓ Swapped' : 'Swap'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex gap-2 mt-4">
                <button
                  onClick={() => { setShowSubstitution(false); addToCart(); }}
                  className="flex-1 py-2 text-xs font-semibold border border-[#D5D9D9]
                    rounded-md text-gray-600 hover:bg-gray-50 transition-colors"
                >
                  Skip subs
                </button>
                <button
                  onClick={confirmSubstitutions}
                  className="flex-1 py-2 text-xs font-bold bg-[#FFD814] hover:bg-[#F7CA00]
                    text-[#0F1111] rounded-md transition-colors"
                >
                  Confirm & add to cart
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Production extension:
// - Real inventory check via check_inventory_eta API on reorder click
// - Animated confetti on successful reorder of large rituals (>5 items)
// - Drag-to-reorder items within the ritual
// - Share ritual via WhatsApp deeplink for group/family shopping
// - Analytics: track reorder conversion rate, time-to-reorder, sub acceptance
