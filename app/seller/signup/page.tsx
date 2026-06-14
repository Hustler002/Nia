// app/seller/signup/page.tsx
// Seller Console signup page — single column, centered form
// Mock — doesn't actually create an account; shows a success screen after "submission"
// Production: Amazon Cognito + KYC verification (Aadhaar/GSTIN)

'use client';

import { useState } from 'react';

const CATEGORIES = [
  'Electronics',
  'Groceries',
  'Personal Care',
  'Baby Care',
  'Health',
  'Snacks & Beverages',
  'Kitchen',
  'Other',
];

function getPasswordStrength(pw: string): { label: string; color: string; width: string } {
  if (pw.length === 0) return { label: '', color: '', width: '0%' };
  if (pw.length < 6) return { label: 'Weak', color: 'bg-red-400', width: '33%' };
  const hasUpper = /[A-Z]/.test(pw);
  const hasNumber = /[0-9]/.test(pw);
  const hasSpecial = /[^A-Za-z0-9]/.test(pw);
  const score = [pw.length >= 8, hasUpper, hasNumber, hasSpecial].filter(Boolean).length;
  if (score >= 3) return { label: 'Strong', color: 'bg-green-500', width: '100%' };
  if (score >= 2) return { label: 'Medium', color: 'bg-amber-400', width: '66%' };
  return { label: 'Weak', color: 'bg-red-400', width: '33%' };
}

