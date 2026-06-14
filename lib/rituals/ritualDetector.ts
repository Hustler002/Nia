/**
 * lib/rituals/ritualDetector.ts — Ritual Detection Engine (Module 4B)
 *
 * Detects recurring order patterns from purchase history and creates
 * named "Rituals" — reorderable bundles that capture the user's habits.
 *
 * Detection algorithm:
 *   1. Sliding 7-day window over order history
 *   2. Find product sets that co-occur ≥ 2 times across windows
 *   3. If a co-occurring set has ≥ 3 products → create a Ritual
 *   4. Auto-name based on time-of-day, day-of-week, and category heuristics
 *   5. Compute next suggested reorder date from frequency analysis
 *
 * Production: replace with Kinesis stream processing + ML clustering
 */

import type { CartItem } from '@/lib/useNiaStore';

// ─── Types ──────────────────────────────────────────────────────────────────

export interface RitualItem {
  productId: string;
  name: string;
  price: number;
  mrp: number;
  image: string;   // emoji for demo
  quantity: number;
  category: string;
  inStock: boolean; // used for substitution flow
}

export type RitualFrequency = 'daily' | 'weekly' | 'biweekly' | 'monthly' | 'custom';

export interface Ritual {
  id: string;
  name: string;
  icon: string;             // emoji
  items: RitualItem[];
  estimatedTotal: number;
  lastOrdered: Date;
  frequency: RitualFrequency;
  nextSuggestedDate: Date;
  autoNamed: boolean;       // true = system-generated name, false = user-renamed
  orderCount: number;       // how many times this bundle has been ordered
  daysSinceLastOrder: number;
  isEditing?: boolean;      // UI transient state
}

// ─── Order History Input Type ───────────────────────────────────────────────

export interface OrderBundleItem {
  productId: string;
  productName: string;
  price: number;
  mrp: number;
  image: string;
  quantity: number;
  category: string;
}

export interface OrderBundle {
  orderId: string;
  orderDate: Date;
  timeOfDay: 'morning' | 'afternoon' | 'evening' | 'night';
  dayOfWeek: number; // 0=Sun, 6=Sat
  items: OrderBundleItem[];
}

// ─── Auto-naming Heuristics ─────────────────────────────────────────────────

const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

const TIME_LABELS: Record<string, string> = {
  morning: 'Morning',
  afternoon: 'Afternoon',
  evening: 'Evening',
  night: 'Late Night',
};

/** Category-based occasion inference for richer naming */
const OCCASION_PATTERNS: Array<{ keywords: string[]; name: string; icon: string }> = [
  { keywords: ['dairy', 'bread', 'eggs', 'butter', 'milk', 'juice', 'breakfast'],
    name: 'Breakfast Run', icon: '🌅' },
  { keywords: ['chips', 'cola', 'nachos', 'popcorn', 'snack', 'pepsi', 'coke', 'kurkure', 'lays'],
    name: 'Snack Time', icon: '🍿' },
  { keywords: ['rice', 'dal', 'oil', 'atta', 'sugar', 'salt', 'spice', 'haldi', 'jeera'],
    name: 'Grocery Run', icon: '🛒' },
  { keywords: ['soap', 'shampoo', 'toothpaste', 'lotion', 'deodorant', 'face wash'],
    name: 'Personal Care Restock', icon: '🧴' },
  { keywords: ['diaper', 'baby', 'wipes', 'formula', 'cerelac'],
    name: 'Baby Essentials', icon: '👶' },
];

/**
 * Auto-generates a ritual name from item names, time-of-day, and day-of-week.
 * Tries occasion-based naming first, falls back to time+day pattern.
 */
function autoNameRitual(
  items: OrderBundleItem[],
  timeOfDay: string,
  dayOfWeek: number,
): { name: string; icon: string } {
  // Flatten item names + categories into a searchable string
  const corpus = items.map(i => `${i.productName} ${i.category}`).join(' ').toLowerCase();

  // Try occasion-based naming (more descriptive)
  for (const pattern of OCCASION_PATTERNS) {
    const matchCount = pattern.keywords.filter(kw => corpus.includes(kw)).length;
    // Need at least 2 keyword matches to infer an occasion
    if (matchCount >= 2) {
      return { name: pattern.name, icon: pattern.icon };
    }
  }

  // Fallback: time + day naming
  const dayName = DAY_NAMES[dayOfWeek];
  const timeName = TIME_LABELS[timeOfDay] || 'Regular';
  const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

  if (isWeekend) {
    return { name: `Weekend ${timeName}`, icon: '☀️' };
  }

  return { name: `${dayName} ${timeName}`, icon: '📋' };
}

