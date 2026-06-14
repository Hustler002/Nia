// lib/socialCart/socialCartStore.ts
// Zustand store for Social Cart with Supabase Realtime live sync

'use client';

import { create } from 'zustand';
import { supabase } from '@/lib/supabaseClient';
import type { SocialCart, SocialCartMember, SocialCartItem } from './types';
import type { RealtimeChannel } from '@supabase/supabase-js';

// ─── Avatar Colors ────────────────────────────────────────────────────────────

export const AVATAR_COLORS = [
  '#FF9900', '#00838F', '#E91E63', '#9C27B0',
  '#3F51B5', '#009688', '#FF5722', '#795548',
  '#607D8B', '#F44336', '#4CAF50', '#2196F3',
];

export const getAvatarColor = (index: number) =>
  AVATAR_COLORS[index % AVATAR_COLORS.length];

// ─── Store Interface ──────────────────────────────────────────────────────────

interface SocialCartStore {
  cart: SocialCart | null;
  members: SocialCartMember[];
  items: SocialCartItem[];
  myMember: SocialCartMember | null;
  isLoading: boolean;
  error: string | null;
  channel: RealtimeChannel | null;

  // Actions
  loadCart: (code: string) => Promise<void>;
  joinCart: (code: string, name: string, userId: string) => Promise<{ success: boolean; error?: string }>;
  addItem: (item: Omit<SocialCartItem, 'id' | 'cart_code' | 'flagged_by_nia' | 'nia_flag_reason' | 'created_at'>) => Promise<void>;
  removeItem: (itemId: string) => Promise<void>;
  cleanup: () => void;
  setMyMember: (member: SocialCartMember | null) => void;
}

// ─── Store ────────────────────────────────────────────────────────────────────

export const useSocialCartStore = create<SocialCartStore>((set, get) => ({
  cart: null,
  members: [],
  items: [],
  myMember: null,
  isLoading: false,
  error: null,
  channel: null,

  setMyMember: (member) => set({ myMember: member }),

  loadCart: async (code: string) => {
    set({ isLoading: true, error: null });

    if (!supabase) {
      set({ error: 'Database not configured', isLoading: false });
      return;
    }

    // Fetch cart
    const { data: cart, error: cartError } = await supabase
      .from('social_carts')
      .select('*')
      .eq('code', code)
      .single();

    if (cartError || !cart) {
      set({ error: 'Cart not found', isLoading: false });
      return;
    }

    // Fetch members
    const { data: members } = await supabase
      .from('social_cart_members')
      .select('*')
      .eq('cart_code', code)
      .order('joined_at');

    // Fetch items
    const { data: items } = await supabase
      .from('social_cart_items')
      .select('*')
      .eq('cart_code', code)
      .order('created_at');

    set({
      cart,
      members: members || [],
      items: items || [],
      isLoading: false,
    });

    // ── Subscribe to Realtime changes ──
    const existingChannel = get().channel;
    if (existingChannel) {
      supabase.removeChannel(existingChannel);
    }

    const channel = supabase
      .channel(`social-cart-${code}`)
      // Items changes
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'social_cart_items', filter: `cart_code=eq.${code}` },
        (payload) => {
          set((state) => ({
            items: [...state.items.filter((i) => i.id !== payload.new.id), payload.new as SocialCartItem],
          }));
        }
      )
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'social_cart_items', filter: `cart_code=eq.${code}` },
        (payload) => {
          set((state) => ({
            items: state.items.map((i) => (i.id === payload.new.id ? (payload.new as SocialCartItem) : i)),
          }));
        }
      )
      .on(
        'postgres_changes',
        { event: 'DELETE', schema: 'public', table: 'social_cart_items', filter: `cart_code=eq.${code}` },
        (payload) => {
          set((state) => ({
            items: state.items.filter((i) => i.id !== payload.old.id),
          }));
        }
      )
      // Members changes
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'social_cart_members', filter: `cart_code=eq.${code}` },
        (payload) => {
          set((state) => ({
            members: [...state.members.filter((m) => m.id !== payload.new.id), payload.new as SocialCartMember],
          }));
        }
      )
      .subscribe();

    set({ channel });
  },

  joinCart: async (code, name, userId) => {
    if (!supabase) return { success: false, error: 'Database not configured' };

    // Check if already a member
    const { data: existing } = await supabase
      .from('social_cart_members')
      .select('*')
      .eq('cart_code', code)
      .eq('user_id', userId)
      .single();

    if (existing) {
      set({ myMember: existing });
      return { success: true };
    }

    // Count current members for avatar color
    const currentMembers = get().members;
    const avatarColor = getAvatarColor(currentMembers.length);

    const { data, error } = await supabase
      .from('social_cart_members')
      .insert({ cart_code: code, user_id: userId, name, avatar_color: avatarColor })
      .select()
      .single();

    if (error || !data) {
      return { success: false, error: error?.message || 'Failed to join' };
    }

    set({ myMember: data });
    return { success: true };
  },

  addItem: async (item) => {
    if (!supabase) return;
    const { cart } = get();
    if (!cart) return;

    const { data, error } = await supabase
      .from('social_cart_items')
      .insert({ ...item, cart_code: cart.code })
      .select()
      .single();

    if (error || !data) return;

    // Trigger Nia conflict check via API
    try {
      await fetch('/api/social-cart/nia-check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          itemId: data.id,
          itemName: data.name,
          cartCode: cart.code,
          addedByName: item.added_by_name,
          members: get().members.map((m) => ({ id: m.user_id, name: m.name })),
        }),
      });
    } catch {
      // Non-critical — Nia check failure shouldn't block the item being added
    }
  },

  removeItem: async (itemId) => {
    if (!supabase) return;
    await supabase.from('social_cart_items').delete().eq('id', itemId);
  },

  cleanup: () => {
    const { channel } = get();
    if (channel && supabase) {
      supabase.removeChannel(channel);
    }
    set({ cart: null, members: [], items: [], myMember: null, channel: null });
  },
}));
