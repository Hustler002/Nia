// lib/ritualsEngine.ts
// Detects repeated purchase patterns and creates named ritual bundles
// "Ritual" = 2+ items bought together at least twice

import { supabase, DBOrder } from './supabaseClient';

export interface Ritual {
  id: string;
  name: string;
  items: Array<{
    id: string;
    name: string;
    image: string;
    price: number;
    qty: number;
    category: string;
    mrp: number;
  }>;
  totalPrice: number;
  orderCount: number; // how many times this combo was ordered
  lastOrderedDaysAgo: number;
}

function daysSince(dateStr: string): number {
  return Math.floor((Date.now() - new Date(dateStr).getTime()) / 86400000);
}

// Generate a stable ID from a sorted list of item IDs
function comboId(itemIds: string[]): string {
  return [...itemIds].sort().join('-');
}

const RITUAL_NAMES: Record<string, string> = {
  default_0: '🌅 Morning Routine',
  default_1: '🌙 Evening Essentials',
  default_2: '🏋️ Fitness Pack',
  default_3: '🎬 Movie Night',
  default_4: '🥗 Weekly Grocery Run',
};

export async function detectRituals(userId: string): Promise<Ritual[]> {
  if (!supabase) return [];
  const { data: orders, error } = await supabase
    .from('orders')
    .select('*')
    .eq('user_id', userId)
    .order('placed_at', { ascending: false })
    .limit(20);

  if (error || !orders || orders.length < 2) return [];

  // Count how often each combo of 2-4 items appears together
  const comboCounts: Record<string, { count: number; items: any[]; lastDate: string }> = {};

  for (const order of orders as DBOrder[]) {
    const items = order.items;
    if (items.length < 2) continue;

    // Generate all pairs from this order
    for (let i = 0; i < items.length; i++) {
      for (let j = i + 1; j < items.length; j++) {
        const id = comboId([items[i].id, items[j].id]);
        if (!comboCounts[id]) {
          comboCounts[id] = { count: 0, items: [items[i], items[j]], lastDate: order.placed_at };
        }
        comboCounts[id].count++;
        if (new Date(order.placed_at) > new Date(comboCounts[id].lastDate)) {
          comboCounts[id].lastDate = order.placed_at;
        }
      }
    }
  }

  // Keep only combos ordered 2+ times
  const rituals: Ritual[] = Object.entries(comboCounts)
    .filter(([, v]) => v.count >= 2)
    .map(([id, { count, items, lastDate }], index) => ({
      id,
      name: RITUAL_NAMES[`default_${index % 5}`] || `My Bundle ${index + 1}`,
      items,
      totalPrice: items.reduce((sum, item) => sum + item.price * item.qty, 0),
      orderCount: count,
      lastOrderedDaysAgo: daysSince(lastDate),
    }))
    .slice(0, 4); // max 4 rituals shown

  return rituals;
}