// ─── Frequency Detection ────────────────────────────────────────────────────

const MS_PER_DAY = 1000 * 60 * 60 * 24;

function detectFrequency(orderDates: Date[]): RitualFrequency {
  if (orderDates.length < 2) return 'weekly'; // default assumption

  // Sort chronologically
  const sorted = [...orderDates].sort((a, b) => a.getTime() - b.getTime());
  const intervals: number[] = [];

  for (let i = 1; i < sorted.length; i++) {
    intervals.push((sorted[i].getTime() - sorted[i - 1].getTime()) / MS_PER_DAY);
  }

  const avgInterval = intervals.reduce((s, v) => s + v, 0) / intervals.length;

  if (avgInterval <= 2) return 'daily';
  if (avgInterval <= 10) return 'weekly';
  if (avgInterval <= 20) return 'biweekly';
  if (avgInterval <= 45) return 'monthly';
  return 'custom';
}

// ─── Core Detection Engine ──────────────────────────────────────────────────

/**
 * Detects rituals from order history by finding co-occurring product sets.
 *
 * In this demo, we skip the sliding-window algorithm and return curated
 * mock rituals that match the demo persona (Priya Sharma). In production,
 * this would run as a nightly batch job over DynamoDB order streams.
 */
export function detectRituals(_orderHistory?: OrderBundle[]): Ritual[] {
  return getMockRituals();
}

// ─── Mock Rituals ───────────────────────────────────────────────────────────

const today = new Date();
const daysAgo = (n: number): Date => {
  const d = new Date(today);
  d.setDate(d.getDate() - n);
  return d;
};
const daysFromNow = (n: number): Date => {
  const d = new Date(today);
  d.setDate(d.getDate() + n);
  return d;
};

export function getMockRituals(): Ritual[] {
  return [
    {
      id: 'ritual-001',
      name: 'Monday Morning Routine',
      icon: '🌅',
      items: [
        { productId: 'rm-001', name: 'Amul Toned Milk 500ml', price: 24, mrp: 24, image: '🥛', quantity: 2, category: 'Dairy & Eggs', inStock: true },
        { productId: 'rm-002', name: 'Britannia Bread 400g', price: 45, mrp: 50, image: '🍞', quantity: 1, category: 'Groceries', inStock: true },
        { productId: 'rm-003', name: 'Farm Fresh Eggs (6 pcs)', price: 48, mrp: 55, image: '🥚', quantity: 1, category: 'Dairy & Eggs', inStock: true },
        { productId: 'rm-004', name: 'Amul Butter 100g', price: 56, mrp: 56, image: '🧈', quantity: 1, category: 'Dairy & Eggs', inStock: true },
      ],
      estimatedTotal: 197,
      lastOrdered: daysAgo(7),
      frequency: 'weekly',
      nextSuggestedDate: daysFromNow(0), // Due today!
      autoNamed: true,
      orderCount: 12,
      daysSinceLastOrder: 7,
    },
    {
      id: 'ritual-002',
      name: 'Weekend Snack Box',
      icon: '🍿',
      items: [
        { productId: 'rs-001', name: "Lay's Classic Salted 150g", price: 50, mrp: 50, image: '🥔', quantity: 2, category: 'Snacks', inStock: true },
        { productId: 'rs-002', name: 'Kurkure Masala Munch 120g', price: 30, mrp: 30, image: '🌶️', quantity: 1, category: 'Snacks', inStock: true },
        { productId: 'rs-003', name: 'Pepsi 2L', price: 80, mrp: 85, image: '🥤', quantity: 1, category: 'Beverages', inStock: false }, // out of stock!
        { productId: 'rs-004', name: 'Oreo Original 300g', price: 60, mrp: 65, image: '🍪', quantity: 1, category: 'Snacks', inStock: true },
      ],
      estimatedTotal: 270,
      lastOrdered: daysAgo(5),
      frequency: 'weekly',
      nextSuggestedDate: daysFromNow(2),
      autoNamed: true,
      orderCount: 8,
      daysSinceLastOrder: 5,
    },
    {
      id: 'ritual-003',
      name: 'Weekly Grocery Run',
      icon: '🛒',
      items: [
        { productId: 'rg-001', name: 'Tata Salt 1kg', price: 28, mrp: 28, image: '🧂', quantity: 1, category: 'Kitchen Essentials', inStock: true },
        { productId: 'rg-002', name: 'India Gate Sugar 1kg', price: 48, mrp: 52, image: '🍬', quantity: 1, category: 'Kitchen Essentials', inStock: true },
        { productId: 'rg-003', name: 'Fortune Sunlite Oil 1L', price: 155, mrp: 170, image: '🫙', quantity: 1, category: 'Kitchen Essentials', inStock: true },
        { productId: 'rg-004', name: 'Toor Dal 1kg', price: 140, mrp: 160, image: '🫘', quantity: 1, category: 'Groceries', inStock: true },
        { productId: 'rg-005', name: 'Moong Dal 500g', price: 75, mrp: 85, image: '🫛', quantity: 1, category: 'Groceries', inStock: true },
        { productId: 'rg-006', name: 'India Gate Basmati Rice 5kg', price: 450, mrp: 499, image: '🍚', quantity: 1, category: 'Groceries', inStock: true },
      ],
      estimatedTotal: 896,
      lastOrdered: daysAgo(6),
      frequency: 'weekly',
      nextSuggestedDate: daysFromNow(1),
      autoNamed: false, // User named this one
      orderCount: 24,
      daysSinceLastOrder: 6,
    },
  ];
}

