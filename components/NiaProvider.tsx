// components/NiaProvider.tsx
// Wraps the app and provides both legacy context state and Zustand-based chat state
// Handles the proactive nudge timer on first page load
// Production: add WebSocket connection to Bedrock Agent, session persistence

'use client';

import { useState, useCallback, useEffect, type ReactNode } from 'react';
import { NiaContext } from '@/lib/useNiaStore';
import { useNiaChatStore } from '@/lib/useNiaStore';
import { getProactiveNudge } from '@/lib/niaMockEngine';

export default function NiaProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [initialQuery, setInitialQuery] = useState('');

  // Zustand store actions — used for proactive nudge
  const zustandOpen = useNiaChatStore((s) => s.open);
  const zustandClose = useNiaChatStore((s) => s.close);
  const zustandIsOpen = useNiaChatStore((s) => s.isOpen);
  const addMessage = useNiaChatStore((s) => s.addMessage);
  const setHasProactiveNudge = useNiaChatStore((s) => s.setHasProactiveNudge);
  const messages = useNiaChatStore((s) => s.messages);

  // Sync legacy context state with Zustand store
  const openNia = useCallback(
    (query?: string) => {
      setInitialQuery(query || '');
      setIsOpen(true);
      zustandOpen(query);
    },
    [zustandOpen]
  );

  const closeNia = useCallback(() => {
    setIsOpen(false);
    setInitialQuery('');
    zustandClose();
  }, [zustandClose]);

  const toggleNia = useCallback(() => {
    if (zustandIsOpen) {
      closeNia();
    } else {
      openNia();
    }
  }, [zustandIsOpen, openNia, closeNia]);

  // ── Proactive nudge on first load ──
  // After 4 seconds, if user hasn't opened Nia, show the badge and preload a message
  useEffect(() => {
    const timer = setTimeout(() => {
      // Only show nudge if user hasn't interacted with Nia yet
      if (messages.length === 0) {
        const nudgeMsg = getProactiveNudge();
        addMessage(nudgeMsg);
        setHasProactiveNudge(true);
      }
    }, 4000);

    return () => clearTimeout(timer);
    // Only run once on mount — empty deps intentional
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <NiaContext.Provider
      value={{ isOpen, initialQuery, openNia, closeNia, toggleNia }}
    >
      {children}
    </NiaContext.Provider>
  );
}

// Production extension:
// - Establish WebSocket connection to Bedrock Agent on mount
// - Load conversation history from DynamoDB for returning users
// - Proactive nudges come from Amazon Personalize via API call, not hardcoded timer
// - Add analytics tracking for widget open/close events
// - Handle session timeout and reconnection logic
