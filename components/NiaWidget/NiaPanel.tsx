// components/NiaWidget/NiaPanel.tsx
// The main Nia chat panel — slides in from right (desktop) or bottom (mobile)
// Contains: header, messages area with rich cards, typing indicator, input bar, quick chips
// Production: add WebSocket streaming, voice input UI, file/image upload

'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence, PanInfo } from 'framer-motion';
import { useRouter, usePathname } from 'next/navigation';
import { useNiaChatStore } from '@/lib/useNiaStore';
import type { NiaMessage } from '@/lib/useNiaStore';
import { useUserStore } from '@/lib/stores/useUserStore';

// Lazy-loaded card renderers
import CartSummaryCard from './cards/CartSummaryCard';
import ProductListCard from './cards/ProductListCard';
import ComparisonCard from './cards/ComparisonCard';
import EmergencyKitCard from './cards/EmergencyKitCard';
import ReorderNudgeCard from './cards/ReorderNudgeCard';

// ─── Message Renderer ───────────────────────────────────────────────────────

function MessageBubble({ msg }: { msg: NiaMessage }) {
  const isUser = msg.role === 'user';

  if (isUser) {
    return (
      <div className="flex justify-end">
        <motion.div
          initial={{ opacity: 0, y: 8, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.2 }}
          className="max-w-[85%] rounded-md rounded-br-sm px-4 py-3 bg-[#232F3E] text-white"
        >
          <p className="text-sm leading-relaxed">{msg.content}</p>
        </motion.div>
      </div>
    );
  }

  // Nia's message — render rich card based on type
  return (
    <div className="flex justify-start">
      <motion.div
        initial={{ opacity: 0, y: 8, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.25, delay: 0.05 }}
        className="max-w-[95%] w-full"
      >
        {renderRichCard(msg)}
      </motion.div>
    </div>
  );
}

/** Routes NiaMessage to the correct card renderer */
function renderRichCard(msg: NiaMessage) {
  switch (msg.type) {
    case 'cart_summary':
      return (
        <CartSummaryCard
          items={msg.data as import('@/lib/useNiaStore').CartItem[]}
          content={msg.content}
        />
      );
    case 'product_list':
      return (
        <ProductListCard
          items={msg.data as import('@/lib/useNiaStore').CartItem[]}
          content={msg.content}
        />
      );
    case 'comparison':
      return (
        <ComparisonCard
          data={msg.data as import('@/lib/useNiaStore').ComparisonData}
          content={msg.content}
        />
      );
    case 'emergency_kit':
      return (
        <EmergencyKitCard
          kit={msg.data as import('@/lib/useNiaStore').EmergencyKit}
          content={msg.content}
        />
      );
    case 'reorder_nudge':
      return (
        <ReorderNudgeCard
          nudge={msg.data as import('@/lib/useNiaStore').ReorderNudge}
          content={msg.content}
        />
      );
    case 'text':
    default:
      // Plain text message with teal left border
      return (
        <div className="bg-white rounded-md rounded-bl-sm border border-[#D5D9D9] border-l-4 border-l-[#00838F] px-4 py-3 shadow-sm">
          <p className="text-sm leading-relaxed text-[#0F1111] whitespace-pre-line">
            {msg.content}
          </p>
        </div>
      );
  }
}

// ─── Typing Indicator ───────────────────────────────────────────────────────

function TypingIndicator() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      className="flex justify-start"
    >
      <div className="bg-white rounded-md rounded-bl-sm px-4 py-3 border border-[#D5D9D9] border-l-4 border-l-[#00838F] shadow-sm">
        <div className="flex items-center gap-2">
          <div className="flex gap-1">
            <span
              className="w-2 h-2 rounded-full bg-[#00838F] animate-bounce"
              style={{ animationDelay: '0ms', animationDuration: '0.6s' }}
            />
            <span
              className="w-2 h-2 rounded-full bg-[#00838F]/70 animate-bounce"
              style={{ animationDelay: '150ms', animationDuration: '0.6s' }}
            />
            <span
              className="w-2 h-2 rounded-full bg-[#00838F]/40 animate-bounce"
              style={{ animationDelay: '300ms', animationDuration: '0.6s' }}
            />
          </div>
          <span className="text-[11px] text-gray-400">Nia is thinking...</span>
        </div>
      </div>
    </motion.div>
  );
}

// ─── Main Panel Component ───────────────────────────────────────────────────

