// lib/supabaseClient.ts
// Singleton Supabase client — used in server routes and client components
// Returns null if env vars are missing or invalid — all callers must null-check

import { createClient, SupabaseClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '';

// Only create client if URL is a valid Supabase project URL
const isValidSupabase =
  supabaseUrl.startsWith('https://') && supabaseUrl.includes('.supabase.co');

// Will be null if Supabase is not configured — all callers must null-check
export const supabase: SupabaseClient | null = isValidSupabase
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

// ─── Database Types ────────────────────────────────────────────────────────

export interface DBUser {
  id: string;
  name: string;
  email: string;
  role: 'buyer' | 'seller';
  created_at: string;
}

export interface DBAddress {
  id: string;
  user_id: string;
  label: string;
  full_address: string;
  pincode: string;
}

export interface DBOrder {
  id: string;
  user_id: string;
  address_id: string;
  items: Array<{
    id: string;
    name: string;
    price: number;
    qty: number;
    image: string;
    category: string;
  }>;
  total: number;
  placed_at: string;
}

export interface DBMemory {
  id: string;
  user_id: string;
  memory: string;
  created_at: string;
}
