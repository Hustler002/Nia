// app/rituals/page.tsx
// Full rituals management page — view, edit, delete, create rituals.
// Features: expanded item lists, bulk reorder, emoji picker, edit/rename.
// Production: CRUD operations via DynamoDB API routes

'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { getMockRituals, ritualToCartItems, getSubstitutions } from '@/lib/rituals/ritualDetector';
import type { Ritual, RitualItem } from '@/lib/rituals/ritualDetector';
import { useNiaChatStore } from '@/lib/useNiaStore';

// ── Emoji Picker ────────────────────────────────────────────────────────────

const EMOJI_OPTIONS = [
  '🌅', '🍿', '🛒', '☀️', '🌙', '🎉', '💪', '🧹', '👶', '🐾',
  '🍳', '☕', '🥗', '🧴', '📦', '🎂', '🏃', '🧘', '💊', '🍕',
];

function EmojiPicker({
  selected,
  onSelect,
}: {
  selected: string;
  onSelect: (emoji: string) => void;
}) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {EMOJI_OPTIONS.map(emoji => (
        <button
          key={emoji}
          onClick={() => onSelect(emoji)}
          className={`w-9 h-9 rounded-sm flex items-center justify-center text-lg
            transition-all hover:scale-110 ${
            emoji === selected
              ? 'bg-[#00838F]/10 ring-2 ring-[#00838F] scale-110'
              : 'bg-gray-50 hover:bg-gray-100'
          }`}
        >
          {emoji}
        </button>
      ))}
    </div>
  );
}

// ── Ritual Detail Card (expanded) ───────────────────────────────────────────

