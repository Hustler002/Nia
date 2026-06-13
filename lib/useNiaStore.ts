// lib/useNiaStore.ts
// Global state for the Nia chat panel
// Uses React Context instead of Zustand to avoid extra deps in this hackathon build
// Production: migrate to Zustand for performance with devtools integration

'use client';

import { createContext, useContext } from 'react';

export interface NiaState {
  isOpen: boolean;
  initialQuery: string;
  openNia: (query?: string) => void;
  closeNia: () => void;
  toggleNia: () => void;
}

export const NiaContext = createContext<NiaState>({
  isOpen: false,
  initialQuery: '',
  openNia: () => {},
  closeNia: () => {},
  toggleNia: () => {},
});

export const useNiaStore = () => useContext(NiaContext);

// Production extension:
// - Add message history, cart state, session tracking
// - Integrate with Bedrock Agent WebSocket for streaming responses
// - Persist conversation state in DynamoDB per session
