// app/seller/login/page.tsx
// Seller Console login page — split screen layout
// Left: branding panel (teal) with value props
// Right: login form with mock credentials hint
// Production: Amazon Cognito / Seller Central SSO

'use client';

import { useState, useEffect } from 'react';
import { useSellerAuth } from '@/lib/seller/authStore';

export default function SellerLoginPage() {
  const { login, isAuthenticated } = useSellerAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      window.location.href = '/seller';
    }
  }, [isAuthenticated]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Basic validation
    if (!email.trim()) {
      setError('Please enter your email address');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Please enter a valid email address');
      return;
    }
    if (!password) {
      setError('Please enter your password');
      return;
    }

    setIsLoading(true);
    const result = await login(email, password);
    setIsLoading(false);

    if (result.success) {
      window.location.href = '/seller';
    } else {
      setError(result.error || 'Login failed');
    }
  };

  const showToast = (message: string) => {
    setToastMessage(message);
    setTimeout(() => setToastMessage(''), 3000);
  };

  return (
    <div className="min-h-screen flex">
      {/* ── Left Panel — Branding (hidden on mobile) ── */}
      <div className="hidden lg:flex lg:w-[45%] bg-[#00838F] relative overflow-hidden flex-col justify-center px-12 xl:px-16">
        {/* Decorative circles */}
        <div className="absolute top-20 right-[-60px] w-40 h-40 rounded-full bg-white/5" />
        <div className="absolute bottom-32 left-[-40px] w-56 h-56 rounded-full bg-white/5" />
        <div className="absolute top-1/2 right-20 w-20 h-20 rounded-full bg-white/10" />

        {/* Logo */}
        <div className="mb-10">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-2xl font-bold text-white">amazon</span>
            <span className="text-2xl font-bold text-[#FF9900]">now</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-white/60" />
            <span className="text-sm text-white/60">Nia for Sellers</span>
          </div>
        </div>

        {/* Headline */}
        <h1 className="text-4xl xl:text-5xl font-bold text-white leading-tight mb-4">
          Grow with Nia
        </h1>
        <p className="text-lg text-white/80 mb-10 max-w-md leading-relaxed">
          India&apos;s first intent-driven seller platform.
          See exactly what customers want — and list it first.
        </p>

        {/* Value Props */}
        <div className="space-y-5">
          <div className="flex items-start gap-4">
            <span className="text-2xl mt-0.5">🎯</span>
            <div>
              <p className="text-white font-semibold">See 1,200+ weekly unmet customer queries</p>
              <p className="text-white/60 text-sm mt-0.5">Know what customers want before anyone else</p>
            </div>
          </div>
          <div className="flex items-start gap-4">
            <span className="text-2xl mt-0.5">📈</span>
            <div>
              <p className="text-white font-semibold">Optimize listings with AI in minutes</p>
              <p className="text-white/60 text-sm mt-0.5">Nia rewrites your titles and tags for maximum discovery</p>
            </div>
          </div>
          <div className="flex items-start gap-4">
            <span className="text-2xl mt-0.5">⚡</span>
            <div>
              <p className="text-white font-semibold">Appear in Nia&apos;s recommendations automatically</p>
              <p className="text-white/60 text-sm mt-0.5">Merit-based, not ad-spend-based placement</p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Right Panel — Login Form ── */}
      <div className="flex-1 flex items-center justify-center px-6 py-12 bg-white">
        <div className="w-full max-w-md">
          {/* Mobile-only logo */}
          <div className="lg:hidden mb-8">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xl font-bold text-[#FF9900]">amazon</span>
              <span className="text-xl font-bold text-[#0F1111]">now</span>
              <span className="text-xs text-gray-400 ml-1">· Sellers</span>
            </div>
          </div>

          <h2 className="text-2xl font-bold text-[#0F1111] mb-1">Seller Sign In</h2>
          <p className="text-sm text-gray-500 mb-8">
            Access your seller dashboard and analytics
          </p>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email */}
            <div>
              <label htmlFor="seller-email" className="block text-sm font-medium text-[#0F1111] mb-1.5">
                Seller email
              </label>
              <input
                id="seller-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seller@yourstore.com"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm text-[#0F1111] placeholder-gray-400 focus:border-[#00838F] focus:ring-2 focus:ring-[#00838F]/10 focus:outline-none transition-all"
                autoComplete="email"
              />
            </div>

            {/* Password */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label htmlFor="seller-password" className="block text-sm font-medium text-[#0F1111]">
                  Password
                </label>
                <button
                  type="button"
                  onClick={() => showToast('Password reset is not available in demo mode')}
                  className="text-xs text-[#00838F] hover:underline"
                >
                  Forgot password?
                </button>
              </div>
              <div className="relative">
                <input
                  id="seller-password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm text-[#0F1111] placeholder-gray-400 focus:border-[#00838F] focus:ring-2 focus:ring-[#00838F]/10 focus:outline-none transition-all pr-12"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? (
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {/* Remember Me */}
            <div className="flex items-center gap-2">
              <input
                id="remember-me"
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-4 h-4 rounded border-gray-300 text-[#00838F] focus:ring-[#00838F]"
              />
              <label htmlFor="remember-me" className="text-sm text-gray-600">
                Remember me
              </label>
            </div>

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
                  Signing in...
                </>
              ) : (
                'Sign In'
              )}
            </button>

            {/* Error */}
            {error && (
              <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-100 rounded-xl">
                <svg className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
                </svg>
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}
          </form>

          {/* Demo hint */}
          <div className="mt-4 p-3 bg-gray-50 rounded-xl border border-gray-100">
            <p className="text-xs text-gray-400 text-center">
              Demo credentials: <span className="font-mono text-gray-500">seller@techzone.in</span> /{' '}
              <span className="font-mono text-gray-500">demo123</span>
            </p>
          </div>

          {/* Divider */}
          <div className="flex items-center gap-4 my-6">
            <div className="flex-1 h-px bg-gray-100" />
            <span className="text-xs text-gray-400">or</span>
            <div className="flex-1 h-px bg-gray-100" />
          </div>

          {/* Signup link */}
          <a
            href="/seller/signup"
            className="block w-full text-center py-3 border border-gray-200 rounded-xl text-sm font-medium text-[#0F1111] hover:bg-gray-50 transition-colors"
          >
            New seller? Create your account →
          </a>
        </div>
      </div>

      {/* ── Toast ── */}
      {toastMessage && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[100] bg-[#232F3E] text-white text-sm px-5 py-3 rounded-xl shadow-lg animate-[slide-up_0.2s_ease-out]">
          {toastMessage}
        </div>
      )}
    </div>
  );
}

// Production extension:
// - Amazon Cognito hosted UI or custom auth flow
// - MFA step after password verification (TOTP / SMS OTP)
// - OAuth buttons: "Sign in with Amazon Seller Central"
// - Rate limiting on login attempts (WAF rule)
// - CAPTCHA after 3 failed attempts
// - Secure cookie-based session management
