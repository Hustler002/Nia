// components/ProductReorderCard.tsx
// Individual product card for the "Running low" reorder row
// Shows AI-predicted consumption status and quick-add functionality
// Production: images from S3/CDN, prediction from Amazon Personalize

'use client';

import { useState } from 'react';
import type { Product } from '@/lib/mockData';

export default function ProductReorderCard({ product }: { product: Product }) {
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);

  const handleAdd = () => {
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  return (
    <div className="flex-shrink-0 w-44 sm:w-52 bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow duration-300 overflow-hidden group">
      {/* Image area */}
      <div className="relative bg-gray-50 p-4 flex items-center justify-center h-32">
        {/* Placeholder product visual */}
        <div className="w-20 h-20 rounded-xl bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center text-3xl">
          {product.category === 'Dairy & Eggs' && '🥛'}
          {product.category === 'Personal Care' && '🪥'}
          {product.category === 'Kitchen Essentials' && '🧂'}
          {product.category === 'Groceries' && '🍞'}
        </div>
        {/* Running low badge */}
        <span className="absolute top-2 left-2 bg-amber-100 text-amber-700 text-[10px] font-bold px-2 py-0.5 rounded-full">
          ⚠ Running low
        </span>
      </div>

      {/* Info */}
      <div className="p-3">
        <h3 className="text-sm font-semibold text-[#0F1111] truncate" title={product.name}>
          {product.name}
        </h3>
        <p className="text-xs text-gray-400 mt-0.5">{product.unit}</p>
        <p className="text-[11px] text-gray-400 mt-1">
          Last ordered {product.lastOrdered}
        </p>

        <div className="flex items-center justify-between mt-3">
          {/* Price */}
          <div>
            <span className="text-base font-bold text-[#0F1111]">₹{product.price}</span>
            {product.mrp > product.price && (
              <span className="text-xs text-gray-400 line-through ml-1">₹{product.mrp}</span>
            )}
          </div>

          {/* Qty + Add */}
          <div className="flex items-center gap-1">
            {!added ? (
              <>
                <select
                  value={qty}
                  onChange={(e) => setQty(Number(e.target.value))}
                  className="w-10 h-8 text-xs border border-gray-200 rounded-lg bg-white text-center appearance-none cursor-pointer"
                  aria-label="Quantity"
                >
                  {[1, 2, 3, 4, 5].map((n) => (
                    <option key={n} value={n}>{n}</option>
                  ))}
                </select>
                <button
                  onClick={handleAdd}
                  className="h-8 px-3 bg-[#00838F] hover:bg-[#006d75] text-white text-xs font-semibold rounded-lg transition-colors"
                  aria-label={`Add ${product.name} to cart`}
                >
                  + Add
                </button>
              </>
            ) : (
              <span className="text-xs font-semibold text-green-600 flex items-center gap-1">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                </svg>
                Added!
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
