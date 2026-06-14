'use client';

// app/seller/analytics/page.tsx — Comprehensive Seller Analytics Dashboard
// Full analytics view with time-range switching, Recharts visualizations,
// Nia impact funnel, category breakdown, and return analysis.
// All data is mock — per-range values simulate a real backend response.

import { useState, useMemo } from 'react';
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, Area, AreaChart,
} from 'recharts';

// ─── Design Tokens ──────────────────────────────────────────────────────────
const TEAL = '#00838F';
const ORANGE = '#FF9900';
const DARK = '#0F1111';
const PIE_COLORS = [TEAL, ORANGE, '#4CAF50', '#9E9E9E'];

// ─── Types ──────────────────────────────────────────────────────────────────
type TimeRange = '7d' | '30d' | '90d';

interface KPI {
  label: string;
  value: string;
  change: string;
  positive: boolean;
  icon: string;
}

// ─── Per-Range KPI Data ─────────────────────────────────────────────────────
const kpiByRange: Record<TimeRange, KPI[]> = {
  '7d': [
    { label: 'Orders', value: '847', change: '+12.3%', positive: true, icon: '📦' },
    { label: 'Revenue', value: '₹2,34,180', change: '+8.7%', positive: true, icon: '💰' },
    { label: 'Nia Appearances', value: '3,241', change: '+22.1%', positive: true, icon: '✨' },
    { label: 'Return Rate', value: '3.2%', change: '-0.4%', positive: true, icon: '↩️' },
  ],
  '30d': [
    { label: 'Orders', value: '3,420', change: '+15.6%', positive: true, icon: '📦' },
    { label: 'Revenue', value: '₹9,45,600', change: '+11.2%', positive: true, icon: '💰' },
    { label: 'Nia Appearances', value: '12,840', change: '+28.4%', positive: true, icon: '✨' },
    { label: 'Return Rate', value: '3.5%', change: '+0.1%', positive: false, icon: '↩️' },
  ],
  '90d': [
    { label: 'Orders', value: '9,870', change: '+18.9%', positive: true, icon: '📦' },
    { label: 'Revenue', value: '₹27,12,400', change: '+14.5%', positive: true, icon: '💰' },
    { label: 'Nia Appearances', value: '38,200', change: '+35.7%', positive: true, icon: '✨' },
    { label: 'Return Rate', value: '3.8%', change: '+0.3%', positive: false, icon: '↩️' },
  ],
};

// ─── Sales Chart Data Generator ─────────────────────────────────────────────
// Generates realistic-looking daily sales data for the selected time range.
function generateSalesData(range: TimeRange) {
  const days = range === '7d' ? 7 : range === '30d' ? 30 : 90;
  const today = new Date();
  return Array.from({ length: days }, (_, i) => {
    const date = new Date(today);
    date.setDate(today.getDate() - (days - 1 - i));
    const dayLabel = `${date.getDate()}/${date.getMonth() + 1}`;
    // Slight upward trend with daily variance
    const baseUnits = 80 + Math.floor(i * 0.5);
    const units = baseUnits + Math.floor(Math.random() * 40 - 15);
    const avgPrice = 250 + Math.floor(Math.random() * 50);
    return {
      date: dayLabel,
      'Units Sold': Math.max(units, 30),
      Revenue: Math.max(units, 30) * avgPrice,
    };
  });
}

// ─── Return Rate Trend Data (12 months, declining) ──────────────────────────
const returnRateTrend = [
  { month: 'Jul', rate: 5.1 }, { month: 'Aug', rate: 4.8 },
  { month: 'Sep', rate: 4.5 }, { month: 'Oct', rate: 4.3 },
  { month: 'Nov', rate: 4.0 }, { month: 'Dec', rate: 3.9 },
  { month: 'Jan', rate: 3.7 }, { month: 'Feb', rate: 3.6 },
  { month: 'Mar', rate: 3.5 }, { month: 'Apr', rate: 3.4 },
  { month: 'May', rate: 3.3 }, { month: 'Jun', rate: 3.2 },
];

// ─── Return Reasons Data ────────────────────────────────────────────────────
const returnReasons = [
  { reason: 'Not as described', pct: 45 },
  { reason: 'Defective', pct: 28 },
  { reason: 'Changed mind', pct: 18 },
  { reason: 'Wrong item', pct: 9 },
];
const returnReasonColors = ['#ef4444', '#f97316', '#eab308', '#9ca3af'];

