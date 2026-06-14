// components/Rituals/RitualsRow.tsx
// Horizontally scrollable row of ritual bundles on the homepage.
// Shows detected rituals + a "+ Create new ritual" CTA card.
// Production: ritual data from DynamoDB via get_user_profile API call

'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { getMockRituals } from '@/lib/rituals/ritualDetector';
import type { Ritual } from '@/lib/rituals/ritualDetector';
import RitualCard from './RitualCard';

export default function RitualsRow() {
  const [rituals, setRituals] = useState<Ritual[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setRituals(getMockRituals());
    requestAnimationFrame(() => setMounted(true));
  }, []);

  const router = useRouter();

  const handleCreateNew = () => {
    router.push('/rituals?create=1');
  };

  return (
    <section className="py-8 px-4 bg-gray-50/50">
      <div
        className={`max-w-7xl mx-auto transition-all duration-700 ease-out ${
          mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
        }`}
      >
        {/* ── Section header ──────────────────────────────────────────── */}
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-[#0F1111]">Your rituals</h2>
            <span className="text-lg">⚡</span>
            <span className="text-[10px] bg-[#F7F8F8] text-[#007185] font-bold px-2 py-0.5 rounded-sm border border-[#D5D9D9]">
              {rituals.length} saved
            </span>
          </div>
          <Link
            href="/rituals"
            className="text-[#007185] text-xs font-semibold hover:text-[#C45500] hover:underline transition-colors hidden sm:block"
          >
            Manage rituals →
          </Link>
        </div>
        <p className="text-sm text-gray-400 mb-4">
          Saved bundles you keep coming back to
        </p>

        {/* ── Scrollable card row ─────────────────────────────────────── */}
        <div className="flex gap-3 overflow-x-auto pb-4 -mx-4 px-4 snap-x snap-mandatory scrollbar-hide">
          {rituals.map(ritual => (
            <div key={ritual.id} className="snap-start">
              <RitualCard ritual={ritual} />
            </div>
          ))}

          {/* ── "+ Create new ritual" card ────────────────────────────── */}
          <div className="snap-start">
            <Link
              href="/rituals?create=1"
              className="flex-shrink-0 w-52 sm:w-56 h-full min-h-[240px] bg-white rounded-sm
                border-2 border-dashed border-[#D5D9D9] hover:border-[#007185]
                hover:bg-[#F7F8F8] transition-all duration-200
                flex flex-col items-center justify-center gap-3 px-4 group"
            >
              {/* Plus icon */}
              <div className="w-10 h-10 rounded-sm bg-[#F7F8F8] border border-[#D5D9D9] flex items-center justify-center
                group-hover:bg-[#232F3E] group-hover:border-[#232F3E] transition-colors duration-200">
                <svg
                  className="w-5 h-5 text-gray-500 group-hover:text-white transition-colors"
                  fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                </svg>
              </div>
              <div className="text-center">
                <p className="text-xs font-semibold text-[#0F1111] group-hover:text-[#007185] transition-colors">
                  Create new ritual
                </p>
                <p className="text-[11px] text-gray-400 mt-0.5">
                  Bundle items you buy together
                </p>
              </div>
            </Link>
          </div>
        </div>

        {/* ── Mobile "Manage" link ────────────────────────────────────── */}
        <div className="flex justify-center mt-2 sm:hidden">
          <Link
            href="/rituals"
            className="text-[#007185] text-xs font-semibold hover:text-[#C45500] hover:underline"
          >
            Manage all rituals →
          </Link>
        </div>
      </div>
    </section>
  );
}

// Production extension:
// - Fetch rituals from GET /api/rituals?userId=xxx (DynamoDB)
// - Skeleton shimmer loading state while data loads
// - Drag-to-reorder ritual cards for priority ranking
// - "Pin" rituals to always appear first
// - A/B test section title and CTA copy
