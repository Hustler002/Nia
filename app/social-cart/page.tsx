'use client';

// app/social-cart/page.tsx
// Social Cart landing page — create a new group cart and get a shareable link

import { useState } from 'react';
import { useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';

const CART_EMOJIS = ['🎬', '🍕', '🎉', '🏡', '🏋️', '🎮', '🌙', '☕'];

export default function SocialCartPage() {
  const { user } = useUser();
  const router = useRouter();
  const [cartName, setCartName] = useState('');
  const [selectedEmoji, setSelectedEmoji] = useState('🎬');
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState('');

  const handleCreate = async () => {
    const name = cartName.trim() || 'Group Cart';
    setIsCreating(true);
    setError('');

    const hostId = user?.id || `guest-${Date.now()}`;
    const hostName = user?.firstName || user?.username || 'You';

    const res = await fetch('/api/social-cart/create', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: `${selectedEmoji} ${name}`,
        hostId,
        hostName,
      }),
    });

    const data = await res.json();
    setIsCreating(false);

    if (!res.ok || !data.code) {
      setError(data.error || 'Failed to create cart. Make sure Supabase tables are set up.');
      return;
    }

    router.push(`/social-cart/${data.code}`);
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-[#E0F2F1] via-white to-white flex flex-col items-center justify-center px-4 py-12">
      {/* Back to home */}
      <a href="/" className="absolute top-5 left-5 text-sm text-[#00838F] hover:underline flex items-center gap-1">
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
        </svg>
        Back to home
      </a>

      <div className="w-full max-w-md">
        {/* Hero */}
        <div className="text-center mb-10">
          <div className="w-20 h-20 mx-auto mb-5 rounded-3xl bg-[#00838F] flex items-center justify-center shadow-lg shadow-[#00838F]/20">
            <span className="text-4xl">🛒</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Group Cart</h1>
          <p className="text-gray-500 text-sm leading-relaxed">
            Shop together in real-time. Share the link, everyone adds their items,
            Nia keeps everyone safe.
          </p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-3xl border border-gray-100 shadow-xl p-6 space-y-5">
          {/* Emoji picker */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Pick a vibe</label>
            <div className="flex gap-2 flex-wrap">
              {CART_EMOJIS.map((emoji) => (
                <button
                  key={emoji}
                  onClick={() => setSelectedEmoji(emoji)}
                  className={`w-11 h-11 rounded-xl text-2xl transition-all ${
                    selectedEmoji === emoji
                      ? 'bg-[#00838F] scale-110 shadow-md'
                      : 'bg-gray-50 hover:bg-gray-100'
                  }`}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>

          {/* Cart name */}
          <div>
            <label htmlFor="cart-name" className="block text-sm font-medium text-gray-700 mb-1.5">
              Cart name <span className="text-gray-400 font-normal">(optional)</span>
            </label>
            <input
              id="cart-name"
              type="text"
              value={cartName}
              onChange={(e) => setCartName(e.target.value)}
              placeholder="e.g. Movie Night, Team Lunch, House Party..."
              className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-[#00838F] transition-colors"
              onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
              maxLength={50}
            />
          </div>

          {/* Error */}
          {error && (
            <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-100 rounded-xl">
              <span className="text-red-500 text-sm">⚠️ {error}</span>
            </div>
          )}

          {/* Create button */}
          <button
            onClick={handleCreate}
            disabled={isCreating}
            className="w-full py-3.5 bg-[#FF9900] hover:bg-[#e88b00] disabled:opacity-60 text-white font-bold text-base rounded-2xl transition-all active:scale-[0.98] shadow-lg shadow-[#FF9900]/30 flex items-center justify-center gap-2"
          >
            {isCreating ? (
              <>
                <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Creating your cart...
              </>
            ) : (
              <>
                <span>Create & Share Cart</span>
                <span>→</span>
              </>
            )}
          </button>
        </div>

        {/* Features */}
        <div className="mt-8 grid grid-cols-3 gap-3 text-center">
          {[
            { icon: '⚡', title: 'Real-time', desc: 'Everyone sees updates instantly' },
            { icon: '🛡️', title: 'Nia Protected', desc: 'AI checks for allergy conflicts' },
            { icon: '🔗', title: 'Easy Share', desc: 'Just send a link — no sign-up needed' },
          ].map((f) => (
            <div key={f.title} className="bg-white rounded-2xl border border-gray-100 p-3 shadow-sm">
              <span className="text-xl">{f.icon}</span>
              <p className="text-xs font-semibold text-gray-800 mt-1">{f.title}</p>
              <p className="text-[10px] text-gray-400 mt-0.5">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
