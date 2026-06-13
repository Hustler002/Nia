// lib/seller/analytics.ts
// Server-side analytics helpers for the Seller Dashboard
// All functions query Supabase and return clean data for Recharts

import { supabase } from '../supabaseClient';

export interface RevenueByDay {
  date: string;
  revenue: number;
  orders: number;
}

export interface TopProduct {
  name: string;
  image: string;
  units: number;
  revenue: number;
}

export interface DemandByPincode {
  pincode: string;
  orders: number;
  revenue: number;
}

// Revenue grouped by day (last 30 days)
export async function getRevenueByDay(): Promise<RevenueByDay[]> {
  const { data, error } = await supabase
    .from('orders')
    .select('placed_at, total')
    .order('placed_at', { ascending: true });

  if (error || !data) return [];

  const grouped: Record<string, RevenueByDay> = {};
  for (const order of data) {
    const date = order.placed_at.slice(0, 10); // YYYY-MM-DD
    if (!grouped[date]) grouped[date] = { date, revenue: 0, orders: 0 };
    grouped[date].revenue += order.total;
    grouped[date].orders += 1;
  }
  return Object.values(grouped).slice(-30);
}

// Top 8 products by units sold
export async function getTopProducts(): Promise<TopProduct[]> {
  const { data, error } = await supabase.from('orders').select('items');
  if (error || !data) return [];

  const productMap: Record<string, TopProduct> = {};
  for (const order of data) {
    for (const item of order.items ?? []) {
      if (!productMap[item.name]) {
        productMap[item.name] = { name: item.name, image: item.image || '📦', units: 0, revenue: 0 };
      }
      productMap[item.name].units += item.qty ?? 1;
      productMap[item.name].revenue += (item.price ?? 0) * (item.qty ?? 1);
    }
  }
  return Object.values(productMap)
    .sort((a, b) => b.units - a.units)
    .slice(0, 8);
}

// Demand heatmap by delivery pincode
export async function getDemandByPincode(): Promise<DemandByPincode[]> {
  // Join orders → addresses to get pincode
  const { data, error } = await supabase
    .from('orders')
    .select('total, addresses(pincode)');

  if (error || !data) return [];

  const map: Record<string, DemandByPincode> = {};
  for (const row of data as any[]) {
    const pincode = row.addresses?.pincode ?? 'Unknown';
    if (!map[pincode]) map[pincode] = { pincode, orders: 0, revenue: 0 };
    map[pincode].orders += 1;
    map[pincode].revenue += row.total ?? 0;
  }
  return Object.values(map).sort((a, b) => b.orders - a.orders).slice(0, 10);
}

// Summary stats
export async function getSummaryStats() {
  const { data: orders } = await supabase.from('orders').select('total, placed_at');
  if (!orders) return { totalRevenue: 0, totalOrders: 0, todayOrders: 0, avgOrderValue: 0 };

  const today = new Date().toISOString().slice(0, 10);
  const totalRevenue = orders.reduce((sum, o) => sum + (o.total ?? 0), 0);
  const todayOrders = orders.filter((o) => o.placed_at?.startsWith(today)).length;

  return {
    totalRevenue,
    totalOrders: orders.length,
    todayOrders,
    avgOrderValue: orders.length ? Math.round(totalRevenue / orders.length) : 0,
  };
}
