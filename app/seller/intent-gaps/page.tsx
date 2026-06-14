'use client';

// app/seller/page.tsx — Full Seller Dashboard
// Live charts + AI insights powered by Supabase + Groq

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Cell
} from 'recharts';

interface DashboardData {
  stats: { totalRevenue: number; totalOrders: number; todayOrders: number; avgOrderValue: number };
  topProducts: Array<{ name: string; image: string; units: number; revenue: number }>;
  revenueByDay: Array<{ date: string; revenue: number; orders: number }>;
  demandByPin: Array<{ pincode: string; orders: number; revenue: number }>;
  insights: Array<{ title: string; body: string; type: 'opportunity' | 'warning' | 'info' }>;
}

const TEAL = '#00838F';
const AMBER = '#FF9900';
const CHART_COLORS = [TEAL, AMBER, '#26C6DA', '#FF7043', '#AB47BC', '#66BB6A', '#FFA726', '#42A5F5'];

const insightStyles: Record<string, { bg: string; border: string; icon: string }> = {
  opportunity: { bg: 'bg-green-50', border: 'border-green-200', icon: '🚀' },
  warning: { bg: 'bg-amber-50', border: 'border-amber-200', icon: '⚠️' },
  info: { bg: 'bg-blue-50', border: 'border-blue-200', icon: '💡' },
};

function StatCard({ label, value, sub, icon }: { label: string; value: string; sub?: string; icon: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm"
    >
      <div className="flex items-center justify-between mb-3">
        <span className="text-2xl">{icon}</span>
        <span className="text-xs font-medium text-gray-400 bg-gray-50 px-2 py-1 rounded-full">Last 30 days</span>
      </div>
      <p className="text-3xl font-bold text-[#0F1111]">{value}</p>
      <p className="text-sm text-gray-500 mt-1">{label}</p>
      {sub && <p className="text-xs text-[#00838F] font-medium mt-1">{sub}</p>}
    </motion.div>
  );
}

