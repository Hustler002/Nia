// components/NiaProvider.tsx
// Wraps the app and provides both legacy context state and Zustand-based chat state
// Handles the proactive nudge timer on first page load using the consumption engine
// Production: add WebSocket connection to Bedrock Agent, session persistence

'use client';

import { useState, useCallback, useEffect, type ReactNode } from 'react';
import { NiaContext } from '@/lib/useNiaStore';
import { useNiaChatStore } from '@/lib/useNiaStore';
import { getRunningLowItems } from '@/lib/personalization/consumptionEngine';
import { getProactiveNudgeMessage } from '@/lib/personalization/proactiveNudge';

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
  // After 4 seconds, if user hasn't opened Nia, compute consumption predictions
  // and show the most urgent nudge as a preloaded message + orange badge
  useEffect(() => {
    const timer = setTimeout(() => {
      // Only show nudge if user hasn't interacted with Nia yet
      if (messages.length === 0) {
        // Get real-time consumption predictions from the engine
        const runningLowItems = getRunningLowItems();
        const nudgeMsg = getProactiveNudgeMessage(runningLowItems);

        if (nudgeMsg) {
          addMessage(nudgeMsg);
          setHasProactiveNudge(true);
        }
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
// - Proactive nudges come from Amazon Personalize via API call:
//   1. On page load, call GET /api/personalize/predictions?userId=xxx
//   2. The API route queries Amazon Personalize (consumption-cycle recipe)
//   3. Results include predicted runout dates with confidence scores
//   4. The most urgent prediction is shown as a proactive nudge
// - For returning users, check DynamoDB for snooze/dismiss state per product
// - Add analytics tracking for widget open/close events
// - Handle session timeout and reconnection logic
