// components/SocialCart/AddItemModal.tsx
// Modal sheet for searching and adding products to the shared cart

'use client';

import { useState } from 'react';
import type { SocialCartItem } from '@/lib/socialCart/types';

// Curated product catalog for the Social Cart
const SOCIAL_CART_PRODUCTS = [
  // Snacks & Movie Night
  { id: 'sc-001', name: 'Lay\'s Classic Salted Chips', price: 30, image: '🥔', category: 'Snacks' },
  { id: 'sc-002', name: 'Popcorn (Butter)', price: 45, image: '🍿', category: 'Snacks' },
  { id: 'sc-003', name: 'Peanut Butter Cookies', price: 80, image: '🍪', category: 'Snacks' },
  { id: 'sc-004', name: 'Mixed Nuts & Dried Fruits', price: 120, image: '🥜', category: 'Snacks' },
  { id: 'sc-005', name: 'Dark Chocolate Bar', price: 95, image: '🍫', category: 'Snacks' },
  { id: 'sc-006', name: 'Peanuts (Salted)', price: 40, image: '🥜', category: 'Snacks' },
  // Drinks
  { id: 'sc-007', name: 'Coca-Cola 2L', price: 65, image: '🥤', category: 'Drinks' },
  { id: 'sc-008', name: 'Pepsi 2L', price: 60, image: '🥤', category: 'Drinks' },
  { id: 'sc-009', name: 'Tropicana Orange Juice', price: 85, image: '🍊', category: 'Drinks' },
  { id: 'sc-010', name: 'Mineral Water 5L', price: 50, image: '💧', category: 'Drinks' },
  { id: 'sc-011', name: 'Red Bull Energy Drink', price: 110, image: '⚡', category: 'Drinks' },
  // Food
  { id: 'sc-012', name: 'Maggi 2-Minute Noodles (12 pack)', price: 144, image: '🍜', category: 'Food' },
  { id: 'sc-013', name: 'Bread Loaf', price: 45, image: '🍞', category: 'Food' },
  { id: 'sc-014', name: 'Amul Butter', price: 55, image: '🧈', category: 'Food' },
  { id: 'sc-015', name: 'Paneer 200g', price: 75, image: '🧀', category: 'Food' },
  { id: 'sc-016', name: 'Egg Tray (12 eggs)', price: 85, image: '🥚', category: 'Food' },
  // Essentials
  { id: 'sc-017', name: 'Paper Plates (50pcs)', price: 65, image: '🍽️', category: 'Essentials' },
  { id: 'sc-018', name: 'Tissue Box', price: 40, image: '🧻', category: 'Essentials' },
  { id: 'sc-019', name: 'Hand Sanitizer', price: 55, image: '🧴', category: 'Essentials' },
  { id: 'sc-020', name: 'Plastic Cups (50pcs)', price: 70, image: '🥤', category: 'Essentials' },
  { id: 'sc-021', name: 'Ice Cubes Bag', price: 30, image: '🧊', category: 'Essentials' },
];

const CATEGORIES = ['All', 'Snacks', 'Drinks', 'Food', 'Essentials'];

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (item: Omit<SocialCartItem, 'id' | 'cart_code' | 'flagged_by_nia' | 'nia_flag_reason' | 'created_at'>) => void;
  addedById: string;
  addedByName: string;
}

export default function AddItemModal({ isOpen, onClose, onAdd, addedById, addedByName }: Props) {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [adding, setAdding] = useState<string | null>(null);

  if (!isOpen) return null;

  const filtered = SOCIAL_CART_PRODUCTS.filter((p) => {
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase());
    const matchesCat = category === 'All' || p.category === category;
    return matchesSearch && matchesCat;
  });

  const handleAdd = async (product: typeof SOCIAL_CART_PRODUCTS[0]) => {
    setAdding(product.id);
    await onAdd({
      product_id: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
      qty: 1,
      added_by_id: addedById,
      added_by_name: addedByName,
    });
    setAdding(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />

      {/* Sheet */}
      <div className="relative w-full sm:max-w-lg bg-white rounded-t-3xl sm:rounded-2xl shadow-2xl max-h-[90vh] flex flex-col">
        {/* Handle */}
        <div className="w-10 h-1 bg-gray-200 rounded-full mx-auto mt-3 sm:hidden" />

        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-4 pb-3 border-b border-gray-100">
          <div>
            <h3 className="text-lg font-bold text-gray-900">Add to Group Cart</h3>
            <p className="text-xs text-gray-500 mt-0.5">Adding as <span className="font-medium text-[#00838F]">{addedByName}</span></p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
          >
            <svg className="w-4 h-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Search */}
        <div className="px-5 pt-3 pb-2">
          <div className="relative">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Search products..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-[#00838F] transition-colors"
              autoFocus
            />
          </div>
        </div>

        {/* Category pills */}
        <div className="px-5 pb-2 flex gap-2 overflow-x-auto no-scrollbar">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={`shrink-0 px-3 py-1 rounded-full text-xs font-medium transition-all ${
                category === cat
                  ? 'bg-[#00838F] text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Products */}
        <div className="overflow-y-auto flex-1 px-5 pb-5">
          <div className="grid grid-cols-1 gap-2 pt-2">
            {filtered.map((product) => (
              <div
                key={product.id}
                className="flex items-center gap-3 p-3 rounded-xl border border-gray-100 hover:border-[#00838F]/30 hover:bg-[#00838F]/5 transition-all"
              >
                <span className="text-2xl w-10 h-10 flex items-center justify-center bg-gray-50 rounded-lg shrink-0">
                  {product.image}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{product.name}</p>
                  <p className="text-sm font-bold text-gray-700">₹{product.price}</p>
                </div>
                <button
                  onClick={() => handleAdd(product)}
                  disabled={adding === product.id}
                  className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                    adding === product.id
                      ? 'bg-green-100 text-green-600'
                      : 'bg-[#FF9900] hover:bg-[#e88b00] text-white'
                  }`}
                >
                  {adding === product.id ? (
                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                  ) : (
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                    </svg>
                  )}
                </button>
              </div>
            ))}

            {filtered.length === 0 && (
              <div className="text-center py-10 text-gray-400">
                <p className="text-4xl mb-2">🔍</p>
                <p className="text-sm">No products found</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
