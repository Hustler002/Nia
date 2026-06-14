// components/NiaChatPanel.tsx
// Legacy chat panel — replaced by NiaWidget/NiaPanel.tsx but kept for any old imports.
// This is a lightweight fallback that delegates to the real NiaPanel.

'use client';

import NiaPanel from '@/components/NiaWidget/NiaPanel';

export function NiaChatPanel() {
  // Delegate to the real NiaPanel implementation
  return <NiaPanel />;
}

export default NiaChatPanel;
