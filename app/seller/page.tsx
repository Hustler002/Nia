'use client';

// app/seller/page.tsx — Seller Dashboard
// AWS / Seller Central design: dense, square cards, tight tables

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

const NAVY = '#232F3E';
const AMBER = '#FF9900';
const CHART_COLORS = [NAVY, AMBER, '#146EB4', '#FF7043', '#AB47BC', '#66BB6A', '#FFA726', '#42A5F5'];

const insightStyles: Record<string, { bg: string; border: string; icon: string }> = {
  opportunity: { bg: 'bg-green-50', border: 'border-green-200', icon: '🚀' },
  warning: { bg: 'bg-amber-50', border: 'border-amber-200', icon: '⚠️' },
  info: { bg: 'bg-blue-50', border: 'border-blue-200', icon: '💡' },
};

function StatCard({ label, value, sub, icon }: { label: string; value: string; sub?: string; icon: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-sm border border-[#D5D9D9] p-4"
    >
      <div className="flex items-center justify-between mb-2">
        <span className="text-xl">{icon}</span>
        <span className="text-[10px] font-medium text-gray-400">Last 30 days</span>
      </div>
      <p className="text-2xl font-bold text-[#0F1111]">{value}</p>
      <p className="text-xs text-gray-500 mt-0.5">{label}</p>
      {sub && <p className="text-[10px] text-[#007185] font-medium mt-0.5">{sub}</p>}
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
        <div className="w-10 h-10 rounded-sm border-3 border-[#FF9900] border-t-transparent animate-spin" />
        <p className="text-gray-500 text-xs">Loading analytics...</p>
      </div>
    );
  }

  if (!data) return <div className="p-6 text-red-600 text-sm">Failed to load dashboard data.</div>;

  const { stats, topProducts, revenueByDay, demandByPin, insights } = data;

  const tabs = [
    { id: 'overview', label: '📊 Overview' },
    { id: 'products', label: '📦 Products' },
    { id: 'locations', label: '📍 Locations' },
    { id: 'ai', label: '🤖 AI Insights' },
  ] as const;

  return (
    <div className="min-h-screen bg-[#EAEDED] pb-12">
      {/* Page Header */}
      <div className="bg-white border-b border-[#D5D9D9] px-5 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-lg font-bold text-[#0F1111]">Seller Dashboard</h1>
            <p className="text-xs text-gray-500 mt-0.5">Powered by Nia Analytics × Groq AI</p>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <span className="text-[10px] text-gray-500 font-medium">Live</span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-5 py-4 space-y-4">

        {/* Stats Row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <StatCard icon="💰" label="Total Revenue" value={`₹${stats.totalRevenue.toLocaleString()}`} />
          <StatCard icon="📦" label="Total Orders" value={stats.totalOrders.toString()} />
          <StatCard icon="⚡" label="Orders Today" value={stats.todayOrders.toString()} sub="Amazon Now speed" />
          <StatCard icon="🧾" label="Avg Order Value" value={`₹${stats.avgOrderValue}`} />
        </div>

        {/* Tabs — Amazon underline style */}
        <div className="flex gap-0 border-b border-[#D5D9D9] overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-shrink-0 px-4 py-2 text-xs font-medium border-b-2 transition-all ${
                activeTab === tab.id
                  ? 'border-[#E77600] text-[#C45500] font-bold'
                  : 'border-transparent text-gray-600 hover:text-[#C45500] hover:border-[#E77600]/50'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* OVERVIEW TAB */}
        {activeTab === 'overview' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
            <div className="bg-white rounded-sm border border-[#D5D9D9] p-4">
              <h2 className="font-bold text-sm text-[#0F1111] mb-3">Revenue Over Time</h2>
              {revenueByDay.length > 0 ? (
                <ResponsiveContainer width="100%" height={200}>
                  <LineChart data={revenueByDay}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="date" tick={{ fontSize: 10 }} tickFormatter={(d) => d.slice(5)} />
                    <YAxis tick={{ fontSize: 10 }} tickFormatter={(v) => `₹${v}`} />
                    <Tooltip formatter={(v: any) => [`₹${v}`, 'Revenue']} />
                    <Line type="monotone" dataKey="revenue" stroke={NAVY} strokeWidth={2} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-40 flex items-center justify-center text-gray-400 text-xs">
                  No orders yet. Place some orders to see the chart!
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* PRODUCTS TAB */}
        {activeTab === 'products' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
            <div className="bg-white rounded-sm border border-[#D5D9D9] p-4">
              <h2 className="font-bold text-sm text-[#0F1111] mb-3">Top Products by Units Sold</h2>
              {topProducts.length > 0 ? (
                <>
                  <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={topProducts} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" horizontal={false} />
                      <XAxis type="number" tick={{ fontSize: 10 }} />
                      <YAxis type="category" dataKey="name" tick={{ fontSize: 10 }} width={100} />
                      <Tooltip formatter={(v: any) => [`${v} units`, 'Sold']} />
                      <Bar dataKey="units" radius={[0, 2, 2, 0]}>
                        {topProducts.map((_, i) => (
                          <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                  {/* Table below chart */}
                  <div className="mt-3 border border-[#D5D9D9] rounded-sm overflow-hidden">
                    <table className="w-full text-xs">
                      <thead className="bg-[#F7F8F8]">
                        <tr>
                          <th className="text-left px-3 py-2 font-medium text-gray-600 border-b border-[#D5D9D9]">Product</th>
                          <th className="text-right px-3 py-2 font-medium text-gray-600 border-b border-[#D5D9D9]">Units</th>
                          <th className="text-right px-3 py-2 font-medium text-gray-600 border-b border-[#D5D9D9]">Revenue</th>
                        </tr>
                      </thead>
                      <tbody>
                        {topProducts.map((p, i) => (
                          <tr key={i} className="border-b border-gray-100 last:border-0 hover:bg-[#F7F8F8]">
                            <td className="px-3 py-2">
                              <div className="flex items-center gap-2">
                                <span className="text-base">{p.image}</span>
                                <span className="font-medium text-[#0F1111]">{p.name}</span>
                              </div>
                            </td>
                            <td className="text-right px-3 py-2 text-gray-500">{p.units}</td>
                            <td className="text-right px-3 py-2 font-bold text-[#0F1111]">₹{p.revenue.toLocaleString()}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </>
              ) : (
                <div className="h-40 flex items-center justify-center text-gray-400 text-xs">No product data yet.</div>
              )}
            </div>
          </motion.div>
        )}

        {/* LOCATIONS TAB */}
        {activeTab === 'locations' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
            <div className="bg-white rounded-sm border border-[#D5D9D9] p-4">
              <h2 className="font-bold text-sm text-[#0F1111] mb-1">Demand by Pincode</h2>
              <p className="text-[10px] text-gray-400 mb-3">Areas with highest order volume</p>
              {demandByPin.length > 0 ? (
                <div className="space-y-2.5">
                  {demandByPin.map((pin, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <div className="w-6 h-6 rounded-sm bg-[#232F3E] flex items-center justify-center text-white font-bold text-[10px] flex-shrink-0">
                        {i + 1}
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between mb-0.5">
                          <span className="text-xs font-medium text-[#0F1111]">📍 {pin.pincode}</span>
                          <span className="text-[10px] text-gray-500">{pin.orders} orders · ₹{pin.revenue}</span>
                        </div>
                        <div className="h-1.5 bg-gray-100 rounded-sm overflow-hidden">
                          <div
                            className="h-full bg-[#232F3E] rounded-sm transition-all"
                            style={{ width: `${Math.min((pin.orders / (demandByPin[0]?.orders || 1)) * 100, 100)}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="h-40 flex items-center justify-center text-gray-400 text-xs">No location data yet.</div>
              )}
            </div>
          </motion.div>
        )}

        {/* AI INSIGHTS TAB */}
        {activeTab === 'ai' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
            <div className="bg-white rounded-sm border border-[#D5D9D9] p-4">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-lg">🤖</span>
                <div>
                  <h2 className="font-bold text-sm text-[#0F1111]">AI-Generated Insights</h2>
                  <p className="text-[10px] text-gray-400">Powered by Groq × Llama 3.3</p>
                </div>
              </div>
              <div className="space-y-2">
                {insights.map((insight, i) => {
                  const style = insightStyles[insight.type] || insightStyles.info;
                  return (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.1 }}
                      className={`${style.bg} border ${style.border} rounded-sm p-3`}
                    >
                      <div className="flex items-start gap-2">
                        <span className="text-base flex-shrink-0">{style.icon}</span>
                        <div>
                          <p className="font-bold text-[#0F1111] text-xs">{insight.title}</p>
                          <p className="text-gray-600 text-xs mt-0.5 leading-relaxed">{insight.body}</p>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>

            {/* Quick actions for seller */}
            <div className="bg-[#232F3E] rounded-sm p-4 text-white">
              <h3 className="font-bold text-sm mb-1">Ready to act on these insights?</h3>
              <p className="text-white/60 text-xs mb-3">Nia can help you draft promotions, restock alerts, and more.</p>
              <button className="bg-[#FF9900] hover:bg-[#E88B00] text-white font-bold text-xs px-4 py-2 rounded-sm transition-colors">
                Ask Nia →
              </button>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
