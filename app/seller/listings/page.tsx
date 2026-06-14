'use client';

// app/seller/listings/page.tsx — My Listings grid page
// Displays all seller product listings with search, filter, sort
// Cards show stock status, Nia Match Score, and quick actions
// All filtering & sorting is client-side via useMemo for instant UX

import { useState, useMemo, useCallback } from 'react';

// ─── Types ──────────────────────────────────────────────────────────────────

interface Product {
  id: string;
  name: string;
  sku: string;
  price: number;
  stock: number;
  status: 'Active' | 'Out of Stock' | 'Under Review' | 'Inactive';
  niaScore: number;
  /** Monthly units sold — used for "Best Selling" sort */
  monthlySales: number;
}

// ─── Mock Data ──────────────────────────────────────────────────────────────

const MOCK_PRODUCTS: Product[] = [
  { id: '1',  name: 'boAt Airdopes 141',            sku: 'TZ-BOAT-141',  price: 1299, stock: 47,  status: 'Active',       niaScore: 94, monthlySales: 312 },
  { id: '2',  name: 'Noise Buds VS104',             sku: 'TZ-NOIS-104',  price: 1099, stock: 31,  status: 'Active',       niaScore: 87, monthlySales: 245 },
  { id: '3',  name: 'JBL Tune 115TWS',              sku: 'TZ-JBL-115',   price: 1799, stock: 22,  status: 'Active',       niaScore: 91, monthlySales: 198 },
  { id: '4',  name: 'Mi Dual Driver Earphones',     sku: 'TZ-MI-DDR',    price: 780,  stock: 56,  status: 'Active',       niaScore: 72, monthlySales: 167 },
  { id: '5',  name: 'Portronics Charge 5',          sku: 'TZ-PORT-C5',   price: 849,  stock: 3,   status: 'Active',       niaScore: 65, monthlySales: 89  },
  { id: '6',  name: 'Ambrane 10000mAh Power Bank',  sku: 'TZ-AMBR-PB',   price: 999,  stock: 18,  status: 'Active',       niaScore: 78, monthlySales: 134 },
  { id: '7',  name: 'Zebronics Bluetooth Speaker',  sku: 'TZ-ZEB-SPK',   price: 1299, stock: 12,  status: 'Active',       niaScore: 82, monthlySales: 156 },
  { id: '8',  name: 'Syska LED 10W Bulb x4',        sku: 'TZ-SYSK-L10',  price: 299,  stock: 89,  status: 'Active',       niaScore: 60, monthlySales: 423 },
  { id: '9',  name: 'AmazonBasics USB Hub 4-port',  sku: 'TZ-AB-HUB4',   price: 599,  stock: 0,   status: 'Out of Stock', niaScore: 68, monthlySales: 0   },
  { id: '10', name: 'Portronics Muffs M2',          sku: 'TZ-PORT-M2',   price: 1199, stock: 8,   status: 'Active',       niaScore: 75, monthlySales: 102 },
  { id: '11', name: 'iVOOMi Tempered Glass x2',     sku: 'TZ-IVOO-TG',   price: 149,  stock: 120, status: 'Active',       niaScore: 45, monthlySales: 578 },
  { id: '12', name: 'Boat Rockerz 450 Pro',         sku: 'TZ-BOAT-450',  price: 0,    stock: 0,   status: 'Under Review', niaScore: 0,  monthlySales: 0   },
];

type StatusFilter = 'All' | 'Active' | 'Out of Stock' | 'Under Review';
type SortOption = 'Most Recent' | 'Best Selling' | 'Lowest Nia Score' | 'Price Low to High';

// ─── Helper: Extract initials from product name ─────────────────────────────

function getInitials(name: string): string {
  return name
    .split(' ')
    .filter((w) => w.length > 0)
    .map((w) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 3); // Cap at 3 initials for readability
}

// ─── Helper: Stock status styling ───────────────────────────────────────────

function stockLabel(stock: number, status: string) {
  if (status === 'Out of Stock' || stock === 0) {
    return { text: 'Out of Stock', color: 'text-red-600', bg: 'bg-red-50' };
  }
  if (stock <= 5) {
    return { text: `Low Stock (${stock})`, color: 'text-amber-600', bg: 'bg-amber-50' };
  }
  return { text: `In Stock (${stock})`, color: 'text-green-600', bg: 'bg-green-50' };
}

// ─── Helper: Status badge styling ───────────────────────────────────────────

function statusBadge(status: string) {
  switch (status) {
    case 'Active':
      return { text: 'Active', dot: 'bg-green-500', bg: 'bg-green-50', textColor: 'text-green-700' };
    case 'Under Review':
      return { text: 'Under Review', dot: 'bg-amber-500', bg: 'bg-amber-50', textColor: 'text-amber-700' };
    case 'Out of Stock':
      return { text: 'Active', dot: 'bg-green-500', bg: 'bg-green-50', textColor: 'text-green-700' };
    default:
      return { text: 'Inactive', dot: 'bg-gray-400', bg: 'bg-gray-100', textColor: 'text-gray-600' };
  }
}