/** Substitution suggestions for out-of-stock items */
export interface SubstitutionOption {
  originalItem: RitualItem;
  substitute: RitualItem;
  reason: string;
}

export function getSubstitutions(ritual: Ritual): SubstitutionOption[] {
  const outOfStock = ritual.items.filter(i => !i.inStock);

  // Mock substitution map
  const substitutionMap: Record<string, { item: RitualItem; reason: string }> = {
    'rs-003': {
      item: {
        productId: 'sub-001', name: 'Sprite 2L', price: 80, mrp: 85,
        image: '🥤', quantity: 1, category: 'Beverages', inStock: true,
      },
      reason: 'Same size, same price — refreshing alternative to Pepsi',
    },
  };

  return outOfStock
    .filter(item => substitutionMap[item.productId])
    .map(item => ({
      originalItem: item,
      substitute: substitutionMap[item.productId].item,
      reason: substitutionMap[item.productId].reason,
    }));
}

/**
 * Convert Ritual items to CartItem[] for adding to the Zustand cart.
 * Handles substitutions: replaces out-of-stock items with their substitutes.
 */
export function ritualToCartItems(
  ritual: Ritual,
  substitutions?: SubstitutionOption[],
): CartItem[] {
  const subMap = new Map(
    (substitutions || []).map(s => [s.originalItem.productId, s.substitute])
  );

  return ritual.items.map(item => {
    const sub = subMap.get(item.productId);
    const finalItem = sub || item;

    return {
      id: finalItem.productId,
      name: finalItem.name,
      price: finalItem.price,
      mrp: finalItem.mrp,
      image: finalItem.image,
      qty: finalItem.quantity,
      category: finalItem.category,
    };
  }).filter(item => {
    // Exclude out-of-stock items that have no substitution
    const original = ritual.items.find(ri => ri.productId === item.id);
    if (original && !original.inStock && !subMap.has(original.productId)) {
      return false;
    }
    return true;
  });
}

// ─── Production Extension Notes ─────────────────────────────────────────────
/*
 * 1. STREAM-BASED DETECTION (Kinesis + Lambda)
 *    In production, ritual detection runs as a stream processor:
 *    - Every completed order fires an event to Kinesis Data Streams
 *    - A Lambda function (triggered by Kinesis) maintains a sliding window
 *      of recent orders per user in ElastiCache (Redis sorted sets)
 *    - When a new order arrives, the Lambda checks for co-occurring product
 *      sets against the window and upserts ritual candidates in DynamoDB
 *    - A nightly Step Function consolidates candidates into confirmed rituals
 *
 * 2. ML CLUSTERING (SageMaker)
 *    - K-means or DBSCAN clustering on order-item vectors discovers
 *      non-obvious co-purchase patterns across millions of users
 *    - Collaborative filtering: "users who buy X, Y together also buy Z"
 *      enriches ritual suggestions with items the user hasn't tried yet
 *    - Time-series decomposition (Prophet/DeepAR) models ritual frequency
 *      with seasonality awareness (e.g., more snacks during IPL season)
 *
 * 3. USER CONTROLS
 *    - Rituals stored in DynamoDB with user_id partition key
 *    - Users can rename, reorder items, pin/unpin, share with family
 *    - Changes feed back into the ML model as explicit preference signals
 *
 * 4. SUBSTITUTION ENGINE
 *    - Real substitutions from Bedrock Agent (apply_substitution tool)
 *    - Considers: price parity, brand affinity, dietary restrictions,
 *      user's past acceptance rate for substitutions
 */
