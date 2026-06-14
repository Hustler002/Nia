// app/seller/page.tsx
// Seller Console Dashboard — the main landing page after login
// Shows KPIs, revenue chart, top listings, activity feed, and quick actions
// Production: all data from Seller Metrics API (Lambda → DynamoDB aggregated views)

'use client';

import { useState, useMemo } from 'react';
import { useSellerAuth } from '@/lib/seller/authStore';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';

// ─── Mock Revenue Data (30 days) ────────────────────────────────────────────

function generateRevenueData() {
  const data = [];
  const now = new Date();
  for (let i = 29; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    const dayOfWeek = date.getDay();
    // Weekend spikes + general upward trend
    const baseRevenue = 6000 + (29 - i) * 120 + Math.random() * 2000;
    const weekendBonus = dayOfWeek === 0 || dayOfWeek === 6 ? 2500 : 0;
    const total = Math.round(baseRevenue + weekendBonus);
    const niaDriven = Math.round(total * (0.30 + Math.random() * 0.10)); // 30-40% from Nia
    data.push({
      date: date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }),
      total,
      niaDriven,
    });
  }
  return data;
}

// ─── Top Listings Data ──────────────────────────────────────────────────────

const topListings = [
  { rank: 1, name: 'boAt Airdopes 141', units: 312, revenue: 40488, niaScore: 94 },
  { rank: 2, name: 'Noise Buds VS104', units: 198, revenue: 21780, niaScore: 87 },
  { rank: 3, name: 'JBL Tune 115TWS', units: 143, revenue: 25697, niaScore: 91 },
  { rank: 4, name: 'Mi Dual Driver Earphones', units: 112, revenue: 8736, niaScore: 72 },
  { rank: 5, name: 'Portronics Charge 5', units: 82, revenue: 6970, niaScore: 65 },
];

// ─── Activity Feed ──────────────────────────────────────────────────────────

const activityFeed = [
  {
    time: '2 min ago',
    icon: '✨',
    text: 'boAt Airdopes 141 appeared in 47 Nia recommendations',
    highlight: true,
  },
  {
    time: '18 min ago',
    icon: '🎯',
    text: "New intent gap detected: 'wireless earbuds under ₹1200' — 89 searches today",
    highlight: true,
  },
  {
    time: '1 hour ago',
    icon: '📦',
    text: 'Order #AMZ-8821 delivered — Noise Buds VS104',
  },
  {
    time: '3 hours ago',
    icon: '✏️',
    text: "Your listing title for 'JBL Tune 115TWS' was updated via Nia chat",
  },
  {
    time: 'Yesterday',
    icon: '📈',
    text: 'Weekly performance report ready — ↑ 12% revenue growth',
  },
  {
    time: '2 days ago',
    icon: '⭐',
    text: 'New review: ★★★★★ on boAt Airdopes 141',
  },
];

// ─── Custom Tooltip for Chart ───────────────────────────────────────────────

function ChartTooltip({ active, payload, label }: { active?: boolean; payload?: Array<{ value: number; name: string; color: string }>; label?: string }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white rounded-sm shadow-sm border border-gray-100 p-3 text-xs">
      <p className="font-semibold text-[#0F1111] mb-1">{label}</p>
      {payload.map((entry) => (
        <p key={entry.name} className="text-gray-600">
          <span className="inline-block w-2 h-2 rounded-full mr-1.5" style={{ backgroundColor: entry.color }} />
          {entry.name}: ₹{entry.value.toLocaleString('en-IN')}
        </p>
      ))}
    </div>
  );
}

// ─── Nia Score Badge ────────────────────────────────────────────────────────

function NiaScoreBadge({ score }: { score: number }) {
  if (score >= 90) {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#E0F2F1] text-[#00838F]">
        {score}% Excellent
      </span>
    );
  }
  if (score >= 75) {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-green-100 text-green-700">
        {score}% Good
      </span>
    );
  }
  return (
    <a href="/seller/optimization" className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-700 hover:bg-amber-200 transition-colors">
      {score}% Fix →
    </a>
  );
}

// ─── Main Dashboard Component ───────────────────────────────────────────────

