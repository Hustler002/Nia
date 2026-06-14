'use client';

// app/seller/optimization/page.tsx
// Split-panel page: left side shows current listing + intent gap data,
// right side is a Nia chat for optimizing the listing in real-time.
// URL param ?query= seeds the context for which intent gap triggered this page.

import { useState, useRef, useEffect, useCallback } from 'react';

// ─── Design tokens (kept co-located for readability) ───────────────────────
const TEAL = '#00838F';
const TEAL_LIGHT = '#E0F2F1';
const ORANGE = '#FF9900';
const DARK = '#0F1111';
const NAVY = '#232F3E';

// ─── Types ─────────────────────────────────────────────────────────────────
interface ChatMessage {
  id: string;
  role: 'nia' | 'user';
  content: string;
  /** When set, renders as a rich suggestion card instead of plain text */
  suggestion?: {
    header: string;
    before: string;
    after: string;
    buttonLabel: string;
  };
}

// ─── Mock listing data (hardcoded per spec — no external imports) ──────────
const LISTING = {
  title: 'RiteBite Max Protein Bar - Choco Fudge 70g',
  category: 'Health & Wellness',
  price: 125,
  matchScore: 62,
  description:
    'High protein energy bar with 20g protein. Made with whey protein, dark chocolate coating, and oats. Perfect post-workout snack.',
  attributes: [
    { label: 'Protein', value: '20g' },
    { label: 'Flavour', value: 'Choco Fudge' },
    { label: 'Weight', value: '70g' },
    { label: 'Diet Type', value: 'Vegetarian' },
  ],
};

const SEARCH_QUERIES = [
  { query: 'sugar-free protein bar under ₹300', volume: '1,247' },
  { query: 'diabetic friendly protein bar', volume: '890' },
  { query: 'low sugar high protein snack', volume: '645' },
];

const IMPROVEMENTS = [
  "Add 'sugar-free' to product title",
  "Include 'diabetic friendly' in search tags",
  'Add protein content (grams) to attributes',
  "Mention 'gym snack' in description",
];

const QUICK_CHIPS = [
  'Rewrite my description',
  'Suggest better tags',
  'Show competitor analysis',
];

// ─── Seed messages shown on mount ──────────────────────────────────────────
const SEED_MESSAGES: ChatMessage[] = [
  {
    id: 'seed-1',
    role: 'nia',
    content:
      "Hi! I see you're looking at your Health & Wellness listings. This week, **1,247 customers** searched for 'sugar-free protein bar under ₹300' and couldn't find a match. Your RiteBite bar is close but isn't showing up because the title doesn't include 'sugar-free'. Let me help fix that!",
  },
  {
    id: 'seed-2',
    role: 'nia',
    content: '', // content lives in the suggestion card
    suggestion: {
      header: 'Suggested Title Rewrite',
      before: 'RiteBite Max Protein Bar - Choco Fudge 70g',
      after:
        'RiteBite Max Protein Bar - Sugar Free Choco Fudge 70g | Diabetic Friendly | 20g Protein',
      buttonLabel: 'Apply this title',
    },
  },
  {
    id: 'seed-3',
    role: 'nia',
    content:
      "I'd also suggest adding these search tags: 'sugar-free', 'diabetic friendly', 'gym snack', 'keto snack', 'high protein low sugar'. Want me to update them?",
  },
];

