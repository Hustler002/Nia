'use client';

import { create } from 'zustand';
import type { CartItem } from '@/types';

interface CartStore {
  items: CartItem[];
  isOpen: boolean;

  // Actions
  addItem: (item: CartItem) => void;
  addItems: (items: CartItem[]) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, qty: number) => void;
  clearCart: () => void;
  openCart: () => void;
  closeCart: () => void;

  // Computed helpers (call these as functions)
  getTotalItems: () => number;
  getTotalPrice: () => number;
}

export const useCartStore = create<CartStore>((set, get) => ({
  items: [],
  isOpen: false,

  addItem: (item) =>
    set((state) => {
      const existing = state.items.find((i) => i.id === item.id);
      if (existing) {
        return {
          items: state.items.map((i) =>
            i.id === item.id ? { ...i, qty: i.qty + (item.qty || 1) } : i
          ),
        };
      }
      return { items: [...state.items, { ...item, qty: item.qty || 1 }] };
    }),

  addItems: (items) => {
    items.forEach((item) => get().addItem(item));
  },

  removeItem: (productId) =>
    set((state) => ({ items: state.items.filter((i) => i.id !== productId) })),

  updateQuantity: (productId, qty) =>
    set((state) => ({
      items:
        qty <= 0
          ? state.items.filter((i) => i.id !== productId)
          : state.items.map((i) => (i.id === productId ? { ...i, qty } : i)),
    })),

  clearCart: () => set({ items: [] }),
  openCart: () => set({ isOpen: true }),
  closeCart: () => set({ isOpen: false }),

  getTotalItems: () => get().items.reduce((sum, i) => sum + i.qty, 0),
  getTotalPrice: () => get().items.reduce((sum, i) => sum + i.price * i.qty, 0),
}));