// ─── Pie Chart Category Data ────────────────────────────────────────────────
const categoryData = [
  { name: 'TWS Earbuds', value: 72, revenue: 168610 },
  { name: 'Wired Earphones', value: 14, revenue: 32786 },
  { name: 'Chargers & Cables', value: 8, revenue: 18734 },
  { name: 'Others', value: 6, revenue: 14050 },
];

// ─── Nia Funnel Data ────────────────────────────────────────────────────────
const funnelSteps = [
  { label: 'Nia Searches', value: 10000 },
  { label: 'Your Product Appeared', value: 3241 },
  { label: 'User Clicked', value: 596 },
  { label: 'Added to Cart', value: 401 },
  { label: 'Ordered', value: 312 },
];

// ─── Top Queries Table Data ─────────────────────────────────────────────────
const topQueries = [
  { query: 'wireless earbuds under ₹2000', appearances: 1847, clicks: 312, orders: 98 },
  { query: 'best earbuds with bass under ₹1500', appearances: 642, clicks: 87, orders: 31 },
  { query: 'earphones for gym workout', appearances: 398, clicks: 72, orders: 28 },
  { query: 'compare earbuds boAt vs noise', appearances: 289, clicks: 61, orders: 24 },
  { query: 'noise cancelling earbuds', appearances: 65, clicks: 18, orders: 6 },
];

// ═════════════════════════════════════════════════════════════════════════════
// Main Component
// ═════════════════════════════════════════════════════════════════════════════

