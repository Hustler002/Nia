// lib/seller/authStore.ts
// Zustand store for seller authentication using Supabase Auth

import { create } from 'zustand';
import { supabase } from '@/lib/supabaseClient';

// ─── Types ──────────────────────────────────────────────────────────────────

export interface SellerProfile {
  id: string;
  name: string;
  email: string;
  storeName: string;
  category: string;
  joinedDate: string;
  avatarInitials: string;
  plan: 'basic' | 'pro';
}

interface SellerAuthStore {
  isAuthenticated: boolean;
  seller: SellerProfile | null;
  isHydrated: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signup: (data: Omit<SellerProfile, 'id' | 'joinedDate' | 'avatarInitials' | 'plan'>, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  hydrate: () => void;
}

// ─── Helper ─────────────────────────────────────────────────────────────────

const buildProfileFromUser = (user: any): SellerProfile => {
  const metadata = user.user_metadata || {};
  return {
    id: user.id,
    email: user.email,
    name: metadata.name || 'Seller',
    storeName: metadata.storeName || 'My Store',
    category: metadata.category || 'Other',
    joinedDate: new Date(user.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
    avatarInitials: (metadata.name || 'S').substring(0, 2).toUpperCase(),
    plan: 'basic',
  };
};

// ─── Mock Credentials Fallback ──────────────────────────────────────────────

const VALID_CREDENTIALS = [
  { email: 'seller@techzone.in', password: 'demo123' },
  { email: 'seller@example.com', password: 'password' },
];

const DEFAULT_SELLER: SellerProfile = {
  id: 'seller-mock',
  name: 'Ankit Gupta (Demo)',
  email: 'seller@techzone.in',
  storeName: 'TechZone India',
  category: 'Electronics Accessories',
  joinedDate: 'March 2023',
  avatarInitials: 'AG',
  plan: 'pro',
};

// ─── Store ──────────────────────────────────────────────────────────────────

export const useSellerAuth = create<SellerAuthStore>((set) => ({
  isAuthenticated: false,
  seller: null,
  isHydrated: false,

  login: async (email: string, password: string) => {
    // 1. Check Mock Credentials First
    const match = VALID_CREDENTIALS.find(
      (cred) => cred.email.toLowerCase() === email.toLowerCase() && cred.password === password
    );

    if (match) {
      await new Promise((resolve) => setTimeout(resolve, 600)); // smooth ux delay
      const seller = { ...DEFAULT_SELLER, email: match.email };
      set({ isAuthenticated: true, seller });
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('nia_seller_auth', JSON.stringify(seller));
      }
      return { success: true };
    }

    // 2. Proceed with Supabase Auth
    if (!supabase) return { success: false, error: 'Supabase client is not initialized.' };

    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    
    if (error || !data.user) {
      return { success: false, error: error?.message || 'Invalid login credentials' };
    }

    const seller = buildProfileFromUser(data.user);
    set({ isAuthenticated: true, seller });
    return { success: true };
  },

  signup: async (data, password) => {
    if (!supabase) return { success: false, error: 'Supabase client is not initialized.' };

    const { data: authData, error } = await supabase.auth.signUp({
      email: data.email,
      password,
      options: {
        data: {
          name: data.name,
          storeName: data.storeName,
          category: data.category,
        },
      },
    });

    if (error || !authData.user) {
      return { success: false, error: error?.message || 'Registration failed' };
    }

    const seller = buildProfileFromUser(authData.user);
    set({ isAuthenticated: true, seller });
    return { success: true };
  },

  logout: async () => {
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem('nia_seller_auth');
    }
    if (supabase) {
      await supabase.auth.signOut();
    }
    set({ isAuthenticated: false, seller: null });
  },

  hydrate: () => {
    // 1. Check for mock session first
    if (typeof window !== 'undefined') {
      const stored = sessionStorage.getItem('nia_seller_auth');
      if (stored) {
        try {
          const seller = JSON.parse(stored) as SellerProfile;
          set({ isAuthenticated: true, seller, isHydrated: true });
          return;
        } catch {}
      }
    }

    // 2. If no mock session, check Supabase
    if (!supabase) {
      set({ isHydrated: true });
      return;
    }

    // Get current session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        set({
          isAuthenticated: true,
          seller: buildProfileFromUser(session.user),
          isHydrated: true,
        });
      } else {
        set({ isHydrated: true });
      }
    });

    // Listen for auth changes
    supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        set({
          isAuthenticated: true,
          seller: buildProfileFromUser(session.user),
        });
      } else {
        set({
          isAuthenticated: false,
          seller: null,
        });
      }
    });
  },
}));
