// components/TopBar.tsx
<<<<<<< HEAD
// Sticky top navigation bar — Amazon Navy design
// Uses Clerk UserButton for live auth state + live cart count
=======
// Sticky top navigation bar for Amazon Now + Nia
// Reads live data from useCartStore, useUserStore, useNiaChatStore
>>>>>>> main

'use client';

import { useState } from 'react';
import { useNiaChatStore } from '@/lib/useNiaStore';
import { useCartStore } from '@/lib/stores/useCartStore';
import { useUserStore } from '@/lib/stores/useUserStore';
import { UserButton, SignInButton, useUser } from '@clerk/nextjs';
import Link from 'next/link';

export default function TopBar() {
  const { open: openNia } = useNiaChatStore();
  const openCart = useCartStore((s) => s.openCart);
  const cartTotalItems = useCartStore((s) => s.getTotalItems());
  const { user: niaUser, pincode } = useUserStore();
  const { isSignedIn } = useUser();
  const [editingPincode, setEditingPincode] = useState(false);
  const [pincodeInput, setPincodeInput] = useState(pincode);
  const setPincode = useUserStore((s) => s.setPincode);

  const handlePincodeUpdate = () => {
    if (pincodeInput.trim().length >= 5) {
      setPincode(pincodeInput.trim());
    }
    setEditingPincode(false);
  };

  return (
    <header className="sticky top-0 z-50 bg-[#232F3E] shadow-md">
      <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between">
        {/* Left: Logo */}
        <Link href="/" className="flex items-center">
          <span className="text-2xl font-bold tracking-tight">
            <span className="text-white">amazon</span>
            <span className="text-[#FF9900]"> now</span>
          </span>
        </Link>

        {/* Center: Delivery badge — Amazon "Deliver to" style */}
        <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 hover:outline hover:outline-1 hover:outline-white/40 rounded-sm cursor-pointer transition-all">
          <svg className="w-4 h-4 text-white/70 self-end" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <div className="leading-tight">
            <p className="text-[11px] text-white/60">Deliver to</p>
            {editingPincode ? (
              <input
                type="text"
                value={pincodeInput}
                onChange={(e) => setPincodeInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handlePincodeUpdate()}
                onBlur={handlePincodeUpdate}
                className="w-16 text-sm font-bold bg-transparent border-b border-white text-white focus:outline-none"
                maxLength={6}
                autoFocus
              />
            ) : (
              <button
                onClick={() => { setEditingPincode(true); setPincodeInput(pincode); }}
                className="text-sm font-bold text-white hover:text-white/80 transition-colors"
              >
                {pincode}
              </button>
            )}
          </div>
        </div>

        {/* Right: Seller + Auth + Cart */}
        <div className="flex items-center gap-3">
          {/* 10 min delivery badge */}
          <span className="hidden md:inline-flex items-center gap-1 text-xs font-bold text-white bg-[#007185] px-2 py-1 rounded-sm">
            <span className="italic">prime</span>
            <span className="text-white/70">⚡ 10 min</span>
          </span>

          {/* Seller Dashboard link */}
          <Link
            href="/seller"
            className="hidden sm:block text-xs font-medium text-white/80 hover:text-white hover:underline transition-colors px-2 py-1"
          >
            Seller Central
          </Link>

          {/* Group Cart link */}
          <Link
            href="/social-cart"
            className="hidden sm:flex items-center gap-1 text-xs font-bold text-white/80 hover:text-white hover:underline transition-colors px-2 py-1"
          >
            👥 Group Cart
          </Link>

          {/* Nia button (mobile) — keeps teal (Nia branding exception) */}
          <button
            onClick={() => openNia()}
            className="sm:hidden w-9 h-9 rounded-full bg-[#00838F] flex items-center justify-center shadow-md"
            aria-label="Open Nia assistant"
          >
            <span className="text-white text-sm font-bold">N</span>
          </button>

          {/* Clerk Auth */}
          {isSignedIn ? (
            <UserButton />
          ) : (
            <SignInButton mode="modal">
              <button className="text-xs font-bold text-[#0F1111] bg-[#FFD814] hover:bg-[#F7CA00] px-4 py-1.5 rounded-sm transition-colors shadow-sm">
                Sign in
              </button>
            </SignInButton>
          )}

          {/* Cart with live count */}
          <button
            onClick={openCart}
            className="relative p-1.5 hover:outline hover:outline-1 hover:outline-white/40 rounded-sm transition-all"
            aria-label="Cart"
          >
            <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z" />
            </svg>
            {cartTotalItems > 0 && (
              <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-[#FF9900] text-white text-xs font-bold rounded-full flex items-center justify-center animate-[scale-in_0.2s_ease-out]">
                {cartTotalItems}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
}