export default function AnalyticsPage() {
  const [range, setRange] = useState<TimeRange>('30d');
  const [showToast, setShowToast] = useState(false);

  // Memoize chart data so it doesn't regenerate on every render
  const salesData = useMemo(() => generateSalesData(range), [range]);
  const kpis = kpiByRange[range];

  const rangeButtons: { key: TimeRange; label: string }[] = [
    { key: '7d', label: 'Last 7 Days' },
    { key: '30d', label: 'Last 30 Days' },
    { key: '90d', label: 'Last 90 Days' },
  ];

  function handleDownload() {
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-16">
      {/* ── Header Row ───────────────────────────────────────────────────── */}
      <div className="bg-white border-b border-gray-200 px-6 py-5">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <h1 className="text-2xl font-bold text-[#0F1111]">Analytics</h1>
          <div className="flex gap-2">
            {rangeButtons.map((btn) => (
              <button
                key={btn.key}
                onClick={() => setRange(btn.key)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  range === btn.key
                    ? 'bg-[#00838F] text-white shadow-md'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {btn.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-8">

        {/* ─── Section 1: Performance Overview KPI Cards ───────────────── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {kpis.map((kpi) => (
            <div
              key={kpi.label}
              className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-2xl">{kpi.icon}</span>
                <span
                  className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                    kpi.positive
                      ? 'bg-green-50 text-green-600'
                      : 'bg-red-50 text-red-500'
                  }`}
                >
                  {kpi.change}
                </span>
              </div>
              <p className="text-2xl font-bold text-[#0F1111]">{kpi.value}</p>
              <p className="text-sm text-gray-500 mt-1">{kpi.label}</p>
            </div>
          ))}
        </div>

        {/* ─── Section 2: Sales Performance Chart ─────────────────────── */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-[#0F1111] mb-4">Sales Performance</h2>
          <ResponsiveContainer width="100%" height={350}>
            <BarChart data={salesData} barGap={2}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 11, fill: '#6b7280' }}
                /* Show fewer ticks when data is dense (90-day view) */
                interval={range === '90d' ? 6 : range === '30d' ? 2 : 0}
              />
              <YAxis
                yAxisId="units"
                tick={{ fontSize: 11, fill: '#6b7280' }}
                orientation="left"
                label={{ value: 'Units', angle: -90, position: 'insideLeft', fontSize: 11, fill: '#6b7280' }}
              />
              <YAxis
                yAxisId="revenue"
                tick={{ fontSize: 11, fill: '#6b7280' }}
                orientation="right"
                tickFormatter={(v: number) => `₹${(v / 1000).toFixed(0)}k`}
                label={{ value: 'Revenue', angle: 90, position: 'insideRight', fontSize: 11, fill: '#6b7280' }}
              />
              {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
              <Tooltip
                formatter={(value: any, name: any) =>
                  name === 'Revenue'
                    ? [`₹${Number(value).toLocaleString('en-IN')}`, name]
                    : [Number(value).toLocaleString('en-IN'), name]
                }
              />
              <Legend />
              <Bar yAxisId="units" dataKey="Units Sold" fill={ORANGE} radius={[4, 4, 0, 0]} />
              <Bar yAxisId="revenue" dataKey="Revenue" fill={TEAL} radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* ─── Section 3: Nia Impact ──────────────────────────────────── */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm space-y-6">
          <div>
            <h2 className="text-lg font-semibold text-[#0F1111]">
              Nia&apos;s Impact on Your Business ✨
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              How Nia&apos;s AI recommendations are driving your growth
            </p>
          </div>

          {/* 4 Nia Metric Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: 'Recommendation Appearances', value: '3,241', sub: null },
              { label: 'Click-through Rate from Nia', value: '18.4%', sub: 'Industry avg: 11%' },
              { label: 'Conversions from Nia', value: '312 orders', sub: null },
              { label: 'Nia-driven Revenue', value: '₹82,836', sub: '35% of total' },
            ].map((m) => (
              <div
                key={m.label}
                className="bg-[#E0F2F1] rounded-xl p-4 border border-[#00838F]/10"
              >
                <p className="text-xs text-[#00838F] font-medium mb-1">{m.label}</p>
                <p className="text-xl font-bold text-[#0F1111]">{m.value}</p>
                {m.sub && <p className="text-xs text-gray-500 mt-1">{m.sub}</p>}
              </div>
            ))}
          </div>

          {/* Funnel Visualization — built with CSS bars, not Recharts */}
          <div>
            <h3 className="text-sm font-semibold text-[#0F1111] mb-3">Conversion Funnel</h3>
            <div className="space-y-2">
              {funnelSteps.map((step, i) => {
                // Width proportional to max value (first step)
                const widthPct = (step.value / funnelSteps[0].value) * 100;
                // Opacity decreases down the funnel to visually show narrowing
                const opacity = 1 - i * 0.15;
                return (
                  <div key={step.label} className="flex items-center gap-3">
                    <span className="text-xs text-gray-600 w-40 text-right shrink-0 font-medium">
                      {step.label}
                    </span>
                    <div className="flex-1 h-7 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${widthPct}%`,
                          backgroundColor: TEAL,
                          opacity,
                        }}
                      />
                    </div>
                    <span className="text-sm font-semibold text-[#0F1111] w-16 text-right shrink-0">
                      {step.value.toLocaleString('en-IN')}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Top 5 Queries Table */}
          <div>
            <h3 className="text-sm font-semibold text-[#0F1111] mb-3">
              Top Queries Driving Traffic
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-2 px-3 font-semibold text-gray-500">Query</th>
                    <th className="text-right py-2 px-3 font-semibold text-gray-500">Appearances</th>
                    <th className="text-right py-2 px-3 font-semibold text-gray-500">Clicks</th>
                    <th className="text-right py-2 px-3 font-semibold text-gray-500">Orders</th>
                  </tr>
                </thead>
                <tbody>
                  {topQueries.map((q, i) => (
                    <tr
                      key={i}
                      className="border-b border-gray-50 hover:bg-gray-50 transition-colors"
                    >
                      <td className="py-2.5 px-3 text-[#0F1111] font-medium">{q.query}</td>
                      <td className="py-2.5 px-3 text-right text-gray-600">
                        {q.appearances.toLocaleString('en-IN')}
                      </td>
                      <td className="py-2.5 px-3 text-right text-gray-600">
                        {q.clicks.toLocaleString('en-IN')}
                      </td>
                      <td className="py-2.5 px-3 text-right font-semibold text-[#00838F]">
                        {q.orders.toLocaleString('en-IN')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* ─── Section 4: Category Breakdown (Pie Chart) ──────────────── */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-[#0F1111] mb-4">Revenue by Subcategory</h2>
          <div className="flex flex-col lg:flex-row items-center gap-8">
            <div className="w-full lg:w-1/2">
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={110}
                    dataKey="value"
                    paddingAngle={3}
                    /* Label shows percentage on each slice */
                    label={({ name, value }: { name?: string; value?: number }) => `${name || ''} ${value}%`}
                    labelLine={true}
                  >
                    {categoryData.map((_, i) => (
                      <Cell key={i} fill={PIE_COLORS[i]} />
                    ))}
                  </Pie>
                  {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                  <Tooltip
                    formatter={(value: any, name: any) => [`${value}%`, name]}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            {/* Legend with colored dots and ₹ values */}
            <div className="w-full lg:w-1/2 space-y-3">
              {categoryData.map((cat, i) => (
                <div key={cat.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span
                      className="w-3 h-3 rounded-full shrink-0"
                      style={{ backgroundColor: PIE_COLORS[i] }}
                    />
                    <span className="text-sm font-medium text-[#0F1111]">{cat.name}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-semibold text-[#0F1111]">
                      ₹{cat.revenue.toLocaleString('en-IN')}
                    </span>
                    <span className="text-xs text-gray-400 ml-2">({cat.value}%)</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ─── Section 5: Returns & Quality ───────────────────────────── */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm space-y-6">
          <h2 className="text-lg font-semibold text-[#0F1111]">Returns &amp; Quality</h2>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left: Return Rate Over Time (Area + Line) */}
            <div>
              <h3 className="text-sm font-semibold text-gray-600 mb-3">Return Rate Over Time</h3>
              <ResponsiveContainer width="100%" height={260}>
                <AreaChart data={returnRateTrend}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#6b7280' }} />
                  <YAxis
                    tick={{ fontSize: 11, fill: '#6b7280' }}
                    tickFormatter={(v: number) => `${v}%`}
                    domain={[2, 6]}
                  />
                  {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                  <Tooltip formatter={(v: any) => [`${v}%`, 'Return Rate']} />
                  <Area
                    type="monotone"
                    dataKey="rate"
                    stroke="#ef4444"
                    strokeWidth={2}
                    fill="#fecaca"
                    fillOpacity={0.4}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* Right: Return Reasons (Horizontal Bar) */}
            <div>
              <h3 className="text-sm font-semibold text-gray-600 mb-3">Return Reasons</h3>
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={returnReasons} layout="vertical" barSize={22}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" horizontal={false} />
                  <XAxis
                    type="number"
                    tick={{ fontSize: 11, fill: '#6b7280' }}
                    tickFormatter={(v: number) => `${v}%`}
                  />
                  <YAxis
                    type="category"
                    dataKey="reason"
                    tick={{ fontSize: 11, fill: '#6b7280' }}
                    width={120}
                  />
                  {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                  <Tooltip formatter={(v: any) => [`${v}%`, 'Percentage']} />
                  <Bar dataKey="pct" radius={[0, 6, 6, 0]}>
                    {returnReasons.map((_, i) => (
                      <Cell key={i} fill={returnReasonColors[i]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Callout below the charts */}
          <div className="space-y-3">
            <p className="text-sm text-gray-600">
              <span className="font-semibold text-[#0F1111]">Most returned product:</span>{' '}
              Portronics Charge 5{' '}
              <span className="text-red-500 font-medium">(8.2% return rate)</span>
            </p>

            {/* Nia Tip callout box */}
            <div className="bg-[#E0F2F1] border border-[#00838F]/20 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center gap-3">
              <div className="flex-1">
                <p className="text-sm text-[#0F1111]">
                  <span className="font-semibold text-[#00838F]">Nia Tip:</span>{' '}
                  3 customers said the description was misleading about compatibility.
                  Update your listing keywords to fix this.
                </p>
              </div>
              <a
                href="/seller/optimization"
                className="shrink-0 inline-flex items-center gap-1 bg-[#00838F] text-white text-sm font-medium px-4 py-2 rounded-full hover:bg-[#006d75] transition-colors"
              >
                → Optimize with Nia
              </a>
            </div>
          </div>
        </div>

        {/* ─── Section 6: Download Report ─────────────────────────────── */}
        <div className="flex justify-center">
          <button
            onClick={handleDownload}
            className="inline-flex items-center gap-2 bg-[#0F1111] text-white text-sm font-semibold px-6 py-3 rounded-full hover:bg-[#232F3E] transition-colors shadow-md"
          >
            {/* Download icon */}
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
            </svg>
            Download Report (PDF)
          </button>
        </div>
      </div>

      {/* ── Toast Notification ─────────────────────────────────────────── */}
      {/* Fixed bottom-center toast that auto-dismisses after 3 seconds */}
      {showToast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-[#0F1111] text-white text-sm font-medium px-6 py-3 rounded-full shadow-lg animate-[fadeIn_0.2s_ease-out]">
          Report generation is not available in demo mode.
        </div>
      )}
    </div>
  );
}

// ─── Production Extension ────────────────────────────────────────────────────
// - Replace mock data with real API calls to seller analytics endpoints
// - Add date-range picker with custom start/end dates
// - Server-side data fetching with React Server Components + streaming
// - Export to CSV/Excel in addition to PDF
// - Real-time WebSocket updates for live order tracking
// - Cohort analysis (new vs returning customers)
// - A/B test results for listing experiments
// - Nia recommendation quality scoring with feedback loop
// - Drill-down into individual product analytics
// - Mobile-optimized swipeable chart carousels
// - Comparison mode: compare two time periods side by side