export default function SellerSignupPage() {
  const [form, setForm] = useState({
    name: '',
    storeName: '',
    email: '',
    phone: '',
    category: '',
    password: '',
    confirmPassword: '',
    termsAccepted: false,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const update = (field: string, value: string | boolean) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    // Clear error for this field when user types
    if (errors[field]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  const validate = (): boolean => {
    const errs: Record<string, string> = {};
    if (!form.name.trim()) errs.name = 'Name is required';
    if (!form.storeName.trim()) errs.storeName = 'Store name is required';
    if (!form.email.trim()) errs.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errs.email = 'Invalid email format';
    if (!form.phone.trim()) errs.phone = 'Phone number is required';
    else if (!/^\d{10}$/.test(form.phone.replace(/\s/g, ''))) errs.phone = 'Enter a valid 10-digit number';
    if (!form.category) errs.category = 'Select a category';
    if (!form.password) errs.password = 'Password is required';
    else if (form.password.length < 6) errs.password = 'Password must be at least 6 characters';
    if (form.password !== form.confirmPassword) errs.confirmPassword = 'Passwords do not match';
    if (!form.termsAccepted) errs.terms = 'You must accept the terms';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setIsLoading(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setIsLoading(false);
    setShowSuccess(true);
  };

  const strength = getPasswordStrength(form.password);

  // ─── Success Screen ─────────────────────────────────────────────────────
  if (showSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-6">
        <div className="max-w-md w-full text-center">
          {/* Animated checkmark */}
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-green-100 flex items-center justify-center">
            <svg
              className="w-10 h-10 text-green-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2.5}
              style={{ animation: 'slide-up 0.4s ease-out' }}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
            </svg>
          </div>

          <h2 className="text-2xl font-bold text-[#0F1111] mb-2">
            Welcome aboard, {form.name.split(' ')[0]}! 🎉
          </h2>
          <p className="text-sm text-gray-500 mb-6 max-w-sm mx-auto leading-relaxed">
            Your seller account is under review. This usually takes 24 hours.
            We&apos;ll send a confirmation to <span className="font-medium text-[#0F1111]">{form.email}</span>.
          </p>

          {/* Steps */}
          <div className="bg-white rounded-2xl border border-gray-100 p-5 mb-6 text-left">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">What happens next</p>
            <div className="space-y-3">
              {[
                { step: '1', text: 'Our team verifies your business details', status: 'In progress' },
                { step: '2', text: 'KYC verification (GSTIN / Aadhaar)', status: 'Pending' },
                { step: '3', text: 'Account activated — start listing!', status: 'Pending' },
              ].map((item) => (
                <div key={item.step} className="flex items-center gap-3">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${
                    item.step === '1' ? 'bg-[#00838F] text-white' : 'bg-gray-100 text-gray-400'
                  }`}>
                    {item.step}
                  </div>
                  <span className="text-sm text-[#0F1111] flex-1">{item.text}</span>
                  <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${
                    item.step === '1' ? 'bg-[#E0F2F1] text-[#00838F]' : 'bg-gray-100 text-gray-400'
                  }`}>
                    {item.status}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <a
            href="/seller/login"
            className="inline-flex items-center gap-2 px-6 py-3 bg-[#FF9900] hover:bg-[#e88b00] text-white font-semibold rounded-xl transition-colors shadow-sm"
          >
            Explore the demo dashboard →
          </a>
        </div>
      </div>
    );
  }

  // ─── Signup Form ──────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-6 py-12">
      <div className="w-full max-w-lg">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center gap-2 justify-center mb-4">
            <span className="text-xl font-bold text-[#FF9900]">amazon</span>
            <span className="text-xl font-bold text-[#0F1111]">now</span>
          </div>
          <h1 className="text-2xl font-bold text-[#0F1111] mb-1">Start selling on Amazon Now</h1>
          <p className="text-sm text-gray-500">
            Reach 10-minute delivery customers across India
          </p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 sm:p-8 space-y-5">
          {/* Full Name */}
          <div>
            <label htmlFor="signup-name" className="block text-sm font-medium text-[#0F1111] mb-1.5">
              Full name
            </label>
            <input
              id="signup-name"
              type="text"
              value={form.name}
              onChange={(e) => update('name', e.target.value)}
              placeholder="Ankit Gupta"
              className={`w-full px-4 py-3 rounded-xl border text-sm text-[#0F1111] placeholder-gray-400 focus:outline-none transition-all ${
                errors.name ? 'border-red-300 focus:border-red-400' : 'border-gray-200 focus:border-[#00838F]'
              }`}
            />
            {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
          </div>

          {/* Store Name */}
          <div>
            <label htmlFor="signup-store" className="block text-sm font-medium text-[#0F1111] mb-1.5">
              Business / Store name
            </label>
            <input
              id="signup-store"
              type="text"
              value={form.storeName}
              onChange={(e) => update('storeName', e.target.value)}
              placeholder="TechZone India"
              className={`w-full px-4 py-3 rounded-xl border text-sm text-[#0F1111] placeholder-gray-400 focus:outline-none transition-all ${
                errors.storeName ? 'border-red-300 focus:border-red-400' : 'border-gray-200 focus:border-[#00838F]'
              }`}
            />
            {errors.storeName && <p className="text-xs text-red-500 mt-1">{errors.storeName}</p>}
          </div>

          {/* Email */}
          <div>
            <label htmlFor="signup-email" className="block text-sm font-medium text-[#0F1111] mb-1.5">
              Email
            </label>
            <input
              id="signup-email"
              type="email"
              value={form.email}
              onChange={(e) => update('email', e.target.value)}
              placeholder="seller@yourstore.in"
              className={`w-full px-4 py-3 rounded-xl border text-sm text-[#0F1111] placeholder-gray-400 focus:outline-none transition-all ${
                errors.email ? 'border-red-300 focus:border-red-400' : 'border-gray-200 focus:border-[#00838F]'
              }`}
            />
            {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email}</p>}
          </div>

          {/* Phone */}
          <div>
            <label htmlFor="signup-phone" className="block text-sm font-medium text-[#0F1111] mb-1.5">
              Phone number
            </label>
            <div className="flex">
              <span className="inline-flex items-center px-4 py-3 rounded-l-xl border border-r-0 border-gray-200 bg-gray-50 text-sm text-gray-500 font-medium">
                +91
              </span>
              <input
                id="signup-phone"
                type="tel"
                value={form.phone}
                onChange={(e) => update('phone', e.target.value.replace(/\D/g, '').slice(0, 10))}
                placeholder="98765 43210"
                className={`flex-1 px-4 py-3 rounded-r-xl border text-sm text-[#0F1111] placeholder-gray-400 focus:outline-none transition-all ${
                  errors.phone ? 'border-red-300 focus:border-red-400' : 'border-gray-200 focus:border-[#00838F]'
                }`}
              />
            </div>
            {errors.phone && <p className="text-xs text-red-500 mt-1">{errors.phone}</p>}
          </div>

          {/* Category */}
          <div>
            <label htmlFor="signup-category" className="block text-sm font-medium text-[#0F1111] mb-1.5">
              Primary category
            </label>
            <select
              id="signup-category"
              value={form.category}
              onChange={(e) => update('category', e.target.value)}
              className={`w-full px-4 py-3 rounded-xl border text-sm text-[#0F1111] focus:outline-none transition-all appearance-none bg-white ${
                errors.category ? 'border-red-300 focus:border-red-400' : 'border-gray-200 focus:border-[#00838F]'
              } ${!form.category ? 'text-gray-400' : ''}`}
            >
              <option value="">Select a category</option>
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
            {errors.category && <p className="text-xs text-red-500 mt-1">{errors.category}</p>}
          </div>

          {/* Password */}
          <div>
            <label htmlFor="signup-password" className="block text-sm font-medium text-[#0F1111] mb-1.5">
              Password
            </label>
            <input
              id="signup-password"
              type="password"
              value={form.password}
              onChange={(e) => update('password', e.target.value)}
              placeholder="Min 6 characters"
              className={`w-full px-4 py-3 rounded-xl border text-sm text-[#0F1111] placeholder-gray-400 focus:outline-none transition-all ${
                errors.password ? 'border-red-300 focus:border-red-400' : 'border-gray-200 focus:border-[#00838F]'
              }`}
            />
            {/* Strength indicator */}
            {form.password && (
              <div className="mt-2">
                <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <div className={`h-full ${strength.color} rounded-full transition-all duration-300`} style={{ width: strength.width }} />
                </div>
                <p className={`text-[11px] mt-1 font-medium ${
                  strength.label === 'Strong' ? 'text-green-600' : strength.label === 'Medium' ? 'text-amber-600' : 'text-red-500'
                }`}>
                  {strength.label}
                </p>
              </div>
            )}
            {errors.password && <p className="text-xs text-red-500 mt-1">{errors.password}</p>}
          </div>

          {/* Confirm Password */}
          <div>
            <label htmlFor="signup-confirm" className="block text-sm font-medium text-[#0F1111] mb-1.5">
              Confirm password
            </label>
            <input
              id="signup-confirm"
              type="password"
              value={form.confirmPassword}
              onChange={(e) => update('confirmPassword', e.target.value)}
              placeholder="Re-enter your password"
              className={`w-full px-4 py-3 rounded-xl border text-sm text-[#0F1111] placeholder-gray-400 focus:outline-none transition-all ${
                errors.confirmPassword ? 'border-red-300 focus:border-red-400' : 'border-gray-200 focus:border-[#00838F]'
              }`}
            />
            {errors.confirmPassword && <p className="text-xs text-red-500 mt-1">{errors.confirmPassword}</p>}
          </div>

          {/* Terms */}
          <div className="flex items-start gap-2">
            <input
              id="signup-terms"
              type="checkbox"
              checked={form.termsAccepted}
              onChange={(e) => update('termsAccepted', e.target.checked)}
              className="w-4 h-4 rounded border-gray-300 text-[#00838F] focus:ring-[#00838F] mt-0.5"
            />
            <label htmlFor="signup-terms" className="text-sm text-gray-600">
              I agree to the <span className="text-[#00838F] underline cursor-pointer">Amazon Seller Terms & Conditions</span>
            </label>
          </div>
          {errors.terms && <p className="text-xs text-red-500 -mt-2">{errors.terms}</p>}

          {/* Submit */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 bg-[#FF9900] hover:bg-[#e88b00] text-white font-semibold rounded-xl transition-all disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-sm"
          >
            {isLoading ? (
              <>
                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Creating account...
              </>
            ) : (
              'Create Account'
            )}
          </button>
        </form>

        {/* Sign in link */}
        <p className="text-center text-sm text-gray-500 mt-6">
          Already have an account?{' '}
          <a href="/seller/login" className="text-[#00838F] font-medium hover:underline">
            Sign in →
          </a>
        </p>
      </div>
    </div>
  );
}

// Production extension:
// - Amazon Cognito user pool registration
// - KYC step: Aadhaar/PAN/GSTIN verification via DigiLocker API
// - Email OTP verification before account activation
// - Phone OTP via SNS
// - Business address validation with pincode lookup
// - FSSAI license upload for food category sellers
// - Auto-categorization suggestion based on business name