// ─── Helper: Nia score badge ────────────────────────────────────────────────

function niaBadge(score: number) {
  if (score >= 90) return { label: 'Excellent', bg: 'bg-[#E0F2F1]', text: 'text-[#00838F]', ring: 'ring-[#00838F]/20' };
  if (score >= 75) return { label: 'Good', bg: 'bg-green-50', text: 'text-green-700', ring: 'ring-green-200' };
  // Below 75 — needs improvement
  return { label: 'Needs work', bg: 'bg-amber-50', text: 'text-amber-700', ring: 'ring-amber-200' };
}

// ─── Toast Component ────────────────────────────────────────────────────────

function Toast({ message, onClose }: { message: string; onClose: () => void }) {
  return (
    <div className="fixed bottom-6 right-6 z-50 animate-[slideUp_0.3s_ease-out]">
      <div className="bg-[#0F1111] text-white px-5 py-3 rounded-xl shadow-2xl flex items-center gap-3 max-w-sm">
        <span className="text-sm">{message}</span>
        <button onClick={onClose} className="text-white/60 hover:text-white ml-2 flex-shrink-0">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  );
}

// ─── Main Component ─────────────────────────────────────────────────────────

export default function MyListingsPage() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('All');
  const [sortBy, setSortBy] = useState<SortOption>('Most Recent');
  const [toast, setToast] = useState<string | null>(null);

  // Show toast with auto-dismiss
  const showToast = useCallback((msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3500);
  }, []);

  // Count active listings for subtitle
  const activeCount = useMemo(
    () => MOCK_PRODUCTS.filter((p) => p.status === 'Active').length,
    []
  );

  // ── Filtered & sorted products ────────────────────────────────────────────
  const filteredProducts = useMemo(() => {
    let items = [...MOCK_PRODUCTS];

    // Search by name or SKU
    if (search.trim()) {
      const q = search.toLowerCase();
      items = items.filter(
        (p) => p.name.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q)
      );
    }

    // Status filter
    if (statusFilter !== 'All') {
      items = items.filter((p) => p.status === statusFilter);
    }

    // Sort
    switch (sortBy) {
      case 'Best Selling':
        items.sort((a, b) => b.monthlySales - a.monthlySales);
        break;
      case 'Lowest Nia Score':
        items.sort((a, b) => a.niaScore - b.niaScore);
        break;
      case 'Price Low to High':
        items.sort((a, b) => a.price - b.price);
        break;
      case 'Most Recent':
      default:
        // Keep original order (mock order = most recent first)
        break;
    }

    return items;
  }, [search, statusFilter, sortBy]);

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* ── Page Header ── */}
      <div className="bg-white border-b border-gray-100 px-6 py-5">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold text-[#0F1111]">My Listings</h1>
            <p className="text-sm text-gray-500 mt-0.5">{activeCount} active listings</p>
          </div>
          <a
            href="/seller/listings/new"
            className="inline-flex items-center gap-2 bg-[#FF9900] hover:bg-[#E88B00] text-white font-semibold text-sm px-5 py-2.5 rounded-xl transition-colors shadow-sm"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            Add New Listing
          </a>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
        {/* ── Filter / Search Bar ── */}
        <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm">
          <div className="flex flex-col md:flex-row gap-3">
            {/* Search input */}
            <div className="relative flex-1">
              <svg
                className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
                fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
              </svg>
              <input
                type="text"
                placeholder="Search by product name or SKU..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm text-[#0F1111] placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#00838F]/30 focus:border-[#00838F] transition-all"
              />
            </div>

            {/* Status filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
              className="px-4 py-2.5 rounded-xl border border-gray-200 text-sm text-[#0F1111] bg-white focus:outline-none focus:ring-2 focus:ring-[#00838F]/30 focus:border-[#00838F] min-w-[160px]"
            >
              <option value="All">All Status</option>
              <option value="Active">Active</option>
              <option value="Out of Stock">Out of Stock</option>
              <option value="Under Review">Under Review</option>
            </select>

            {/* Sort dropdown */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              className="px-4 py-2.5 rounded-xl border border-gray-200 text-sm text-[#0F1111] bg-white focus:outline-none focus:ring-2 focus:ring-[#00838F]/30 focus:border-[#00838F] min-w-[180px]"
            >
              <option value="Most Recent">Sort: Most Recent</option>
              <option value="Best Selling">Sort: Best Selling</option>
              <option value="Lowest Nia Score">Sort: Lowest Nia Score</option>
              <option value="Price Low to High">Sort: Price Low to High</option>
            </select>
          </div>
        </div>

        {/* ── Results count ── */}
        {filteredProducts.length !== MOCK_PRODUCTS.length && (
          <p className="text-sm text-gray-500">
            Showing {filteredProducts.length} of {MOCK_PRODUCTS.length} listings
          </p>
        )}

        {/* ── Listings Grid ── */}
        {filteredProducts.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 p-16 text-center shadow-sm">
            <p className="text-gray-400 text-lg mb-2">No listings found</p>
            <p className="text-gray-400 text-sm">Try adjusting your search or filter criteria.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredProducts.map((product) => {
              const stock = stockLabel(product.stock, product.status);
              const badge = statusBadge(product.status);
              const nia = niaBadge(product.niaScore);

              return (
                <div
                  key={product.id}
                  className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm hover:shadow-md hover:border-gray-200 transition-all group"
                >
                  {/* Top row: product info + status */}
                  <div className="flex gap-4 mb-4">
                    {/* Product placeholder image with initials */}
                    <div className="w-20 h-20 rounded-xl bg-gray-100 flex items-center justify-center flex-shrink-0">
                      <span className="text-lg font-bold text-gray-400">
                        {getInitials(product.name)}
                      </span>
                    </div>

                    <div className="flex-1 min-w-0">
                      {/* Product name — 2 line clamp */}
                      <p className="text-sm font-semibold text-[#0F1111] line-clamp-2 leading-snug">
                        {product.name}
                      </p>
                      {/* SKU */}
                      <p className="text-xs text-gray-400 mt-1 font-mono">{product.sku}</p>
                      {/* Status badge */}
                      <div className="mt-1.5">
                        <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-medium ${badge.bg} ${badge.textColor}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${badge.dot}`} />
                          {badge.text}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Price row */}
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-lg font-bold text-[#0F1111]">
                        {product.price > 0 ? `₹${product.price.toLocaleString()}` : '—'}
                      </span>
                      {/* Small edit pencil for price */}
                      <button
                        className="text-gray-300 hover:text-[#00838F] transition-colors"
                        title="Edit price"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                        </svg>
                      </button>
                    </div>

                    {/* Stock status */}
                    <span className={`text-xs font-medium px-2 py-1 rounded-lg ${stock.bg} ${stock.color}`}>
                      {stock.text}
                    </span>
                  </div>

                  {/* Nia Match Score */}
                  <div className="flex items-center justify-between mb-4 py-2 px-3 rounded-xl bg-gray-50">
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-500">Nia Match</span>
                      {/* Score bar — visual indicator of the score */}
                      <div className="w-16 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all ${
                            product.niaScore >= 90
                              ? 'bg-[#00838F]'
                              : product.niaScore >= 75
                                ? 'bg-green-500'
                                : 'bg-amber-500'
                          }`}
                          style={{ width: `${product.niaScore}%` }}
                        />
                      </div>
                    </div>
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ring-1 ${nia.bg} ${nia.text} ${nia.ring}`}>
                      {product.niaScore > 0 ? `${product.niaScore}% ${nia.label}` : '—'}
                    </span>
                  </div>

                  {/* Action buttons */}
                  <div className="flex items-center justify-end gap-1 pt-3 border-t border-gray-100">
                    {/* View button */}
                    <button
                      onClick={() => showToast('Opens product page on Amazon Now')}
                      className="w-9 h-9 rounded-lg flex items-center justify-center text-gray-400 hover:text-[#00838F] hover:bg-[#E0F2F1] transition-colors"
                      title="View on Amazon Now"
                    >
                      <svg className="w-4.5 h-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    </button>

                    {/* Edit button */}
                    <a
                      href={`/seller/listings/${product.sku}/edit`}
                      className="w-9 h-9 rounded-lg flex items-center justify-center text-gray-400 hover:text-[#FF9900] hover:bg-orange-50 transition-colors"
                      title="Edit listing"
                    >
                      <svg className="w-4.5 h-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                      </svg>
                    </a>

                    {/* Optimize with Nia button */}
                    <a
                      href={`/seller/optimization?listing=${product.sku}`}
                      className="w-9 h-9 rounded-lg flex items-center justify-center text-gray-400 hover:text-[#00838F] hover:bg-[#E0F2F1] transition-colors"
                      title="Optimize with Nia"
                    >
                      {/* Robot / AI icon */}
                      <svg className="w-4.5 h-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" />
                      </svg>
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Toast notification */}
      {toast && <Toast message={toast} onClose={() => setToast(null)} />}

      {/* Slide-up animation for toast */}
      <style>{`
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}

// Production extension:
// - Pagination or infinite scroll for large product catalogs (100s of SKUs)
// - Server-side filtering/sorting via API with query params
// - Bulk actions: select multiple listings for price update, status change
// - Column/list view toggle alongside grid view
// - Export listings as CSV/Excel
// - Real-time stock sync with warehouse management system
// - Nia score refresh button that triggers re-evaluation
// - Drag-and-drop reordering for featured listings
// - Deep link support for sharing filtered views with team members