export default function SellerDashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'products' | 'locations' | 'ai'>('overview');

  useEffect(() => {
    fetch('/seller/api/insights')
      .then((r) => r.json())
      .then((d) => { setData(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center gap-4">
        <div className="w-12 h-12 rounded-full border-4 border-[#00838F] border-t-transparent animate-spin" />
        <p className="text-gray-500 text-sm">Loading your analytics...</p>
      </div>
    );
  }

  if (!data) return <div className="p-8 text-red-500">Failed to load dashboard data.</div>;

  const { stats, topProducts, revenueByDay, demandByPin, insights } = data;

  const tabs = [
    { id: 'overview', label: '📊 Overview' },
    { id: 'products', label: '📦 Products' },
    { id: 'locations', label: '📍 Locations' },
    { id: 'ai', label: '🤖 AI Insights' },
  ] as const;

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Page Header */}
      <div className="bg-white border-b border-gray-100 px-6 py-5">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-[#0F1111]">Seller Dashboard</h1>
            <p className="text-sm text-gray-500 mt-0.5">Powered by Nia Analytics × Groq AI</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            <span className="text-xs text-gray-500 font-medium">Live</span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">

        {/* Stats Row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard icon="💰" label="Total Revenue" value={`₹${stats.totalRevenue.toLocaleString()}`} />
          <StatCard icon="📦" label="Total Orders" value={stats.totalOrders.toString()} />
          <StatCard icon="⚡" label="Orders Today" value={stats.todayOrders.toString()} sub="Amazon Now speed" />
          <StatCard icon="🧾" label="Avg Order Value" value={`₹${stats.avgOrderValue}`} />
        </div>

        {/* Tabs */}
        <div className="flex gap-2 overflow-x-auto pb-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all ${
                activeTab === tab.id
                  ? 'bg-[#00838F] text-white shadow-md'
                  : 'bg-white text-gray-600 border border-gray-200 hover:border-[#00838F] hover:text-[#00838F]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* OVERVIEW TAB */}
        {activeTab === 'overview' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
            <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
              <h2 className="font-semibold text-[#0F1111] mb-4">Revenue Over Time</h2>
              {revenueByDay.length > 0 ? (
                <ResponsiveContainer width="100%" height={220}>
                  <LineChart data={revenueByDay}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="date" tick={{ fontSize: 11 }} tickFormatter={(d) => d.slice(5)} />
                    <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `₹${v}`} />
                    <Tooltip formatter={(v: any) => [`₹${v}`, 'Revenue']} />
                    <Line type="monotone" dataKey="revenue" stroke={TEAL} strokeWidth={2.5} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-48 flex items-center justify-center text-gray-400 text-sm">
                  No orders yet. Place some orders to see the chart!
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* PRODUCTS TAB */}
        {activeTab === 'products' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
            <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
              <h2 className="font-semibold text-[#0F1111] mb-4">Top Products by Units Sold</h2>
              {topProducts.length > 0 ? (
                <>
                  <ResponsiveContainer width="100%" height={240}>
                    <BarChart data={topProducts} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" horizontal={false} />
                      <XAxis type="number" tick={{ fontSize: 11 }} />
                      <YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} width={100} />
                      <Tooltip formatter={(v: any) => [`${v} units`, 'Sold']} />
                      <Bar dataKey="units" radius={[0, 4, 4, 0]}>
                        {topProducts.map((_, i) => (
                          <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                  {/* Table below chart */}
                  <div className="mt-4 space-y-2">
                    {topProducts.map((p, i) => (
                      <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-gray-50">
                        <span className="text-xl w-8 text-center">{p.image}</span>
                        <div className="flex-1">
                          <p className="font-medium text-sm text-[#0F1111]">{p.name}</p>
                          <p className="text-xs text-gray-400">{p.units} units sold</p>
                        </div>
                        <p className="font-semibold text-sm text-[#00838F]">₹{p.revenue.toLocaleString()}</p>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <div className="h-48 flex items-center justify-center text-gray-400 text-sm">No product data yet.</div>
              )}
            </div>
          </motion.div>
        )}

        {/* LOCATIONS TAB */}
        {activeTab === 'locations' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
            <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
              <h2 className="font-semibold text-[#0F1111] mb-1">Demand by Pincode</h2>
              <p className="text-xs text-gray-400 mb-4">Areas with highest order volume — consider stocking nearby dark stores</p>
              {demandByPin.length > 0 ? (
                <div className="space-y-3">
                  {demandByPin.map((pin, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-[#E0F2F1] flex items-center justify-center text-[#00838F] font-bold text-xs flex-shrink-0">
                        {i + 1}
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between mb-1">
                          <span className="text-sm font-medium text-[#0F1111]">📍 {pin.pincode}</span>
                          <span className="text-xs text-gray-500">{pin.orders} orders · ₹{pin.revenue}</span>
                        </div>
                        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-[#00838F] rounded-full transition-all"
                            style={{ width: `${Math.min((pin.orders / (demandByPin[0]?.orders || 1)) * 100, 100)}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="h-48 flex items-center justify-center text-gray-400 text-sm">No location data yet.</div>
              )}
            </div>
          </motion.div>
        )}

        {/* AI INSIGHTS TAB */}
        {activeTab === 'ai' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
            <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <span className="text-xl">🤖</span>
                <div>
                  <h2 className="font-semibold text-[#0F1111]">AI-Generated Insights</h2>
                  <p className="text-xs text-gray-400">Powered by Groq × Llama 3.3 — refreshed on every load</p>
                </div>
              </div>
              <div className="space-y-3">
                {insights.map((insight, i) => {
                  const style = insightStyles[insight.type] || insightStyles.info;
                  return (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.1 }}
                      className={`${style.bg} border ${style.border} rounded-2xl p-4`}
                    >
                      <div className="flex items-start gap-3">
                        <span className="text-xl flex-shrink-0">{style.icon}</span>
                        <div>
                          <p className="font-semibold text-[#0F1111] text-sm">{insight.title}</p>
                          <p className="text-gray-600 text-sm mt-0.5 leading-relaxed">{insight.body}</p>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>

            {/* Quick actions for seller */}
            <div className="bg-gradient-to-r from-[#00838F] to-[#26C6DA] rounded-2xl p-5 text-white">
              <h3 className="font-bold text-lg mb-1">Ready to act on these insights?</h3>
              <p className="text-white/80 text-sm mb-4">Nia can help you draft promotions, restock alerts, and more.</p>
              <button className="bg-white text-[#00838F] font-semibold text-sm px-4 py-2 rounded-full hover:bg-white/90 transition-colors">
                Ask Nia →
              </button>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