export default function SellerDashboard() {
  const { seller } = useSellerAuth();
  const [toastMessage, setToastMessage] = useState('');
  const revenueData = useMemo(() => generateRevenueData(), []);

  const firstName = seller?.name?.split(' ')[0] || 'Seller';
  const storeName = seller?.storeName || 'Your Store';

  // Time-of-day greeting
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3000);
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-[1400px] mx-auto">
      {/* ── Section 1: Welcome Bar ── */}
      <div className="mb-6">
        <h1 className="text-xl sm:text-2xl font-bold text-[#0F1111]">
          {greeting}, {firstName}! 👋
        </h1>
        <p className="text-sm text-gray-500 mt-0.5">
          Here&apos;s how <span className="font-medium text-[#0F1111]">{storeName}</span> is performing.
          <span className="text-gray-400 ml-2">
            {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
            {' · '}Last updated: just now
          </span>
        </p>
      </div>

      {/* ── Section 2: KPI Cards ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
        {/* Orders */}
        <div className="bg-white rounded-sm p-4 sm:p-5 border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] sm:text-xs text-gray-500 font-medium">Orders this week</span>
            <span className="text-lg">📦</span>
          </div>
          <p className="text-xl sm:text-2xl font-bold text-[#0F1111]">847</p>
          <div className="flex items-center gap-1 mt-1.5">
            <span className="text-[11px] font-medium text-green-600">↑ 12%</span>
            <span className="text-[11px] text-gray-400">from last week</span>
          </div>
        </div>

        {/* Revenue */}
        <div className="bg-white rounded-sm p-4 sm:p-5 border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] sm:text-xs text-gray-500 font-medium">Revenue this week</span>
            <span className="text-lg">💰</span>
          </div>
          <p className="text-xl sm:text-2xl font-bold text-[#0F1111]">₹2,34,180</p>
          <div className="flex items-center gap-1 mt-1.5">
            <span className="text-[11px] font-medium text-green-600">↑ 8%</span>
            <span className="text-[11px] text-gray-400">from last week</span>
          </div>
        </div>

        {/* Nia Appearances — visually distinct */}
        <div className="bg-gradient-to-br from-[#E0F2F1] to-white rounded-sm p-4 sm:p-5 border border-[#00838F]/10 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] sm:text-xs text-[#00838F] font-medium">Nia Appearances</span>
            <span className="text-lg">✨</span>
          </div>
          <p className="text-xl sm:text-2xl font-bold text-[#00838F]">3,241</p>
          <div className="flex items-center gap-1 mt-1.5">
            <span className="text-[11px] font-medium text-[#00838F]">↑ 34%</span>
            <span className="text-[11px] text-gray-400">in Nia&apos;s results</span>
          </div>
        </div>

        {/* Return Rate */}
        <div className="bg-white rounded-sm p-4 sm:p-5 border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] sm:text-xs text-gray-500 font-medium">Return Rate</span>
            <span className="text-lg">🔄</span>
          </div>
          <p className="text-xl sm:text-2xl font-bold text-[#0F1111]">3.2%</p>
          <div className="flex items-center gap-1 mt-1.5">
            <span className="text-[11px] font-medium text-green-600">↓ 0.4%</span>
            <span className="text-[11px] text-gray-400">improvement</span>
          </div>
        </div>
      </div>

      {/* ── Section 3: Revenue Chart ── */}
      <div className="bg-white rounded-sm border border-gray-100 shadow-sm p-4 sm:p-6 mb-6">
        <h2 className="text-sm font-bold text-[#0F1111] mb-1">Revenue — Last 30 Days</h2>
        <p className="text-[11px] text-gray-400 mb-4">Total vs Nia-driven revenue</p>
        <ResponsiveContainer width="100%" height={320}>
          <LineChart data={revenueData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 10, fill: '#9ca3af' }}
              tickLine={false}
              axisLine={{ stroke: '#e5e7eb' }}
              interval={4}
            />
            <YAxis
              tick={{ fontSize: 10, fill: '#9ca3af' }}
              tickLine={false}
              axisLine={false}
              tickFormatter={(v: number) => `₹${(v / 1000).toFixed(0)}k`}
            />
            <Tooltip content={<ChartTooltip />} />
            <Legend
              wrapperStyle={{ fontSize: '12px', paddingTop: '12px' }}
            />
            <Line
              type="monotone"
              dataKey="total"
              name="Total Revenue"
              stroke="#FF9900"
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4, fill: '#FF9900' }}
            />
            <Line
              type="monotone"
              dataKey="niaDriven"
              name="Via Nia Recommendations"
              stroke="#00838F"
              strokeWidth={2}
              dot={false}
              strokeDasharray="5 3"
              activeDot={{ r: 4, fill: '#00838F' }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* ── Section 4: Top Listings + Activity Feed ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mb-6">
        {/* Left: Top Performing Listings */}
        <div className="bg-white rounded-sm border border-gray-100 shadow-sm p-4 sm:p-6">
          <h2 className="text-sm font-bold text-[#0F1111] mb-4">Top Performing Listings</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left text-[10px] font-semibold text-gray-400 uppercase tracking-wider pb-2 pr-2">#</th>
                  <th className="text-left text-[10px] font-semibold text-gray-400 uppercase tracking-wider pb-2">Product</th>
                  <th className="text-right text-[10px] font-semibold text-gray-400 uppercase tracking-wider pb-2">Units</th>
                  <th className="text-right text-[10px] font-semibold text-gray-400 uppercase tracking-wider pb-2">Revenue</th>
                  <th className="text-right text-[10px] font-semibold text-gray-400 uppercase tracking-wider pb-2">Nia Score</th>
                </tr>
              </thead>
              <tbody>
                {topListings.map((item) => (
                  <tr key={item.rank} className="border-b border-gray-50 last:border-0">
                    <td className="py-2.5 pr-2 text-xs text-gray-400 font-medium">{item.rank}</td>
                    <td className="py-2.5 text-xs font-medium text-[#0F1111] max-w-[140px] truncate">
                      {item.name}
                    </td>
                    <td className="py-2.5 text-xs text-right text-gray-600 tabular-nums">{item.units}</td>
                    <td className="py-2.5 text-xs text-right font-medium text-[#0F1111] tabular-nums">
                      ₹{item.revenue.toLocaleString('en-IN')}
                    </td>
                    <td className="py-2.5 text-right">
                      <NiaScoreBadge score={item.niaScore} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <a
            href="/seller/listings"
            className="block mt-3 text-xs text-[#00838F] font-medium hover:underline"
          >
            View all listings →
          </a>
        </div>

        {/* Right: Activity Feed */}
        <div className="bg-white rounded-sm border border-gray-100 shadow-sm p-4 sm:p-6">
          <h2 className="text-sm font-bold text-[#0F1111] mb-4">Recent Activity</h2>
          <div className="space-y-4">
            {activityFeed.map((item, idx) => (
              <div key={idx} className="flex gap-3">
                {/* Timeline dot + line */}
                <div className="flex flex-col items-center">
                  <span className="text-base">{item.icon}</span>
                  {idx < activityFeed.length - 1 && (
                    <div className="w-px flex-1 bg-gray-100 mt-1" />
                  )}
                </div>
                <div className="flex-1 min-w-0 pb-1">
                  <p className={`text-xs leading-relaxed ${item.highlight ? 'text-[#0F1111] font-medium' : 'text-gray-600'}`}>
                    {item.text}
                  </p>
                  <p className="text-[10px] text-gray-400 mt-0.5">{item.time}</p>
                </div>
              </div>
            ))}
          </div>
          <button
            onClick={() => showToast('Full activity log coming soon')}
            className="block mt-3 text-xs text-[#00838F] font-medium hover:underline"
          >
            View all activity →
          </button>
        </div>
      </div>

      {/* ── Section 5: Quick Actions ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {[
          { emoji: '📊', label: 'View Intent Gaps', href: '/seller/intent-gaps', desc: 'See unmet demand' },
          { emoji: '✏️', label: 'Optimize a Listing', href: '/seller/optimization', desc: 'AI-powered improvements' },
          { emoji: '📦', label: 'Add New Listing', href: '/seller/listings/new', desc: 'Publish a new product' },
          { emoji: '📈', label: 'Full Analytics', href: '/seller/analytics', desc: 'Revenue & performance' },
        ].map((action) => (
          <a
            key={action.label}
            href={action.href}
            className="bg-white rounded-sm border border-gray-100 shadow-sm p-4 hover:border-[#00838F]/20 hover:shadow-md transition-all group"
          >
            <span className="text-2xl">{action.emoji}</span>
            <p className="text-sm font-semibold text-[#0F1111] mt-2 group-hover:text-[#00838F] transition-colors">
              {action.label}
            </p>
            <p className="text-[11px] text-gray-400 mt-0.5">{action.desc}</p>
          </a>
        ))}
      </div>

      {/* ── Toast ── */}
      {toastMessage && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[100] bg-[#232F3E] text-white text-sm px-5 py-3 rounded-sm shadow-sm animate-[slide-up_0.2s_ease-out]">
          {toastMessage}
        </div>
      )}
    </div>
  );
}

// Production extension:
// - All KPIs pulled from Seller Metrics API (Lambda → DynamoDB aggregated views)
// - Revenue chart uses real order data streamed via Kinesis → Athena
// - Nia Appearances metric from Attribution Service (join chat events with orders)
// - Activity feed from DynamoDB activity stream (with pagination)
// - Quick actions dynamically prioritized based on seller's most-used features
// - Export dashboard as PDF via AWS Lambda + WeasyPrint
// - Personalized greeting message from Nia based on recent performance
