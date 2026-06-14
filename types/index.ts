// types/index.ts
// Canonical type definitions for the Nia for Amazon Now project.
// All shared types live here. Other files import from '@/types'.

// ─── Product Catalog ───────────────────────────────────────

export type ProductCategory =
  | 'Snacks' | 'Beverages' | 'Dairy'
  | 'Electronics Accessories' | 'Health & Medicine'
  | 'Party Supplies' | 'Pain Relief' | 'Health Devices'
  | 'Fitness & Protein' | 'Breakfast & Eggs'
  | 'Personal Care' | 'Grocery Staples' | 'Instant Food';

export interface Product {
  id: string;
  name: string;
  brand: string;
  category: ProductCategory;
  subcategory: string;
  price: number;
  mrp: number;
  unit: string;
  rating: number;
  reviewCount: number;
  imageUrl: string;
  image?: string;
  tags: string[];
  attributes: Record<string, string>;
  inStock: boolean;
  eta_minutes: number;
  isOrganic?: boolean;
  isVegetarian?: boolean;
  lifespanDays?: number;
}

// ─── Cart ──────────────────────────────────────────────────
// Flat CartItem shape used throughout the app (API responses, cards, stores)

export interface CartItem {
  id: string;
  name: string;
  price: number;
  mrp: number;
  image: string;
  qty: number;
  category: string;
  rating?: number;
  eta?: number;
  matchReason?: string;
  brand?: string;
}

// ─── Nia Messages ──────────────────────────────────────────

export type NiaMessageType =
  | 'text'
  | 'product_list'
  | 'comparison'
  | 'cart_summary'
  | 'emergency_kit'
  | 'reorder_nudge'
  | 'direct_checkout';

export interface NiaMessage {
  id: string;
  role: 'user' | 'nia';
  content: string;
  type: NiaMessageType;
  data?: CartItem[] | ComparisonData | EmergencyKit | ReorderNudge | null;
  confidence?: number;
  reason?: string;
  timestamp: Date;
}

// ─── Comparison ────────────────────────────────────────────

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

// ─── Emergency ─────────────────────────────────────────────

export interface EmergencyKit {
  category: string;
  name: string;
  items: CartItem[];
  totalPrice: number;
  eta: string;
}

// ─── Reorder ───────────────────────────────────────────────

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

// ─── User & Auth ───────────────────────────────────────────

export interface ReorderCycle {
  productId: string;
  productName: string;
  avgDays: number;
  lastOrderDate: string;
  daysUntilRunOut: number;
  confidence: 'high' | 'medium' | 'low';
}

export interface PastOrder {
  orderId: string;
  date: string;
  items: string[];
  total: number;
}

export interface UserProfile {
  id: string;
  name: string;
  preferences: string[];
  dietary_restrictions: string[];
  reorder_cycles: ReorderCycle[];
  past_orders: PastOrder[];
  pincode: string;
  avatarInitials: string;
}

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

// ─── API Contract ──────────────────────────────────────────

export interface NiaAPIRequest {
  messages: NiaMessage[];
  userId: string;
  userName?: string;
  pincode: string;
}

export interface NiaAPIResponse {
  id: string;
  role: 'nia';
  type: NiaMessageType;
  content: string;
  data: CartItem[] | ComparisonData | EmergencyKit | ReorderNudge | null;
  confidence?: number;
  reason?: string;
  timestamp: Date;
}

// ─── Toast ─────────────────────────────────────────────────

export interface Toast {
  id: string;
  message: string;
  type: 'success' | 'info' | 'error';
  duration?: number;
}

// ─── Emergency Categories ──────────────────────────────────

export type EmergencyCategory =
  | 'baby_care' | 'fever_illness' | 'surprise_guests'
  | 'tech_rescue' | 'kitchen_mishap' | 'period_care' | 'pet_emergency'
  | 'general_emergency'
  | 'custom';

// ─── Custom Emergency ──────────────────────────────────────

export interface CustomEmergencyResult {
  kit: EmergencyKit | null;
  canFullyHelp: boolean;
  canPartiallyHelp: boolean;
  niaMessage: string;
  cannotHelpWith?: string[];
  alternativeSuggestion?: string;
}
