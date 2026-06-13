// app/seller/page.tsx
// Seller Console: Intent Gap Analytics Dashboard
// Shows unmatched customer queries that represent listing/catalog opportunities
// This is the primary seller-facing intelligence surface of Nia
// Production: real-time data from Kinesis → Athena pipeline, QuickSight embeds

'use client';

import { useState, useMemo } from 'react';
import {
  intentGaps,
  getIntentGapSummary,
  categoryColors,
  gapTypeConfig,
  allCategories,
  type IntentGap,
} from '@/lib/seller/mockIntentGaps';

// ─── Mini Sparkline SVG Component ───────────────────────────────────────────

function Sparkline({ data, color = '#00838F' }: { data: number[]; color?: string }) {
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const w = 64;
  const h = 20;
  const points = data
    .map((v, i) => {
      const x = (i / (data.length - 1)) * w;
      const y = h - ((v - min) / range) * (h - 4) - 2;
      return `${x},${y}`;
    })
    .join(' ');

  return (
    <svg width={w} height={h} className="inline-block">
      <polyline
        points={points}
        fill="none"
        stroke={color}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* End dot */}
      {data.length > 0 && (
        <circle
          cx={(data.length - 1) / (data.length - 1) * w}
          cy={h - ((data[data.length - 1] - min) / range) * (h - 4) - 2}
          r={2.5}
          fill={color}
        />
      )}
    </svg>
  );
}

// ─── Time Distribution Mini Bar Chart ───────────────────────────────────────

function TimeDistChart({ data }: { data: number[] }) {
  const max = Math.max(...data);
  const labels = ['12a-6a', '6a-12p', '12p-6p', '6p-12a'];

  return (
    <div className="flex items-end gap-1 h-10">
      {data.map((val, i) => (
        <div key={labels[i]} className="flex flex-col items-center gap-0.5">
          <div
            className="w-4 bg-[#00838F]/70 rounded-t-sm transition-all"
            style={{ height: `${(val / max) * 32}px` }}
          />
          <span className="text-[8px] text-gray-400">{labels[i]}</span>
        </div>
      ))}
    </div>
  );
}

// ─── Expanded Row Detail ────────────────────────────────────────────────────

