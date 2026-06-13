// components/NiaChatPanel.tsx
// Floating Nia chat widget — sidebar on desktop, bottom drawer on mobile
// This is a demo panel with mock responses; production connects to Bedrock Agent via WebSocket
// Production: replace mock responses with real Bedrock Agent streaming responses

'use client';

import { useState, useEffect, useRef } from 'react';
import { useNiaStore } from '@/lib/useNiaStore';

interface ChatMessage {
  id: string;
  role: 'user' | 'nia';
  text: string;
  timestamp: Date;
  cards?: ProductCard[];
}

interface ProductCard {
  name: string;
  price: number;
  emoji: string;
  qty: number;
}

// Mock responses for demo conversations
const mockResponses: Record<string, { text: string; cards?: ProductCard[] }> = {
  'movie night': {
    text: "🎬 Movie night for 4 under ₹500? I've got you! Here's a perfect spread:",
    cards: [
      { name: 'ACT II Popcorn (Pack of 3)', price: 120, emoji: '🍿', qty: 1 },
      { name: "Lay's Classic Chips 150g", price: 50, emoji: '🥔', qty: 2 },
      { name: 'Coca-Cola 1.25L', price: 76, emoji: '🥤', qty: 2 },
      { name: 'Doritos Nachos 150g', price: 80, emoji: '🌮', qty: 1 },
      { name: 'Hershey\'s Chocolate Dip', price: 65, emoji: '🍫', qty: 1 },
    ],
  },
  'birthday party': {
    text: "🎂 Birthday party for 10 kids? Let me plan the whole thing!",
    cards: [
      { name: 'Party Plates & Cups Set', price: 180, emoji: '🎉', qty: 1 },
      { name: 'Birthday Candles Assorted', price: 40, emoji: '🕯️', qty: 1 },
      { name: 'Frooti Juice 200ml (12-pack)', price: 120, emoji: '🧃', qty: 1 },
      { name: 'Hide & Seek Biscuits (6-pack)', price: 150, emoji: '🍪', qty: 1 },
      { name: 'Cadbury Gems Pack (10 pcs)', price: 100, emoji: '🍬', qty: 1 },
      { name: 'Paper Napkins (50 pcs)', price: 60, emoji: '🧻', qty: 1 },
    ],
  },
  'fever': {
    text: "🚨 I'm switching to Emergency Mode. Here's what you need right now — everything delivers in 10 min:",
    cards: [
      { name: 'Crocin Advance 500mg', price: 30, emoji: '💊', qty: 1 },
      { name: 'Digital Thermometer', price: 150, emoji: '🌡️', qty: 1 },
      { name: 'ORS Sachets (4-pack)', price: 48, emoji: '💧', qty: 1 },
      { name: 'Moov Pain Relief Spray', price: 99, emoji: '🩹', qty: 1 },
      { name: 'Electral Powder (3-pack)', price: 45, emoji: '⚡', qty: 1 },
    ],
  },
};

function getResponse(query: string): { text: string; cards?: ProductCard[] } {
  const lower = query.toLowerCase();
  if (lower.includes('movie')) return mockResponses['movie night'];
  if (lower.includes('party') || lower.includes('birthday')) return mockResponses['birthday party'];
  if (lower.includes('fever') || lower.includes('emergency') || lower.includes('sick'))
    return mockResponses['fever'];

  return {
    text: `Got it! Let me find the best options for "${query}". I'll have your cart ready in seconds... 🛒`,
  };
}

