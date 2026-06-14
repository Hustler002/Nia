'use client';

import { useEffect } from 'react';
import { useUserStore } from '@/lib/stores/useUserStore';
import { useCartStore } from '@/lib/stores/useCartStore';
import { MOCK_USER_PRIYA } from '@/lib/mockData';

export default function UserStoreInitializer() {
  const setUser = useUserStore((s) => s.setUser);
  const hydrateCart = useCartStore((s) => s.hydrate);

  useEffect(() => {
    setUser(MOCK_USER_PRIYA);
    hydrateCart();
  }, [setUser, hydrateCart]);

  return null;
}
