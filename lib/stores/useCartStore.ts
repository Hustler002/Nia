'use client';

import { create } from 'zustand';
import type { CartItem } from '@/types';

// ── localStorage helpers ────────────────────────────────────────────────────

const STORAGE_KEY = 'nia_cart';

function loadCartFromStorage(): CartItem[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch {
    // Corrupt data — ignore and start fresh
  }
  return [];
}

function saveCartToStorage(items: CartItem[]) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch {
    // Storage full or blocked — non-critical
  }
}

// ── Zustand Store ───────────────────────────────────────────────────────────

interface CartStore {
  items: CartItem[];
  isOpen: boolean;
  _hydrated: boolean;

  // Actions
  addItem: (item: CartItem) => void;
  addItems: (items: CartItem[]) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, qty: number) => void;
  clearCart: () => void;
  openCart: () => void;
  closeCart: () => void;
  hydrate: () => void;

  // Computed helpers (call these as functions)
  getTotalItems: () => number;
  getTotalPrice: () => number;
}

export const useCartStore = create<CartStore>((set, get) => ({
  items: [],
  isOpen: false,
  _hydrated: false,

  hydrate: () => {
    if (get()._hydrated) return;
    const stored = loadCartFromStorage();
    set({ items: stored, _hydrated: true });
  },

  addItem: (item) =>
    set((state) => {
      const existing = state.items.find((i) => i.id === item.id);
      let newItems: CartItem[];
      if (existing) {
        newItems = state.items.map((i) =>
          i.id === item.id ? { ...i, qty: i.qty + (item.qty || 1) } : i
        );
      } else {
        newItems = [...state.items, { ...item, qty: item.qty || 1 }];
      }
      saveCartToStorage(newItems);
      return { items: newItems };
    }),

  addItems: (items) => {
    items.forEach((item) => get().addItem(item));
  },

  removeItem: (productId) =>
    set((state) => {
      const newItems = state.items.filter((i) => i.id !== productId);
      saveCartToStorage(newItems);
      return { items: newItems };
    }),

  updateQuantity: (productId, qty) =>
    set((state) => {
      const newItems =
        qty <= 0
          ? state.items.filter((i) => i.id !== productId)
          : state.items.map((i) => (i.id === productId ? { ...i, qty } : i));
      saveCartToStorage(newItems);
      return { items: newItems };
    }),

  clearCart: () => {
    saveCartToStorage([]);
    set({ items: [] });
  },
  openCart: () => set({ isOpen: true }),
  closeCart: () => set({ isOpen: false }),

  getTotalItems: () => get().items.reduce((sum, i) => sum + i.qty, 0),
  getTotalPrice: () => get().items.reduce((sum, i) => sum + i.price * i.qty, 0),
}));
