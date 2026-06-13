// lib/supabaseClient.ts
// Singleton Supabase client — used in both server routes and client components
// Server routes: import { supabaseAdmin } for service-role access
// Client components: import { supabase } for anon-key access (RLS-protected)

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Client-side (anon key, row-level security applies)
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// ─── Database Types ──────────────────────────────────────────────────────────

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
  label: string; // 'home', 'mom', 'office', etc.
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
  memory: string; // e.g. "User is allergic to peanuts"
  created_at: string;
}
