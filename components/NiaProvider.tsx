// components/NiaProvider.tsx
// Wraps the app and provides Nia chat state to all children
// Production: add WebSocket connection to Bedrock Agent here

'use client';

import { useState, useCallback, type ReactNode } from 'react';
import { NiaContext } from '@/lib/useNiaStore';

export default function NiaProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [initialQuery, setInitialQuery] = useState('');

  const openNia = useCallback((query?: string) => {
    setInitialQuery(query || '');
    setIsOpen(true);
  }, []);

  const closeNia = useCallback(() => {
    setIsOpen(false);
    setInitialQuery('');
  }, []);

  const toggleNia = useCallback(() => {
    setIsOpen((prev) => !prev);
  }, []);

  return (
    <NiaContext.Provider value={{ isOpen, initialQuery, openNia, closeNia, toggleNia }}>
      {children}
    </NiaContext.Provider>
  );
}
