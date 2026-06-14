// lib/useNiaStore.ts
// Canonical Zustand store for the Nia chat widget
// Manages: open/close, messages, typing state, proactive nudges, API calls
// All types imported from @/types

'use client';

import { create } from 'zustand';
import type { CartItem, ComparisonData, EmergencyKit, ReorderNudge, NiaMessage, NiaMessageType } from '@/types';
import { useCartStore } from '@/lib/stores/useCartStore';
import { useToastStore } from '@/lib/stores/useToastStore';

// Re-export types for backward compatibility
export type { CartItem, ComparisonData, EmergencyKit, ReorderNudge, NiaMessage, NiaMessageType };

// ─── Zustand Store ──────────────────────────────────────────────────────────

interface NiaStoreState {
  // UI state
  isOpen: boolean;
  isThinking: boolean;
  hasProactiveNudge: boolean;

  // Messages
  messages: NiaMessage[];

  // Rich data previews (set when the latest message contains structured data)
  cartPreview: CartItem[] | null;
  comparisonPreview: ComparisonData | null;

  // Quick chip suggestions — update contextually after each response
  quickChips: string[];

  // Initial query passed from hero input or deep links
  initialQuery: string;

  // Live cart — shared between Nia AI cart and manual product browser
  liveCart: CartItem[];

  // Active product filter category for the browse panel
  browseCategory: string;

  // Products Nia surfaced for the latest query — shown in browse panel
  relatedProducts: CartItem[];

  // The last user query — used to filter browse panel
  activeQuery: string;

  // Actions
  open: (query?: string) => void;
  close: () => void;
  toggle: () => void;
  addMessage: (msg: NiaMessage) => void;
  setThinking: (val: boolean) => void;
  setQuickChips: (chips: string[]) => void;
  setCartPreview: (items: CartItem[] | null) => void;
  setComparisonPreview: (data: ComparisonData | null) => void;
  setHasProactiveNudge: (val: boolean) => void;
  clearMessages: () => void;

  // Live cart actions (kept for backward compat with card components)
  addToCart: (item: CartItem) => void;
  removeFromCart: (id: string) => void;
  updateQty: (id: string, qty: number) => void;
  clearCart: () => void;
  setBrowseCategory: (cat: string) => void;
  setRelatedProducts: (items: CartItem[]) => void;
  setActiveQuery: (query: string) => void;

  // API call action
  sendMessage: (text: string, userId?: string, pincode?: string) => Promise<void>;
}

export const useNiaChatStore = create<NiaStoreState>((set, get) => ({
  isOpen: false,
  isThinking: false,
  hasProactiveNudge: false,
  messages: [],
  cartPreview: null,
  comparisonPreview: null,
  initialQuery: '',
  liveCart: [],
  browseCategory: 'All',
  relatedProducts: [],
  activeQuery: '',
  quickChips: [
    'Movie night for 4 🎬',
    'Compare earbuds 🎧',
    'I have a fever 🚨',
  ],

  open: (query?: string) =>
    set({ isOpen: true, initialQuery: query || '', hasProactiveNudge: false }),
  close: () => set({ isOpen: false, initialQuery: '' }),
  toggle: () =>
    set((state) => ({
      isOpen: !state.isOpen,
      hasProactiveNudge: state.isOpen ? state.hasProactiveNudge : false,
    })),

  addMessage: (msg) =>
    set((state) => ({ messages: [...state.messages, msg] })),
  setThinking: (val) => set({ isThinking: val }),
  setQuickChips: (chips) => set({ quickChips: chips }),
  setCartPreview: (items) => set({ cartPreview: items }),
  setComparisonPreview: (data) => set({ comparisonPreview: data }),
  setHasProactiveNudge: (val) => set({ hasProactiveNudge: val }),
  clearMessages: () =>
    set({ messages: [], cartPreview: null, comparisonPreview: null }),

  // Cart actions — bridge to the dedicated cart store + keep local liveCart in sync
  addToCart: (item) => {
    // Add to the dedicated cart store
    useCartStore.getState().addItem(item);
    // Fire toast
    useToastStore.getState().addToast(`${item.name} added to cart · ₹${item.price * (item.qty || 1)}`);
    // Also update local liveCart for backward compat
    set((state) => {
      const existing = state.liveCart.find((i) => i.id === item.id);
      if (existing) {
        return {
          liveCart: state.liveCart.map((i) =>
            i.id === item.id ? { ...i, qty: i.qty + (item.qty || 1) } : i
          ),
        };
      }
      return { liveCart: [...state.liveCart, { ...item, qty: item.qty || 1 }] };
    });
  },
  removeFromCart: (id) =>
    set((state) => ({ liveCart: state.liveCart.filter((i) => i.id !== id) })),
  updateQty: (id, qty) =>
    set((state) => ({
      liveCart:
        qty <= 0
          ? state.liveCart.filter((i) => i.id !== id)
          : state.liveCart.map((i) => (i.id === id ? { ...i, qty } : i)),
    })),
  clearCart: () => set({ liveCart: [] }),
  setBrowseCategory: (cat) => set({ browseCategory: cat }),
  setRelatedProducts: (items) => set({ relatedProducts: items }),
  setActiveQuery: (query) => set({ activeQuery: query }),

  // ── Core send message handler — calls /api/nia ──
  sendMessage: async (text: string, userId?: string, pincode?: string) => {
    const query = text.trim();
    if (!query || get().isThinking) return;

    const userMsg: NiaMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: query,
      type: 'text',
      timestamp: new Date(),
    };

    const currentMessages = [...get().messages, userMsg];
    set((state) => ({
      messages: [...state.messages, userMsg],
      isThinking: true,
      activeQuery: query,
    }));

    try {
      const res = await fetch('/api/nia', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: currentMessages,
          userId: userId || 'priya-sharma-001',
          pincode: pincode || '110001',
        }),
      });

      if (!res.ok) throw new Error(`API error ${res.status}`);
      const niaResponse = await res.json();

      const niaMsg: NiaMessage = {
        id: niaResponse.id || `nia-${Date.now()}`,
        role: 'nia',
        content: niaResponse.content || niaResponse.message || '',
        type: niaResponse.type || 'text',
        data: niaResponse.data || null,
        confidence: niaResponse.confidence,
        reason: niaResponse.reason,
        timestamp: new Date(),
      };

      set((state) => ({
        messages: [...state.messages, niaMsg],
        isThinking: false,
      }));

      // Auto-add to cart for cart_summary responses
      if (niaMsg.data && Array.isArray(niaMsg.data) && niaMsg.type === 'cart_summary') {
        niaMsg.data.forEach((item: CartItem) => {
          get().addToCart(item);
        });
      }

      // Update related products for browse panel
      if (niaMsg.data && Array.isArray(niaMsg.data)) {
        set({ relatedProducts: niaMsg.data });
      }

      // Update quick chips if provided
      if (niaResponse.quickChips?.length) {
        set({ quickChips: niaResponse.quickChips });
      }
    } catch (err) {
      console.error('Nia fetch error:', err);
      set((state) => ({
        messages: [
          ...state.messages,
          {
            id: `nia-err-${Date.now()}`,
            role: 'nia' as const,
            content: "Hmm, something went wrong on my end. Try again in a second! 🙏",
            type: 'text' as const,
            data: null,
            timestamp: new Date(),
          },
        ],
        isThinking: false,
      }));
    }
  },
}));

// ─── Backward-compatible aliases ────────────────────────────────────────────
// Some components import useNiaStore — point them to the same store
export const useNiaStore = useNiaChatStore;
