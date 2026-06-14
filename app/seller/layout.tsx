// app/seller/layout.tsx
// Seller Console layout — AWS/Seller Central dark sidebar
// Dense navigation, square elements, orange active indicators

'use client';

import { useState } from 'react';

// ─── Sidebar Navigation Items ───────────────────────────────────────────────

const navItems = [
  {
    label: 'Dashboard',
    href: '/seller',
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
      </svg>
    ),
  },
  {
    label: 'Intent Gaps',
    href: '/seller',
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3v11.25A2.25 2.25 0 006 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0118 16.5h-2.25m-7.5 0h7.5m-7.5 0l-1 3m8.5-3l1 3m0 0l.5 1.5m-.5-1.5h-9.5m0 0l-.5 1.5M9 11.25v-5.5m1.5 5.5V8.625m1.5 2.625V9.75m1.5 1.5v-2.5" />
      </svg>
    ),
    active: true,
  },
  {
    label: 'My Listings',
    href: '/seller',
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z" />
      </svg>
    ),
  },
  {
    label: 'Optimization Chat',
    href: '/seller/optimization',
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.087.16 2.185.283 3.293.369V21l4.076-4.076a1.526 1.526 0 011.037-.443 48.282 48.282 0 005.68-.494c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z" />
      </svg>
    ),
  },
  {
    label: 'Analytics',
    href: '/seller',
    icon: (
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 6a7.5 7.5 0 107.5 7.5h-7.5V6z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 10.5H21A7.5 7.5 0 0013.5 3v7.5z" />
      </svg>
    ),
  },
];

export default function SellerLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

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
        <div className="px-4 py-3 border-b border-white/10">
          <div className="flex items-center gap-1.5">
            <span className="text-sm font-bold text-[#FF9900]">amazon</span>
            <span className="text-sm font-bold text-white">now</span>
          </div>
          <p className="text-[10px] text-gray-500 mt-0.5 uppercase tracking-wider">Seller Central</p>
        </div>

        {/* Nav Items */}
        <nav className="flex-1 px-2 py-3 space-y-0.5">
          {navItems.map((item) => (
            <a
              key={item.label}
              href={item.href}
              className={`flex items-center gap-2.5 px-2.5 py-2 rounded-sm text-xs font-medium transition-colors ${
                item.active
                  ? 'bg-[#232F3E] text-white border-l-3 border-[#FF9900]'
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              {item.icon}
              {item.label}
              {item.active && (
                <div className="ml-auto w-1.5 h-1.5 rounded-full bg-[#FF9900]" />
              )}
            </a>
          ))}
        </nav>

        {/* Seller Info */}
        <div className="px-3 py-3 border-t border-white/10">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-sm bg-[#FF9900] flex items-center justify-center text-[10px] font-bold text-white">
              SK
            </div>
            <div>
              <p className="text-xs font-medium">Sharma Kitchen</p>
              <p className="text-[10px] text-gray-500">seller@example.com</p>
            </div>
          </div>
        </div>
      </aside>

      {/* ── Main Content ── */}
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
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-bold text-[#FF9900]">amazon</span>
            <span className="text-xs font-bold text-white">now</span>
            <span className="text-[10px] text-gray-400 ml-1 uppercase tracking-wider">· Seller Central</span>
          </div>
        </div>

        {/* Page Content */}
        <main className="flex-1">{children}</main>
      </div>
    </div>
  );
}

// Production extension:
// - Real auth gate with Amazon Seller Central SSO
// - Active nav state based on current pathname (use usePathname from next/navigation)
// - Collapsible sidebar with icon-only mode on desktop
// - Notification bell with unread count for new intent gaps
// - Seller tier badge (Gold/Silver/Bronze)
// - Quick-switch between multiple seller accounts