export default function NiaChatPanel() {
  const { isOpen, initialQuery, closeNia } = useNiaStore();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Handle initial query when panel opens
  useEffect(() => {
    if (isOpen && initialQuery) {
      handleSend(initialQuery);
    }
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 300);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, initialQuery]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = (text?: string) => {
    const query = text || input.trim();
    if (!query) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      text: query,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    // Simulate AI response delay
    setTimeout(() => {
      const response = getResponse(query);
      const niaMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'nia',
        text: response.text,
        timestamp: new Date(),
        cards: response.cards,
      };
      setMessages((prev) => [...prev, niaMsg]);
      setIsTyping(false);
    }, 800 + Math.random() * 700);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSend();
  };

  const totalCartPrice = (cards: ProductCard[]) =>
    cards.reduce((sum, c) => sum + c.price * c.qty, 0);

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/20 backdrop-blur-sm z-[998] sm:hidden"
        onClick={closeNia}
      />

      {/* Panel */}
      <div
        className={`fixed z-[999] bg-white shadow-2xl flex flex-col
          /* Mobile: bottom drawer */
          inset-x-0 bottom-0 h-[85vh] rounded-t-3xl
          /* Desktop: right sidebar */
          sm:inset-y-0 sm:right-0 sm:left-auto sm:w-[420px] sm:h-full sm:rounded-none sm:rounded-l-3xl
          animate-slide-up sm:animate-slide-left
        `}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-9 h-9 rounded-full bg-[#00838F] flex items-center justify-center">
                <span className="text-white text-sm font-bold">N</span>
              </div>
              {isTyping && (
                <div className="absolute inset-0 rounded-full bg-[#00838F]/30 animate-nia-pulse" />
              )}
            </div>
            <div>
              <h2 className="text-sm font-bold text-[#0F1111]">Nia</h2>
              <p className="text-[11px] text-gray-400">Your shopping assistant</p>
            </div>
          </div>
          <button
            onClick={closeNia}
            className="w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center transition-colors"
            aria-label="Close Nia"
          >
            <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
          {messages.length === 0 && (
            <div className="text-center py-8">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[#E0F2F1] flex items-center justify-center">
                <span className="text-2xl">✨</span>
              </div>
              <p className="text-sm font-semibold text-[#0F1111]">Hey! I'm Nia.</p>
              <p className="text-xs text-gray-400 mt-1 max-w-[240px] mx-auto">
                Tell me what you need and I'll build your cart in seconds. Try "movie night for 4"!
              </p>
            </div>
          )}

          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[85%] rounded-2xl px-4 py-3 ${
                  msg.role === 'user'
                    ? 'bg-[#00838F] text-white rounded-br-md'
                    : 'bg-gray-50 text-[#0F1111] rounded-bl-md border border-gray-100'
                }`}
              >
                <p className="text-sm leading-relaxed">{msg.text}</p>

                {/* Product cards (rich response) */}
                {msg.cards && msg.cards.length > 0 && (
                  <div className="mt-3 space-y-2">
                    {msg.cards.map((card, i) => (
                      <div
                        key={i}
                        className="flex items-center gap-3 bg-white rounded-xl p-2.5 border border-gray-100 shadow-sm"
                      >
                        <span className="text-xl flex-shrink-0">{card.emoji}</span>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold text-[#0F1111] truncate">{card.name}</p>
                          <p className="text-[11px] text-gray-400">Qty: {card.qty}</p>
                        </div>
                        <span className="text-sm font-bold text-[#0F1111] flex-shrink-0">
                          ₹{card.price * card.qty}
                        </span>
                      </div>
                    ))}

                    {/* Cart summary */}
                    <div className="flex items-center justify-between bg-[#E0F2F1] rounded-xl p-3 mt-2">
                      <span className="text-xs font-semibold text-[#00838F]">
                        Total: ₹{totalCartPrice(msg.cards)}
                      </span>
                      <button className="px-4 py-1.5 bg-[#00838F] text-white text-xs font-bold rounded-lg hover:bg-[#006d75] transition-colors">
                        Add all to cart
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}

          {/* Typing indicator */}
          {isTyping && (
            <div className="flex justify-start">
              <div className="bg-gray-50 rounded-2xl rounded-bl-md px-4 py-3 border border-gray-100">
                <div className="flex gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-gray-300 animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-2 h-2 rounded-full bg-gray-300 animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-2 h-2 rounded-full bg-gray-300 animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input bar */}
        <form onSubmit={handleSubmit} className="border-t border-gray-100 px-4 py-3">
          <div className="flex items-center gap-2 bg-gray-50 rounded-xl px-3 py-2 border border-gray-200 focus-within:border-[#00838F] transition-colors">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask Nia anything..."
              className="flex-1 bg-transparent text-sm outline-none text-[#0F1111] placeholder-gray-400"
              aria-label="Chat with Nia"
              id="nia-chat-input"
            />
            <button
              type="submit"
              disabled={!input.trim()}
              className="w-8 h-8 rounded-full bg-[#00838F] hover:bg-[#006d75] disabled:bg-gray-200 flex items-center justify-center transition-colors flex-shrink-0"
              aria-label="Send message"
            >
              <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 10.5L12 3m0 0l7.5 7.5M12 3v18" />
              </svg>
            </button>
          </div>
        </form>
      </div>
    </>
  );
}
