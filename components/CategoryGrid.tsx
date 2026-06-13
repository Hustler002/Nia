// components/CategoryGrid.tsx
// Grid of category tiles for quick browsing
// Production: categories fetched from OpenSearch catalog aggregation

'use client';

import Link from 'next/link';
import { categories } from '@/lib/mockData';

export default function CategoryGrid() {
  return (
    <section className="py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-xl font-bold text-[#0F1111] mb-5">Shop by category</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {categories.map((cat) => (
            <Link
              key={cat.slug}
              href={`/category/${cat.slug}`}
              className="group relative bg-white rounded-2xl border border-gray-100 p-4 sm:p-5 flex flex-col items-center gap-2 hover:shadow-lg hover:border-transparent transition-all duration-300 overflow-hidden"
            >
              {/* Colored accent on hover */}
              <div
                className="absolute inset-0 opacity-0 group-hover:opacity-[0.04] transition-opacity duration-300 rounded-2xl"
                style={{ backgroundColor: cat.color }}
              />
              <span className="text-3xl sm:text-4xl group-hover:scale-110 transition-transform duration-300">
                {cat.emoji}
              </span>
              <span className="text-sm font-semibold text-[#0F1111] text-center">{cat.name}</span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
