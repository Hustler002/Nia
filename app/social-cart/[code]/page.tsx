'use client';

// app/social-cart/[code]/page.tsx
// The main real-time collaborative cart page

import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useUser } from '@clerk/nextjs';
import { useSocialCartStore } from '@/lib/socialCart/socialCartStore';
import { useNiaChatStore } from '@/lib/useNiaStore';
import MemberAvatars from '@/components/SocialCart/MemberAvatars';
import SharedCartItem from '@/components/SocialCart/SharedCartItem';
import AddItemModal from '@/components/SocialCart/AddItemModal';
import type { SocialCartItem } from '@/lib/socialCart/types';

// ─── Join Modal ───────────────────────────────────────────────────────────────

function JoinModal({ onJoin }: { onJoin: (name: string) => void }) {
  const [name, setName] = useState('');
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
      <div className="relative bg-white rounded-3xl shadow-2xl p-8 w-full max-w-sm text-center">
        <span className="text-5xl block mb-4">👋</span>
        <h2 className="text-xl font-bold text-gray-900 mb-1">Join the group cart!</h2>
        <p className="text-sm text-gray-500 mb-6">What should your friends call you?</p>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && name.trim() && onJoin(name.trim())}
          placeholder="Your name..."
          className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm text-center focus:outline-none focus:border-[#00838F] transition-colors mb-4"
          autoFocus
          maxLength={30}
        />
        <button
          onClick={() => name.trim() && onJoin(name.trim())}
          disabled={!name.trim()}
          className="w-full py-3 bg-[#FF9900] hover:bg-[#e88b00] disabled:opacity-50 text-white font-bold rounded-2xl transition-all active:scale-[0.98]"
        >
          Join Cart 🛒
        </button>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function SocialCartRoomPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useUser();
  const code = params.code as string;

  const { cart, members, items, myMember, isLoading, error, loadCart, joinCart, addItem, removeItem, cleanup } =
    useSocialCartStore();
  const { addToCart } = useNiaChatStore();

  const [showJoinModal, setShowJoinModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);
  const [shareSupported] = useState(() => typeof navigator !== 'undefined' && !!navigator.share);
  const [checkingOut, setCheckingOut] = useState(false);

  // Load cart on mount
  useEffect(() => {
    if (code) {
      loadCart(code);
    }
    return () => cleanup();
  }, [code, loadCart, cleanup]);

  // Determine if we need to show join modal
  useEffect(() => {
    if (!isLoading && cart && !myMember) {
      setShowJoinModal(true);
    }
  }, [isLoading, cart, myMember]);

  const handleJoin = useCallback(
    async (name: string) => {
      const userId = user?.id || `guest-${Math.random().toString(36).slice(2, 8)}`;
      const result = await joinCart(code, name, userId);
      if (result.success) {
        setShowJoinModal(false);
      }
    },
    [code, joinCart, user]
  );

  const handleAddItem = useCallback(
    async (itemData: Omit<SocialCartItem, 'id' | 'cart_code' | 'flagged_by_nia' | 'nia_flag_reason' | 'created_at'>) => {
      await addItem(itemData);
    },
    [addItem]
  );

  const handleShare = async () => {
    const url = window.location.href;
    const cartTitle = cart?.name || 'Group Cart';

    if (shareSupported) {
      try {
        await navigator.share({
          title: `Join my ${cartTitle} on Amazon Now`,
          text: `Hey! I've started a group cart. Click the link to add your items and we'll checkout together 🛒`,
          url,
        });
        return;
      } catch (err) {
        // User dismissed the share sheet — that's fine, fall through to copy
        if ((err as Error).name === 'AbortError') return;
      }
    }

    // Fallback: copy to clipboard
    try {
      await navigator.clipboard.writeText(url);
    } catch {
      // Last-resort fallback for older browsers
      const el = document.createElement('textarea');
      el.value = url;
      document.body.appendChild(el);
      el.select();
      document.execCommand('copy');
      document.body.removeChild(el);
    }
    setLinkCopied(true);
    setTimeout(() => setLinkCopied(false), 2500);
  };

  const handleCheckout = () => {
    setCheckingOut(true);
    // Add all items from the social cart into the main Nia cart
    items.forEach((item) => {
      addToCart({
        id: item.product_id,
        name: item.name,
        price: item.price,
        mrp: Math.round(item.price * 1.15),
        image: item.image,
        qty: item.qty,
        category: 'Social Cart',
      });
    });
    setTimeout(() => {
      router.push('/payment');
    }, 500);
  };

  const total = items.reduce((sum, item) => sum + item.price * item.qty, 0);
  const flaggedItems = items.filter((i) => i.flagged_by_nia);

  // ── Loading ──
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[#00838F] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm text-gray-500">Loading group cart...</p>
        </div>
      </div>
    );
  }

  // ── Not found ──
  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4 text-center">
        <span className="text-5xl mb-4">😕</span>
        <h2 className="text-xl font-bold text-gray-900 mb-2">Cart not found</h2>
        <p className="text-sm text-gray-500 mb-6">{error}</p>
        <a href="/social-cart" className="text-[#00838F] font-medium hover:underline">← Create a new group cart</a>
      </div>
    );
  }

  return (
    <>
      {showJoinModal && <JoinModal onJoin={handleJoin} />}

      <AddItemModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onAdd={handleAddItem}
        addedById={myMember?.user_id || 'guest'}
        addedByName={myMember?.name || 'Guest'}
      />

      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 sticky top-0 z-30">
          <div className="max-w-2xl mx-auto px-4 py-3 flex items-center gap-3">
            <a href="/social-cart" className="text-gray-400 hover:text-gray-600 transition-colors">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
            </a>

            <div className="flex-1 min-w-0">
              <h1 className="text-base font-bold text-gray-900 truncate">{cart?.name || 'Group Cart'}</h1>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-xs text-gray-400 font-mono">#{code}</span>
                <span className="text-gray-200">•</span>
                <MemberAvatars members={members} myMemberId={myMember?.user_id} />
              </div>
            </div>

            <button
              onClick={handleShare}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                linkCopied ? 'bg-green-100 text-green-700' : 'bg-[#00838F] text-white hover:bg-[#006d75]'
              }`}
            >
              {linkCopied ? (
                <>✓ Link Copied!</>
              ) : shareSupported ? (
                <>
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                  </svg>
                  Invite Friends
                </>
              ) : (
                <>
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                  Copy Link
                </>
              )}
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="max-w-2xl mx-auto px-4 py-4 space-y-4 pb-40">
          {/* Nia Warnings */}
          {flaggedItems.length > 0 && (
            <div className="bg-orange-50 border border-orange-200 rounded-2xl p-4">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center shrink-0">
                  <span className="text-lg">🤖</span>
                </div>
                <div>
                  <p className="text-sm font-bold text-orange-800">Nia has a heads-up for your group</p>
                  <p className="text-xs text-orange-600 mt-1">
                    {flaggedItems.length === 1
                      ? `1 item was flagged based on your group's known preferences.`
                      : `${flaggedItems.length} items were flagged based on your group's known preferences.`}
                    {' '}Check the items below for details.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Empty state */}
          {items.length === 0 && (
            <div className="text-center py-16">
              <span className="text-5xl block mb-4">🛒</span>
              <p className="text-base font-semibold text-gray-700 mb-1">Cart is empty</p>
              <p className="text-sm text-gray-400 mb-6">
                You and your friends can start adding items!
              </p>
              <button
                onClick={() => setShowAddModal(true)}
                disabled={!myMember}
                className="px-6 py-3 bg-[#FF9900] text-white font-bold rounded-2xl hover:bg-[#e88b00] transition-all active:scale-95 disabled:opacity-40"
              >
                Add First Item +
              </button>
            </div>
          )}

          {/* Items grid */}
          {items.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {items.map((item) => (
                <SharedCartItem
                  key={item.id}
                  item={item}
                  members={members}
                  canRemove={item.added_by_id === myMember?.user_id || cart?.host_id === myMember?.user_id}
                  onRemove={() => removeItem(item.id)}
                />
              ))}
            </div>
          )}
        </div>

        {/* Bottom checkout bar */}
        {items.length > 0 && (
          <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-30">
            <div className="max-w-2xl mx-auto px-4 py-3 flex items-center gap-3">
              <button
                onClick={() => setShowAddModal(true)}
                disabled={!myMember}
                className="flex-1 py-3 border-2 border-[#00838F] text-[#00838F] font-bold rounded-2xl hover:bg-[#E0F2F1] transition-all disabled:opacity-40 text-sm"
              >
                + Add Item
              </button>
              <button
                onClick={handleCheckout}
                disabled={checkingOut}
                className="flex-[2] py-3 bg-[#FF9900] hover:bg-[#e88b00] text-white font-bold rounded-2xl transition-all active:scale-[0.98] text-sm flex items-center justify-center gap-2 shadow-lg shadow-[#FF9900]/20"
              >
                {checkingOut ? (
                  <>
                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Moving to checkout...
                  </>
                ) : (
                  <>Checkout · ₹{total.toLocaleString('en-IN')}</>
                )}
              </button>
            </div>
          </div>
        )}

        {/* Floating add button when no items in bar */}
        {items.length === 0 && myMember && (
          <button
            onClick={() => setShowAddModal(true)}
            className="fixed bottom-6 right-6 w-14 h-14 bg-[#FF9900] hover:bg-[#e88b00] text-white text-3xl font-bold rounded-full shadow-xl flex items-center justify-center transition-all active:scale-95 z-30"
          >
            +
          </button>
        )}
      </div>
    </>
  );
}
