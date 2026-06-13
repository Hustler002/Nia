// components/TopBar.tsx
// Sticky top navigation bar for Amazon Now + Nia
// Production: connect location badge to geolocation API, cart count to DynamoDB cart state

'use client';

import { useNiaStore } from '@/lib/useNiaStore';

export default function TopBar() {
  const { toggleNia } = useNiaStore();

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between">
        {/* Left: Logo */}
        <div className="flex items-center gap-2">
          <div className="flex items-center">
            <span className="text-2xl font-bold tracking-tight">
              <span className="text-[#0F1111]">amazon</span>
              <span className="text-[#FF9900]"> now</span>
            </span>
          </div>
        </div>

        {/* Center: Delivery badge */}
        <div className="hidden sm:flex items-center gap-2 bg-gray-50 rounded-full px-4 py-1.5 border border-gray-200">
          <svg className="w-4 h-4 text-[#00838F]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <span className="text-sm text-gray-600">
            Delivering to: <span className="font-semibold text-[#0F1111]">110001</span>
          </span>
          <span className="text-xs text-[#00838F] font-semibold bg-[#E0F2F1] rounded-full px-2 py-0.5">
            ⚡ 10 min
          </span>
        </div>

        {/* Right: Account + Cart */}
        <div className="flex items-center gap-3">
          {/* Nia button (mobile) */}
          <button
            onClick={toggleNia}
            className="sm:hidden w-9 h-9 rounded-full bg-[#00838F] flex items-center justify-center shadow-md"
            aria-label="Open Nia assistant"
          >
            <span className="text-white text-sm font-bold">N</span>
          </button>

          {/* Account */}
          <button className="p-2 rounded-full hover:bg-gray-100 transition-colors" aria-label="Account">
            <svg className="w-6 h-6 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
            </svg>
          </button>

          {/* Cart */}
          <button className="relative p-2 rounded-full hover:bg-gray-100 transition-colors" aria-label="Cart">
            <svg className="w-6 h-6 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z" />
            </svg>
            {/* Badge */}
            <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-[#FF9900] text-white text-xs font-bold rounded-full flex items-center justify-center">
              3
            </span>
          </button>
        </div>
      </div>
    </header>
  );
}
