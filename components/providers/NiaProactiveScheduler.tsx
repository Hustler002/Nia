'use client';

import { useEffect, useRef } from 'react';
import { useNiaChatStore } from '@/lib/useNiaStore';

export default function NiaProactiveScheduler() {
  const hasRun = useRef(false);

  useEffect(() => {
    if (hasRun.current) return;
    hasRun.current = true;

    const timer = setTimeout(() => {
      const state = useNiaChatStore.getState();
      if (!state.isOpen) {
        state.setHasProactiveNudge(true);
      }
    }, 4000);

    return () => clearTimeout(timer);
  }, []);

  return null;
}