// ─── Mock response handler ─────────────────────────────────────────────────
function getMockResponse(userMsg: string): string {
  const lower = userMsg.toLowerCase();

  if (lower.includes('description')) {
    return `Here's an optimized description:\n\n"RiteBite Max Protein Bar — your guilt-free, **sugar-free** post-workout snack packed with **20g whey protein**. Diabetic-friendly with a rich dark chocolate coating and wholesome oats. Perfect for gym-goers, keto dieters, and anyone craving a high-protein, low-sugar treat. Available in Choco Fudge flavour — grab yours under ₹300!"\n\nThis version targets 3 high-volume search queries and adds keywords customers are actually searching for.`;
  }

  if (lower.includes('tag')) {
    return `Based on current search trends, here are the **top recommended tags** for your listing:\n\n• sugar-free protein bar\n• diabetic friendly snack\n• gym snack India\n• keto protein bar\n• high protein low sugar\n• post-workout snack\n• whey protein bar\n• healthy snack under 300\n\nAdding these could capture an estimated **2,780+ additional searches/week**.`;
  }

  if (lower.includes('competitor')) {
    return `**Competitor Snapshot — Protein Bars (₹100-₹200)**\n\n🥇 **Yoga Bar** — 4.3★, ₹99, ranks #1 for 'sugar-free protein bar'. Uses 'sugar-free' and 'diabetic safe' in title.\n\n🥈 **MuscleBlaze** — 4.1★, ₹145, ranks #2. Has 12 search tags vs. your 4.\n\n🥉 **Your Listing (RiteBite)** — 4.0★, ₹125, ranks #7. Missing 'sugar-free' keyword entirely.\n\nKey gap: Top competitors average **10 search tags** — you have 4. Adding 6 more targeted tags could move you to the top 3.`;
  }

  // Default catch-all
  return `Great question! Based on the intent gap data I'm seeing, your listing has strong fundamentals but is missing some key search terms. The biggest opportunity is around "sugar-free" and "diabetic friendly" — these queries have high volume but your listing doesn't surface for them.\n\nWould you like me to rewrite your description, suggest better tags, or show a competitor analysis?`;
}

