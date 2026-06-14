// components/NiaWidget/cards/ComparisonCard.tsx
// Side-by-side product comparison card for Nia chat responses
// Shows 2-3 products with spec comparison, match scores, and "Best Pick" badge
// Production: real product images, deep links to product pages, live pricing

'use client';

import { useState } from 'react';
import { useNiaChatStore } from '@/lib/useNiaStore';
import type { ComparisonData } from '@/lib/useNiaStore';

interface ComparisonCardProps {
  data: ComparisonData;
  content: string;
}

/** Renders filled/empty star icons for a rating value (0-5) */
function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <svg
          key={star}
          className={`w-3 h-3 ${
            star <= Math.round(rating) ? 'text-[#FF9900]' : 'text-gray-200'
          }`}
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
      <span className="text-[10px] text-gray-400 ml-1">{rating}</span>
    </div>
  );
}

export default function ComparisonCard({ data, content }: ComparisonCardProps) {
  const [showWhy, setShowWhy] = useState(false);
  const [added, setAdded] = useState(false);
  const recommended = data.products.find((p) => p.recommended);

  return (
    <div className="bg-white rounded-md rounded-bl-sm border border-[#D5D9D9] border-l-4 border-l-[#00838F] shadow-sm overflow-hidden">
      {/* Content text */}
      <div className="px-4 pt-4 pb-3">
        <p className="text-sm leading-relaxed text-[#0F1111]">{content}</p>
      </div>

      {/* Product columns — horizontal scroll */}
      <div className="overflow-x-auto scrollbar-hide">
        <div className="flex gap-3 px-4 pb-3 min-w-max">
          {data.products.map((product) => (
            <div
              key={product.id}
              className={`min-w-[130px] max-w-[140px] flex flex-col items-center p-3 rounded-sm border transition-all ${
                product.recommended
                  ? 'border-[#007185] bg-[#F7FAFA] shadow-sm'
                  : 'border-[#D5D9D9] bg-[#F7F8F8]'
              }`}
            >
              {/* Best Pick badge */}
              {product.recommended && (
                <div className="bg-[#FF9900] text-white text-[9px] font-bold rounded-sm px-2 py-0.5 mb-2">
                  ⭐ Best Pick
                </div>
              )}

              {/* Product image */}
              <span className="text-3xl mb-2">{product.image}</span>

              {/* Name */}
              <p className="text-xs font-semibold text-center text-[#0F1111] leading-tight mb-1">
                {product.name}
              </p>

              {/* Price */}
              <p className="text-sm font-bold text-[#0F1111] mb-1">
                ₹{product.price.toLocaleString('en-IN')}
              </p>

              {/* Rating */}
              <StarRating rating={product.rating} />

              {/* Match score badge */}
              <div
                className={`mt-2 rounded-sm px-2 py-0.5 text-[10px] font-bold ${
                  product.matchScore >= 90
                    ? 'bg-[#F7FAFA] text-[#007185] border border-[#007185]/30'
                    : 'bg-orange-50 text-orange-600'
                }`}
              >
                {product.matchScore}% match
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Spec comparison table */}
      <div className="px-4 pb-3">
        <div className="rounded-sm overflow-hidden border border-[#D5D9D9]">
          {data.attributes.map((attr, idx) => (
            <div
              key={attr}
              className={`flex items-center text-[11px] ${
                idx % 2 === 0 ? 'bg-gray-50' : 'bg-white'
              }`}
            >
              {/* Attribute name */}
              <div className="w-[80px] flex-shrink-0 px-2.5 py-2 font-medium text-gray-400 border-r border-gray-100">
                {attr}
              </div>
              {/* Values for each product */}
              {data.products.map((product) => (
                <div
                  key={product.id}
                  className={`flex-1 px-2.5 py-2 text-center text-[#0F1111] ${
                    product.recommended ? 'font-semibold' : ''
                  }`}
                >
                  {product.specs[attr] || '—'}
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* "Why Nia recommends" expandable section */}
      {recommended?.whyRecommended && (
        <div className="px-4 pb-3">
          <button
            onClick={() => setShowWhy(!showWhy)}
            className="flex items-center gap-1 text-xs text-[#00838F] hover:text-[#006d75] transition-colors cursor-pointer"
          >
            <span>💡</span>
            <span className="underline">
              {showWhy ? 'Hide recommendation' : 'Why Nia recommends this'}
            </span>
            <svg
              className={`w-3 h-3 transition-transform ${
                showWhy ? 'rotate-180' : ''
              }`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </button>
          {showWhy && (
            <div className="mt-2 bg-[#F7F8F8] rounded-sm p-3 text-xs text-gray-600 leading-relaxed border border-[#D5D9D9]">
              {recommended.whyRecommended}
            </div>
          )}
        </div>
      )}

      {/* Add to cart CTA */}
      {recommended && (
        <div className="px-4 pb-4">
          <button
            className={`w-full font-bold text-sm rounded-md py-2.5 transition-colors shadow-sm mb-3 ${
              added
                ? 'bg-[#00838F] text-white cursor-default'
                : 'bg-[#FFD814] hover:bg-[#F7CA00] text-[#0F1111]'
            }`}
            onClick={() => {
              if (added) return;
              useNiaChatStore.getState().addToCart({
                id: recommended.id,
                name: recommended.name,
                price: recommended.price,
                mrp: recommended.price,
                image: recommended.image,
                qty: 1,
                category: 'Electronics',
              });
              setAdded(true);
              setTimeout(() => setAdded(false), 2000);
            }}
          >
            {added
              ? '✓ Added to cart'
              : `Add ${recommended.name} to cart · ₹${recommended.price.toLocaleString('en-IN')}`}
          </button>
          
          <a 
            href={`/compare?ids=${data.products.map((p) => p.id).join(',')}`}
            className="block text-center text-xs font-semibold text-[#00838F] hover:text-[#006d75] hover:underline transition-colors"
          >
            View full comparison →
          </a>
        </div>
      )}
    </div>
  );
}

// Production extension:
// - Real product images from S3/CDN instead of emoji placeholders
// - Deep links to full product detail pages
// - Live pricing and availability checks via check_inventory_eta()
// - A/B test different comparison layouts (table vs. card)
// - Track which product the user selects for model fine-tuning
