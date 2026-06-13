// components/NiaWidget/cards/EmergencyKitCard.tsx
// Urgent emergency kit card with color-coded header based on emergency category
// Uses kit.categoryColor for left border + ETA badge to visually differentiate categories
// Production: real inventory checks, live ETA from logistics, one-tap checkout

'use client';

import type { EmergencyKit } from '@/lib/useNiaStore';
import Link from 'next/link';

interface EmergencyKitCardProps {
  kit: EmergencyKit;
  content: string;
}

export default function EmergencyKitCard({
  kit,
  content,
}: EmergencyKitCardProps) {
  const categoryColor = kit.categoryColor || '#FF9900';
  const categoryEmoji = kit.categoryEmoji || '🚨';
  const totalPrice = kit.items.reduce((sum, item) => sum + item.price * item.qty, 0);

  return (
    <div
      className="bg-white rounded-2xl rounded-bl-md border border-gray-100 border-l-4 shadow-sm overflow-hidden bg-gradient-to-b from-orange-50/50 to-white"
      style={{ borderLeftColor: categoryColor }}
    >
      {/* Header with pulsing emergency dot + category emoji */}
      <div className="px-4 pt-4 pb-2">
        <div className="flex items-center gap-2 mb-2">
          <div
            className="w-2.5 h-2.5 rounded-full bg-red-500"
            style={{ animation: 'dot-pulse 1.5s ease-in-out infinite' }}
          />
          <span className="text-base flex-shrink-0">{categoryEmoji}</span>
          <h3 className="text-sm font-bold text-[#0F1111]">{kit.name}</h3>
        </div>
        <p className="text-sm leading-relaxed text-[#0F1111]">{content}</p>
      </div>

      {/* Item list with alternating category-color rows */}
      <div className="px-4 pb-3 space-y-1">
        {kit.items.map((item, idx) => (
          <div
            key={item.id}
            className="flex items-center gap-3 px-3 py-2 rounded-lg"
            style={{
              backgroundColor:
                idx % 2 === 0
                  ? `${categoryColor}1A` // 10% opacity hex suffix
                  : 'transparent',
            }}
          >
            <span className="text-lg flex-shrink-0">{item.image}</span>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-[#0F1111] truncate">
                {item.name}
              </p>
            </div>
            <span className="text-xs font-bold text-[#0F1111] flex-shrink-0">
              ₹{item.price}
            </span>
          </div>
        ))}
      </div>

      {/* ETA badge — large and prominent with category color */}
      <div
        className="mx-4 mb-3 text-white rounded-xl p-3 text-center"
        style={{ backgroundColor: categoryColor }}
      >
        <p className="text-[10px] uppercase tracking-wide opacity-80">
          Estimated Delivery
        </p>
        <div className="flex items-center justify-center gap-2 mt-0.5">
          <span className="text-lg font-bold">{kit.eta}</span>
          <span className="text-lg">🚚</span>
        </div>
      </div>

      {/* Total + Order button + secondary actions */}
      <div className="px-4 pb-4">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs text-gray-400">Kit total</span>
          <span className="text-base font-bold text-[#0F1111]">
            ₹{totalPrice}
          </span>
        </div>
        <button
          className="w-full bg-[#FF9900] hover:bg-[#e8870d] text-white font-bold text-sm rounded-xl py-3 transition-colors shadow-md"
          style={{ animation: 'emergency-pulse 2s ease-in-out infinite' }}
        >
          Order Emergency Kit Now
        </button>
        <p className="text-center mt-2">
          <button className="text-xs text-[#007185] hover:text-[#C7511F] hover:underline transition-colors">
            Add to cart instead
          </button>
        </p>
        <p className="text-center text-[10px] text-gray-300 mt-2">
          Free delivery on emergency orders · No minimum
        </p>
        <p className="text-center mt-2">
          <Link
            href="/emergency"
            className="text-xs text-[#007185] hover:text-[#C7511F] hover:underline transition-colors"
          >
            📍 Open Emergency Page
          </Link>
        </p>
      </div>
    </div>
  );
}

// Production extension:
// - Real-time inventory check via check_inventory_eta(product_ids, pincode)
// - Live ETA from logistics service, not hardcoded
// - One-tap checkout flow bypassing cart for emergencies
// - Category-specific kits maintained by category managers in DynamoDB
// - Track emergency order conversion rates for kit optimization
// - Add medicine prescription check for regulated items
