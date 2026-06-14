// components/NiaProvider.tsx
// Legacy compatibility wrapper — delegates all state to the Zustand store.
// Components that import `useNia()` from this file will get the same
// state as components that use `useNiaChatStore` directly.

'use client';

import { ReactNode } from 'react';
import { useNiaChatStore } from '@/lib/useNiaStore';

// Re-export hook for backward compat
export function useNia() {
  const store = useNiaChatStore();
  return {
    isOpen: store.isOpen,
    messages: store.messages,
    isThinking: store.isThinking,
    hasNotification: store.hasProactiveNudge,
    open: store.open,
    close: store.close,
    toggle: store.toggle,
    sendMessage: (text: string) => store.sendMessage(text),
  };
}

// Thin wrapper — no actual context needed since Zustand is global
export default function NiaProvider({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
