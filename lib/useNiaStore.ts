// lib/useNiaStore.ts
// Global state for the Nia chat widget using Zustand
// Manages: open/close, messages, typing state, cart preview, comparison data, proactive nudges
// Production: add WebSocket connection state, streaming message support, session persistence

'use client';

import { createContext, useContext } from 'react';
import { create } from 'zustand';

// ─── Type Definitions ───────────────────────────────────────────────────────

export interface CartItem {
  id: string;
  name: string;
  price: number;
  mrp: number;
  image: string; // emoji for demo, URL in production
  qty: number;
  category: string;
}

export interface ComparisonProduct {
  id: string;
  name: string;
  price: number;
  rating: number;
  image: string;
  specs: Record<string, string>;
  matchScore: number;
  recommended: boolean;
  whyRecommended?: string;
}

export interface ComparisonData {
  query: string;
  products: ComparisonProduct[];
  attributes: string[];
}

export interface EmergencyKit {
  category: string;
  name: string;
  items: CartItem[];
  totalPrice: number;
  eta: string;
  categoryColor?: string; // hex color for category-coded UI (e.g. #EF5350 for fever)
  categoryEmoji?: string; // emoji icon for the category (e.g. 🤒)
}

export interface ReorderNudge {
  product: {
    id: string;
    name: string;
    price: number;
    image: string;
    lastOrdered: string;
    cycleDays: number;
    percentUsed: number;
  };
}

// Message types map to specific rich card renderers
export type NiaMessageType =
  | 'text'
  | 'product_list'
  | 'comparison'
  | 'cart_summary'
  | 'emergency_kit'
  | 'reorder_nudge';

export interface NiaMessage {
  id: string;
  role: 'user' | 'nia';
  content: string;
  type: NiaMessageType;
  data?: CartItem[] | ComparisonData | EmergencyKit | ReorderNudge | null;
  timestamp: Date;
}

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
}

export const useNiaChatStore = create<NiaStoreState>((set) => ({
  isOpen: false,
  isThinking: false,
  hasProactiveNudge: false,
  messages: [],
  cartPreview: null,
  comparisonPreview: null,
  initialQuery: '',
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
}));

// ─── Legacy Context (backward compat with existing NiaProvider/components) ──

export interface NiaState {
  isOpen: boolean;
  initialQuery: string;
  openNia: (query?: string) => void;
  closeNia: () => void;
  toggleNia: () => void;
}

export const NiaContext = createContext<NiaState>({
  isOpen: false,
  initialQuery: '',
  openNia: () => {},
  closeNia: () => {},
  toggleNia: () => {},
});

export const useNiaStore = () => useContext(NiaContext);

// Production extension:
// - Add WebSocket connection state for streaming Bedrock Agent responses
// - Persist conversation history to DynamoDB per session_id
// - Add optimistic updates for cart operations
// - Integrate with Amazon Personalize for contextual quick chip suggestions
// - Add message retry/error state for failed API calls
