// components/TopBar.tsx
// Sticky top navigation bar for Amazon Now + Nia
// Uses Clerk UserButton for live auth state + live cart count

'use client';

import { useNiaStore, useNiaChatStore } from '@/lib/useNiaStore';
import { UserButton, SignInButton, useUser } from '@clerk/nextjs';
import Link from 'next/link';

export default function TopBar() {
  const { toggleNia } = useNiaStore();
  const { liveCart } = useNiaChatStore();
  const { isSignedIn } = useUser();

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between">
        {/* Left: Logo */}
        <Link href="/" className="flex items-center">
          <span className="text-2xl font-bold tracking-tight">
            <span className="text-[#0F1111]">amazon</span>
            <span className="text-[#FF9900]"> now</span>
          </span>
        </Link>

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

        {/* Right: Seller + Auth + Cart */}
        <div className="flex items-center gap-3">
          {/* Seller Dashboard link */}
          <Link
            href="/seller"
            className="hidden sm:block text-xs font-semibold text-gray-500 hover:text-[#00838F] transition-colors px-2 py-1 rounded-lg hover:bg-[#E0F2F1]"
          >
            📊 Seller
          </Link>

          {/* Nia button (mobile) */}
          <button
            onClick={toggleNia}
            className="sm:hidden w-9 h-9 rounded-full bg-[#00838F] flex items-center justify-center shadow-md"
            aria-label="Open Nia assistant"
          >
            <span className="text-white text-sm font-bold">N</span>
          </button>

          {/* Clerk Auth */}
          {isSignedIn ? (
            <UserButton afterSignOutUrl="/" />
          ) : (
            <SignInButton mode="modal">
              <button className="text-xs font-semibold text-white bg-[#00838F] hover:bg-[#006d75] px-3 py-1.5 rounded-full transition-colors">
                Sign in
              </button>
            </SignInButton>
          )}

          {/* Cart with live count */}
          <Link href="/payment" className="relative p-2 rounded-full hover:bg-gray-100 transition-colors" aria-label="Cart">
            <svg className="w-6 h-6 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z" />
            </svg>
            {liveCart.length > 0 && (
              <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-[#FF9900] text-white text-xs font-bold rounded-full flex items-center justify-center">
                {liveCart.reduce((sum, i) => sum + i.qty, 0)}
              </span>
            )}
          </Link>
        </div>
      </div>
    </header>
  );
}
