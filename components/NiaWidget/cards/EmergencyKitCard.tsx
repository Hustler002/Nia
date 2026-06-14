// components/NiaWidget/cards/EmergencyKitCard.tsx
// Urgent emergency kit card with orange accent for immediate-need situations
// Uses orange left border (not teal) to signal urgency visually
// Production: real inventory checks, live ETA from logistics, one-tap checkout

'use client';

import { useState } from 'react';
import { useNiaChatStore } from '@/lib/useNiaStore';
import type { EmergencyKit } from '@/lib/useNiaStore';

interface EmergencyKitCardProps {
  kit: EmergencyKit;
  content: string;
}

export default function EmergencyKitCard({
  kit,
  content,
}: EmergencyKitCardProps) {
  const totalPrice = kit.items.reduce((sum, item) => sum + item.price * item.qty, 0);
  const [ordered, setOrdered] = useState(false);

  return (
    <div className="bg-white rounded-md rounded-bl-sm border border-[#D5D9D9] border-l-4 border-l-[#FF9900] shadow-sm overflow-hidden bg-gradient-to-b from-orange-50/50 to-white">
      {/* Header with pulsing emergency dot */}
      <div className="px-4 pt-4 pb-2">
        <div className="flex items-center gap-2 mb-2">
          <div
            className="w-2.5 h-2.5 rounded-full bg-red-500"
            style={{ animation: 'dot-pulse 1.5s ease-in-out infinite' }}
          />
          <h3 className="text-sm font-bold text-[#0F1111]">{kit.name}</h3>
        </div>
        <p className="text-sm leading-relaxed text-[#0F1111]">{content}</p>
      </div>

      {/* Item list */}
      <div className="px-4 pb-3 space-y-1">
        {kit.items.map((item, idx) => (
          <div
            key={item.id}
            className={`flex items-center gap-3 px-3 py-2 rounded-sm ${
              idx % 2 === 0 ? 'bg-orange-50/40' : 'bg-white'
            }`}
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

      {/* ETA badge — large and prominent */}
      <div className="mx-4 mb-3 bg-[#FF9900] text-white rounded-md p-3 text-center">
        <p className="text-[10px] uppercase tracking-wide opacity-80">
          Estimated Delivery
        </p>
        <div className="flex items-center justify-center gap-2 mt-0.5">
          <span className="text-lg font-bold">{kit.eta}</span>
          <span className="text-lg">🚚</span>
        </div>
      </div>

      {/* Total + Order button */}
      <div className="px-4 pb-4">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs text-gray-400">Kit total</span>
          <span className="text-base font-bold text-[#0F1111]">
            ₹{totalPrice}
          </span>
        </div>
        <button
          className={`w-full font-bold text-sm rounded-md py-3 transition-colors shadow-sm ${
            ordered
              ? 'bg-[#00838F] text-white cursor-default'
              : 'bg-[#FFD814] hover:bg-[#F7CA00] text-[#0F1111]'
          }`}
          style={ordered ? undefined : { animation: 'emergency-pulse 2s ease-in-out infinite' }}
          onClick={() => {
            if (ordered) return;
            kit.items.forEach(item => {
              useNiaChatStore.getState().addToCart(item);
            });
            setOrdered(true);
            setTimeout(() => setOrdered(false), 3000);
          }}
        >
          {ordered ? '✓ Kit added to cart!' : 'Order Emergency Kit Now'}
        </button>
        <p className="text-center text-[10px] text-gray-300 mt-2">
          Free delivery on emergency orders · No minimum
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