function GapDetail({ gap }: { gap: IntentGap }) {
  return (
    <div className="bg-gray-50 border-t border-gray-100 px-6 py-5 grid grid-cols-1 md:grid-cols-3 gap-6 animate-[slide-up_0.2s_ease-out]">
      {/* Customer Quotes */}
      <div>
        <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
          Customer Queries
        </h4>
        <div className="space-y-2">
          {gap.sampleQueries.map((q, i) => (
            <div
              key={i}
              className="bg-white px-3 py-2 rounded-lg border border-gray-100 text-xs text-[#0F1111] font-mono"
            >
              &ldquo;{q}&rdquo;
            </div>
          ))}
        </div>
      </div>

      {/* Time + Location */}
      <div>
        <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
          When & Where
        </h4>
        <div className="bg-white p-3 rounded-lg border border-gray-100 mb-3">
          <p className="text-[10px] text-gray-400 mb-1.5">Search time distribution</p>
          <TimeDistChart data={gap.timeDistribution} />
        </div>
        <div className="bg-white p-3 rounded-lg border border-gray-100">
          <p className="text-[10px] text-gray-400 mb-1.5">Top locations</p>
          <div className="space-y-1.5">
            {gap.locationBreakdown.map((loc) => (
              <div key={loc.area} className="flex items-center gap-2">
                <div className="flex-1 bg-gray-100 rounded-full h-1.5 overflow-hidden">
                  <div
                    className="h-full bg-[#00838F] rounded-full"
                    style={{ width: `${loc.percentage}%` }}
                  />
                </div>
                <span className="text-[10px] text-gray-500 w-20 truncate">{loc.area}</span>
                <span className="text-[10px] font-medium text-[#0F1111] w-8 text-right">
                  {loc.percentage}%
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recommendations */}
      <div>
        <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
          Recommended Actions
        </h4>
        {gap.closestExistingProduct && (
          <div className="bg-white p-3 rounded-lg border border-gray-100 mb-3">
            <p className="text-[10px] text-gray-400 mb-1">What Nia currently shows</p>
            <p className="text-xs font-medium text-[#0F1111]">
              {gap.closestExistingProduct.name}
            </p>
            <div className="flex items-center gap-2 mt-1">
              <div className="flex-1 bg-gray-100 rounded-full h-1.5 overflow-hidden">
                <div
                  className="h-full bg-[#FF9900] rounded-full"
                  style={{ width: `${gap.closestExistingProduct.matchScore}%` }}
                />
              </div>
              <span className="text-[10px] font-medium text-[#FF9900]">
                {gap.closestExistingProduct.matchScore}% match
              </span>
            </div>
          </div>
        )}
        <div className="space-y-1.5">
          {gap.recommendedAttributes.map((attr, i) => (
            <div key={i} className="flex items-start gap-2">
              <div className="w-4 h-4 rounded-full bg-[#E0F2F1] flex items-center justify-center flex-shrink-0 mt-0.5">
                <svg className="w-2.5 h-2.5 text-[#00838F]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                </svg>
              </div>
              <span className="text-xs text-gray-600">{attr}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Main Dashboard ─────────────────────────────────────────────────────────

export default function SellerDashboard() {
  const summary = getIntentGapSummary();

  // ── Filters ──
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [gapTypeFilter, setGapTypeFilter] = useState('All');
  const [trendFilter, setTrendFilter] = useState('All');
  const [sortBy, setSortBy] = useState<'frequency' | 'trendDelta' | 'revenue'>('frequency');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // ── Filtered + Sorted Data ──
  const filteredGaps = useMemo(() => {
    let result = intentGaps.filter((gap) => {
      if (categoryFilter !== 'All' && gap.category !== categoryFilter) return false;
      if (gapTypeFilter !== 'All' && gap.gapType !== gapTypeFilter) return false;
      if (trendFilter !== 'All' && gap.trend !== trendFilter) return false;
      if (searchQuery && !gap.query.toLowerCase().includes(searchQuery.toLowerCase())) return false;
      return true;
    });

    result.sort((a, b) => {
      switch (sortBy) {
        case 'frequency':
          return b.frequency - a.frequency;
        case 'trendDelta':
          return Math.abs(b.trendDelta) - Math.abs(a.trendDelta);
        case 'revenue':
          return (b.frequency * b.avgMaxPrice) - (a.frequency * a.avgMaxPrice);
        default:
          return 0;
      }
    });

    return result;
  }, [categoryFilter, gapTypeFilter, trendFilter, sortBy, searchQuery]);

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-[1400px] mx-auto">
      {/* ── Page Header ── */}
      <div className="mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-[#0F1111]">Intent Gap Analytics</h1>
            <p className="text-sm text-gray-500 mt-0.5">
              What customers are searching for but can&apos;t find · Last 7 days
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div className="px-3 py-1.5 bg-[#E0F2F1] text-[#00838F] text-xs font-medium rounded-full flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-[#00838F] animate-pulse" />
              Live data
            </div>
            <button className="px-4 py-2 bg-[#FF9900] hover:bg-[#e8870d] text-white text-sm font-semibold rounded-lg transition-colors shadow-sm">
              Export Report
            </button>
          </div>
        </div>
      </div>

      {/* ── Summary Cards ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
        {/* Card 1: Unmet Queries */}
        <div className="bg-white rounded-xl p-4 sm:p-5 border border-gray-100 shadow-sm">
          <p className="text-[11px] sm:text-xs text-gray-500 font-medium">Unmet queries this week</p>
          <p className="text-xl sm:text-2xl font-bold text-[#0F1111] mt-1">
            {summary.totalUnmet.toLocaleString('en-IN')}
          </p>
          <div className="flex items-center gap-1 mt-1.5">
            <svg className="w-3 h-3 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 19.5l15-15m0 0H8.25m11.25 0v11.25" />
            </svg>
            <span className="text-[11px] font-medium text-green-600">
              ↑ {summary.weekOverWeekChange}% from last week
            </span>
          </div>
        </div>

        {/* Card 2: Revenue Opportunity */}
        <div className="bg-white rounded-xl p-4 sm:p-5 border border-gray-100 shadow-sm">
          <p className="text-[11px] sm:text-xs text-gray-500 font-medium">Potential revenue opportunity</p>
          <p className="text-xl sm:text-2xl font-bold text-[#FF9900] mt-1">
            {summary.potentialRevenue}
          </p>
          <p className="text-[11px] text-gray-400 mt-1.5">
            Based on avg order value × 15% conversion
          </p>
        </div>

        {/* Card 3: Gaps You Can Fill */}
        <div className="bg-white rounded-xl p-4 sm:p-5 border border-gray-100 shadow-sm">
          <p className="text-[11px] sm:text-xs text-gray-500 font-medium">Gaps you can fill</p>
          <p className="text-xl sm:text-2xl font-bold text-[#00838F] mt-1">
            {summary.matchingGaps}
          </p>
          <p className="text-[11px] text-gray-400 mt-1.5">
            Gaps matching your category: {summary.sellerCategory}
          </p>
        </div>

        {/* Card 4: Listing Match Score */}
        <div className="bg-white rounded-xl p-4 sm:p-5 border border-gray-100 shadow-sm">
          <p className="text-[11px] sm:text-xs text-gray-500 font-medium">Your listing match score</p>
          <div className="flex items-baseline gap-1 mt-1">
            <p className="text-xl sm:text-2xl font-bold text-[#0F1111]">{summary.matchScore}%</p>
            <span className="text-xs text-gray-400">of recommendations</span>
          </div>
          <div className="w-full bg-gray-100 rounded-full h-1.5 mt-2 overflow-hidden">
            <div
              className="h-full bg-[#00838F] rounded-full transition-all"
              style={{ width: `${summary.matchScore}%` }}
            />
          </div>
        </div>
      </div>

      {/* ── Filter Bar ── */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-3 sm:p-4 mb-4 flex flex-col sm:flex-row gap-3">
        {/* Search */}
        <div className="flex-1 relative">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
          </svg>
          <input
            type="text"
            placeholder="Search intent gaps..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-gray-200 focus:border-[#00838F] focus:outline-none transition-colors bg-gray-50 focus:bg-white"
          />
        </div>

        {/* Category */}
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="px-3 py-2 text-sm rounded-lg border border-gray-200 bg-white focus:border-[#00838F] focus:outline-none cursor-pointer"
        >
          <option value="All">All Categories</option>
          {allCategories.map((cat) => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>

        {/* Gap Type */}
        <select
          value={gapTypeFilter}
          onChange={(e) => setGapTypeFilter(e.target.value)}
          className="px-3 py-2 text-sm rounded-lg border border-gray-200 bg-white focus:border-[#00838F] focus:outline-none cursor-pointer"
        >
          <option value="All">All Gap Types</option>
          <option value="no_listing">No Listing</option>
          <option value="poor_keywords">Poor Keywords</option>
          <option value="price_mismatch">Price Mismatch</option>
          <option value="out_of_stock">Out of Stock</option>
        </select>

        {/* Trend */}
        <select
          value={trendFilter}
          onChange={(e) => setTrendFilter(e.target.value)}
          className="px-3 py-2 text-sm rounded-lg border border-gray-200 bg-white focus:border-[#00838F] focus:outline-none cursor-pointer"
        >
          <option value="All">All Trends</option>
          <option value="rising">Rising</option>
          <option value="stable">Stable</option>
          <option value="falling">Falling</option>
        </select>

        {/* Sort */}
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
          className="px-3 py-2 text-sm rounded-lg border border-gray-200 bg-white focus:border-[#00838F] focus:outline-none cursor-pointer"
        >
          <option value="frequency">Most Searches</option>
          <option value="trendDelta">Fastest Growing</option>
          <option value="revenue">Highest Revenue</option>
        </select>
      </div>

      {/* ── Results Count ── */}
      <div className="flex items-center justify-between mb-3 px-1">
        <p className="text-xs text-gray-400">
          Showing <span className="font-semibold text-[#0F1111]">{filteredGaps.length}</span> of{' '}
          {intentGaps.length} intent gaps
        </p>
      </div>

      {/* ── Intent Gap Table ── */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        {/* Table Header */}
        <div className="hidden lg:grid grid-cols-[1fr_120px_100px_90px_90px_100px_100px] gap-4 px-6 py-3 border-b border-gray-100 bg-gray-50/50">
          <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Query</span>
          <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Category</span>
          <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider text-right">Weekly</span>
          <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider text-right">Trend</span>
          <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider text-right">Avg Price</span>
          <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Gap Type</span>
          <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider text-right">Action</span>
        </div>

        {/* Table Rows */}
        {filteredGaps.length === 0 ? (
          <div className="px-6 py-12 text-center">
            <p className="text-sm text-gray-400">No intent gaps match your filters.</p>
            <button
              onClick={() => {
                setCategoryFilter('All');
                setGapTypeFilter('All');
                setTrendFilter('All');
                setSearchQuery('');
              }}
              className="mt-2 text-xs text-[#00838F] underline"
            >
              Clear all filters
            </button>
          </div>
        ) : (
          filteredGaps.map((gap) => {
            const isExpanded = expandedId === gap.id;
            const catColor = categoryColors[gap.category] || { bg: 'bg-gray-100', text: 'text-gray-600' };
            const gapConfig = gapTypeConfig[gap.gapType];
            const trendColor =
              gap.trend === 'rising'
                ? 'text-green-600'
                : gap.trend === 'falling'
                ? 'text-red-500'
                : 'text-gray-500';
            const sparkColor =
              gap.trend === 'rising' ? '#16a34a' : gap.trend === 'falling' ? '#ef4444' : '#6b7280';

            return (
              <div key={gap.id}>
                {/* Row */}
                <div
                  className={`grid grid-cols-1 lg:grid-cols-[1fr_120px_100px_90px_90px_100px_100px] gap-2 lg:gap-4 px-4 lg:px-6 py-3.5 border-b border-gray-50 cursor-pointer hover:bg-gray-50/50 transition-colors ${
                    isExpanded ? 'bg-gray-50/50' : ''
                  }`}
                  onClick={() => setExpandedId(isExpanded ? null : gap.id)}
                >
                  {/* Query */}
                  <div className="flex items-center gap-2 min-w-0">
                    <svg
                      className={`w-4 h-4 text-gray-400 flex-shrink-0 transition-transform ${
                        isExpanded ? 'rotate-90' : ''
                      }`}
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                    </svg>
                    <span className="text-sm text-[#0F1111] font-medium truncate font-mono">
                      &ldquo;{gap.query}&rdquo;
                    </span>
                  </div>

                  {/* Category */}
                  <div className="flex items-center lg:justify-start">
                    <span
                      className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-semibold ${catColor.bg} ${catColor.text}`}
                    >
                      {gap.category}
                    </span>
                  </div>

                  {/* Weekly Searches */}
                  <div className="flex items-center gap-2 lg:justify-end">
                    <Sparkline data={gap.weeklyHistory} color={sparkColor} />
                    <span className="text-sm font-bold text-[#0F1111] tabular-nums">
                      {gap.frequency.toLocaleString('en-IN')}
                    </span>
                  </div>

                  {/* Trend */}
                  <div className={`flex items-center gap-1 lg:justify-end ${trendColor}`}>
                    {gap.trend === 'rising' && (
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 19.5l15-15m0 0H8.25m11.25 0v11.25" />
                      </svg>
                    )}
                    {gap.trend === 'falling' && (
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 4.5l15 15m0 0V8.25m0 11.25H8.25" />
                      </svg>
                    )}
                    {gap.trend === 'stable' && (
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12h15" />
                      </svg>
                    )}
                    <span className="text-xs font-semibold tabular-nums">
                      {gap.trendDelta > 0 ? '+' : ''}
                      {gap.trendDelta}%
                    </span>
                  </div>

                  {/* Avg Max Price */}
                  <div className="flex items-center lg:justify-end">
                    <span className="text-xs text-gray-500">
                      under <span className="font-medium text-[#0F1111]">₹{gap.avgMaxPrice}</span>
                    </span>
                  </div>

                  {/* Gap Type Badge */}
                  <div className="flex items-center">
                    <span
                      className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-semibold ${gapConfig.bg} ${gapConfig.text}`}
                    >
                      {gapConfig.label}
                    </span>
                  </div>

                  {/* Action Button */}
                  <div className="flex items-center lg:justify-end" onClick={(e) => e.stopPropagation()}>
                    <a
                      href={
                        gap.gapType === 'no_listing'
                          ? `/seller/optimization?query=${encodeURIComponent(gap.query)}`
                          : gap.gapType === 'poor_keywords'
                          ? `/seller/optimization?query=${encodeURIComponent(gap.query)}`
                          : '#'
                      }
                      className={`px-3 py-1.5 text-white text-[11px] font-semibold rounded-lg transition-colors ${gapConfig.actionColor}`}
                    >
                      {gapConfig.action}
                    </a>
                  </div>
                </div>

                {/* Expanded Detail */}
                {isExpanded && <GapDetail gap={gap} />}
              </div>
            );
          })
        )}
      </div>

      {/* ── Table Footer ── */}
      <div className="flex items-center justify-between mt-4 px-1">
        <p className="text-[11px] text-gray-400">
          Data refreshed every 15 minutes · Last update: {new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
        </p>
        <p className="text-[11px] text-gray-400">
          Powered by <span className="font-semibold text-[#00838F]">Nia</span> Intent Analytics
        </p>
      </div>
    </div>
  );
}

// Production extension:
// ─────────────────────────────────────────────────────────────────────────────
//
// 1. INTENT GAP PIPELINE (how this data flows in production):
//    ┌────────┐    ┌────────────┐    ┌─────┐    ┌────────┐    ┌───────────┐
//    │  Nia   │───>│  Kinesis   │───>│ S3  │───>│ Athena │───>│ Dashboard │
//    │ Agent  │    │ Firehose   │    │(raw)│    │(agg.)  │    │   API     │
//    └────────┘    └────────────┘    └─────┘    └────────┘    └───────────┘
//
//    a. Every time the Bedrock Agent's search_catalog() tool returns <3 results
//       or a matchScore below 60%, the query is flagged as an "unmatched intent"
//    b. This event (query, timestamp, pincode, session_id) is written to
//       Kinesis Firehose in real-time
//    c. Firehose delivers batched records to S3 every 60 seconds
//       (partitioned by date: s3://nia-analytics/intent-gaps/year/month/day/)
//    d. Athena runs scheduled queries every 15 minutes to aggregate:
//       - Weekly frequency counts
//       - Trend calculations (WoW delta)
//       - Price extraction (regex for "under ₹X" patterns)
//       - Pincode frequency distributions
//    e. Results are served via API Gateway → Lambda → Athena query
//
// 2. GAP TYPE CLASSIFICATION:
//    Runs as a Step Functions state machine triggered per new gap:
//    ┌─────────────────┐
//    │ search_catalog() │───> results? ───> N ──> "no_listing"
//    └─────────────────┘         │
//                               Y
//                               │
//                    ┌──────────┴──────────┐
//                    │ matchScore > 60%?   │───> N ──> "poor_keywords"
//                    └────────────────────┘
//                               │
//                               Y
//                               │
//                    ┌──────────┴──────────┐
//                    │ price <= avgMaxPrice? │───> N ──> "price_mismatch"
//                    └────────────────────┘
//                               │
//                               Y
//                               │
//                    ┌──────────┴──────────┐
//                    │ inventory > 0?      │───> N ──> "out_of_stock"
//                    └────────────────────┘
//
// 3. FIX KEYWORDS AUTOMATION:
//    - "Fix listing" action triggers a Bedrock Agent (Claude Sonnet) with the
//      seller's current listing + the unmatched query
//    - The agent suggests title, tag, and attribute changes
//    - On seller approval, changes are pushed directly via Seller Central API
//      (SP-API: Listings API v2021-08-01, patchListingsItem endpoint)
//    - A feedback loop tracks whether the fix improved the match score
//
// 4. QUICKSIGHT EMBEDS:
//    - The summary cards can be replaced with QuickSight embedded visuals
//    - Use QuickSight Embedding SDK (anonymous embedding) for read-only dashboards
//    - Enables drill-down, date range selection, and custom filtering
//
// 5. REAL-TIME STREAMING:
//    - For the "Live data" badge to be real, add a WebSocket connection
//      (API Gateway WebSocket → Lambda → DynamoDB Streams)
//    - New intent gaps appear in the table in real-time without page refresh
//    - Use SWR or React Query with polling as a fallback
