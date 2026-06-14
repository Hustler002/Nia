'use client';

// app/seller/listings/[id]/edit/page.tsx — Edit Listing page
// Same form layout as the "new" page but pre-populated with existing product data
// Parses listing ID from window.location.pathname (e.g. /seller/listings/TZ-BOAT-141/edit)
// For demo purposes, always pre-fills with boAt Airdopes 141 data regardless of actual ID
// Does NOT use next/navigation — uses window.location for URL parsing

import { useState, useCallback, useEffect } from 'react';

// ─── Types ──────────────────────────────────────────────────────────────────

interface FormData {
  title: string;
  description: string;
  keywords: string[];
  category: string;
  subcategory: string;
  price: string;
  mrp: string;
  stock: string;
}

interface FormErrors {
  title?: string;
  price?: string;
  stock?: string;
  category?: string;
}

// ─── Constants ──────────────────────────────────────────────────────────────

const CATEGORIES = ['Electronics Accessories', 'Mobile Accessories', 'Audio', 'Cables & Chargers'];
const SUBCATEGORIES = ['TWS Earbuds', 'Wired Earphones', 'Headphones', 'Speakers', 'Power Banks', 'Chargers', 'Other'];
const MAX_TITLE_CHARS = 200;
const MAX_DESC_CHARS = 2000;
const MAX_IMAGES = 5;

// ─── Pre-filled data (boAt Airdopes 141 demo) ──────────────────────────────

const PREFILLED: FormData = {
  title: 'boAt Airdopes 141 TWS Earbuds',
  description:
    'True wireless earbuds with 42-hour playback, 8mm drivers, IPX4 water resistance, and ENx technology for clear calls.',
  keywords: ['wireless earbuds', 'boAt', 'TWS', 'bluetooth earphones'],
  category: 'Electronics Accessories',
  subcategory: 'TWS Earbuds',
  price: '1299',
  mrp: '2490',
  stock: '47',
};

// ─── Toast Component ────────────────────────────────────────────────────────