export default function NiaPanel() {
  const router = useRouter();
  const pathname = usePathname();
  const user = useUserStore((s) => s.user);
  const {
    isOpen,
    close,
    messages,
    isThinking,
    quickChips,
    initialQuery,
    addMessage,
    setThinking,
    setQuickChips,
  } = useNiaChatStore();

  const [input, setInput] = useState('');
  const [isListening, setIsListening] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const processedQueryRef = useRef<string>('');

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isThinking]);

  // Auto-focus input when panel opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 350);
    }
  }, [isOpen]);

  // Handle initial query from hero input or deep link
  useEffect(() => {
    if (isOpen && initialQuery && initialQuery !== processedQueryRef.current) {
      processedQueryRef.current = initialQuery;
      handleSend(initialQuery);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, initialQuery]);

  // ── Core send handler — calls real /api/nia backend ──
  const handleSend = useCallback(
    async (text?: string) => {
      const query = (text || input).trim();
      if (!query || isThinking) return;

      // Add user message
      const userMsg: NiaMessage = {
        id: `user-${Date.now()}`,
        role: 'user',
        content: query,
        type: 'text',
        timestamp: new Date(),
      };
      
      // Read messages BEFORE adding the new one to avoid duplicate in API context
      const currentMessages = [...useNiaChatStore.getState().messages, userMsg];
      
      addMessage(userMsg);
      setInput('');
      setThinking(true);
      
      // Tell the product grid what the user is currently searching for
      useNiaChatStore.getState().setActiveQuery(query);
      
      // Navigate to the search page only on the first query (not every follow-up message)
      if (useNiaChatStore.getState().messages.length <= 2) {
        router.push(`/search?q=${encodeURIComponent(query)}`);
      }

      // Clear previous related products so the grid shows loading or clears
      useNiaChatStore.getState().setRelatedProducts([]);

      try {
        // Get all current messages for context window (already includes userMsg)
        const contextMessages = currentMessages;

        const res = await fetch('/api/nia', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            messages: contextMessages,
            userId: user?.id ?? 'priya-sharma-001',
            userName: user?.name ?? 'Guest',
            pincode: user?.pincode ?? '110001',
          }),
        });

        if (!res.ok) throw new Error(`API error ${res.status}`);
        const niaResponse = await res.json();

        const niaMsg: NiaMessage = {
          id: niaResponse.id || `nia-${Date.now()}`,
          role: 'nia',
          content: niaResponse.content,
          type: niaResponse.type || 'text',
          data: niaResponse.data || null,
          timestamp: new Date(),
        };
        addMessage(niaMsg);

        // --- Auto-cart & Related Products Logic ---
        if (niaMsg.data && Array.isArray(niaMsg.data) && niaMsg.data.length > 0) {
          // Auto-add cart summary items to the live cart
          if (niaMsg.type === 'cart_summary') {
            const store = useNiaChatStore.getState();
            niaMsg.data.forEach((item: any) => {
               store.addToCart(item);
            });
          }
          
          // ALWAYS update the "Suggested" grid if the AI returns any product array
          useNiaChatStore.getState().setRelatedProducts(niaMsg.data);
        }

        // --- Autonomous Checkout (direct_checkout tool result) ---
        if (niaMsg.type === 'direct_checkout' && niaMsg.data && !Array.isArray(niaMsg.data)) {
          const checkoutData = niaMsg.data as any;
          if (checkoutData.item) {
            useNiaChatStore.getState().addToCart(checkoutData.item);
          }
          const addressLabel = checkoutData.address?.label || 'home';
          // Small delay so user can read Nia's message, then redirect
          setTimeout(() => {
            router.push(`/payment?address=${encodeURIComponent(addressLabel)}`);
          }, 1500);
        }

        // Update quick chips from response if available
        if (niaResponse.quickChips?.length) {
          setQuickChips(niaResponse.quickChips);
        }
      } catch (err) {
        console.error('Nia fetch error:', err);
        addMessage({
          id: `nia-err-${Date.now()}`,
          role: 'nia',
          content: "Hmm, something went wrong on my end. Try again in a second! 🙏",
          type: 'text',
          data: null,
          timestamp: new Date(),
        });
      } finally {
        setThinking(false);
      }
    },
    [input, isThinking, addMessage, setThinking, setQuickChips, router, user]
  );


  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSend();
  };

  // Voice input toggle (mock — uses Web Speech API in production)
  const toggleVoice = () => {
    if (isListening) {
      setIsListening(false);
      return;
    }

    // Check for browser support — SpeechRecognition is not in standard TS types
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const SpeechRecognitionAPI = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognitionAPI) {
      // Fallback: simulate voice input for demo
      setIsListening(true);
      setTimeout(() => {
        setInput('Movie night for 4 under 500');
        setIsListening(false);
      }, 2000);
      return;
    }

    const recognition = new SpeechRecognitionAPI();
    recognition.lang = 'en-IN'; // Indian English + Hindi support
    recognition.interimResults = false;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setInput(transcript);
      setIsListening(false);
    };

    recognition.onerror = () => {
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    setIsListening(true);
    recognition.start();
  };

  // Swipe-to-dismiss on mobile
  const handleDragEnd = (_: unknown, info: PanInfo) => {
    if (info.offset.y > 100) {
      close();
    }
  };

  // Format timestamp for display
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  };

  return (
    <AnimatePresence>
      {isOpen && !pathname.startsWith('/seller') && (
        <>
          {/* Backdrop (mobile only - hidden on desktop so users can interact with the page) */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/30 backdrop-blur-sm z-[998] sm:hidden"
            onClick={close}
          />

          {/* Panel — desktop: slide from right, mobile: slide from bottom */}
          <motion.div
            // Desktop animation
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            // Mobile: also handle vertical drag
            drag="y"
            dragConstraints={{ top: 0, bottom: 300 }}
            dragElastic={0.2}
            onDragEnd={handleDragEnd}
            className="fixed z-[999] bg-white shadow-2xl flex flex-col overflow-hidden
              /* Mobile: bottom drawer */
              inset-x-0 bottom-0 h-[85vh] rounded-t-md
              /* Desktop: right sidebar */
              sm:inset-y-0 sm:right-0 sm:left-auto sm:w-[420px] sm:h-full sm:rounded-none sm:rounded-l-md"
            role="dialog"
            aria-label="Nia AI Shopping Assistant"
            id="nia-chat-panel"
          >
            {/* ── Drag handle (mobile) ── */}
            <div className="sm:hidden flex justify-center pt-2 pb-1">
              <div className="w-10 h-1 rounded-full bg-gray-300" />
            </div>

            {/* ── Header ── */}
            <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100 bg-white">
              <div className="flex items-center gap-3">
                {/* Nia avatar */}
                <div className="relative">
                  <div className="w-9 h-9 rounded-full bg-[#00838F] flex items-center justify-center shadow-md">
                    <div className="flex items-center gap-[1.5px]">
                      <div className="w-[2px] h-2 bg-white/80 rounded-full" />
                      <div className="w-[2px] h-3 bg-white rounded-full" />
                      <div className="w-[2px] h-2.5 bg-white/80 rounded-full" />
                      <div className="w-[2px] h-3.5 bg-white rounded-full" />
                      <div className="w-[2px] h-2 bg-white/80 rounded-full" />
                    </div>
                  </div>
                  {/* Thinking pulse */}
                  {isThinking && (
                    <div className="absolute inset-0 rounded-full bg-[#00838F]/30 animate-nia-pulse" />
                  )}
                </div>
                <div>
                  <h2 className="text-sm font-bold text-[#0F1111] leading-tight">
                    Nia
                  </h2>
                  <div className="flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
                    <p className="text-[11px] text-gray-400">
                      10 min delivery · 110001
                    </p>
                  </div>
                </div>
              </div>
              <button
                onClick={close}
                className="w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center transition-colors"
                aria-label="Close Nia"
                id="nia-close-button"
              >
                <svg
                  className="w-5 h-5 text-gray-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            {/* ── Messages Area ── */}
            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 scroll-smooth">
              {/* Empty state */}
              {messages.length === 0 && !isThinking && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="text-center py-8"
                >
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-[#E0F2F1] to-[#B2DFDB] flex items-center justify-center shadow-inner">
                    <span className="text-2xl">✨</span>
                  </div>
                  <p className="text-sm font-semibold text-[#0F1111]">
                    Hey! I&apos;m Nia.
                  </p>
                  <p className="text-xs text-gray-400 mt-1 max-w-[240px] mx-auto leading-relaxed">
                    Tell me what you need — in English, Hindi, or Hinglish — and
                    I&apos;ll build your cart in seconds.
                  </p>

                  {/* Suggestion cards in empty state */}
                  <div className="mt-6 space-y-2">
                    {[
                      {
                        emoji: '🎬',
                        text: 'Movie night for 4 under ₹500',
                      },
                      {
                        emoji: '🎧',
                        text: 'Best earbuds under ₹2000',
                      },
                      {
                        emoji: '🚨',
                        text: 'I have a fever',
                      },
                    ].map((suggestion) => (
                      <button
                        key={suggestion.text}
                        onClick={() => handleSend(suggestion.text)}
                        className="w-full flex items-center gap-3 px-4 py-3 bg-[#F7F8F8] hover:bg-[#E0F2F1] rounded-sm border border-[#D5D9D9] hover:border-[#00838F]/30 transition-all text-left group"
                      >
                        <span className="text-lg">{suggestion.emoji}</span>
                        <span className="text-xs text-gray-600 group-hover:text-[#00838F] transition-colors">
                          {suggestion.text}
                        </span>
                        <svg
                          className="w-4 h-4 text-gray-300 group-hover:text-[#00838F] ml-auto transition-colors"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                          strokeWidth={2}
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M9 5l7 7-7 7"
                          />
                        </svg>
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* Messages */}
              {messages.map((msg, idx) => (
                <div key={msg.id}>
                  {/* Timestamp separator — show every 3rd message or on role change */}
                  {(idx === 0 ||
                    (idx > 0 && messages[idx - 1].role !== msg.role)) && (
                    <div className="flex justify-center mb-2">
                      <span className="text-[10px] text-gray-300 bg-gray-50 px-2 py-0.5 rounded-full">
                        {formatTime(msg.timestamp)}
                      </span>
                    </div>
                  )}
                  <MessageBubble msg={msg} />
                </div>
              ))}

              {/* Thinking indicator */}
              <AnimatePresence>{isThinking && <TypingIndicator />}</AnimatePresence>

              <div ref={messagesEndRef} />
            </div>

            {/* ── Quick Chips ── */}
            {messages.length > 0 && !isThinking && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="px-4 pb-2 flex gap-2 overflow-x-auto scrollbar-hide"
              >
                {quickChips.map((chip) => (
                  <button
                    key={chip}
                    onClick={() => handleSend(chip.replace(/\s*[\u{1F300}-\u{1FAFF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/u, ''))}
                    className="flex-shrink-0 px-3 py-1.5 bg-[#E0F2F1] text-[#00838F] text-xs font-medium rounded-sm hover:bg-[#B2DFDB] transition-colors whitespace-nowrap border border-[#00838F]/10"
                  >
                    {chip}
                  </button>
                ))}
              </motion.div>
            )}

            {/* ── Input Area ── */}
            <form
              onSubmit={handleSubmit}
              className="border-t border-gray-100 px-4 py-3 bg-white"
            >
              <div
                className={`flex items-center gap-2 rounded-xl px-3 py-2 border transition-colors ${
                  isListening
                    ? 'bg-red-50 border-red-300'
                    : 'bg-gray-50 border-gray-200 focus-within:border-[#00838F] focus-within:bg-white'
                }`}
              >
                <input
                  ref={inputRef}
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder={
                    isListening
                      ? 'Listening...'
                      : 'Ask Nia anything... (Hindi/English)'
                  }
                  className="flex-1 bg-transparent text-sm outline-none text-[#0F1111] placeholder-gray-400"
                  disabled={isListening}
                  aria-label="Chat with Nia"
                  id="nia-chat-input"
                />

                {/* Mic button */}
                <button
                  type="button"
                  onClick={toggleVoice}
                  className={`w-8 h-8 rounded-full flex items-center justify-center transition-all flex-shrink-0 ${
                    isListening
                      ? 'bg-red-500 text-white animate-pulse'
                      : 'bg-transparent text-gray-400 hover:text-[#00838F] hover:bg-[#E0F2F1]'
                  }`}
                  aria-label={isListening ? 'Stop recording' : 'Voice input'}
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 01-3-3V4.5a3 3 0 116 0v8.25a3 3 0 01-3 3z"
                    />
                  </svg>
                </button>

                {/* Send button */}
                <button
                  type="submit"
                  disabled={!input.trim() || isThinking}
                  className="w-8 h-8 rounded-full bg-[#00838F] hover:bg-[#006d75] disabled:bg-gray-200 flex items-center justify-center transition-all flex-shrink-0 disabled:cursor-not-allowed"
                  aria-label="Send message"
                >
                  <svg
                    className="w-4 h-4 text-white"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5"
                    />
                  </svg>
                </button>
              </div>

              {/* Powered by line */}
              <p className="text-center text-[10px] text-gray-300 mt-2">
                Powered by Amazon Bedrock · Nia v1.0
              </p>
            </form>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

// Production extension:
// - Replace handleSend with a streaming Bedrock Agent InvokeAgent call
// - The agent's tool-use responses (search_catalog, build_cart, compare_products)
//   return structured JSON that maps directly to the card renderer switch statement
// - Add file/image upload for visual search (Bedrock multimodal + Rekognition)
// - Implement typing indicators that show partial streaming text
// - Add message retry on failure with exponential backoff
// - Voice input: use Amazon Transcribe as fallback for browsers without Web Speech API
// - Quick chips: generated by the model based on conversation context, not hardcoded
