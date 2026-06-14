'use client';

import { useState } from 'react';
import { intentGaps, IntentGap, gapTypeConfig, categoryColors, getIntentGapSummary } from '@/lib/seller/mockIntentGaps';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';

function IntentGapRow({ gap, isExpanded, onToggle }: { gap: IntentGap, isExpanded: boolean, onToggle: () => void }) {
  const typeConfig = gapTypeConfig[gap.gapType];
  const catColor = categoryColors[gap.category] || { bg: 'bg-gray-100', text: 'text-gray-700' };

  return (
    <div className="border-b border-gray-100 last:border-0 hover:bg-gray-50/50 transition-colors">
      <div
        className="flex items-center px-6 py-4 cursor-pointer"
        onClick={onToggle}
      >
        <div className="flex-1 min-w-0 pr-4">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="text-[15px] font-semibold text-[#0F1111] truncate">{gap.query}</h3>
            {gap.trend === 'rising' && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-green-50 text-green-700">
                ↑ {gap.trendDelta}%
              </span>
            )}
          </div>
          <div className="flex items-center gap-3">
            <span className={`inline-flex px-2 py-0.5 rounded text-[10px] font-medium ${catColor.bg} ${catColor.text}`}>
              {gap.category}
            </span>
            <span className="text-[11px] text-gray-500 font-medium">
              Avg max price: ₹{gap.avgMaxPrice}
            </span>
          </div>
        </div>

        <div className="w-32 text-right pr-4">
          <p className="text-[15px] font-bold text-[#0F1111]">{gap.frequency}</p>
          <p className="text-[11px] text-gray-400">Searches/wk</p>
        </div>

        <div className="w-32 hidden sm:block pr-4">
          <span className={`inline-flex px-2 py-1 rounded-md text-xs font-semibold ${typeConfig.bg} ${typeConfig.text}`}>
            {typeConfig.label}
          </span>
        </div>

        <div className="w-8 flex justify-end">
          <svg
            className={`w-5 h-5 text-gray-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
            fill="none" viewBox="0 0 24 24" stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden bg-gray-50"
          >
            <div className="px-6 py-5 border-t border-gray-100 flex flex-col md:flex-row gap-6">
              {/* Left col: details */}
              <div className="flex-1 space-y-4">
                <div>
                  <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Closest Existing Listing</h4>
                  {gap.closestExistingProduct ? (
                    <div className="bg-white border border-gray-200 rounded-lg p-3 flex justify-between items-center">
                      <span className="text-sm font-medium text-[#0F1111]">{gap.closestExistingProduct.name}</span>
                      <span className="text-xs font-bold text-[#00838F] bg-[#E0F2F1] px-2 py-1 rounded">
                        {gap.closestExistingProduct.matchScore}% Match
                      </span>
                    </div>
                  ) : (
                    <div className="text-sm text-gray-500 italic">None found in your catalog.</div>
                  )}
                </div>
                
                <div>
                  <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Location Hotspots</h4>
                  <div className="flex flex-wrap gap-2">
                    {gap.locationBreakdown.map((loc, i) => (
                      <span key={i} className="text-xs bg-white border border-gray-200 text-gray-600 px-2 py-1 rounded-md">
                        {loc.area} <span className="font-semibold text-gray-900 ml-1">{loc.percentage}%</span>
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Right col: Action & Recommendations */}
              <div className="w-full md:w-72 space-y-4">
                <div>
                  <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Nia's Recommendations</h4>
                  <ul className="space-y-1">
                    {gap.recommendedAttributes.map((rec, i) => (
                      <li key={i} className="text-xs text-gray-700 flex items-start gap-1.5">
                        <span className="text-[#00838F] mt-0.5">•</span>
                        <span className="leading-relaxed">{rec}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                
                <Link
                  href={`/seller/optimization?query=${encodeURIComponent(gap.query)}`}
                  className={`block w-full text-center py-2 px-4 rounded-lg text-sm font-bold text-white transition-colors shadow-sm ${typeConfig.actionColor}`}
                >
                  {typeConfig.action}
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function IntentGapsPage() {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [sortByCategory, setSortByCategory] = useState(false);
  const summary = getIntentGapSummary();

  const sortedGaps = sortByCategory
    ? [...intentGaps].sort((a, b) => {
        const aIsMatch = a.category === summary.sellerCategory ? 0 : 1;
        const bIsMatch = b.category === summary.sellerCategory ? 0 : 1;
        return aIsMatch - bIsMatch;
      })
    : intentGaps;

  return (
    <div className="min-h-screen bg-gray-50 pb-16">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-6">
        <div className="max-w-5xl mx-auto">
          <h1 className="text-2xl font-bold text-[#0F1111] flex items-center gap-2">
            Intent Gaps <span className="text-xl">🎯</span>
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Discover what customers are searching for, but cannot find.
          </p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-6">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
            <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider mb-1">Total Unmet Searches</p>
            <p className="text-2xl font-bold text-[#0F1111]">{summary.totalUnmet.toLocaleString()}</p>
            <p className="text-xs text-green-600 font-medium mt-1">↑ {summary.weekOverWeekChange}% vs last week</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
            <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider mb-1">Gaps in Your Category</p>
            <p className="text-2xl font-bold text-[#0F1111]">{summary.matchingGaps}</p>
            <p className="text-xs text-gray-500 font-medium mt-1">in {summary.sellerCategory}</p>
          </div>
          <div className="bg-gradient-to-br from-[#E0F2F1] to-white rounded-xl border border-[#00838F]/20 p-5 shadow-sm">
            <p className="text-xs text-[#00838F] font-semibold uppercase tracking-wider mb-1">Potential Missed Revenue</p>
            <p className="text-2xl font-bold text-[#00838F]">{summary.potentialRevenue}</p>
            <p className="text-xs text-[#00838F]/70 font-medium mt-1">estimated per week</p>
          </div>
        </div>

        {/* Table/List */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 bg-gray-50 border-b border-gray-200 flex items-center justify-between">
            <h2 className="text-sm font-bold text-[#0F1111]">Top Intent Gaps ({intentGaps.length})</h2>
            <button
              onClick={() => setSortByCategory(prev => !prev)}
              className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg border transition-all ${
                sortByCategory
                  ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                  : 'bg-white text-blue-600 border-blue-200 hover:bg-blue-50'
              }`}
            >
              <span>🔌</span>
              {sortByCategory ? `Sorted: ${summary.sellerCategory} first` : `Sort by my category (${summary.sellerCategory})`}
            </button>
          </div>
          <div className="flex flex-col">
            {sortedGaps.map(gap => (
              <IntentGapRow
                key={gap.id}
                gap={gap}
                isExpanded={expandedId === gap.id}
                onToggle={() => setExpandedId(expandedId === gap.id ? null : gap.id)}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