function Toast({ message, onClose }: { message: string; onClose: () => void }) {
  return (
    <div className="fixed bottom-6 right-6 z-50 animate-[slideUp_0.3s_ease-out]">
      <div className="bg-[#0F1111] text-white px-5 py-3 rounded-xl shadow-2xl flex items-center gap-3 max-w-sm">
        <svg className="w-5 h-5 text-green-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
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

export default function EditListingPage() {
  const [form, setForm] = useState<FormData>(PREFILLED);
  const [keywordInput, setKeywordInput] = useState('');
  const [errors, setErrors] = useState<FormErrors>({});
  const [toast, setToast] = useState<string | null>(null);
  const [listingId, setListingId] = useState('TZ-BOAT-141');

  // Parse listing ID from URL on mount
  // Path format: /seller/listings/[id]/edit
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const segments = window.location.pathname.split('/');
      // Find the segment between "listings" and "edit"
      const listingsIdx = segments.indexOf('listings');
      if (listingsIdx >= 0 && segments[listingsIdx + 1]) {
        setListingId(segments[listingsIdx + 1]);
      }
    }
  }, []);

  // ── Field updaters ──────────────────────────────────────────────────────

  const updateField = useCallback(<K extends keyof FormData>(key: K, value: FormData[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    if (errors[key as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [key]: undefined }));
    }
  }, [errors]);

  // ── Keyword tag management ────────────────────────────────────────────────

  const addKeyword = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const keyword = keywordInput.trim().toLowerCase();
      if (keyword && !form.keywords.includes(keyword)) {
        updateField('keywords', [...form.keywords, keyword]);
      }
      setKeywordInput('');
    }
  }, [keywordInput, form.keywords, updateField]);

  const removeKeyword = useCallback((keyword: string) => {
    updateField('keywords', form.keywords.filter((k) => k !== keyword));
  }, [form.keywords, updateField]);

  // ── Form validation ───────────────────────────────────────────────────────

  const validate = useCallback((): boolean => {
    const newErrors: FormErrors = {};
    if (!form.title.trim()) newErrors.title = 'Product title is required';
    if (!form.price || parseFloat(form.price) <= 0) newErrors.price = 'Enter a valid price';
    if (!form.stock || parseInt(form.stock) < 0) newErrors.stock = 'Enter stock quantity';
    if (!form.category) newErrors.category = 'Select a category';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [form]);

  // ── Save handler ──────────────────────────────────────────────────────────

  const handleSave = useCallback(() => {
    if (validate()) {
      setToast('Listing updated! Changes go live within 15 minutes.');
      setTimeout(() => setToast(null), 4000);
    }
  }, [validate]);

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* ── Page Header ── */}
      <div className="bg-white border-b border-gray-100 px-6 py-5">
        <div className="max-w-6xl mx-auto">
          <a
            href="/seller/listings"
            className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-[#00838F] transition-colors mb-3"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
            </svg>
            Back to listings
          </a>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-[#0F1111]">Edit Listing</h1>
            <span className="px-2.5 py-1 rounded-lg bg-gray-100 text-xs font-mono text-gray-500">
              {listingId}
            </span>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        {/* ── Two Column Form ── */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">

          {/* ── Left Column (~60%) ── */}
          <div className="lg:col-span-3 space-y-5">
            {/* Product Title */}
            <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
              <label className="block text-sm font-semibold text-[#0F1111] mb-2">
                Product Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={form.title}
                onChange={(e) => updateField('title', e.target.value.slice(0, MAX_TITLE_CHARS))}
                placeholder="e.g. boAt Airdopes 141 TWS Earbuds with 42H Playback"
                className={`w-full px-4 py-3 rounded-xl border text-sm text-[#0F1111] placeholder:text-gray-400 focus:outline-none focus:ring-2 transition-all ${
                  errors.title
                    ? 'border-red-300 focus:ring-red-200 focus:border-red-400'
                    : 'border-gray-200 focus:ring-[#00838F]/30 focus:border-[#00838F]'
                }`}
              />
              <div className="flex justify-between mt-1.5">
                {errors.title && <p className="text-xs text-red-500">{errors.title}</p>}
                <p className={`text-xs ml-auto ${form.title.length > MAX_TITLE_CHARS * 0.9 ? 'text-amber-500' : 'text-gray-400'}`}>
                  {form.title.length}/{MAX_TITLE_CHARS}
                </p>
              </div>
            </div>

            {/* Description */}
            <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
              <label className="block text-sm font-semibold text-[#0F1111] mb-2">
                Description
              </label>
              <textarea
                value={form.description}
                onChange={(e) => updateField('description', e.target.value.slice(0, MAX_DESC_CHARS))}
                placeholder="Describe your product features, specifications, and selling points..."
                rows={6}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm text-[#0F1111] placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#00838F]/30 focus:border-[#00838F] transition-all resize-none"
              />
              <p className={`text-xs text-right mt-1.5 ${form.description.length > MAX_DESC_CHARS * 0.9 ? 'text-amber-500' : 'text-gray-400'}`}>
                {form.description.length}/{MAX_DESC_CHARS}
              </p>
            </div>

            {/* Search Keywords (Tag Input) */}
            <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
              <label className="block text-sm font-semibold text-[#0F1111] mb-2">
                Search Keywords
              </label>
              {form.keywords.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-3">
                  {form.keywords.map((kw) => (
                    <span
                      key={kw}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-[#E0F2F1] text-[#00838F] text-xs font-medium"
                    >
                      {kw}
                      <button
                        onClick={() => removeKeyword(kw)}
                        className="hover:text-red-500 transition-colors ml-0.5"
                      >
                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </span>
                  ))}
                </div>
              )}
              <input
                type="text"
                value={keywordInput}
                onChange={(e) => setKeywordInput(e.target.value)}
                onKeyDown={addKeyword}
                placeholder="Type a keyword and press Enter to add..."
                className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm text-[#0F1111] placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#00838F]/30 focus:border-[#00838F] transition-all"
              />
              <p className="text-xs text-gray-400 mt-1.5">Press Enter to add each keyword as a tag</p>
            </div>

            {/* Category & Subcategory */}
            <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-[#0F1111] mb-2">
                    Category <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={form.category}
                    onChange={(e) => updateField('category', e.target.value)}
                    className={`w-full px-4 py-3 rounded-xl border text-sm bg-white focus:outline-none focus:ring-2 transition-all ${
                      errors.category
                        ? 'border-red-300 text-red-600 focus:ring-red-200'
                        : 'border-gray-200 text-[#0F1111] focus:ring-[#00838F]/30 focus:border-[#00838F]'
                    }`}
                  >
                    <option value="">Select category</option>
                    {CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                  {errors.category && <p className="text-xs text-red-500 mt-1">{errors.category}</p>}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-[#0F1111] mb-2">
                    Subcategory
                  </label>
                  <select
                    value={form.subcategory}
                    onChange={(e) => updateField('subcategory', e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm text-[#0F1111] bg-white focus:outline-none focus:ring-2 focus:ring-[#00838F]/30 focus:border-[#00838F] transition-all"
                  >
                    <option value="">Select subcategory</option>
                    {SUBCATEGORIES.map((sub) => (
                      <option key={sub} value={sub}>{sub}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* ── Right Column (~40%) ── */}
          <div className="lg:col-span-2 space-y-5">
            {/* Pricing */}
            <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
              <h3 className="text-sm font-semibold text-[#0F1111] mb-4">Pricing</h3>

              <div className="mb-4">
                <label className="block text-xs font-medium text-gray-500 mb-1.5">
                  Price (₹) <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm text-gray-400 font-medium">₹</span>
                  <input
                    type="number"
                    value={form.price}
                    onChange={(e) => updateField('price', e.target.value)}
                    placeholder="0.00"
                    min="0"
                    className={`w-full pl-8 pr-4 py-3 rounded-xl border text-sm text-[#0F1111] placeholder:text-gray-400 focus:outline-none focus:ring-2 transition-all ${
                      errors.price
                        ? 'border-red-300 focus:ring-red-200'
                        : 'border-gray-200 focus:ring-[#00838F]/30 focus:border-[#00838F]'
                    }`}
                  />
                </div>
                {errors.price && <p className="text-xs text-red-500 mt-1">{errors.price}</p>}
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1.5">
                  MRP / Strike-through Price (₹)
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm text-gray-400 font-medium">₹</span>
                  <input
                    type="number"
                    value={form.mrp}
                    onChange={(e) => updateField('mrp', e.target.value)}
                    placeholder="0.00"
                    min="0"
                    className="w-full pl-8 pr-4 py-3 rounded-xl border border-gray-200 text-sm text-[#0F1111] placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#00838F]/30 focus:border-[#00838F] transition-all"
                  />
                </div>
              </div>
            </div>

            {/* Stock */}
            <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
              <label className="block text-sm font-semibold text-[#0F1111] mb-2">
                Stock Quantity <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                value={form.stock}
                onChange={(e) => updateField('stock', e.target.value)}
                placeholder="0"
                min="0"
                className={`w-full px-4 py-3 rounded-xl border text-sm text-[#0F1111] placeholder:text-gray-400 focus:outline-none focus:ring-2 transition-all ${
                  errors.stock
                    ? 'border-red-300 focus:ring-red-200'
                    : 'border-gray-200 focus:ring-[#00838F]/30 focus:border-[#00838F]'
                }`}
              />
              {errors.stock && <p className="text-xs text-red-500 mt-1">{errors.stock}</p>}
            </div>

            {/* Image Upload Slots */}
            <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
              <h3 className="text-sm font-semibold text-[#0F1111] mb-2">Product Images</h3>
              <p className="text-xs text-gray-400 mb-4">Max {MAX_IMAGES} images. First image is the main display.</p>

              <div className="grid grid-cols-3 gap-3">
                {Array.from({ length: MAX_IMAGES }).map((_, i) => (
                  <div
                    key={i}
                    className="aspect-square rounded-xl bg-gray-100 border-2 border-dashed border-gray-200 flex flex-col items-center justify-center gap-1.5 hover:border-[#00838F] hover:bg-[#E0F2F1]/30 transition-colors cursor-pointer group"
                  >
                    <svg className="w-5 h-5 text-gray-300 group-hover:text-[#00838F] transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                    </svg>
                    <span className="text-[10px] text-gray-400 group-hover:text-[#00838F] font-medium">Upload</span>
                    {i === 0 && (
                      <span className="text-[9px] text-[#00838F] font-semibold">MAIN</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ── Nia Suggestion Callout ── */}
        <div className="mt-6 bg-[#E0F2F1] border border-[#00838F]/20 rounded-2xl p-5">
          <div className="flex flex-col sm:flex-row items-start gap-4">
            <span className="text-2xl flex-shrink-0">🤖</span>
            <div className="flex-1">
              <p className="text-sm font-semibold text-[#00838F]">Nia Suggestion Available</p>
              <p className="text-sm text-[#0F1111]/70 mt-1">
                Your current title gets a <span className="font-semibold text-amber-600">65% match score</span>. Nia found a better title that could increase your visibility by <span className="font-semibold text-green-600">~40%</span>.
              </p>
            </div>
            <a
              href={`/seller/optimization?listing=${listingId}`}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#00838F] hover:bg-[#006D75] text-white text-sm font-semibold transition-colors flex-shrink-0 shadow-sm"
            >
              See Nia&apos;s suggestion
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
              </svg>
            </a>
          </div>
        </div>

        {/* ── Form Actions ── */}
        <div className="mt-6 flex flex-col sm:flex-row items-center gap-3 sm:justify-end">
          <a
            href="/seller/listings"
            className="w-full sm:w-auto px-6 py-3 rounded-xl border border-gray-300 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors text-center"
          >
            Cancel
          </a>
          <button
            onClick={handleSave}
            className="w-full sm:w-auto px-8 py-3 rounded-xl bg-[#FF9900] hover:bg-[#E88B00] text-white text-sm font-semibold transition-colors shadow-sm"
          >
            Save Changes
          </button>
        </div>
      </div>

      {/* Toast notification */}
      {toast && <Toast message={toast} onClose={() => setToast(null)} />}

      {/* Toast animation */}
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
// - Fetch real listing data from API using the parsed listing ID
// - Show diff view highlighting what fields changed since last save
// - Version history with rollback capability
// - Side-by-side comparison of current vs. Nia-suggested title/description
// - Real image management: reorder, delete, replace existing images
// - Field-level change tracking to only PATCH modified fields
// - Audit log showing who edited what and when (for team seller accounts)
// - Auto-save draft with "unsaved changes" warning on navigation
// - Real-time preview of how the listing appears on Amazon Now storefront
// - Integration with Nia Chat for inline AI suggestions per field
