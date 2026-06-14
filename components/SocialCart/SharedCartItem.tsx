// components/SocialCart/SharedCartItem.tsx
// Individual cart item card with attribution and Nia warning flag

'use client';

import type { SocialCartItem, SocialCartMember } from '@/lib/socialCart/types';

interface Props {
  item: SocialCartItem;
  members: SocialCartMember[];
  canRemove: boolean;
  onRemove: () => void;
}

export default function SharedCartItem({ item, members, canRemove, onRemove }: Props) {
  const adder = members.find((m) => m.user_id === item.added_by_id);
  const adderColor = adder?.avatar_color || '#888';

  return (
    <div className={`
      relative rounded-2xl border bg-white overflow-hidden shadow-sm
      transition-all duration-200 hover:shadow-md
      ${item.flagged_by_nia ? 'border-orange-300 ring-1 ring-orange-200' : 'border-gray-100'}
    `}>
      {/* Nia Warning Banner */}
      {item.flagged_by_nia && item.nia_flag_reason && (
        <div className="flex items-start gap-2 px-3 py-2 bg-orange-50 border-b border-orange-200">
          <span className="text-lg leading-none mt-0.5">⚠️</span>
          <div>
            <p className="text-xs font-semibold text-orange-700">Nia flagged this</p>
            <p className="text-xs text-orange-600 mt-0.5">{item.nia_flag_reason}</p>
          </div>
        </div>
      )}

      <div className="p-3">
        <div className="flex items-start gap-3">
          {/* Product image/emoji */}
          <span className="text-3xl w-12 h-12 flex items-center justify-center bg-gray-50 rounded-xl shrink-0">
            {item.image}
          </span>

          {/* Details */}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">{item.name}</p>
            <p className="text-sm font-bold text-gray-800 mt-0.5">₹{item.price}</p>

            {/* Added by tag */}
            <div className="flex items-center gap-1.5 mt-1.5">
              <div
                className="w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-bold text-white"
                style={{ backgroundColor: adderColor }}
              >
                {item.added_by_name.slice(0, 1).toUpperCase()}
              </div>
              <span className="text-[11px] text-gray-400">
                Added by <span className="font-medium text-gray-600">{item.added_by_name}</span>
              </span>
            </div>
          </div>

          {/* Qty + Remove */}
          <div className="flex flex-col items-end gap-2 shrink-0">
            <span className="text-xs font-semibold text-gray-500 bg-gray-100 rounded-lg px-2 py-1">
              ×{item.qty}
            </span>
            {canRemove && (
              <button
                onClick={onRemove}
                className="text-gray-300 hover:text-red-400 transition-colors"
                aria-label="Remove item"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
