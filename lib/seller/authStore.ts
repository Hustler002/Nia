// lib/seller/authStore.ts
// Zustand store for seller authentication
// Mock auth — hardcoded credentials for hackathon demo
// Production: replace with Amazon Cognito / Seller Central OAuth

import { create } from 'zustand';

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
  isHydrated: boolean; // tracks whether sessionStorage has been read
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  hydrate: () => void; // restore from sessionStorage on mount
}

// ─── Mock Credentials ───────────────────────────────────────────────────────
// Two sets so hackathon judges can use either

const VALID_CREDENTIALS = [
  { email: 'seller@techzone.in', password: 'demo123' },
  { email: 'seller@example.com', password: 'password' },
];

const DEFAULT_SELLER: SellerProfile = {
  id: 'seller-001',
  name: 'Ankit Gupta',
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
    // Simulate network latency for realistic feel
    await new Promise((resolve) => setTimeout(resolve, 800));

    const match = VALID_CREDENTIALS.find(
      (cred) => cred.email.toLowerCase() === email.toLowerCase() && cred.password === password
    );

    if (match) {
      const seller = { ...DEFAULT_SELLER, email: match.email };
      set({ isAuthenticated: true, seller });
      // Persist to sessionStorage so it survives refresh during demo
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('nia_seller_auth', JSON.stringify(seller));
      }
      return { success: true };
    }

    return {
      success: false,
      error: 'Invalid email or password. Try seller@techzone.in / demo123',
    };
  },

  logout: () => {
    set({ isAuthenticated: false, seller: null });
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem('nia_seller_auth');
    }
  },

  hydrate: () => {
    if (typeof window !== 'undefined') {
      const stored = sessionStorage.getItem('nia_seller_auth');
      if (stored) {
        try {
          const seller = JSON.parse(stored) as SellerProfile;
          set({ isAuthenticated: true, seller, isHydrated: true });
          return;
        } catch {
          // Corrupted data — ignore
        }
      }
    }
    set({ isHydrated: true });
  },
}));

// Production extension:
// - Replace with Amazon Cognito User Pool (Seller Identity Pool)
// - JWT tokens stored in httpOnly cookies, not sessionStorage
// - Refresh token rotation with sliding window
// - MFA via TOTP or SMS OTP (mandatory for seller accounts)
// - OAuth SSO with existing Amazon Seller Central credentials
// - Role-based access control (owner vs staff vs read-only)
