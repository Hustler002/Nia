'use client';

// app/seller/listings/new/page.tsx — Add New Listing form page
// Two-column responsive form for creating a new product listing
// Features: character counters, keyword tag input, image upload slots,
// form validation, and a success modal with Nia optimization CTA
// Does NOT use next/navigation — standard <a> tags and window.location only

import { useState, useCallback } from 'react';

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

// ─── Main Component ─────────────────────────────────────────────────────────

export default function NewListingPage() {
  const [form, setForm] = useState<FormData>({
    title: '',
    description: '',
    keywords: [],
    category: '',
    subcategory: '',
    price: '',
    mrp: '',
    stock: '',
  });

  const [keywordInput, setKeywordInput] = useState('');
  const [errors, setErrors] = useState<FormErrors>({});
  const [showSuccess, setShowSuccess] = useState(false);

  // ── Field updaters ──────────────────────────────────────────────────────

  const updateField = useCallback(<K extends keyof FormData>(key: K, value: FormData[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    // Clear error when user starts typing
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

  // ── Submit handler ────────────────────────────────────────────────────────

  const handleSubmit = useCallback(() => {
    if (validate()) {
      setShowSuccess(true);
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
          <h1 className="text-2xl font-bold text-[#0F1111]">Add New Listing</h1>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        {/* ── Two Column Form ── */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">

          {/* ── Left Column (3/5 width = ~60%) ── */}
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
                placeholder="Describe your product's features, specifications, and unique selling points..."
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
              {/* Display existing keyword chips */}
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

          {/* ── Right Column (2/5 width = ~40%) ── */}
          <div className="lg:col-span-2 space-y-5">
            {/* Pricing */}
            <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
              <h3 className="text-sm font-semibold text-[#0F1111] mb-4">Pricing</h3>

              {/* Selling Price */}
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

              {/* MRP */}
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
                    {/* Mark first slot as primary */}
                    {i === 0 && (
                      <span className="text-[9px] text-[#00838F] font-semibold">MAIN</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ── Nia Callout ── */}
        <div className="mt-6 bg-[#E0F2F1] border border-[#00838F]/20 rounded-2xl p-5 flex flex-col sm:flex-row items-start sm:items-center gap-3">
          <span className="text-2xl">🤖</span>
          <div className="flex-1">
            <p className="text-sm font-semibold text-[#00838F]">Let Nia help!</p>
            <p className="text-sm text-[#0F1111]/70 mt-0.5">
              After saving, use Nia Optimization Chat to get AI-powered title and tag suggestions that match real customer searches.
            </p>
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
            onClick={handleSubmit}
            className="w-full sm:w-auto px-8 py-3 rounded-xl bg-[#FF9900] hover:bg-[#E88B00] text-white text-sm font-semibold transition-colors shadow-sm"
          >
            Submit for Review
          </button>
        </div>
      </div>

      {/* ── Success Modal ── */}
      {showSuccess && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/40" onClick={() => setShowSuccess(false)} />

          {/* Modal */}
          <div className="relative bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl text-center animate-[scaleIn_0.2s_ease-out]">
            <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
              </svg>
            </div>

            <h2 className="text-xl font-bold text-[#0F1111] mb-2">
              Listing submitted for review! ✅
            </h2>
            <p className="text-sm text-gray-500 mb-6">
              Our team will review and publish it within 24 hours.
            </p>

            <a
              href="/seller/optimization"
              className="inline-flex items-center justify-center gap-2 w-full px-6 py-3 rounded-xl bg-[#00838F] hover:bg-[#006D75] text-white text-sm font-semibold transition-colors mb-3"
            >
              🤖 While you wait, let Nia optimize your title →
            </a>

            <a
              href="/seller/listings"
              className="inline-block text-sm text-gray-500 hover:text-[#00838F] transition-colors"
            >
              ← Back to listings
            </a>
          </div>
        </div>
      )}

      {/* Modal animation */}
      <style>{`
        @keyframes scaleIn {
          from { opacity: 0; transform: scale(0.95); }
          to   { opacity: 1; transform: scale(1); }
        }
      `}</style>
    </div>
  );
}

// Production extension:
// - Real image upload to S3/CloudFront with preview thumbnails and drag-to-reorder
// - Auto-save draft with debounced localStorage persistence
// - AI-powered title and description generation from product category + keywords
// - Barcode / EAN scanner for quick product identification
// - Variant management (size, color, pack quantity) with separate stock per variant
// - SEO preview showing how the listing will appear in search results
// - Compliance checker for Amazon listing policies (image guidelines, prohibited words)
// - Multi-language listing support (Hindi, Tamil, etc.) for regional Amazon Now markets
// - Webhook integration to notify warehouse team when new listing is approved
