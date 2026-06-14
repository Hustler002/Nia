// app/rituals/page.tsx
// Full rituals management page — view, edit, delete, create rituals.
// Features: expanded item lists, bulk reorder, emoji picker, edit/rename,
// per-item quantity editing, add/remove items, create new ritual from scratch.
// Production: CRUD operations via DynamoDB API routes

'use client';

import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { getMockRituals, ritualToCartItems, getSubstitutions } from '@/lib/rituals/ritualDetector';
import type { Ritual, RitualItem } from '@/lib/rituals/ritualDetector';
import { useNiaChatStore } from '@/lib/useNiaStore';

// ── Available products catalog for add-item picker ──────────────────────────

const AVAILABLE_PRODUCTS: RitualItem[] = [
  { productId: 'ap-001', name: 'Amul Toned Milk 500ml', price: 24, mrp: 24, image: '🥛', quantity: 1, category: 'Dairy & Eggs', inStock: true },
  { productId: 'ap-002', name: 'Britannia Bread 400g', price: 45, mrp: 50, image: '🍞', quantity: 1, category: 'Groceries', inStock: true },
  { productId: 'ap-003', name: 'Farm Fresh Eggs (6 pcs)', price: 48, mrp: 55, image: '🥚', quantity: 1, category: 'Dairy & Eggs', inStock: true },
  { productId: 'ap-004', name: 'Amul Butter 100g', price: 56, mrp: 56, image: '🧈', quantity: 1, category: 'Dairy & Eggs', inStock: true },
  { productId: 'ap-005', name: 'Tata Salt 1kg', price: 28, mrp: 28, image: '🧂', quantity: 1, category: 'Kitchen Essentials', inStock: true },
  { productId: 'ap-006', name: 'India Gate Sugar 1kg', price: 48, mrp: 52, image: '🍬', quantity: 1, category: 'Kitchen Essentials', inStock: true },
  { productId: 'ap-007', name: 'Fortune Sunlite Oil 1L', price: 155, mrp: 170, image: '🫙', quantity: 1, category: 'Kitchen Essentials', inStock: true },
  { productId: 'ap-008', name: 'Toor Dal 1kg', price: 140, mrp: 160, image: '🫘', quantity: 1, category: 'Groceries', inStock: true },
  { productId: 'ap-009', name: 'Nescafé Classic 50g', price: 125, mrp: 140, image: '☕', quantity: 1, category: 'Beverages', inStock: true },
  { productId: 'ap-010', name: 'Red Label Tea 250g', price: 105, mrp: 120, image: '🍵', quantity: 1, category: 'Beverages', inStock: true },
  { productId: 'ap-011', name: "Lay's Classic 150g", price: 50, mrp: 50, image: '🥔', quantity: 1, category: 'Snacks', inStock: true },
  { productId: 'ap-012', name: 'Kurkure Masala 120g', price: 30, mrp: 30, image: '🌶️', quantity: 1, category: 'Snacks', inStock: true },
  { productId: 'ap-013', name: 'Pepsi 2L', price: 80, mrp: 85, image: '🥤', quantity: 1, category: 'Beverages', inStock: true },
  { productId: 'ap-014', name: 'Oreo Original 300g', price: 60, mrp: 65, image: '🍪', quantity: 1, category: 'Snacks', inStock: true },
  { productId: 'ap-015', name: 'Colgate MaxFresh 200g', price: 142, mrp: 165, image: '🪥', quantity: 1, category: 'Personal Care', inStock: true },
  { productId: 'ap-016', name: 'Maggi 2-Min Noodles 4-pack', price: 56, mrp: 60, image: '🍜', quantity: 1, category: 'Groceries', inStock: true },
  { productId: 'ap-017', name: 'Basmati Rice 5kg', price: 450, mrp: 499, image: '🍚', quantity: 1, category: 'Groceries', inStock: true },
  { productId: 'ap-018', name: 'Moong Dal 500g', price: 75, mrp: 85, image: '🫛', quantity: 1, category: 'Groceries', inStock: true },
];

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

// ── Add Item Picker ─────────────────────────────────────────────────────────

