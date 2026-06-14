// components/CategoryGrid.tsx
// Grid of category tiles for quick browsing
// Production: categories fetched from OpenSearch catalog aggregation

'use client';

import Link from 'next/link';
import { categories } from '@/lib/mockData';

export default function CategoryGrid() {
  return (
    <section className="py-6 px-4">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-lg font-bold text-[#0F1111] mb-4">Shop by category</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {categories.map((cat) => (
            <Link
              key={cat.slug}
              href={`/category/${cat.slug}`}
              className="group bg-white rounded-sm border border-[#D5D9D9] p-4 sm:p-5 flex flex-col items-center gap-2 hover:shadow-md transition-all duration-200"
            >
              <span className="text-3xl sm:text-4xl group-hover:scale-110 transition-transform duration-200">
                {cat.emoji}
              </span>
              <span className="text-xs font-semibold text-[#0F1111] text-center">{cat.name}</span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