// ─── Markdown-light renderer (bold only, no external deps) ─────────────────
// Splits on **bold** markers and renders <strong> tags.
function renderMarkdown(text: string) {
  const parts = text.split(/\*\*(.*?)\*\*/g);
  return parts.map((part, i) =>
    i % 2 === 1 ? (
      <strong key={i} className="font-semibold">
        {part}
      </strong>
    ) : (
      <span key={i}>{part}</span>
    )
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// PAGE COMPONENT
// ═══════════════════════════════════════════════════════════════════════════
export default function SellerOptimizationPage() {
  // Read ?query= from URL without next/navigation (per project rules)
  const [queryParam, setQueryParam] = useState<string>('');
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      setQueryParam(params.get('query') ?? '');
    }
  }, []);

  const [messages, setMessages] = useState<ChatMessage[]>(SEED_MESSAGES);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [checkedItems, setCheckedItems] = useState<Set<number>>(new Set());
  const [appliedTitle, setAppliedTitle] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll chat to bottom on new messages
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const toggleCheck = useCallback((idx: number) => {
    setCheckedItems((prev) => {
      const next = new Set(prev);
      if (next.has(idx)) next.delete(idx);
      else next.add(idx);
      return next;
    });
  }, []);

  const sendMessage = useCallback(
    (text: string) => {
      if (!text.trim() || isTyping) return;

      const userMsg: ChatMessage = {
        id: `user-${Date.now()}`,
        role: 'user',
        content: text.trim(),
      };

      setMessages((prev) => [...prev, userMsg]);
      setInput('');
      setIsTyping(true);

      // Simulate Nia "thinking" delay
      setTimeout(() => {
        const niaMsg: ChatMessage = {
          id: `nia-${Date.now()}`,
          role: 'nia',
          content: getMockResponse(text),
        };
        setMessages((prev) => [...prev, niaMsg]);
        setIsTyping(false);
      }, 1200);
    },
    [isTyping]
  );

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  // ─── LEFT PANEL: Current Listing ──────────────────────────────────────
  const LeftPanel = (
    <div className="w-full lg:w-[45%] flex-shrink-0">
      <div className="bg-white rounded-sm shadow-sm p-6 space-y-6 border border-[#D5D9D9]">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold" style={{ color: DARK }}>
            Current Listing
          </h2>
          <span
            className="text-xs font-semibold px-3 py-1 rounded-sm border border-[#D5D9D9]"
            style={{ backgroundColor: TEAL_LIGHT, color: TEAL }}
          >
            {LISTING.matchScore}% match
          </span>
        </div>

        {/* Listing details */}
        <div className="space-y-3">
          <h3 className="font-semibold text-base" style={{ color: DARK }}>
            {appliedTitle
              ? 'RiteBite Max Protein Bar - Sugar Free Choco Fudge 70g | Diabetic Friendly | 20g Protein'
              : LISTING.title}
          </h3>
          <div className="flex items-center gap-3 text-sm text-gray-500">
            <span className="px-2 py-0.5 bg-gray-100 rounded text-xs font-medium">
              {LISTING.category}
            </span>
            <span className="font-semibold text-base" style={{ color: DARK }}>
              ₹{LISTING.price}
            </span>
          </div>
          <p className="text-sm text-gray-600 leading-relaxed">
            {LISTING.description}
          </p>
        </div>

        {/* Attributes table */}
        <div className="border border-[#D5D9D9] rounded-sm overflow-hidden">
          {LISTING.attributes.map((attr, idx) => (
            <div
              key={attr.label}
              className={`flex justify-between px-4 py-2.5 text-sm ${
                idx % 2 === 0 ? 'bg-gray-50' : 'bg-white'
              }`}
            >
              <span className="text-gray-500 font-medium">{attr.label}</span>
              <span className="font-semibold" style={{ color: DARK }}>
                {attr.value}
              </span>
            </div>
          ))}
        </div>

        {/* What customers are searching for */}
        <div className="space-y-3">
          <h4
            className="text-sm font-bold uppercase tracking-wide"
            style={{ color: DARK }}
          >
            What customers are searching for
          </h4>
          <div className="space-y-2">
            {SEARCH_QUERIES.map((sq) => (
              <div
                key={sq.query}
                className="flex items-center justify-between bg-[#F7F8F8] rounded-sm px-4 py-2.5 border border-[#D5D9D9]"
              >
                <code className="text-sm font-mono text-gray-700">
                  &lsquo;{sq.query}&rsquo;
                </code>
                <span
                  className="text-xs font-semibold px-2.5 py-1 rounded-sm whitespace-nowrap"
                  style={{ backgroundColor: '#FFF3E0', color: '#E65100' }}
                >
                  {sq.volume} searches
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Recommended improvements checklist */}
        <div className="space-y-3">
          <h4
            className="text-sm font-bold uppercase tracking-wide"
            style={{ color: DARK }}
          >
            Recommended Improvements
          </h4>
          <ul className="space-y-2">
            {IMPROVEMENTS.map((item, idx) => (
              <li key={idx} className="flex items-start gap-3">
                <button
                  type="button"
                  onClick={() => toggleCheck(idx)}
                  className="mt-0.5 flex-shrink-0 w-5 h-5 rounded border-2 flex items-center justify-center transition-colors cursor-pointer"
                  style={{
                    borderColor: checkedItems.has(idx) ? TEAL : '#D1D5DB',
                    backgroundColor: checkedItems.has(idx) ? TEAL : 'transparent',
                  }}
                  aria-label={`Toggle: ${item}`}
                >
                  {checkedItems.has(idx) && (
                    <svg
                      className="w-3 h-3 text-white"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={3}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  )}
                </button>
                <span
                  className={`text-sm ${
                    checkedItems.has(idx)
                      ? 'line-through text-gray-400'
                      : 'text-gray-700'
                  }`}
                >
                  {item}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );

  // ─── RIGHT PANEL: Nia Chat ────────────────────────────────────────────
  const RightPanel = (
    <div className="w-full lg:w-[55%] flex-shrink-0">
      <div className="bg-white rounded-sm shadow-sm flex flex-col h-[calc(100vh-8rem)] lg:h-[calc(100vh-6rem)] border border-[#D5D9D9]">
        {/* Chat header */}
        <div
          className="flex items-center gap-3 px-5 py-4 border-b border-[#D5D9D9] rounded-t-sm"
        >
          {/* Nia avatar */}
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-lg flex-shrink-0"
            style={{ backgroundColor: TEAL }}
          >
            N
          </div>
          <div>
            <h3 className="font-bold text-sm" style={{ color: DARK }}>
              Nia Listing Assistant
            </h3>
            <p className="text-xs text-gray-400">
              Optimize your listings with AI
            </p>
          </div>
          {/* Online indicator */}
          <div className="ml-auto flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            <span className="text-xs text-gray-400">Online</span>
          </div>
        </div>

        {/* Messages area */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 scrollbar-hide">
          {messages.map((msg) => {
            if (msg.role === 'user') {
              return (
                <div key={msg.id} className="flex justify-end">
                  <div
                    className="max-w-[80%] rounded-md rounded-br-sm px-4 py-3 text-sm text-white leading-relaxed"
                    style={{ backgroundColor: NAVY }}
                  >
                    {msg.content}
                  </div>
                </div>
              );
            }

            // Nia message — might be plain text or a suggestion card
            return (
              <div key={msg.id} className="flex justify-start">
                <div
                  className="max-w-[85%] rounded-md rounded-bl-sm px-4 py-3 text-sm leading-relaxed border-l-4"
                  style={{
                    backgroundColor: 'white',
                    borderLeftColor: TEAL,
                    boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
                  }}
                >
                  {/* Plain text content */}
                  {msg.content && (
                    <p className="text-gray-700 whitespace-pre-line">
                      {renderMarkdown(msg.content)}
                    </p>
                  )}

                  {/* Suggestion card */}
                  {msg.suggestion && (
                    <div className="space-y-3">
                      <p
                        className="font-bold text-sm"
                        style={{ color: DARK }}
                      >
                        {msg.suggestion.header}
                      </p>

                      {/* Before */}
                      <div className="bg-red-50 border border-red-100 rounded-sm px-3 py-2">
                        <span className="text-[10px] uppercase font-bold text-red-400 tracking-wider">
                          Before
                        </span>
                        <p className="text-sm text-red-700 line-through mt-0.5">
                          {msg.suggestion.before}
                        </p>
                      </div>

                      {/* After */}
                      <div className="bg-green-50 border border-green-100 rounded-sm px-3 py-2">
                        <span className="text-[10px] uppercase font-bold text-green-500 tracking-wider">
                          After
                        </span>
                        <p className="text-sm text-green-800 font-medium mt-0.5">
                          {msg.suggestion.after}
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() => setAppliedTitle(true)}
                        disabled={appliedTitle}
                        className="w-full py-2 rounded-md text-sm font-bold text-white transition-opacity cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                        style={{ backgroundColor: TEAL }}
                      >
                        {appliedTitle ? '✓ Title Applied' : msg.suggestion.buttonLabel}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}

          {/* Typing indicator */}
          {isTyping && (
            <div className="flex justify-start">
              <div
                className="rounded-md rounded-bl-sm px-4 py-3 border-l-4 flex items-center gap-1.5"
                style={{
                  backgroundColor: 'white',
                  borderLeftColor: TEAL,
                  boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
                }}
              >
                {/* Three bouncing dots */}
                <span
                  className="w-2 h-2 rounded-full animate-bounce"
                  style={{ backgroundColor: TEAL, animationDelay: '0ms' }}
                />
                <span
                  className="w-2 h-2 rounded-full animate-bounce"
                  style={{ backgroundColor: TEAL, animationDelay: '150ms' }}
                />
                <span
                  className="w-2 h-2 rounded-full animate-bounce"
                  style={{ backgroundColor: TEAL, animationDelay: '300ms' }}
                />
              </div>
            </div>
          )}

          {/* Invisible scroll anchor */}
          <div ref={chatEndRef} />
        </div>

        {/* Quick chip suggestions */}
        <div className="px-4 pb-2 flex flex-wrap gap-2">
          {QUICK_CHIPS.map((chip) => (
            <button
              key={chip}
              type="button"
              onClick={() => sendMessage(chip)}
              disabled={isTyping}
              className="text-xs font-medium px-3 py-1.5 rounded-sm border transition-colors cursor-pointer disabled:opacity-40"
              style={{
                borderColor: TEAL,
                color: TEAL,
              }}
              onMouseEnter={(e) => {
                (e.target as HTMLButtonElement).style.backgroundColor = TEAL_LIGHT;
              }}
              onMouseLeave={(e) => {
                (e.target as HTMLButtonElement).style.backgroundColor = 'transparent';
              }}
            >
              {chip}
            </button>
          ))}
        </div>

        {/* Input bar */}
        <div className="px-4 pb-4 pt-2">
          <div className="flex items-center gap-2 bg-[#F7F8F8] border border-[#D5D9D9] rounded-sm px-4 py-2.5 focus-within:border-[#00838F] transition-colors">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask Nia about your listing..."
              disabled={isTyping}
              className="flex-1 bg-transparent text-sm outline-none placeholder-gray-400 disabled:opacity-50"
              style={{ color: DARK }}
            />
            <button
              type="button"
              onClick={() => sendMessage(input)}
              disabled={!input.trim() || isTyping}
              className="w-8 h-8 rounded-full flex items-center justify-center text-white transition-opacity disabled:opacity-30 cursor-pointer"
              style={{ backgroundColor: TEAL }}
              aria-label="Send message"
            >
              {/* Send arrow icon */}
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
                  d="M5 12h14M12 5l7 7-7 7"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  // ─── PAGE RENDER ────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-[#EAEDED]">
      {/* Top bar with back button */}
      <div className="px-4 sm:px-6 lg:px-8 pt-4 pb-2">
        <a
          href="/seller"
          className="inline-flex items-center gap-1.5 text-sm font-medium transition-colors hover:opacity-80"
          style={{ color: TEAL }}
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
              d="M15 19l-7-7 7-7"
            />
          </svg>
          Back to Dashboard
        </a>

        {/* Page heading — shows the query param if present */}
        <h1
          className="text-xl font-bold mt-2"
          style={{ color: DARK }}
        >
          Listing Optimization
          {queryParam && (
            <span className="text-sm font-normal text-gray-400 ml-2">
              — for &ldquo;{queryParam}&rdquo;
            </span>
          )}
        </h1>
      </div>

      {/* Split panels */}
      <div className="px-4 sm:px-6 lg:px-8 pb-8 flex flex-col lg:flex-row gap-6">
        {LeftPanel}
        {RightPanel}
      </div>
    </div>
  );
}

/*
 * ─── Production extension ──────────────────────────────────────────────────
 *
 * 1. Replace mock listing data with real Seller Central API calls
 *    (GET /api/seller/listings/:asin) fetched via SWR or React Query.
 *
 * 2. Wire Nia chat to the backend LLM endpoint (POST /api/nia/optimize)
 *    with streaming (ReadableStream) for real-time token display.
 *
 * 3. "Apply this title" should PATCH the listing via Seller Central API,
 *    with optimistic UI update and rollback on failure.
 *
 * 4. Search queries + volumes should come from the intent-gap analytics
 *    pipeline (Elasticsearch / OpenSearch aggregations).
 *
 * 5. Add WebSocket or SSE for live notification when a listing change
 *    goes live on the storefront.
 *
 * 6. Persist chat history per listing in a database (DynamoDB / Postgres)
 *    so sellers can resume conversations.
 *
 * 7. Add rate limiting on the chat endpoint and input sanitization.
 *
 * 8. Accessibility: add aria-live="polite" to the messages container,
 *    and keyboard shortcuts (Ctrl+Enter to send).
 *
 * 9. Add analytics events: track which suggestions are applied,
 *    improvement checklist completion rate, chat engagement metrics.
 *
 * 10. Support multi-language listings (Hindi, Tamil, etc.) with
 *     language detection and appropriate Nia responses.
 * ────────────────────────────────────────────────────────────────────────────
 */