function AddItemPicker({
  existingIds,
  onAdd,
  onClose,
}: {
  existingIds: string[];
  onAdd: (item: RitualItem) => void;
  onClose: () => void;
}) {
  const [search, setSearch] = useState('');

  const available = AVAILABLE_PRODUCTS.filter(
    p => !existingIds.includes(p.productId) &&
      p.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="bg-[#F7F8F8] border border-[#D5D9D9] rounded-sm p-3 mt-2">
      <div className="flex items-center justify-between mb-2">
        <p className="text-xs font-bold text-[#0F1111]">Add item to ritual</p>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xs">✕</button>
      </div>
      <input
        type="text"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search products..."
        className="w-full text-xs bg-white border border-[#D5D9D9] rounded-sm px-3 py-2 outline-none focus:border-[#007185] transition-colors mb-2"
        autoFocus
      />
      <div className="max-h-40 overflow-y-auto space-y-1">
        {available.length > 0 ? available.map(item => (
          <button
            key={item.productId}
            onClick={() => { onAdd(item); onClose(); }}
            className="flex items-center gap-2 w-full px-2 py-1.5 rounded-sm hover:bg-white transition-colors text-left"
          >
            <span className="text-lg">{item.image}</span>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-[#0F1111] truncate">{item.name}</p>
              <p className="text-[10px] text-gray-400">{item.category}</p>
            </div>
            <span className="text-xs font-semibold text-[#0F1111]">₹{item.price}</span>
          </button>
        )) : (
          <p className="text-xs text-gray-400 text-center py-3">No matching products</p>
        )}
      </div>
    </div>
  );
}

// ── Ritual Detail Card (expanded) ───────────────────────────────────────────

function RitualDetailCard({
  ritual,
  onReorder,
  onDelete,
  onUpdate,
}: {
  ritual: Ritual;
  onReorder: (ritual: Ritual) => void;
  onDelete: (id: string) => void;
  onUpdate: (id: string, updates: Partial<Ritual>) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [editName, setEditName] = useState(ritual.name);
  const [editIcon, setEditIcon] = useState(ritual.icon);
  const [editItems, setEditItems] = useState<RitualItem[]>(ritual.items);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [showAddItem, setShowAddItem] = useState(false);
  const [reordered, setReordered] = useState(false);

  const outOfStock = ritual.items.filter(i => !i.inStock);

  const handleReorder = () => {
    onReorder(ritual);
    setReordered(true);
    setTimeout(() => setReordered(false), 3000);
  };

  const handleSave = () => {
    const newTotal = editItems.reduce((sum, i) => sum + i.price * i.quantity, 0);
    onUpdate(ritual.id, {
      name: editName,
      icon: editIcon,
      items: editItems,
      estimatedTotal: newTotal,
      autoNamed: false,
    });
    setEditing(false);
    setShowAddItem(false);
  };

  const handleCancel = () => {
    setEditing(false);
    setEditName(ritual.name);
    setEditIcon(ritual.icon);
    setEditItems(ritual.items);
    setShowAddItem(false);
  };

  const handleItemQtyChange = (productId: string, delta: number) => {
    setEditItems(prev =>
      prev.map(item =>
        item.productId === productId
          ? { ...item, quantity: Math.max(1, item.quantity + delta) }
          : item
      )
    );
  };

  const handleRemoveItem = (productId: string) => {
    setEditItems(prev => prev.filter(i => i.productId !== productId));
  };

  const handleAddItem = (item: RitualItem) => {
    setEditItems(prev => [...prev, { ...item, quantity: 1 }]);
  };

  const frequencyLabel = {
    daily: 'Every day',
    weekly: 'Every week',
    biweekly: 'Every 2 weeks',
    monthly: 'Every month',
    custom: 'Custom',
  }[ritual.frequency];

  const editTotal = editItems.reduce((sum, i) => sum + i.price * i.quantity, 0);

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
                Save changes
              </button>
              <button
                onClick={handleCancel}
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
          {(editing ? editItems : ritual.items).map(item => (
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
                {editing ? (
                  <>
                    {/* Quantity controls */}
                    <div className="flex items-center gap-1 border border-[#D5D9D9] rounded-sm">
                      <button
                        onClick={() => handleItemQtyChange(item.productId, -1)}
                        className="w-7 h-7 flex items-center justify-center text-gray-500 hover:bg-gray-100 transition-colors text-sm font-bold"
                      >
                        −
                      </button>
                      <span className="w-6 text-center text-xs font-semibold text-[#0F1111]">{item.quantity}</span>
                      <button
                        onClick={() => handleItemQtyChange(item.productId, 1)}
                        className="w-7 h-7 flex items-center justify-center text-gray-500 hover:bg-gray-100 transition-colors text-sm font-bold"
                      >
                        +
                      </button>
                    </div>
                    <span className="text-sm font-semibold text-[#0F1111] w-12 text-right">
                      ₹{item.price * item.quantity}
                    </span>
                    {/* Remove button */}
                    <button
                      onClick={() => handleRemoveItem(item.productId)}
                      className="w-6 h-6 rounded-sm hover:bg-red-50 flex items-center justify-center text-gray-400 hover:text-red-500 transition-colors"
                      aria-label="Remove item"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </>
                ) : (
                  <>
                    <span className="text-xs text-gray-400">×{item.quantity}</span>
                    <span className="text-sm font-semibold text-[#0F1111]">
                      ₹{item.price * item.quantity}
                    </span>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* ── Add item (edit mode) ─────────────────────────────────── */}
        {editing && (
          <>
            {showAddItem ? (
              <AddItemPicker
                existingIds={editItems.map(i => i.productId)}
                onAdd={handleAddItem}
                onClose={() => setShowAddItem(false)}
              />
            ) : (
              <button
                onClick={() => setShowAddItem(true)}
                className="mt-3 flex items-center gap-2 text-xs text-[#007185] font-semibold hover:text-[#C45500] transition-colors"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                </svg>
                Add item
              </button>
            )}
          </>
        )}

        {/* ── Total + Reorder ─────────────────────────────────────── */}
        <div className="border-t border-gray-100 mt-3 pt-3 flex items-center justify-between">
          <div>
            <p className="text-base font-bold text-[#0F1111]">
              ₹{editing ? editTotal : ritual.estimatedTotal}
            </p>
            <p className="text-[11px] text-gray-400">
              Last ordered {ritual.daysSinceLastOrder} days ago
            </p>
          </div>
          {!editing && (
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
          )}
        </div>

        {/* ── Out-of-stock warning ────────────────────────────────── */}
        {!editing && outOfStock.length > 0 && (
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

// ── Create New Ritual Form ──────────────────────────────────────────────────

function CreateRitualForm({
  onSave,
  onCancel,
}: {
  onSave: (ritual: Ritual) => void;
  onCancel: () => void;
}) {
  const [name, setName] = useState('');
  const [icon, setIcon] = useState('📋');
  const [items, setItems] = useState<RitualItem[]>([]);
  const [showAddItem, setShowAddItem] = useState(false);

  const total = items.reduce((sum, i) => sum + i.price * i.quantity, 0);

  const handleSave = () => {
    if (!name.trim() || items.length === 0) return;

    const now = new Date();
    const ritual: Ritual = {
      id: `ritual-new-${Date.now()}`,
      name: name.trim(),
      icon,
      items,
      estimatedTotal: total,
      lastOrdered: now,
      frequency: 'weekly',
      nextSuggestedDate: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000),
      autoNamed: false,
      orderCount: 0,
      daysSinceLastOrder: 0,
    };
    onSave(ritual);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-sm border-2 border-[#00838F] overflow-hidden shadow-md"
    >
      <div className="bg-gradient-to-r from-[#00838F] to-[#006d75] px-5 py-4">
        <h3 className="text-base font-bold text-white">Create New Ritual</h3>
        <p className="text-xs text-white/70 mt-0.5">Bundle items you buy together for one-click reorder</p>
      </div>

      <div className="px-5 py-4 space-y-4">
        {/* Name + icon */}
        <div>
          <label className="text-xs font-bold text-[#0F1111] block mb-1.5">Ritual name</label>
          <div className="flex items-center gap-3">
            <span className="text-2xl">{icon}</span>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder='e.g. "Monday Morning", "Gym Fuel"'
              className="flex-1 text-sm bg-white border border-[#D5D9D9] rounded-sm px-3 py-2
                outline-none focus:border-[#007185] transition-colors"
              autoFocus
            />
          </div>
        </div>

        {/* Emoji picker */}
        <div>
          <label className="text-xs font-bold text-[#0F1111] block mb-1.5">Choose an icon</label>
          <EmojiPicker selected={icon} onSelect={setIcon} />
        </div>

        {/* Items list */}
        <div>
          <label className="text-xs font-bold text-[#0F1111] block mb-1.5">
            Items ({items.length} added{items.length > 0 ? ` · ₹${total}` : ''})
          </label>
          {items.length > 0 ? (
            <div className="space-y-2 mb-2">
              {items.map(item => (
                <div key={item.productId} className="flex items-center justify-between py-1.5">
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="text-lg">{item.image}</span>
                    <p className="text-sm text-[#0F1111] truncate">{item.name}</p>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <div className="flex items-center gap-1 border border-[#D5D9D9] rounded-sm">
                      <button
                        onClick={() => setItems(prev => prev.map(i => i.productId === item.productId ? { ...i, quantity: Math.max(1, i.quantity - 1) } : i))}
                        className="w-7 h-7 flex items-center justify-center text-gray-500 hover:bg-gray-100 text-sm font-bold"
                      >−</button>
                      <span className="w-6 text-center text-xs font-semibold">{item.quantity}</span>
                      <button
                        onClick={() => setItems(prev => prev.map(i => i.productId === item.productId ? { ...i, quantity: i.quantity + 1 } : i))}
                        className="w-7 h-7 flex items-center justify-center text-gray-500 hover:bg-gray-100 text-sm font-bold"
                      >+</button>
                    </div>
                    <span className="text-xs font-semibold w-10 text-right">₹{item.price * item.quantity}</span>
                    <button
                      onClick={() => setItems(prev => prev.filter(i => i.productId !== item.productId))}
                      className="text-gray-400 hover:text-red-500 transition-colors"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-gray-400 mb-2">No items yet. Add products below.</p>
          )}

          {showAddItem ? (
            <AddItemPicker
              existingIds={items.map(i => i.productId)}
              onAdd={(item) => setItems(prev => [...prev, { ...item, quantity: 1 }])}
              onClose={() => setShowAddItem(false)}
            />
          ) : (
            <button
              onClick={() => setShowAddItem(true)}
              className="flex items-center gap-2 text-xs text-[#007185] font-semibold hover:text-[#C45500] transition-colors"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
              Add item from catalog
            </button>
          )}
        </div>

        {/* Actions */}
        <div className="border-t border-gray-100 pt-3 flex items-center justify-between">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-xs font-semibold text-gray-500 hover:text-gray-700 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={!name.trim() || items.length === 0}
            className={`px-6 py-2 text-sm font-bold rounded-md transition-all ${
              !name.trim() || items.length === 0
                ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                : 'bg-[#FFD814] hover:bg-[#F7CA00] text-[#0F1111] shadow-sm'
            }`}
          >
            Save Ritual · ₹{total}
          </button>
        </div>
      </div>
    </motion.div>
  );
}

// ── Main Page ───────────────────────────────────────────────────────────────

export default function RitualsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#EAEDED] flex items-center justify-center">
        <div className="w-8 h-8 border-3 border-[#FF9900] border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <RitualsPageInner />
    </Suspense>
  );
}

function RitualsPageInner() {
  const searchParams = useSearchParams();
  const [rituals, setRituals] = useState<Ritual[]>([]);
  const [showCreateForm, setShowCreateForm] = useState(false);

  useEffect(() => {
    setRituals(getMockRituals());
    // Auto-open create form if navigating from homepage "Create new ritual" CTA
    if (searchParams.get('create') === '1') {
      setShowCreateForm(true);
    }
  }, [searchParams]);

  const handleReorder = (ritual: Ritual) => {
    const subs = getSubstitutions(ritual);
    const cartItems = ritualToCartItems(ritual, subs);
    const store = useNiaChatStore.getState();
    cartItems.forEach(item => store.addToCart(item));
  };

  const handleDelete = (id: string) => {
    setRituals(prev => prev.filter(r => r.id !== id));
  };

  const handleUpdate = (id: string, updates: Partial<Ritual>) => {
    setRituals(prev =>
      prev.map(r => r.id === id ? { ...r, ...updates } : r)
    );
  };

  const handleCreateNew = (ritual: Ritual) => {
    setRituals(prev => [ritual, ...prev]);
    setShowCreateForm(false);
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
      <div className="bg-white border-b border-[#D5D9D9] sticky top-14 z-40">
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
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowCreateForm(true)}
              className="px-3 py-2 text-xs font-bold text-[#007185] border border-[#D5D9D9]
                rounded-md hover:bg-[#F7F8F8] transition-colors"
            >
              + New Ritual
            </button>
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
      </div>

      {/* ── Content ──────────────────────────────────────────────── */}
      <div className="max-w-3xl mx-auto px-4 py-6 space-y-4">
        {/* Create form */}
        <AnimatePresence>
          {showCreateForm && (
            <CreateRitualForm
              onSave={handleCreateNew}
              onCancel={() => setShowCreateForm(false)}
            />
          )}
        </AnimatePresence>

        {/* Rituals list */}
        <AnimatePresence mode="popLayout">
          {rituals.map(ritual => (
            <RitualDetailCard
              key={ritual.id}
              ritual={ritual}
              onReorder={handleReorder}
              onDelete={handleDelete}
              onUpdate={handleUpdate}
            />
          ))}
        </AnimatePresence>

        {rituals.length === 0 && !showCreateForm && (
          <div className="text-center py-12">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[#E0F2F1]
              flex items-center justify-center">
              <span className="text-2xl">⚡</span>
            </div>
            <p className="text-base font-bold text-[#0F1111]">No rituals yet</p>
            <p className="text-sm text-gray-400 mt-1">
              Create a ritual to bundle items you buy together for one-click reorder.
            </p>
            <button
              onClick={() => setShowCreateForm(true)}
              className="mt-4 px-6 py-2.5 bg-[#00838F] hover:bg-[#006d75] text-white
                text-sm font-semibold rounded-md transition-colors"
            >
              Create your first ritual
            </button>
          </div>
        )}

        {/* ── Import from past order section ──────────────────────── */}
        {rituals.length > 0 && !showCreateForm && (
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
