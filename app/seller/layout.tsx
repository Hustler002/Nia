// app/seller/layout.tsx
// Seller Console layout — AWS/Seller Central dark sidebar
// Auth-aware seller layout with dark sidebar navigation
// Production: Amazon Cognito SSO, role-based sidebar items

'use client';

import { useState, useEffect } from 'react';
import { useSellerAuth } from '@/lib/seller/authStore';

// ─── Sidebar Navigation Items ───────────────────────────────────────────────

const navItems = [
  {
    label: 'Dashboard',
    href: '/seller',
    emoji: '🏠',
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
      </svg>
    ),
  },
  {
    label: 'Intent Gaps',
    href: '/seller/intent-gaps',
    emoji: '📊',
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3v11.25A2.25 2.25 0 006 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0118 16.5h-2.25m-7.5 0h7.5m-7.5 0l-1 3m8.5-3l1 3m0 0l.5 1.5m-.5-1.5h-9.5m0 0l-.5 1.5M9 11.25v-5.5m1.5 5.5V8.625m1.5 2.625V9.75m1.5 1.5v-2.5" />
      </svg>
    ),
  },
  {
    label: 'My Listings',
    href: '/seller/listings',
    emoji: '📦',
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
      </svg>
    ),
  },
  {
    label: 'Optimization Chat',
    href: '/seller/optimization',
    emoji: '💬',
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.087.16 2.185.283 3.293.369V21l4.076-4.076a1.526 1.526 0 011.037-.443 48.282 48.282 0 005.68-.494c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z" />
      </svg>
    ),
  },
  {
    label: 'Analytics',
    href: '/seller/analytics',
    emoji: '📈',
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6a7.5 7.5 0 107.5 7.5h-7.5V6z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 10.5H21A7.5 7.5 0 0013.5 3v7.5z" />
      </svg>
    ),
  },
];

// ─── Auth-exempt routes (no sidebar, no auth check) ─────────────────────────

const AUTH_EXEMPT_PATHS = ['/seller/login', '/seller/signup'];

export default function SellerLayout({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isHydrated, seller, logout, hydrate } = useSellerAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [currentPath, setCurrentPath] = useState('');

  // Hydrate auth from sessionStorage on mount
  useEffect(() => {
    hydrate();
  }, [hydrate]);

  // Track current path for active nav state + auth-exempt check
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setCurrentPath(window.location.pathname);
    }
  }, []);

  // ── Auth-exempt pages (login, signup) — render bare ──
  const isAuthExempt = AUTH_EXEMPT_PATHS.some((p) => currentPath.startsWith(p));
  if (isAuthExempt) {
    return <>{children}</>;
  }

  // ── Waiting for hydration — show centered spinner ──
  if (!isHydrated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-3">
          <svg className="w-8 h-8 animate-spin text-[#00838F]" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          <p className="text-sm text-gray-400">Loading seller console...</p>
        </div>
      </div>
    );
  }

  // ── Not authenticated — redirect to login ──
  if (!isAuthenticated) {
    if (typeof window !== 'undefined') {
      window.location.href = '/seller/login';
    }
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-sm text-gray-400">Redirecting to login...</p>
      </div>
    );
  }

  // ── Determine active nav item ──
  const isActive = (href: string) => {
    if (href === '/seller') return currentPath === '/seller';
    return currentPath.startsWith(href);
  };

  const handleLogout = () => {
    logout();
    window.location.href = '/seller/login';
  };

  // ── Authenticated layout with sidebar ──
  return (
    <div className="flex min-h-screen bg-[#EAEDED]">
      {/* ── Mobile Sidebar Overlay ── */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* ── Sidebar — Dense AWS/Seller Central style ── */}
      <aside
        className={`fixed lg:sticky top-0 left-0 z-50 h-screen w-56 bg-[#1B2631] text-white flex flex-col transition-transform duration-300 lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Logo / Header */}
        <div className="px-5 py-4 border-b border-white/10">
          <a href="/seller" className="block">
            <div className="flex items-center gap-1.5">
              <span className="text-lg font-bold text-[#FF9900]">amazon</span>
              <span className="text-lg font-bold text-white">now</span>
            </div>
            <p className="text-[10px] text-gray-500 mt-0.5 uppercase tracking-wider">Seller Central</p>
          </a>
        </div>

        {/* Seller Profile (at top of sidebar) */}
        {seller && (
          <div className="px-5 py-4 border-b border-white/10">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-sm bg-[#FF9900] flex items-center justify-center text-xs font-bold text-white shadow-md">
                {seller.avatarInitials}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">{seller.name}</p>
                <p className="text-[11px] text-gray-400 truncate">{seller.storeName}</p>
              </div>
              <span className="px-2 py-0.5 bg-[#00838F] text-white text-[9px] font-bold rounded-sm uppercase tracking-wide">
                {seller.plan}
              </span>
            </div>
          </div>
        )}

        {/* Nav Items */}
        <nav className="flex-1 px-2 py-3 space-y-0.5">
          {navItems.map((item) => {
            const active = isActive(item.href);
            return (
              <a
                key={item.label}
                href={item.href}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-2.5 px-2.5 py-2 rounded-sm text-xs font-medium transition-all ${
                  active
                    ? 'bg-[#232F3E] text-white border-l-3 border-[#FF9900] -ml-[3px]'
                    : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
              >
                {item.icon}
                {item.label}
              </a>
            );
          })}
        </nav>

        {/* Sign Out Button */}
        <div className="px-3 py-4 border-t border-white/10">
          <button
            onClick={handleLogout}
            className="flex items-center gap-2.5 w-full px-2.5 py-2 rounded-sm text-xs font-medium text-gray-400 hover:text-white hover:bg-white/5 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" />
            </svg>
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile Top Bar */}
        <div className="lg:hidden flex items-center gap-3 px-4 py-2.5 bg-[#232F3E] border-b border-[#3B4859] sticky top-0 z-30">
          <button
            onClick={() => setSidebarOpen(true)}
            className="w-8 h-8 rounded-sm bg-white/10 flex items-center justify-center"
            aria-label="Open menu"
          >
            <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
            </svg>
          </button>
          <div className="flex items-center gap-1.5 flex-1">
            <span className="text-xs font-bold text-[#FF9900]">amazon</span>
            <span className="text-xs font-bold text-white">now</span>
            <span className="text-[10px] text-gray-400 ml-1 uppercase tracking-wider">· Seller Central</span>
          </div>
          {seller && (
            <div className="w-7 h-7 rounded-full bg-[#FF9900] flex items-center justify-center text-[10px] font-bold text-white">
              {seller.avatarInitials}
            </div>
          )}
        </div>

        {/* Page Content */}
        <main className="flex-1">{children}</main>
      </div>
    </div>
  );
}

// Production extension:
// - Amazon Cognito + Seller Central SSO for auth
// - Active nav state from server-side pathname (middleware)
// - Collapsible sidebar with icon-only mode on desktop
// - Notification bell with unread count for new intent gaps
// - Seller tier badge (Gold/Silver/Bronze) from Seller API
// - Quick-switch between multiple seller accounts
// - Role-based sidebar (hide Analytics for staff accounts)