function RitualDetailCard({
  ritual,
  onReorder,
  onDelete,
  onRename,
}: {
  ritual: Ritual;
  onReorder: (ritual: Ritual) => void;
  onDelete: (id: string) => void;
  onRename: (id: string, name: string, icon: string) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [editName, setEditName] = useState(ritual.name);
  const [editIcon, setEditIcon] = useState(ritual.icon);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [reordered, setReordered] = useState(false);

  const outOfStock = ritual.items.filter(i => !i.inStock);

  const handleReorder = () => {
    onReorder(ritual);
    setReordered(true);
    setTimeout(() => setReordered(false), 3000);
  };

  const handleSave = () => {
    onRename(ritual.id, editName, editIcon);
    setEditing(false);
  };

  const frequencyLabel = {
    daily: 'Every day',
    weekly: 'Every week',
    biweekly: 'Every 2 weeks',
    monthly: 'Every month',
    custom: 'Custom',
  }[ritual.frequency];

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      className="bg-white rounded-sm border border-[#D5D9D9] hover:shadow-md
        transition-shadow overflow-hidden"
    >
      {/* ── Header ────────────────────────────────────────────────── */}
      <div className="bg-[#F7F8F8] px-5 py-4
        border-b border-[#D5D9D9]">
        {editing ? (
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <span className="text-2xl">{editIcon}</span>
              <input
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                className="flex-1 text-base font-bold text-[#0F1111] bg-white border
                  border-[#D5D9D9] rounded-sm px-3 py-1.5 outline-none
                  focus:border-[#007185] transition-colors"
                autoFocus
              />
            </div>
            <EmojiPicker selected={editIcon} onSelect={setEditIcon} />
            <div className="flex gap-2">
              <button
                onClick={handleSave}
                className="px-4 py-1.5 bg-[#FFD814] text-[#0F1111] text-xs font-bold
                  rounded-md hover:bg-[#F7CA00] transition-colors"
              >
                Save
              </button>
              <button
                onClick={() => { setEditing(false); setEditName(ritual.name); setEditIcon(ritual.icon); }}
                className="px-4 py-1.5 text-xs font-semibold text-gray-500 hover:text-gray-700
                  transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-2xl">{ritual.icon}</span>
              <div>
                <h3 className="text-base font-bold text-[#0F1111]">{ritual.name}</h3>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-xs text-gray-400">{frequencyLabel}</span>
                  <span className="text-gray-300">·</span>
                  <span className="text-xs text-gray-400">
                    Ordered {ritual.orderCount} times
                  </span>
                  {ritual.autoNamed && (
                    <>
                      <span className="text-gray-300">·</span>
                      <span className="text-[10px] bg-[#F7F8F8] text-[#007185] px-1.5 py-0.5 rounded-sm font-medium border border-[#D5D9D9]">
                        Auto-named
                      </span>
                    </>
                  )}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setEditing(true)}
                className="w-8 h-8 rounded-sm hover:bg-white/80 flex items-center
                  justify-center transition-colors"
                aria-label="Edit ritual"
              >
                <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24"
                  stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round"
                    d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931z" />
                </svg>
              </button>
              <button
                onClick={() => setShowConfirmDelete(true)}
                className="w-8 h-8 rounded-sm hover:bg-red-50 flex items-center
                  justify-center transition-colors"
                aria-label="Delete ritual"
              >
                <svg className="w-4 h-4 text-gray-400 hover:text-red-500" fill="none"
                  viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round"
                    d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                </svg>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ── Items list ────────────────────────────────────────────── */}
      <div className="px-5 py-4">
        <div className="space-y-2">
          {ritual.items.map(item => (
            <div
              key={item.productId}
              className={`flex items-center justify-between py-1.5 ${
                item.inStock ? '' : 'opacity-50'
              }`}
            >
              <div className="flex items-center gap-3 min-w-0">
                <span className="text-lg flex-shrink-0">{item.image}</span>
                <div className="min-w-0">
                  <p className={`text-sm text-[#0F1111] truncate ${
                    !item.inStock ? 'line-through' : ''
                  }`}>
                    {item.name}
                  </p>
                  {!item.inStock && (
                    <p className="text-[10px] text-amber-600">Out of stock</p>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-3 flex-shrink-0">
                <span className="text-xs text-gray-400">×{item.quantity}</span>
                <span className="text-sm font-semibold text-[#0F1111]">
                  ₹{item.price * item.quantity}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* ── Total + Reorder ─────────────────────────────────────── */}
        <div className="border-t border-gray-100 mt-3 pt-3 flex items-center justify-between">
          <div>
            <p className="text-base font-bold text-[#0F1111]">₹{ritual.estimatedTotal}</p>
            <p className="text-[11px] text-gray-400">
              Last ordered {ritual.daysSinceLastOrder} days ago
            </p>
          </div>
          <button
            onClick={handleReorder}
            disabled={reordered}
            className={`px-6 py-2.5 text-sm font-bold rounded-md transition-all
              active:scale-[0.97] ${
              reordered
                ? 'bg-green-50 text-green-600'
                : 'bg-[#FFD814] hover:bg-[#F7CA00] text-[#0F1111] shadow-sm hover:shadow-md'
            }`}
          >
            {reordered ? '✓ Added to cart!' : `Reorder all · ₹${ritual.estimatedTotal}`}
          </button>
        </div>

        {/* ── Out-of-stock warning ────────────────────────────────── */}
        {outOfStock.length > 0 && (
          <p className="text-xs text-amber-600 mt-2">
            ⚠ {outOfStock.length} item{outOfStock.length > 1 ? 's' : ''} currently
            out of stock — Nia will suggest substitutes when you reorder.
          </p>
        )}
      </div>

      {/* ── Delete confirmation ───────────────────────────────────── */}
      <AnimatePresence>
        {showConfirmDelete && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="px-5 py-3 bg-red-50 border-t border-red-100 flex items-center
              justify-between">
              <p className="text-xs text-red-600">Delete &quot;{ritual.name}&quot;?</p>
              <div className="flex gap-2">
                <button
                  onClick={() => setShowConfirmDelete(false)}
                  className="px-3 py-1 text-xs text-gray-500 hover:text-gray-700"
                >
                  Cancel
                </button>
                <button
                  onClick={() => onDelete(ritual.id)}
                  className="px-3 py-1 text-xs font-semibold text-white bg-red-500
                    hover:bg-red-600 rounded-sm transition-colors"
                >
                  Delete
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ── Main Page ───────────────────────────────────────────────────────────────

export default function RitualsPage() {
  const [rituals, setRituals] = useState<Ritual[]>([]);

  useEffect(() => {
    setRituals(getMockRituals());
  }, []);

  const handleReorder = (ritual: Ritual) => {
    const subs = getSubstitutions(ritual);
    const cartItems = ritualToCartItems(ritual, subs);
    const store = useNiaChatStore.getState();
    cartItems.forEach(item => store.addToCart(item));
  };

  const handleDelete = (id: string) => {
    setRituals(prev => prev.filter(r => r.id !== id));
  };

  const handleRename = (id: string, name: string, icon: string) => {
    setRituals(prev =>
      prev.map(r => r.id === id ? { ...r, name, icon, autoNamed: false } : r)
    );
  };

  const handleBulkReorder = () => {
    const store = useNiaChatStore.getState();
    rituals.forEach(ritual => {
      const subs = getSubstitutions(ritual);
      const cartItems = ritualToCartItems(ritual, subs);
      cartItems.forEach(item => store.addToCart(item));
    });
  };

  const totalAllRituals = rituals.reduce((sum, r) => sum + r.estimatedTotal, 0);
  const totalItems = rituals.reduce((sum, r) => sum + r.items.length, 0);

  return (
    <div className="min-h-screen bg-[#EAEDED]">
      {/* ── Header ───────────────────────────────────────────────── */}
      <div className="bg-white border-b border-[#D5D9D9] sticky top-0 z-40">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="w-8 h-8 rounded-sm hover:bg-gray-100 flex items-center
                justify-center transition-colors"
            >
              <svg className="w-5 h-5 text-gray-600" fill="none" viewBox="0 0 24 24"
                stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
              </svg>
            </Link>
            <div>
              <h1 className="text-lg font-bold text-[#0F1111]">Your Rituals</h1>
              <p className="text-xs text-gray-400">
                {rituals.length} rituals · {totalItems} items
              </p>
            </div>
          </div>
          <button
            onClick={handleBulkReorder}
            className="px-4 py-2 bg-[#FFD814] hover:bg-[#F7CA00] text-[#0F1111] text-xs
              font-bold rounded-md transition-colors shadow-sm hover:shadow-md
              active:scale-[0.97]"
          >
            Reorder all · ₹{totalAllRituals}
          </button>
        </div>
      </div>

      {/* ── Rituals list ─────────────────────────────────────────── */}
      <div className="max-w-3xl mx-auto px-4 py-6 space-y-4">
        <AnimatePresence mode="popLayout">
          {rituals.map(ritual => (
            <RitualDetailCard
              key={ritual.id}
              ritual={ritual}
              onReorder={handleReorder}
              onDelete={handleDelete}
              onRename={handleRename}
            />
          ))}
        </AnimatePresence>

        {rituals.length === 0 && (
          <div className="text-center py-12">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[#E0F2F1]
              flex items-center justify-center">
              <span className="text-2xl">⚡</span>
            </div>
            <p className="text-base font-bold text-[#0F1111]">No rituals yet</p>
            <p className="text-sm text-gray-400 mt-1">
              Nia will detect your patterns automatically, or you can create one manually.
            </p>
            <button
              onClick={() => useNiaChatStore.getState().open(
                'Help me create a new ritual for items I buy every week'
              )}
              className="mt-4 px-6 py-2.5 bg-[#00838F] hover:bg-[#006d75] text-white
                text-sm font-semibold rounded-md transition-colors"
            >
              Create your first ritual
            </button>
          </div>
        )}

        {/* ── Import from past order section ──────────────────────── */}
        {rituals.length > 0 && (
          <div className="bg-white rounded-sm border border-[#D5D9D9] p-5 text-center">
            <p className="text-sm font-semibold text-[#0F1111]">
              📋 Turn a past order into a ritual
            </p>
            <p className="text-xs text-gray-400 mt-1">
              Select any past order and save it as a one-click reorder bundle
            </p>
            <button
              onClick={() => useNiaChatStore.getState().open(
                'Show me my recent orders so I can turn one into a ritual'
              )}
              className="mt-3 px-5 py-2 bg-[#E0F2F1] hover:bg-[#B2DFDB] text-[#00838F]
                text-xs font-semibold rounded-md transition-colors"
            >
              Import from order history
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// Production extension:
// - Full CRUD via /api/rituals REST endpoints → DynamoDB
// - "Import from order" shows a real list of past orders from the order history API
// - Drag-and-drop to reorder items within a ritual
// - Schedule rituals: auto-add to cart every Monday at 8am
// - Share ritual via link/WhatsApp for family shopping
// - Item search + add: real-time catalog search for building rituals from scratch
// - Per-item quantity editing directly on the management page
