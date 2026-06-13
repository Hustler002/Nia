// lib/consumptionEngine.ts
// Smart inventory prediction engine
// Reads order history from Supabase + catalog lifespan data
// Returns items that are running low based on consumption math
//
// Math: percentUsed = (daysSinceOrder / lifespanDays) * qty * 100
// Statuses: almost_out (≥90%), running_low (≥75%), order_soon (≥50%)

import { supabase, DBOrder } from './supabaseClient';
import { CATALOG } from './catalog/products';

export type StockStatus = 'almost_out' | 'running_low' | 'order_soon' | 'stocked';

export interface LowStockItem {
  id: string;
  name: string;
  image: string;
  price: number;
  mrp: number;
  category: string;
  percentUsed: number;
  status: StockStatus;
  lastOrderedDaysAgo: number;
  lifespanDays: number;
}

function daysSince(dateStr: string): number {
  const ordered = new Date(dateStr);
  const now = new Date();
  return Math.floor((now.getTime() - ordered.getTime()) / (1000 * 60 * 60 * 24));
}

function getStatus(percent: number): StockStatus {
  if (percent >= 90) return 'almost_out';
  if (percent >= 75) return 'running_low';
  if (percent >= 50) return 'order_soon';
  return 'stocked';
}

export async function getInventoryStatus(userId: string): Promise<LowStockItem[]> {
  // Fetch last 30 orders for this user
  const { data: orders, error } = await supabase
    .from('orders')
    .select('*')
    .eq('user_id', userId)
    .order('placed_at', { ascending: false })
    .limit(30);

  if (error || !orders) return [];

  // Build a map of item → most recent order date
  const latestOrderMap: Record<string, { date: string; qty: number }> = {};

  for (const order of orders as DBOrder[]) {
    for (const item of order.items) {
      if (!latestOrderMap[item.id]) {
        latestOrderMap[item.id] = { date: order.placed_at, qty: item.qty };
      }
    }
  }

  const lowItems: LowStockItem[] = [];

  for (const [itemId, { date, qty }] of Object.entries(latestOrderMap)) {
    // Find the catalog entry with lifespan data
    const catalogItem = CATALOG.find((p) => p.id === itemId);
    if (!catalogItem || !catalogItem.lifespanDays) continue;

    const days = daysSince(date);
    const effectiveLifespan = catalogItem.lifespanDays / Math.max(qty, 1);
    const percent = Math.min(Math.round((days / effectiveLifespan) * 100), 100);
    const status = getStatus(percent);

    if (status !== 'stocked') {
      lowItems.push({
        id: itemId,
        name: catalogItem.name,
        image: catalogItem.imageUrl ?? catalogItem.image ?? '',
        price: catalogItem.price,
        mrp: catalogItem.mrp,
        category: catalogItem.category,
        percentUsed: percent,
        status,
        lastOrderedDaysAgo: days,
        lifespanDays: catalogItem.lifespanDays,
      });
    }
  }

  // Sort: almost_out first
  return lowItems.sort((a, b) => b.percentUsed - a.percentUsed);
}
